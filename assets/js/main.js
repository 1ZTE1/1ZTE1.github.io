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
      // 有 detail 的卡片才可点开二级页面
      const hasDetail = !!(p.detail && (arr(p.detail.intro).length || arr(p.detail.hardware).length));
      return '' +
        '<article class="card project-card reveal' + (hasDetail ? ' is-clickable' : '') + '"' +
        (hasDetail
          ? ' data-project="' + i + '" data-title="' + esc(p.title) + '"' +
            ' role="button" tabindex="0" aria-label="查看《' + esc(p.title) + '》详情"'
          : '') +
        '>' +
        '<div class="project-top">' +
        '<span class="project-num">' + num + '</span>' +
        '<h3 class="project-title">' + esc(p.title) + '</h3>' +
        '</div>' +
        '<p class="project-desc">' + esc(p.desc) + '</p>' +
        (tags ? '<div class="chips chips-sm">' + tags + '</div>' : '') +
        (links.length ? '<div class="project-links">' + links.join('') + '</div>' : '') +
        (hasDetail
          ? '<div class="project-open"><span>查看详情</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
            ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M5 12h14M13 6l6 6-6 6"/></svg></div>'
          : '') +
        '</article>';
    }).join('');
  })();

  /* ======================================================================
   *  二级页面：项目详情
   *  - 用 hash 路由（#project-1），所以能分享链接、浏览器后退键可用
   *  - Esc / 点遮罩 / 点关闭按钮 都能返回
   * ==================================================================== */
  const projectDetail = (function detail() {
    const layer = $('#detailLayer');
    const panel = $('#detailPanel');
    const scroll = $('#detailScroll');
    const closeBtn = $('#detailClose');
    if (!layer || !panel || !scroll) return { open() { }, close() { }, isOpen: () => false };

    const list = arr(SITE.projects);
    let openedIdx = -1;
    let lastFocus = null;
    let pushed = false;   // 本次是否是我们自己 pushState 进来的（决定关闭时能否 history.back）

    function section(title, body, cls) {
      return '<section class="detail-block' + (cls ? ' ' + cls : '') + '">' +
        '<h3 class="detail-block-title"><span class="dot"></span>' + esc(title) + '</h3>' +
        body + '</section>';
    }

    function build(p, i) {
      const d = p.detail || {};
      const num = String(i + 1).padStart(2, '0');
      const tags = arr(p.tags)
        .map((t) => '<span class="chip chip-sm">' + esc(t) + '</span>').join('');

      const links = [];
      if (p.url) links.push('<a class="btn btn-primary detail-btn" href="' + esc(p.url) + '" target="_blank" rel="noopener"><span class="btn-label">查看项目</span><span class="icon-slot">' + icon('external') + '</span></a>');
      if (p.repo) links.push('<a class="btn btn-ghost detail-btn" href="' + esc(p.repo) + '" target="_blank" rel="noopener"><span class="icon-slot">' + icon('github') + '</span><span class="btn-label">源码</span></a>');

      let html = '' +
        '<header class="detail-head">' +
        '<span class="project-num">' + num + '</span>' +
        '<h2 class="detail-title" id="detailTitle">' + esc(p.title) + '</h2>' +
        (d.tagline ? '<p class="detail-tagline">' + esc(d.tagline) + '</p>' : '') +
        (tags ? '<div class="chips chips-sm detail-tags">' + tags + '</div>' : '') +
        '</header>';

      // 关键数据：横排指标条
      const facts = arr(d.facts).filter((x) => x && x.label);
      if (facts.length) {
        html += '<div class="detail-facts">' + facts.map((x) =>
          '<div class="fact"><span class="fact-value">' + esc(x.value || '—') + '</span>' +
          '<span class="fact-label">' + esc(x.label) + '</span></div>').join('') + '</div>';
      }

      html += '<div class="detail-body">';

      const intro = arr(d.intro).filter(Boolean);
      if (intro.length) {
        html += section('项目简介', intro.map((t) => '<p>' + esc(t) + '</p>').join(''));
      }

      const hw = arr(d.hardware).filter((x) => x && x.name);
      if (hw.length) {
        html += section('硬件清单',
          '<ul class="detail-hardware">' + hw.map((x) =>
            '<li><b>' + esc(x.name) + '</b>' +
            (x.desc ? '<span>' + esc(x.desc) + '</span>' : '') + '</li>').join('') + '</ul>');
      }

      const feat = arr(d.features).filter(Boolean);
      if (feat.length) {
        html += section('功能亮点',
          '<ul class="detail-features">' + feat.map((t) =>
            '<li>' + esc(t) + '</li>').join('') + '</ul>');
      }

      html += '</div>' +
        '<footer class="detail-foot">' +
        '<button class="btn btn-ghost detail-back" type="button" id="detailBack">' +
        '<span class="icon-slot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></span>' +
        '<span class="btn-label">返回项目列表</span></button>' +
        (links.length ? '<div class="detail-links">' + links.join('') + '</div>' : '') +
        '</footer>';

      return html;
    }

    function open(i, push) {
      const p = list[i];
      if (!p) return;
      if (openedIdx === i && !layer.hidden) return;

      openedIdx = i;
      scroll.innerHTML = build(p, i);
      scroll.scrollTop = 0;
      layer.hidden = false;
      document.body.classList.add('detail-open');
      // 触发入场过渡（下一帧加类，保证 transition 生效）
      requestAnimationFrame(() => layer.classList.add('is-open'));

      const back = $('#detailBack');
      if (back) back.addEventListener('click', () => close(true));

      if (push) {
        try { history.pushState({ project: i }, '', '#project-' + (i + 1)); pushed = true; } catch (_) { }
      }
      closeBtn.focus({ preventScroll: true });
    }

    function close(viaUser) {
      if (layer.hidden) return;
      layer.classList.remove('is-open');
      document.body.classList.remove('detail-open');

      const finish = () => {
        layer.hidden = true;
        scroll.innerHTML = '';
        openedIdx = -1;
        if (lastFocus && document.contains(lastFocus)) {
          lastFocus.focus({ preventScroll: true });
        }
      };
      if (reduceMotion) finish(); else setTimeout(finish, 240);

      if (viaUser) {
        if (pushed) {
          // 自己 push 的历史，可以安全回退（会触发 hashchange → close(false)）
          pushed = false;
          try { history.back(); } catch (_) { }
        } else if (/^#project-\d+$/.test(location.hash)) {
          // 分享链接直接打开的：没有可回退的历史，只把 hash 抹掉，别把用户带走
          try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { }
        }
      }
    }

    /* --- 事件绑定 --- */
    // 卡片点击 / 回车 / 空格
    $('#projectGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.project-card[data-project]');
      if (!card) return;
      // 卡片内的真实链接不拦截
      if (e.target.closest('a[href]')) return;
      lastFocus = card;
      open(Number(card.dataset.project), true);
    });
    $('#projectGrid').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.project-card[data-project]');
      if (!card) return;
      e.preventDefault();
      lastFocus = card;
      open(Number(card.dataset.project), true);
    });

    closeBtn.addEventListener('click', () => close(true));
    $('#detailBackdrop').addEventListener('click', () => close(true));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !layer.hidden) close(true);
    });

    window.addEventListener('hashchange', () => {
      const m = /^#project-(\d+)$/.exec(location.hash);
      if (m) open(Number(m[1]) - 1, false);
      else close(false);
    });

    // 直接带 hash 打开（分享链接的场景）
    const init = /^#project-(\d+)$/.exec(location.hash);
    if (init) {
      layer.hidden = false;
      open(Number(init[1]) - 1, false);
      try { history.replaceState({ project: Number(init[1]) - 1 }, '', location.hash); } catch (_) { }
    }

    return { open, close, isOpen: () => !layer.hidden };
  })();

  /* 暴露给控制台调试用：projectDetail.open(0) / projectDetail.close() */
  window.projectDetail = projectDetail;

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
