/**
 * products-service.js
 * Shared Firestore product CRUD module — admin panel + public website.
 * Firestore "products" collection is the single source of truth.
 *
 * Schema per document:
 *   id           string  (Firestore doc ID)
 *   name         string
 *   category     string  ("oils" | "grains" | "cakes" | ...)
 *   categoryLabel string ("Premium Oils" | "Grains & Sugar" | ...)
 *   price        string  ("On Request" or "₹85,000 / MT")
 *   description  string
 *   image        string  (relative path: "images/v-safflower-full.png")
 *   tag          string  (optional badge label)
 *   status       "available" | "limited" | "unavailable"
 *   order        number  (sort weight within category)
 *   updatedAt    Firestore Timestamp
 */

import {
  db, collection, getDocs, doc,
  setDoc, deleteDoc, serverTimestamp
} from './firebase-config.js';

const COLLECTION = 'products';
let cachedPublicProducts = null;

// ── DEFAULT SEED DATA ─────────────────────────────────────────────────────────
export const DEFAULT_PRODUCTS = [
  {
    id: 'safflower-oil', name: 'Cold Pressed Safflower Oil',
    category: 'oils', categoryLabel: 'Premium Oils', price: 'On Request',
    description: 'Pure, natural, and heart-healthy oil extracted at low temperatures to retain its essential nutrients and neutral aroma.',
    image: 'images/v-safflower-full.png', tag: 'Cold Pressed', status: 'available', order: 1,
  },
  {
    id: 'sunflower-oil', name: 'Premium Sunflower Oil',
    category: 'oils', categoryLabel: 'Premium Oils', price: 'On Request',
    description: 'Crystal clear, light, and versatile cooking oil. High in Vitamin E and perfect for all culinary needs.',
    image: 'images/v-sunflower-full.png', tag: '', status: 'available', order: 2,
  },
  {
    id: 'soya-oil', name: 'Refined Soya Bean Oil',
    category: 'oils', categoryLabel: 'Premium Oils', price: 'On Request',
    description: 'High-quality refined soya bean oil, perfect for cooking, baking, and industrial food applications.',
    image: 'images/v-soya-full.png', tag: '', status: 'available', order: 3,
  },
  {
    id: 'all-types-rice', name: 'All Types of Rice',
    category: 'grains', categoryLabel: 'Grains & Sugar', price: 'On Request',
    description: 'A premium selection of diverse rice varieties including Basmati, Jasmine, Sona Masoori, and Brown Rice.',
    image: 'images/all-types-rice.png', tag: 'Premium Varieties', status: 'available', order: 1,
  },
  {
    id: 'gehu-wheat', name: 'Gehu (Golden Wheat)',
    category: 'grains', categoryLabel: 'Grains & Sugar', price: 'On Request',
    description: 'Premium quality wheat grains, high in protein and ideal for milling into superior quality flour.',
    image: 'images/gehu.jpg', tag: '', status: 'available', order: 2,
  },
  {
    id: 'refined-sugar', name: 'Refined White Sugar',
    category: 'grains', categoryLabel: 'Grains & Sugar', price: 'On Request',
    description: 'High-grade refined granulated sugar, meeting international standards for purity and sweetness.',
    image: 'images/sugar.webp', tag: '', status: 'available', order: 3,
  },
  {
    id: 'peanut-oil-cake', name: 'Peanut Oil Cake',
    category: 'cakes', categoryLabel: 'Oil Seed Cakes', price: 'On Request',
    description: 'Protein-rich groundnut cake, an excellent nutritional supplement for livestock and poultry feed.',
    image: 'images/peanut-oil-cake.jpg', tag: 'Animal Feed', status: 'available', order: 1,
  },
  {
    id: 'cotton-oil-cake', name: 'Cotton Oil Cake',
    category: 'cakes', categoryLabel: 'Oil Seed Cakes', price: 'On Request',
    description: 'High-quality kapas cake, processed to ensure maximum nutritional value for dairy industries.',
    image: 'images/cotton-oil-cake.webp', tag: '', status: 'available', order: 2,
  },
  {
    id: 'safflower-doc', name: 'Safflower De-oiled Cake (DOC)',
    category: 'cakes', categoryLabel: 'Oil Seed Cakes', price: 'On Request',
    description: 'Superior de-oiled cake meal, rich in fiber and protein, ideal for multi-purpose agricultural uses.',
    image: 'images/safflower-de-oiled-cake.jpeg', tag: '', status: 'available', order: 3,
  },
];

// ── CLIENT-SIDE SORT (avoids Firestore composite index requirement) ────────────
function sortProducts(list) {
  // Define a fixed category order so display is always consistent
  const catPriority = { oils: 0, grains: 1, cakes: 2 };
  return list.sort((a, b) => {
    const ca = catPriority[a.category] ?? 99;
    const cb = catPriority[b.category] ?? 99;
    if (ca !== cb) return ca - cb;
    return (a.order || 99) - (b.order || 99);
  });
}

// ── FETCH ALL PRODUCTS (admin: includes unavailable) ─────────────────────────
export async function fetchAllProducts() {
  try {
    // No orderBy() — avoids requiring a Firestore composite index
    const snap = await getDocs(collection(db, COLLECTION));
    if (!snap.empty) {
      return sortProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    // Collection is empty on first run → seed defaults
    await seedDefaults();
    return sortProducts([...DEFAULT_PRODUCTS]);
  } catch (err) {
    console.warn('[products-service] Firestore read failed, using defaults:', err.message);
    return sortProducts([...DEFAULT_PRODUCTS]);
  }
}

// ── FETCH PUBLIC PRODUCTS (website: available + limited only) ─────────────────
export async function fetchPublicProducts() {
  if (cachedPublicProducts) return cachedPublicProducts;
  
  const all = await fetchAllProducts();
  cachedPublicProducts = all.filter(p => p.status === 'available' || p.status === 'limited');
  return cachedPublicProducts;
}

// Helper to pre-fetch without returning
export function prefetchProducts() {
  fetchPublicProducts().catch(() => {});
}

// ── SEED DEFAULTS (runs once on first visit when collection is empty) ─────────
async function seedDefaults() {
  const writes = DEFAULT_PRODUCTS.map(p =>
    setDoc(doc(db, COLLECTION, p.id), { ...p, updatedAt: serverTimestamp() })
      .catch(e => console.warn('[products-service] Seed write failed for', p.id, e.message))
  );
  await Promise.all(writes);
}

// ── SAVE / UPSERT A PRODUCT ───────────────────────────────────────────────────
export async function saveProduct(product) {
  await setDoc(
    doc(db, COLLECTION, product.id),
    { ...product, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ── DELETE A PRODUCT ──────────────────────────────────────────────────────────
export async function deleteProductById(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ── UPDATE STATUS ONLY ────────────────────────────────────────────────────────
export async function updateProductStatus(id, status) {
  await setDoc(
    doc(db, COLLECTION, id),
    { status, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
