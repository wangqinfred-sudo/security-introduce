(() => {
  const params = new URLSearchParams(window.location.search);
  const enabled = params.get('hotspotDebug') === '1';
  if (!enabled) return;

  const PANEL_ID = '__hotspot_debug_panel__';
  const OPEN_BTN_ID = '__hotspot_debug_open_btn__';
  if (document.getElementById(PANEL_ID)) return;

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function getActiveMainTabId() {
    return qs('.tab-button.active')?.dataset?.tab || '';
  }
  function getActiveTabContent() {
    const tabId = getActiveMainTabId();
    if (!tabId) return qs('.tab-content.active');
    return document.getElementById(`content-${tabId}`) || qs('.tab-content.active');
  }
  function getActiveSubContent(tabContent) {
    return qs('.sub-tab-content.active', tabContent) || tabContent;
  }
  function getInteractiveRoot() {
    const tabContent = getActiveTabContent();
    if (!tabContent) return null;
    const subContent = getActiveSubContent(tabContent);
    return (
      qs('.two-factor-images.interactive', subContent) ||
      qs('.interactive', subContent) ||
      qs('.two-factor-images', subContent) ||
      subContent
    );
  }

  function getActiveStep(interactiveRoot) {
    // 优先从当前激活图片读取 step（最可靠，且限定在当前流程容器内）
    const activeImage = qs('.step-image.active[data-step]', interactiveRoot);
    const imgStep = activeImage?.getAttribute('data-step');
    if (imgStep) return String(imgStep);

    // 其次从当前激活的子内容内读取 step-indicator（避免误读到其它模块仍处于 active 的 step1）
    const tabContent = getActiveTabContent();
    const subContent = tabContent ? getActiveSubContent(tabContent) : null;
    const activeIndicator = subContent ? qs('.step-indicator.active[data-step]', subContent) : null;
    const step = activeIndicator?.getAttribute('data-step');
    return String(step || '1');
  }

  function getHotspotForStep(interactiveRoot, step) {
    const candidates = qsa(`.hotspot[data-step="${step}"]`, interactiveRoot);
    if (candidates.length === 0) return null;
    const visible = candidates.find((h) => getComputedStyle(h).display !== 'none');
    return visible || candidates[0];
  }

  function pct(n) {
    return `${Math.max(0, Math.min(100, n)).toFixed(2)}%`;
  }

  function computePctInBox(clientX, clientY, box) {
    const x = ((clientX - box.left) / box.width) * 100;
    const y = ((clientY - box.top) / box.height) * 100;
    return { leftPct: pct(x), topPct: pct(y) };
  }

  function getContextKey() {
    const tabId = getActiveMainTabId();
    const tabContent = getActiveTabContent();
    const subActive = qs('.sub-tab-button.active', tabContent);
    const sub = subActive?.dataset?.subTab || (qs('.sub-tab-content.active', tabContent)?.id || '');
    return `${location.pathname}::${tabId}::${sub}`;
  }

  function loadPos(contextKey, step) {
    try {
      const raw = localStorage.getItem('__hotspot_positions__');
      if (!raw) return null;
      const db = JSON.parse(raw);
      return db?.[contextKey]?.[step] || null;
    } catch {
      return null;
    }
  }

  function savePos(contextKey, step, pos) {
    try {
      const raw = localStorage.getItem('__hotspot_positions__');
      const db = raw ? JSON.parse(raw) : {};
      db[contextKey] = db[contextKey] || {};
      db[contextKey][step] = pos;
      localStorage.setItem('__hotspot_positions__', JSON.stringify(db));
    } catch {
      // ignore
    }
  }

  function exportAll() {
    try {
      const raw = localStorage.getItem('__hotspot_positions__');
      const db = raw ? JSON.parse(raw) : {};
      window.__hotspotPositionsExportAll = db;
      return db;
    } catch {
      return {};
    }
  }

  function exportCurrentPage() {
    const all = exportAll();
    const prefix = `${location.pathname}::`;
    const pageOnly = {};
    for (const [k, v] of Object.entries(all)) {
      if (k.startsWith(prefix)) pageOnly[k] = v;
    }
    window.__hotspotPositionsExportPage = pageOnly;
    return pageOnly;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback: prompt
      try {
        window.prompt('复制下面内容并发送给我：', text);
      } catch {
        // ignore
      }
      return false;
    }
  }

  function exportCurrentContext() {
    const ctx = getContextKey();
    const all = exportAll();
    return { ctx, data: all?.[ctx] || {} };
  }

  function ensurePanel() {
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.cssText = [
      'position:fixed',
      'right:16px',
      // 尽量贴底，避免遮挡灰色图片区域
      'bottom:4px',
      'z-index:2000',
      'width:340px',
      'max-height:240px',
      'background:#fff',
      'border:1px solid rgba(0,0,0,.12)',
      'border-radius:10px',
      'box-shadow:0 8px 28px rgba(0,0,0,.18)',
      'font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial',
      'font-size:12px',
      'color:#1F2329',
      'overflow:hidden',
    ].join(';');

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.08);">
        <div style="font-weight:700;">热区定位调试</div>
        <button data-action="close" style="border:none;background:transparent;cursor:pointer;font-size:14px;line-height:14px;color:#666;">×</button>
      </div>
      <div data-field="body" style="padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:auto;max-height:calc(240px - 44px);">
        <div style="color:#666;line-height:1.5;">
          用法：按住 <b>Shift</b> 点击灰底图片区域，更新当前步热区坐标。
        </div>
        <div>
          <div style="color:#666;">当前上下文</div>
          <div data-field="ctx" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;word-break:break-all;">-</div>
        </div>
        <div style="display:flex;gap:8px;">
          <div style="flex:1;">
            <div style="color:#666;">当前 step</div>
            <div data-field="step" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">-</div>
          </div>
          <div style="flex:1;">
            <div style="color:#666;">top / left</div>
            <div data-field="pos" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">-</div>
          </div>
        </div>
        <div>
          <div style="color:#666;">建议写回 HTML</div>
          <div data-field="snippet" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;word-break:break-all;">-</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
          <button data-action="refresh" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;">刷新状态</button>
          <button data-action="export" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;">导出到 Console</button>
          <button data-action="copy-current" style="padding:6px 10px;border-radius:8px;border:none;background:#1456F0;color:#fff;cursor:pointer;">复制当前上下文</button>
          <button data-action="copy-all" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;">复制当前页全部</button>
          <button data-action="copy-all-pages" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;">复制所有页</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    panel.addEventListener('click', (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      if (action === 'close') {
        panel.style.display = 'none';
        ensureOpenButton();
        return;
      }
      if (action === 'refresh') updatePanel();
      if (action === 'export') {
        const page = exportCurrentPage();
        const all = exportAll();
        console.log('[hotspotDebug] Export current page:', page);
        console.log('[hotspotDebug] Export all pages:', all);
        return;
      }
      if (action === 'copy-current') {
        const payload = exportCurrentContext();
        copyText(JSON.stringify(payload, null, 2));
      }
      if (action === 'copy-all') {
        const payload = exportCurrentPage();
        copyText(JSON.stringify(payload, null, 2));
      }
      if (action === 'copy-all-pages') {
        const payload = exportAll();
        copyText(JSON.stringify(payload, null, 2));
      }
    });
    return panel;
  }

  function ensureOpenButton() {
    if (document.getElementById(OPEN_BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = OPEN_BTN_ID;
    btn.type = 'button';
    btn.textContent = '热区';
    btn.title = '打开热区定位调试面板';
    btn.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:4px',
      'z-index:2001',
      'height:32px',
      'padding:0 10px',
      'border-radius:999px',
      'border:1px solid rgba(0,0,0,.15)',
      'background:#fff',
      'cursor:pointer',
      'box-shadow:0 6px 18px rgba(0,0,0,.12)',
      'font-size:12px',
      'color:#1F2329',
    ].join(';');

    btn.addEventListener('click', () => {
      const panel = document.getElementById(PANEL_ID);
      if (panel) {
        panel.style.display = 'block';
      }
      btn.remove();
      updatePanel();
    });

    document.body.appendChild(btn);
  }

  function applySavedPositionIfAny(interactiveRoot) {
    const ctx = getContextKey();
    const step = getActiveStep(interactiveRoot);
    const hotspot = getHotspotForStep(interactiveRoot, step);
    if (!hotspot) return;
    const saved = loadPos(ctx, step);
    if (!saved) return;
    hotspot.style.top = saved.top;
    hotspot.style.left = saved.left;
  }

  function updatePanel() {
    const panel = qs(`#${PANEL_ID}`);
    if (!panel) return;
    const interactiveRoot = getInteractiveRoot();
    const ctx = getContextKey();
    const step = interactiveRoot ? getActiveStep(interactiveRoot) : '-';
    const hotspot = interactiveRoot ? getHotspotForStep(interactiveRoot, step) : null;

    const top = hotspot?.style?.top || (hotspot ? getComputedStyle(hotspot).top : '-');
    const left = hotspot?.style?.left || (hotspot ? getComputedStyle(hotspot).left : '-');

    qs('[data-field="ctx"]', panel).textContent = ctx;
    qs('[data-field="step"]', panel).textContent = step;
    qs('[data-field="pos"]', panel).textContent = hotspot ? `${top} / ${left}` : '-';
    qs('[data-field="snippet"]', panel).textContent = hotspot
      ? `style=\"top: ${top}; left: ${left};\"`
      : '-';
  }

  function init() {
    ensurePanel();

    const applyAndUpdate = () => {
      const interactiveRoot = getInteractiveRoot();
      if (interactiveRoot) applySavedPositionIfAny(interactiveRoot);
      updatePanel();
    };

    applyAndUpdate();

    document.addEventListener('click', (e) => {
      const interactiveRoot = getInteractiveRoot();
      if (!interactiveRoot) return;

      // step 切换后刷新面板
      const indicator = e.target?.closest?.('.step-indicator');
      const subTabBtn = e.target?.closest?.('.sub-tab-button');
      const mainTabBtn = e.target?.closest?.('.tab-button');
      if (indicator || subTabBtn || mainTabBtn) {
        setTimeout(applyAndUpdate, 0);
        return;
      }

      // Shift + 点击容器设置坐标
      if (!e.shiftKey) return;
      // 以当前交互根元素内的 hotspots-container 为坐标系
      const hotspotsContainer = qs('.hotspots-container', interactiveRoot) || e.target?.closest?.('.image-container');
      if (!hotspotsContainer) return;

      const step = getActiveStep(interactiveRoot);
      const hotspot = getHotspotForStep(interactiveRoot, step);
      if (!hotspot) return;

      const box = hotspotsContainer.getBoundingClientRect();
      const { leftPct, topPct } = computePctInBox(e.clientX, e.clientY, box);
      hotspot.style.left = leftPct;
      hotspot.style.top = topPct;

      savePos(getContextKey(), step, { left: leftPct, top: topPct });
      updatePanel();

      e.preventDefault();
      e.stopPropagation();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
