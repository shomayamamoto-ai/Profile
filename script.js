/* SHOMA — Portfolio interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  /* ---------- Preloader ---------- */
  document.body.classList.add('is-loading');
  var loader = document.getElementById('loader');
  function endLoad() {
    document.body.classList.remove('is-loading');
    if (loader) loader.classList.add('done');
    // kick off hero line reveal
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('in-line');
  }
  window.addEventListener('load', function () {
    setTimeout(endLoad, reduce ? 0 : 1500);
  });
  // safety: never hang
  setTimeout(endLoad, 3200);

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

  /* ---------- Custom cursor ---------- */
  var cursor = document.getElementById('cursor');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (cursor && fine && !reduce) {
    var label = cursor.querySelector('.cursor__label');
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('visible'); });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
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
    s.addEventListener('click', function () { openLb(i); });
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

  /* ---------- Obfuscated email (assembled only on interaction) ---------- */
  function buildMail(el) {
    var m = el.getAttribute('data-m');
    if (!m) return '';
    try { return 'mailto:' + atob(m); } catch (err) { return ''; }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.js-mail'), function (el) {
    el.addEventListener('click', function (e) {
      var m = buildMail(el);
      if (m) { e.preventDefault(); window.location.href = m; }
    });
  });
})();
