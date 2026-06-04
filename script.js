/* SHOMA — Portfolio interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  /* ---------- Always start at the top (no scroll restoration) ---------- */
  if ('scrollRestoration' in history) { try { history.scrollRestoration = 'manual'; } catch (e) {} }
  function toTop() { window.scrollTo(0, 0); }
  toTop();
  window.addEventListener('load', function () { toTop(); requestAnimationFrame(toTop); });

  /* ---------- Opening movie ---------- */
  var opening = document.getElementById('opening');
  var heroEl = document.querySelector('.hero');
  var ended = false, rafId = 0;

  function revealHero() { if (heroEl) heroEl.classList.add('in-line'); }
  function endOpening() {
    if (ended) return;
    ended = true;
    if (rafId) cancelAnimationFrame(rafId);
    document.body.classList.remove('is-loading');
    toTop();
    requestAnimationFrame(toTop);
    if (opening) opening.classList.add('done');
    revealHero();
    // fully remove from layout after fade
    setTimeout(function () { document.body.classList.add('opening-off'); }, 900);
  }

  if (!opening) {
    document.body.classList.add('opening-off');
    window.scrollTo(0, 0);
    revealHero();
  } else {
    document.body.classList.add('is-loading');
    window.scrollTo(0, 0);

    // hold on the title card, then split the gate to reveal the hero
    var splitAt = reduce ? 1500 : 2500;
    var splitTimer = setTimeout(function () {
      if (!ended) opening.classList.add('split');
    }, splitAt);
    var endTimer = setTimeout(endOpening, splitAt + 1150);
    setTimeout(endOpening, 7000); // hard safety: never hang

    var skip = document.getElementById('openingSkip');
    if (skip) skip.addEventListener('click', function () {
      clearTimeout(splitTimer); clearTimeout(endTimer);
      opening.classList.add('split');
      setTimeout(endOpening, 360);
    });
  }

  /* ---------- Year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Scroll progress + nav + fab ---------- */
  var progress = document.getElementById('progress');
  var nav = document.getElementById('nav');
  var fab = document.getElementById('fab');
  function onScroll() {
    var st = window.scrollY || doc.scrollTop;
    var h = doc.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-scrolled', st > 40);
    if (fab) fab.classList.toggle('show', st > window.innerHeight * 0.9);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal, .section__title');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in', 'in-line');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in', 'in-line'); });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (menu) menu.classList.remove('open');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- Hero parallax ---------- */
  var par = document.querySelector('[data-parallax] img');
  if (par && !reduce) {
    window.addEventListener('scroll', function () {
      var sy = window.scrollY;
      if (sy < window.innerHeight) par.style.transform = 'translateY(' + sy * 0.16 + 'px) scale(1.03)';
    }, { passive: true });
  }

  /* ---------- Custom cursor (original ring + dot) ---------- */
  var cursor = document.getElementById('cursor');
  var cursorDot = document.getElementById('cursorDot');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (cursor && fine) {
    document.body.classList.add('cursor-on');
    var label = cursor.querySelector('.cursor__label');
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    var ease = reduce ? 1 : 0.2; // snap instantly when reduced motion is requested
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('visible');
      if (cursorDot) {
        cursorDot.classList.add('visible');
        cursorDot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
      }
    });
    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('visible');
      if (cursorDot) cursorDot.classList.remove('visible');
    });
    (function loop() {
      cx += (tx - cx) * ease; cy += (ty - cy) * ease;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    var hot = document.querySelectorAll('a,button,[data-cursor],.works__shot');
    hot.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('hover');
        var t = el.getAttribute('data-cursor');
        if (label) label.textContent = t || '';
        cursor.classList.toggle('expand', !!t);
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('hover');
        if (label) label.textContent = '';
      });
    });
    // dark/light cursor depending on the section under the pointer
    document.addEventListener('mousemove', function (e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var onDark = el && el.closest('.hero,.intro,.english__card,.contact,.footer,.role,.lightbox');
      cursor.classList.toggle('dark', !!onDark);
    });
  }

  /* ---------- Lightbox ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.works__shot'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var idx = 0;
  function showLb(i) {
    if (!shots.length) return;
    idx = (i + shots.length) % shots.length;
    var s = shots[idx];
    var full = s.getAttribute('data-full') || s.querySelector('img').src;
    var cap = s.getAttribute('data-cap') || '';
    if (lbImg) { lbImg.src = full; lbImg.alt = cap; }
    if (lbCap) lbCap.textContent = cap;
  }
  function openLb(i) {
    showLb(i);
    if (lb) lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  shots.forEach(function (s, i) {
    s.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // let the photographer credit link work
      openLb(i);
    });
  });
  var bind = function (id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  bind('lbClose', closeLb);
  bind('lbPrev', function (e) { e.stopPropagation(); showLb(idx - 1); });
  bind('lbNext', function (e) { e.stopPropagation(); showLb(idx + 1); });
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') showLb(idx - 1);
    else if (e.key === 'ArrowRight') showLb(idx + 1);
  });

  /* ---------- Email (obfuscated, revealed only on click via popover) ---------- */
  var EMAIL = '';
  function decodeEmail(el) {
    if (EMAIL) return EMAIL;
    var m = el && el.getAttribute('data-m');
    if (!m) return '';
    try { EMAIL = atob(m); } catch (err) { EMAIL = ''; }
    return EMAIL;
  }

  var pop = document.getElementById('mailPop');
  var popAddr = document.getElementById('mailPopAddr');
  var popOpen = document.getElementById('mailOpen');
  var popGmail = document.getElementById('mailGmail');
  var popCopy = document.getElementById('mailCopy');
  var popClose = document.getElementById('mailPopClose');

  function openPop(addr) {
    if (!pop) { window.location.href = 'mailto:' + addr; return; }
    if (popAddr) popAddr.textContent = addr;
    if (popOpen) popOpen.setAttribute('href', 'mailto:' + addr);
    if (popGmail) popGmail.setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(addr));
    if (popCopy) popCopy.textContent = 'アドレスをコピー';
    pop.classList.add('open');
    pop.removeAttribute('hidden');
  }
  function closePop() { if (pop) pop.classList.remove('open'); }

  // Event delegation: works regardless of how/when links are added.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('.js-mail') : null;
    if (!trigger) return;
    e.preventDefault();
    var addr = decodeEmail(trigger);
    if (addr) openPop(addr);
  });

  if (popCopy) {
    popCopy.addEventListener('click', function () {
      var addr = popAddr ? popAddr.textContent : EMAIL;
      var done = function () { popCopy.textContent = 'コピーしました ✓'; };
      var fail = function () { popCopy.textContent = '長押しでコピー'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(done, fail);
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = addr; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta); done();
        } catch (err) { fail(); }
      }
    });
  }
  if (popClose) popClose.addEventListener('click', closePop);
  if (pop) pop.addEventListener('click', function (e) { if (e.target === pop) closePop(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePop();
  });
})();
