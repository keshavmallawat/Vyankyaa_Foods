/* ═══════════════════════════════════════════
   VYANKYAA FOODS — SHARED JS
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CURSOR ── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (cursor && ring) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx - 6}px,${my - 6}px)`;
    });
    (function animateRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll('a, button, .product-card, .gallery-item, .cat-card, .cert-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '20px';
        cursor.style.height = '20px';
        cursor.style.background = 'var(--earth)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '12px';
        cursor.style.height = '12px';
        cursor.style.background = 'var(--gold)';
      });
    });
  }

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── ACTIVE NAV LINK ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── MOBILE DRAWER ── */
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('mobileDrawer');
  const burgerSpans = burger ? burger.querySelectorAll('span') : [];
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      drawer.style.display = open ? 'flex' : 'none';
      if (open) requestAnimationFrame(() => drawer.style.opacity = '1');
      burgerSpans[0].style.transform = open ? 'rotate(45deg) translate(4px,5px)' : '';
      burgerSpans[1].style.opacity   = open ? '0' : '1';
      burgerSpans[2].style.transform = open ? 'rotate(-45deg) translate(4px,-5px)' : '';
      document.body.style.overflow   = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        drawer.style.display = 'none';
        burgerSpans.forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── COUNT-UP ── */
  function countUp(el, target, suffix) {
    let count = 0;
    const step = target / 55;
    const t = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = (target >= 1000
        ? (count / 1000).toFixed(0) + 'K'
        : Math.floor(count)) + suffix;
      if (count >= target) clearInterval(t);
    }, 22);
  }
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.val').forEach(n => {
        const raw = n.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const suffix = raw.replace(/[0-9.]/g, '');
        if (!isNaN(num)) countUp(n, num, suffix);
      });
      statObserver.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stats-row, .about-stats').forEach(el => statObserver.observe(el));

  /* ── FILTER TABS ── */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.filter-tabs');
      parent.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;
      document.querySelectorAll('[data-category]').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
      });
    });
  });

});
