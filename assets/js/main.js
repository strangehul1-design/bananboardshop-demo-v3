/* BANANBOARDSHOP · вариант 3 — поведение сайта (без зависимостей) */
(function () {
  'use strict';

  var BB = window.BB || { products: [], cats: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* «спокойный режим» (без бегущей ленты, парения, брызг и параллакса): по умолчанию ВЫКЛЮЧЕН — анимации работают.
     Кнопка «Анимация» в футере переключает режим и запоминает выбор в браузере. */
  var calm = false;
  try { if (localStorage.getItem('bb-motion') === 'off') calm = true; } catch (e) { /* ok */ }
  function applyCalm() {
    document.documentElement.classList.toggle('calm', calm);
    var b = document.querySelector('[data-motion-toggle]');
    if (b) { b.setAttribute('aria-pressed', calm ? 'false' : 'true'); b.textContent = calm ? '[ Анимация: выкл ]' : '[ Анимация: вкл ]'; }
  }
  applyCalm();
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (n) { return Number(n).toLocaleString('ru-RU') + ' ₽'; };
  var raf = window.requestAnimationFrame.bind(window);
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ---------- reveal on scroll ---------- */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  }
  function observeReveal(root) {
    $$('.rv', root).forEach(function (el) {
      if (el.classList.contains('in')) return;
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- афиши: оторванные края, наклон, бумага ---------- */
  var PAPERS = ['', 'card--k', '', 'card--y', '', 'card--g', '', 'card--k', 'card--y', ''];
  function torn(r, topTorn) {
    /* контур оторванного листа: «случайное блуждание» вдоль каждого края */
    var pts = [], i, v, n;
    v = 0; n = 46;
    for (i = 0; i <= n; i++) { v = clamp(v + (r() - 0.5) * 0.7, 0, 1.1); pts.push([i / n * 100, topTorn ? v : 0]); }
    v = 0; n = 60;
    for (i = 1; i <= n; i++) { v = clamp(v + (r() - 0.5) * 0.8, 0, 1.3); pts.push([100 - v, i / n * 100]); }
    v = 0; n = 46;
    for (i = n - 1; i >= 0; i--) { v = clamp(v + (r() - 0.5) * 0.7, 0, 1.3); pts.push([i / n * 100, 100 - v]); }
    v = 0; n = 60;
    for (i = n - 1; i > 0; i--) { v = clamp(v + (r() - 0.5) * 0.8, 0, 1.3); pts.push([v, i / n * 100]); }
    return 'polygon(' + pts.map(function (p) { return p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%'; }).join(',') + ')';
  }
  function decorate(card, i) {
    var r = rnd(7000 + i * 97 + 13);
    var feature = card.classList.contains('card--feature');
    var set = function (k, v) { card.style.setProperty(k, v); };
    set('--r', ((r() * 2 - 1) * (feature ? 1 : 1.9)).toFixed(2) + 'deg');
    set('--dy', ((r() * 2 - 1) * 0.6).toFixed(2) + 'cqw');
    set('--pr', ((r() < 0.5 ? -1 : 1) * (6 + r() * 9)).toFixed(1) + 'deg');
    set('--br', Math.floor(r() * 360) + 'deg');
    set('--ir', ((r() * 2 - 1) * 2.4).toFixed(1) + 'deg');
    set('--cy', Math.floor(32 + r() * 40) + '%');
    set('--cx', Math.floor(25 + r() * 50) + '%');
    if (!feature && !/card--(y|k|g)\b/.test(card.className)) {
      var v = PAPERS[i % PAPERS.length]; if (v) card.classList.add(v);
    }
    var paper = $('.card__paper', card);
    if (paper) paper.style.clipPath = torn(r, r() < 0.7);
    var blob = $('.card__blob', card);
    if (blob) blob.classList.add('b' + (1 + (i % 3)));
    var tp = $('.tp', card);
    if (tp) {
      tp.style.setProperty('--r', ((r() * 2 - 1) * 8).toFixed(1) + 'deg');
      tp.style.left = (28 + r() * 44).toFixed(0) + '%';
      tp.style.marginLeft = '-3.2cqw';
      if (r() < 0.5) tp.classList.add(r() < 0.5 ? 'tp--g' : 'tp--k');
      if (!feature && r() < 0.42) {
        var t2 = document.createElement('i'); t2.className = 'tp b'; t2.setAttribute('aria-hidden', 'true'); card.appendChild(t2);
      }
    }
  }

  /* ---------- карточки каталога ---------- */
  function cardHTML(p) {
    var colorNames = p.colors.map(function (c) { return c[1]; }).join(' ');
    var colors = p.colors.map(function (c) {
      return '<span class="dots"><i style="--c:' + c[0] + '"></i>' + c[1] + '</span>';
    }).join('');
    var url = BB.productUrl(p.id);
    var q = (p.name + ' ' + p.desc + ' ' + colorNames).toLowerCase();
    var img = p.img.replace('catalog/', 'sticker/');
    return '' +
      '<article class="card rv" data-id="' + p.id + '" data-cat="' + p.cat + '" data-q="' + q + '">' +
        '<div class="card__paper">' +
          '<a class="card__media" href="' + url + '" target="_blank" rel="noopener" aria-label="' + p.name + ' — открыть во ВКонтакте">' +
            '<i class="card__blob"></i><img src="' + img + '" alt="' + p.name + '" loading="lazy" decoding="async">' +
          '</a>' +
          '<div class="card__meta mono">' +
            '<h3 class="card__name"><a href="' + url + '" target="_blank" rel="noopener">' + p.name + '</a></h3>' +
            '<p class="card__desc">' + p.desc + '</p>' +
            (colors ? '<p class="card__colors">' + colors + '</p>' : '') +
          '</div>' +
        '</div>' +
        '<span class="card__price">' + fmt(p.price) + '</span>' +
        '<button class="card__add" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + p.name + '"><svg width="14" height="14"><use href="#i-plus"/></svg></button>' +
        '<i class="tp" aria-hidden="true"></i>' +
      '</article>';
  }

  var gridEl = $('[data-grid]');
  var railEl = $('[data-rail]');
  if (gridEl) {
    var fresh = BB.products.filter(function (p) { return p.new; });
    fresh.forEach(function (p, i) {
      var tmp = document.createElement('div');
      tmp.innerHTML = cardHTML(p);
      var el = tmp.firstChild;
      el.style.setProperty('--d', (0.05 * (i + 4)) + 's');
      gridEl.appendChild(el);
    });
    $$('.card', gridEl).forEach(function (c, i) { decorate(c, i); });
    observeReveal(gridEl);
  }
  if (railEl) {
    railEl.innerHTML = BB.products.map(cardHTML).join('');
    $$('.card', railEl).forEach(function (c, i) { decorate(c, i + 20); c.classList.add('in'); });
  }

  /* ---------- hero: слайдер ---------- */
  var hero = $('[data-hero]');
  var idx = 0, timer = null, userPause = 0;
  if (hero) {
    var slides = $$('.slide', hero), thumbs = $$('.thumb', hero);
    var track = $('.rail__track', hero), curEl = $('[data-cur]', hero), barEl = $('.rail__count', hero);

    var introDone = false;
    var go = function (i) {
      if (introDone) hero.classList.remove('intro');   /* задержка входа — только для первой загрузки */
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === idx); });
      if (curEl) curEl.textContent = pad2(idx + 1);
      if (barEl) barEl.style.setProperty('--p', (idx + 1) / slides.length);
      if (track && thumbs.length > 1) {
        var step = thumbs[1].offsetLeft - thumbs[0].offsetLeft;
        var horizontal = getComputedStyle(track).flexDirection !== 'column';
        var shift = window.innerWidth <= 760 ? 0 : Math.min(idx, Math.max(0, slides.length - 2)) * step;
        track.style.transform = horizontal ? 'translate3d(' + (-shift) + 'px,0,0)' : '';
      }
    };
    var play = function () {
      stop();
      timer = setInterval(function () {
        if (calm || Date.now() < userPause || document.hidden) return;
        go(idx + 1);
      }, 6200);
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };

    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { userPause = Date.now() + 12000; go(+t.getAttribute('data-go')); });
    });
    hero.addEventListener('mouseenter', function () { userPause = Date.now() + 4000; });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight * 0.6) return;
      userPause = Date.now() + 12000;
      go(idx + (e.key === 'ArrowRight' ? 1 : -1));
    });

    /* свайп по сцене на телефоне */
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) { userPause = Date.now() + 12000; go(idx + (dx < 0 ? 1 : -1)); }
    }, { passive: true });

    /* лёгкий параллакс от курсора + баллончик */
    if (window.matchMedia('(hover: hover)').matches) {
      var pq = null;
      hero.addEventListener('mousemove', function (e) {
        if (pq || calm) return;
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        pq = raf(function () { hero.style.setProperty('--px', (x * 2).toFixed(3)); hero.style.setProperty('--py', (y * 2).toFixed(3)); pq = null; });
      });
      hero.addEventListener('mouseleave', function () { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });

      /* баллончик: курсор оставляет жёлтые, зелёные и белые брызги, которые тают за пару секунд */
      var cv = $('[data-spray]', hero);
      if (cv && cv.getContext) {
        var cx = cv.getContext('2d'), cw = 0, ch = 0, run = false, last = null, tick = 0;
        var COLORS = ['#fff500', '#68b92c', '#f6f3ea', '#14120f'];
        var fit = function () {
          var rc = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
          cw = rc.width; ch = rc.height; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        fit(); window.addEventListener('resize', fit);
        var sprayAt = function (x, y, speed) {
          var n = 22 + Math.min(70, speed * 1.2), col = COLORS[Math.floor(Date.now() / 1300) % COLORS.length];
          for (var i = 0; i < n; i++) {
            var a = Math.random() * 6.283, d = Math.abs((Math.random() + Math.random() + Math.random() - 1.5)) * 34;
            cx.globalAlpha = 0.4 + Math.random() * 0.6; cx.fillStyle = col;
            cx.beginPath(); cx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.8 + Math.random() * 2.4, 0, 6.283); cx.fill();
          }
        };
        var fade = function () {
          cx.globalCompositeOperation = 'destination-out'; cx.globalAlpha = 1; cx.fillStyle = 'rgba(0,0,0,.035)'; cx.fillRect(0, 0, cw, ch); cx.globalCompositeOperation = 'source-over';
          if (++tick % 90 === 0 && !last) { run = false; cx.clearRect(0, 0, cw, ch); return; }
          raf(fade);
        };
        hero.addEventListener('mousemove', function (e) {
          if (calm) return;
          var rc = cv.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
          var sp = last ? Math.hypot(x - last.x, y - last.y) : 0;
          if (sp > 2) { sprayAt(x, y, sp); }
          last = { x: x, y: y, t: Date.now() };
          if (!run) { run = true; tick = 0; raf(fade); }
          clearTimeout(sprayAt.t); sprayAt.t = setTimeout(function () { last = null; }, 160);
        });
      }
    }

    go(0); introDone = true; play();
    setTimeout(function () { hero.classList.remove('intro'); }, 2800);
    window.addEventListener('resize', function () { go(idx); });

    /* размер */
    var heroSize = 'M';
    $$('.sizes button', hero).forEach(function (b) {
      b.addEventListener('click', function () {
        heroSize = b.getAttribute('data-size');
        $$('.sizes button', hero).forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
      });
    });
    var heroPrice = $('[data-hero-price]', hero), hp = BB.byId && BB.byId(BB.hero.id);
    if (heroPrice && hp) heroPrice.textContent = fmt(hp.price);
    var heroBtn = $('[data-add-hero]', hero);
    if (heroBtn) heroBtn.addEventListener('click', function () {
      addToCart(BB.hero.id, heroSize);
      heroBtn.classList.add('is-done'); setTimeout(function () { heroBtn.classList.remove('is-done'); }, 1400);
    });

    /* карточки-образы ведут к нужному слайду */
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-look]');
      if (!b) return;
      userPause = Date.now() + 15000;
      go(+b.getAttribute('data-look'));
      window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    });
  }

  /* ---------- корзина ---------- */
  var KEY = 'bb-cart-v1';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(function (l) { return BB.byId(l.id); }); } catch (e) { cart = []; }
  var drawer = $('#cart'), listEl = $('[data-cart-list]'), totalEl = $('[data-cart-total]'), fab = $('.fab');
  var lastOpener = null;

  function saveCart() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* без хранилища тоже работает */ } }
  function cartTotal() { return cart.reduce(function (s, l) { return s + BB.byId(l.id).price * l.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }

  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; if (el.classList.contains('count')) el.hidden = n === 0; });
    if (fab) fab.hidden = n === 0;
    if (totalEl) totalEl.textContent = fmt(cartTotal());
    if (!listEl) return;
    listEl.innerHTML = cart.map(function (l, i) {
      var p = BB.byId(l.id);
      var meta = (l.size ? 'размер ' + l.size : (p.apparel ? 'размер — уточним' : fmt(p.price)));
      return '' +
        '<li data-i="' + i + '">' +
          '<div class="line__img"><img src="' + p.img + '" alt=""></div>' +
          '<div class="line__t"><b>' + p.name + '</b><span>' + meta + ' · ' + fmt(p.price) + '</span>' +
            '<div class="line__qty"><button type="button" data-dec aria-label="Меньше">−</button><span>' + l.qty + '</span><button type="button" data-inc aria-label="Больше">+</button></div></div>' +
          '<div><div class="line__sum">' + fmt(p.price * l.qty) + '</div><button class="line__rm" type="button" data-rm>удалить</button></div>' +
        '</li>';
    }).join('');
  }

  function addToCart(id, size) {
    var p = BB.byId(id); if (!p) return;
    size = size || '';
    var found = cart.filter(function (l) { return l.id === id && (l.size || '') === size; })[0];
    if (found) found.qty += 1; else cart.push({ id: id, size: size, qty: 1 });
    saveCart(); renderCart();
    toast('В корзине: ' + p.name + (size ? ', ' + size : ''));
    if (fab) { fab.animate && fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' }); }
  }

  function openCart(opener) {
    if (!drawer) return;
    lastOpener = opener || document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    var c = $('.drawer__head [data-cart-close]', drawer); if (c) c.focus();
  }
  function closeCart() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastOpener && lastOpener.focus) lastOpener.focus();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-200px;opacity:0'; document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }

  function checkout() {
    if (!cart.length) { toast('Корзина пока пуста'); return; }
    var lines = cart.map(function (l, i) {
      var p = BB.byId(l.id);
      return (i + 1) + '. ' + p.name + (l.size ? ', размер ' + l.size : (p.apparel ? ' (размер уточнить)' : '')) + ' — ' + fmt(p.price) + ' × ' + l.qty;
    });
    var text = 'Здравствуйте! Хочу заказать:\n' + lines.join('\n') + '\nИтого: ' + fmt(cartTotal()) + '\nГород: ';
    window.open(BB.vkDialog, '_blank', 'noopener');
    copyText(text).then(function (ok) {
      toast(ok ? 'Заказ скопирован — вставьте его в сообщение магазину' : 'Не получилось скопировать. Напишите нам или позвоните: +7 (351) 900-31-19');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest && t.closest('[data-add]');
    if (add) {
      var id = add.getAttribute('data-add');
      addToCart(id, '');
      add.classList.add('is-done'); setTimeout(function () { add.classList.remove('is-done'); }, 1200);
      return;
    }
    var open = t.closest && t.closest('[data-cart-open]');
    if (open) { openCart(open); return; }
    if (t.closest && t.closest('[data-cart-close]')) { closeCart(); return; }
    if (t.closest && t.closest('[data-checkout]')) { checkout(); return; }
    var li = t.closest && t.closest('.drawer__list li');
    if (li) {
      var i = +li.getAttribute('data-i');
      if (t.closest('[data-inc]')) { cart[i].qty += 1; }
      else if (t.closest('[data-dec]')) { cart[i].qty = Math.max(1, cart[i].qty - 1); }
      else if (t.closest('[data-rm]')) { cart.splice(i, 1); }
      else return;
      saveCart(); renderCart();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeCart(); closeMenu(); return; }
    if (e.key === 'Tab' && drawer && drawer.classList.contains('is-open')) {
      var f = $$('button, a[href], input', $('.drawer__panel', drawer)).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  renderCart();

  /* ---------- фильтры и поиск (лента «Снаряжение») ---------- */
  var chipsBox = $('[data-chips]'), searchEl = $('[data-search]'), emptyEl = $('[data-empty]');
  var state = { cat: 'all', q: '' };
  if (chipsBox) {
    chipsBox.innerHTML = BB.cats.map(function (c) {
      return '<button class="chip dymo" type="button" data-cat="' + c.id + '" aria-pressed="' + (c.id === 'all') + '">' + c.label + '</button>';
    }).join('');
    chipsBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      state.cat = b.getAttribute('data-cat');
      $$('.chip', chipsBox).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      applyFilters();
    });
  }
  function setChips(open) {
    if (!chipsBox) return;
    chipsBox.hidden = !open;
    $$('[data-filters-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  }
  $$('[data-filters-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { setChips(chipsBox.hidden); });
  });
  $$('[data-filters-open]').forEach(function (a) { a.addEventListener('click', function () { setChips(true); }); });
  $$('[data-brand]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (searchEl) { searchEl.value = a.getAttribute('data-brand'); state.q = searchEl.value.toLowerCase(); state.cat = 'all'; }
      $$('.chip', chipsBox).forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-cat') === 'all' ? 'true' : 'false'); });
      applyFilters();
    });
  });
  $$('[data-search-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var inv = $('#inventory'); if (inv) inv.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { if (searchEl) searchEl.focus({ preventScroll: true }); }, calm ? 0 : 500);
    });
  });
  if (searchEl) searchEl.addEventListener('input', function () { state.q = searchEl.value.trim().toLowerCase(); applyFilters(); });

  function applyFilters() {
    if (!railEl) return;
    var shown = 0;
    $$('.card', railEl).forEach(function (c) {
      var okCat = state.cat === 'all' || c.getAttribute('data-cat') === state.cat;
      var okQ = !state.q || c.getAttribute('data-q').indexOf(state.q) !== -1;
      var vis = okCat && okQ;
      c.classList.toggle('is-hidden', !vis);
      if (vis) shown++;
    });
    if (emptyEl) emptyEl.hidden = shown !== 0;
    railEl.scrollLeft = 0;
    updateRail();
  }

  /* ---------- лента: стрелки и прогресс ---------- */
  var prev = $('[data-rail-prev]'), next = $('[data-rail-next]');
  var curR = $('[data-rail-cur]'), totR = $('[data-rail-total]'), barR = $('[data-rail-bar]');
  function stepPx() {
    var c = railEl && $('.card:not(.is-hidden)', railEl); if (!c) return 0;
    return c.getBoundingClientRect().width + parseFloat(getComputedStyle(railEl).columnGap || getComputedStyle(railEl).gap || 0);
  }
  function updateRail() {
    if (!railEl) return;
    var vis = $$('.card:not(.is-hidden)', railEl).length;
    var st = stepPx() || 1;
    var cur = clamp(Math.round(railEl.scrollLeft / st) + 1, 1, Math.max(1, vis));
    var max = railEl.scrollWidth - railEl.clientWidth;
    if (curR) curR.textContent = pad2(vis ? cur : 0);
    if (totR) totR.textContent = pad2(vis);
    if (barR) barR.style.setProperty('--p', max > 2 ? clamp(railEl.scrollLeft / max, 0, 1) : 1);
    if (barR && barR.parentNode) barR.parentNode.style.setProperty('--p', max > 2 ? clamp(railEl.scrollLeft / max, 0, 1) : 1);
    if (prev) prev.disabled = railEl.scrollLeft < 4;
    if (next) next.disabled = railEl.scrollLeft > max - 4;
  }
  if (railEl) {
    railEl.addEventListener('scroll', function () { raf(updateRail); }, { passive: true });
    window.addEventListener('resize', updateRail);
    if (prev) prev.addEventListener('click', function () { railEl.scrollBy({ left: -stepPx() * 2, behavior: calm ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { railEl.scrollBy({ left: stepPx() * 2, behavior: calm ? 'auto' : 'smooth' }); });
    railEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); railEl.scrollBy({ left: stepPx(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); railEl.scrollBy({ left: -stepPx(), behavior: 'smooth' }); }
    });
    /* перетаскивание мышью */
    var drag = null;
    railEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: railEl.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) { drag.moved = true; railEl.style.scrollSnapType = 'none'; railEl.style.cursor = 'grabbing'; }
      if (drag.moved) railEl.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      var moved = drag.moved; drag = null;
      railEl.style.scrollSnapType = ''; railEl.style.cursor = '';
      if (moved) { var block = function (ev) { ev.preventDefault(); ev.stopPropagation(); }; railEl.addEventListener('click', block, { capture: true, once: true }); }
    });
    updateRail();
  }

  /* ---------- мобильное меню ---------- */
  var menuBtn = $('[data-menu-toggle]'), menu = $('#menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav')) closeMenu(); });
  }

  /* ---------- штрихкоды ---------- */
  $$('[data-barcode]').forEach(function (svg, k) {
    var r = rnd(20090 + k * 7), x = 0, out = '';
    while (x < 158) {
      var w = [1, 1, 2, 3, 4][Math.floor(r() * 5)], gap = [1, 2, 2, 3][Math.floor(r() * 4)];
      out += '<rect x="' + x + '" y="0" width="' + w + '" height="30"/>';
      x += w + gap;
    }
    svg.innerHTML = out;
  });

  /* ---------- слово на всю ширину в футере ---------- */
  var word = $('.foot__word .display');
  function fitWord() {
    if (!word) return;
    var box = word.parentNode, target = box.clientWidth;
    word.style.fontSize = '';
    var cs = parseFloat(getComputedStyle(word).fontSize) || 100;
    word.style.fontSize = cs + 'px';
    var w = word.scrollWidth || word.getBoundingClientRect().width;
    var range = document.createRange(); range.selectNodeContents(word);
    w = range.getBoundingClientRect().width || w;
    if (w > 0) word.style.fontSize = (cs * target / w * 0.995).toFixed(2) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord); else window.addEventListener('load', fitWord);
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(fitWord, 120); });

  /* ---------- подписка (через письмо магазину) ---------- */
  var sub = $('[data-sub]');
  if (sub) sub.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (new FormData(sub)).get('email');
    var body = encodeURIComponent('Добавьте мой email в рассылку о новинках: ' + email);
    toast('Открываем почту — отправьте письмо, и мы вас подпишем');
    setTimeout(function () { location.href = 'mailto:' + BB.email + '?subject=' + encodeURIComponent('Подписка на новинки') + '&body=' + body; }, 500);
    sub.reset();
  });

  /* ---------- год ---------- */
  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- переключатель анимации ---------- */
  var motionBtn = $('[data-motion-toggle]');
  if (motionBtn) motionBtn.addEventListener('click', function () {
    calm = !calm;
    try { localStorage.setItem('bb-motion', calm ? 'off' : 'on'); } catch (e) { /* ok */ }
    applyCalm();
    if (hero) { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); }
    if (manifest && calm) { manifest.style.setProperty('--py3', '0px'); }
    onScroll();
    toast(calm ? 'Анимация выключена' : 'Анимация включена');
  });

  /* ---------- прокрутка: лёгкий параллакс граффити в манифесте ---------- */
  var manifest = $('.manifest'), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    raf(function () {
      ticking = false;
      var vh = window.innerHeight;
      if (manifest && !calm) {
        var r = manifest.getBoundingClientRect();
        if (r.bottom > -100 && r.top < vh + 100) {
          var d = (r.top + r.height / 2 - vh / 2);
          manifest.style.setProperty('--py3', (d * 0.07).toFixed(1) + 'px');
        }
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  observeReveal(document);
})();


