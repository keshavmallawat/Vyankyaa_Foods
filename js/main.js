/* ═══════════════════════════════════════════
   VYANKYAA FOODS — SHARED JS
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {


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
