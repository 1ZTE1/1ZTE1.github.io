/* ============================================================================
 *  渲染与交互逻辑
 *  —— 一般不需要改这个文件。改文字内容请编辑 content.js
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 配置没加载成功时给出友好提示 ---------- */
  if (typeof SITE === 'undefined' || !SITE) {
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="position:fixed;inset:0;z-index:9999;display:grid;place-items:center;' +
      'background:#06070c;color:#ff7b72;font:15px/1.7 system-ui,sans-serif;text-align:center;padding:24px">' +
      '<div><b>content.js 没有加载成功</b><br>通常是文件里多了一个逗号、少了一个引号。<br>' +
      '把 content.js 恢复成原样，再一点点改。</div></div>');
    return;
  }

  const $ = (s) => document.querySelector(s);
  const RE_ESC = /[&<>"']/g;
  const esc = (s) => String(s == null ? '' : s).replace(RE_ESC,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arr = (v) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 图标 ---------- */
  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3.2 7.2 8.8 5.8 8.8-5.8"/></svg>',
    bilibili: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="13.5" rx="3.2"/><path d="M7 3.2 9.6 6M17 3.2 14.4 6M8.6 11.6v3.2M15.4 11.6v3.2"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.53 3h3.2l-6.99 7.99L21.5 21h-6.6l-5.17-6.76L3.82 21H.6l7.28-8.32L.5 3h6.77l4.83 6.38Zm-1.13 16.23h1.77L6.5 4.67H4.6Z"/></svg>',
    wechat: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.2 3C4.9 3 1.5 5.9 1.5 9.4c0 2 1.1 3.8 2.9 5l-.7 2.6 2.8-1.4c.9.3 1.8.4 2.7.4h.6a5.6 5.6 0 0 1-.2-1.5c0-3.2 3.1-5.8 7-5.8h.6C16.6 5.2 13.3 3 9.2 3Zm-2.6 3.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm5.3 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/><path d="M22.5 14.5c0-2.8-2.8-5.1-6.2-5.1s-6.2 2.3-6.2 5.1 2.8 5.1 6.2 5.1c.7 0 1.4-.1 2-.3l2.3 1.2-.6-1.9c1.5-1 2.5-2.5 2.5-4.1Zm-8.2-1.3a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm4 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z"/></svg>',
    qq: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c3.1 0 5.2 2.2 5.2 5.4 0 .8.3 1.3.8 2 .9 1.2 1.7 2.5 1.7 4 0 1-.4 1.8-1 1.8-.4 0-.8-.3-1-.8-.4 1.3-1.3 2.4-2.4 3 .3.3.6.8.6 1.3 0 .9-.9 1.3-1.9 1.3s-1.6-.4-2-.8c-.4.4-.9.8-2 .8-1 0-1.9-.4-1.9-1.3 0-.5.3-1 .6-1.3-1.1-.6-2-1.7-2.4-3-.2.5-.6.8-1 .8-.6 0-1-.8-1-1.8 0-1.5.8-2.8 1.7-4 .5-.7.8-1.2.8-2C6.8 4.2 8.9 2 12 2Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="m20 4-9.5 9.5"/><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5"/></svg>'
  };
  const icon = (n) => ICONS[n] || ICONS.link;

  /* ======================================================================
   *  渲染：导航
   * ==================================================================== */
  (function nav() {
    $('#brandMark').textContent = SITE.brandMark || '·';
    $('#brandName').textContent = SITE.brandName || 'HOME';

    const links = [
      { href: '#about', label: '关于' },
      { href: '#projects', label: '项目' },
      { href: '#contact', label: '联系' }
    ];
    $('#navLinks').innerHTML = links
      .map((l) => '<a href="' + l.href + '">' + esc(l.label) + '</a>').join('');

    if (SITE.navCta && SITE.navCta.url) {
      const cta = $('#navCta');
      cta.href = SITE.navCta.url;
      cta.querySelector('.icon-slot').innerHTML = icon('github');
      cta.querySelector('.btn-label').textContent = SITE.navCta.label || 'GitHub';
    } else {
      $('#navCta').style.display = 'none';
    }
  })();

  /* ======================================================================
   *  渲染：首屏
   * ==================================================================== */
  (function hero() {
    $('#heroEyebrow').innerHTML = '<span class="eyebrow-mark">//</span>' + esc(SITE.eyebrow || '');
    $('#heroName').textContent = SITE.name || '你的名字';
    $('#heroDesc').textContent = SITE.desc || '';

    // 头像
    const av = $('#avatar');
    if (SITE.avatarImage) {
      av.style.backgroundImage = 'url("' + SITE.avatarImage + '")';
      av.classList.add('has-image');
      av.textContent = '';
    } else {
      av.textContent = SITE.avatarText || (SITE.name || '?').trim().charAt(0) || '·';
    }

    // 按钮
    const act = arr(SITE.actions);
    $('#heroActions').innerHTML = act.map((a) => {
      const cls = a.style === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';
      const ext = /^https?:/i.test(a.url || '') ? ' target="_blank" rel="noopener"' : '';
      const ic = /^https?:/i.test(a.url || '') ? '<span class="icon-slot">' + icon('external') + '</span>' : '';
      return '<a class="' + cls + '" href="' + esc(a.url || '#') + '"' + ext + '>' + ic +
        '<span class="btn-label">' + esc(a.label) + '</span></a>';
    }).join('');

    // 小标签
    $('#heroMeta').innerHTML = arr(SITE.meta)
      .map((m) => '<li>' + esc(m) + '</li>').join('');

    // 打字机
    const lines = arr(SITE.taglines).filter(Boolean);
    const target = $('#heroTagline');
    if (!lines.length) { target.textContent = ''; return; }

    if (reduceMotion) { target.textContent = lines[0]; $('.caret').style.display = 'none'; return; }

    let li = 0, ci = 0, deleting = false;
    (function tick() {
      const line = lines[li];
      if (!deleting) {
        ci++;
        target.textContent = line.slice(0, ci);
        if (ci >= line.length) { deleting = true; return setTimeout(tick, 1900); }
        return setTimeout(tick, 62);
      }
      ci--;
      target.textContent = line.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        return setTimeout(tick, 380);
      }
      return setTimeout(tick, 28);
    })();
  })();

  /* ======================================================================
   *  渲染：关于我
   * ==================================================================== */
  (function about() {
    $('#aboutSub').textContent = SITE.aboutSub || '';
    $('#aboutText').innerHTML =
      '<h3 class="card-title"><span class="dot"></span>简介</h3>' +
      arr(SITE.about).map((p) => '<p>' + esc(p) + '</p>').join('');
    $('#skillChips').innerHTML = arr(SITE.skills)
      .map((s) => '<span class="chip">' + esc(s) + '</span>').join('');
  })();

  /* ======================================================================
   *  渲染：项目
   * ==================================================================== */
  (function projects() {
    $('#projectsSub').textContent = SITE.projectsSub || '';
    const list = arr(SITE.projects);
    if (!list.length) {
      $('#projectGrid').innerHTML = '<p class="empty-tip">还没有添加项目。在 content.js 的 projects 里加吧。</p>';
      return;
    }
    $('#projectGrid').innerHTML = list.map((p, i) => {
      const tags = arr(p.tags).map((t) => '<span class="chip chip-sm">' + esc(t) + '</span>').join('');
      const links = [];
      if (p.url) links.push('<a class="proj-link" href="' + esc(p.url) + '" target="_blank" rel="noopener">查看<span class="icon-slot">' + icon('external') + '</span></a>');
      if (p.repo) links.push('<a class="proj-link" href="' + esc(p.repo) + '" target="_blank" rel="noopener">源码<span class="icon-slot">' + icon('github') + '</span></a>');
      const num = String(i + 1).padStart(2, '0');
      return '' +
        '<article class="card project-card reveal">' +
        '<div class="project-top">' +
        '<span class="project-num">' + num + '</span>' +
        '<h3 class="project-title">' + esc(p.title) + '</h3>' +
        '</div>' +
        '<p class="project-desc">' + esc(p.desc) + '</p>' +
        (tags ? '<div class="chips chips-sm">' + tags + '</div>' : '') +
        (links.length ? '<div class="project-links">' + links.join('') + '</div>' : '') +
        '</article>';
    }).join('');
  })();

  /* ======================================================================
   *  渲染：联系
   * ==================================================================== */
  (function contact() {
    $('#contactSub').textContent = SITE.contactSub || '';

    const list = arr(SITE.contact);
    $('#contactLinks').innerHTML = list.map((c) =>
      '<a class="contact-item" href="' + esc(c.url || '#') + '"' +
      (/^https?:/i.test(c.url || '') ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="contact-icon">' + icon(c.icon) + '</span>' +
      '<span class="contact-text"><b>' + esc(c.label) + '</b><i>' + esc(c.value) + '</i></span>' +
      '</a>').join('');

    $('#contactActions').innerHTML = arr(SITE.contactActions).map((a) => {
      const cls = a.style === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';
      return '<a class="' + cls + '" href="' + esc(a.url || '#') + '">' +
        '<span class="btn-label">' + esc(a.label) + '</span></a>';
    }).join('');
  })();

  /* ======================================================================
   *  渲染：页脚
   * ==================================================================== */
  (function footer() {
    $('#footerText').textContent = SITE.footerText || '';
    $('#footerFine').textContent = SITE.footerFine || '';
  })();

  /* ======================================================================
   *  交互：入场动画
   * ==================================================================== */
  const revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((n) => n.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((n, i) => {
      n.style.transitionDelay = Math.min(i % 6, 5) * 70 + 'ms';
      io.observe(n);
    });
  }

  /* ======================================================================
   *  交互：滚动进度 + 导航状态 + 当前区块高亮
   * ==================================================================== */
  const nav = $('#nav');
  const bar = $('#scrollProgress');
  const navAnchors = Array.from(document.querySelectorAll('#navLinks a'));
  let raf = 0;

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
      nav.classList.toggle('scrolled', y > 24);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = '#' + e.target.id;
        navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ======================================================================
   *  交互：卡片跟随鼠标的高光
   * ==================================================================== */
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    let hot = null;
    document.addEventListener('mousemove', (e) => {
      const t = e.target;
      const card = (t && t.nodeType === 1 && t.closest) ? t.closest('.card') : null;
      if (card !== hot) {
        if (hot) hot.classList.remove('is-hot');
        hot = card;
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      card.classList.add('is-hot');
    }, { passive: true });
  }

  /* ======================================================================
   *  交互：锚点平滑滚动（留出导航栏高度）
   * ==================================================================== */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 76);
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    // file:// 下 replaceState 会被浏览器拒绝，忽略即可
    try { history.replaceState(null, '', id); } catch (_) { }
  });

  /* 控制台留个小签名，无伤大雅 */
  console.log('%c' + (SITE.brandName || '') + ' %c个人主页加载完成',
    'color:#22d3ee;font-weight:700', 'color:#8b93a7');
})();
