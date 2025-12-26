(() => {
  const STYLE_ID = 'process-end-popup-style';
  const POPUP_ID = 'process-end-popup';

  if (window.__processEndPopupInitialized) return;
  window.__processEndPopupInitialized = true;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* 弹窗样式（对齐账号安全页） */
      #${POPUP_ID}.popup-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        justify-content: center;
        align-items: center;
      }

      #${POPUP_ID} .popup-content {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        width: 480px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      #${POPUP_ID} .popup-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      #${POPUP_ID} .popup-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #1456F0;
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 8px;
      }

      #${POPUP_ID} .popup-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        flex: 1;
        text-align: left;
      }

      #${POPUP_ID} .popup-close {
        font-size: 20px;
        color: #999;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }

      #${POPUP_ID} .popup-close:hover {
        background-color: #f0f0f0;
      }

      #${POPUP_ID} .popup-message {
        font-size: 14px;
        color: #666;
        margin-bottom: 24px;
        line-height: 1.6;
        text-align: left;
      }

      #${POPUP_ID} .popup-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      #${POPUP_ID} .popup-admin-btn,
      #${POPUP_ID} .popup-employee-btn {
        background-color: #fff;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      #${POPUP_ID} .popup-admin-btn:hover,
      #${POPUP_ID} .popup-employee-btn:hover {
        border-color: #336DF4;
        color: #336DF4;
      }

      #${POPUP_ID} .popup-next-btn {
        background-color: #1456F0;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      #${POPUP_ID} .popup-next-btn:hover {
        background-color: #336DF4;
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePopup() {
    let popup = document.getElementById(POPUP_ID);
    if (popup) return popup;

    popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.className = 'popup-overlay';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <div class="popup-icon">i</div>
          <div class="popup-title">提示</div>
          <div class="popup-close">×</div>
        </div>
        <div class="popup-message">当前流程已结束，您可以继续体验管理员配置或其他功能。</div>
        <div class="popup-buttons">
          <button id="admin-config-btn" class="popup-admin-btn">管理员配置</button>
          <button id="employee-experience-btn" class="popup-employee-btn" style="display:none;">员工端体验</button>
          <button id="next-btn" class="popup-next-btn">下一个</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    return popup;
  }

  function closePopup() {
    const popup = document.getElementById(POPUP_ID);
    if (popup) popup.style.display = 'none';
  }

  function getActiveMainTab() {
    return document.querySelector('.tab-button.active')?.dataset?.tab || null;
  }

  function getTabContentByTabKey(tabKey) {
    if (!tabKey) return null;
    return document.getElementById(`content-${tabKey}`);
  }

  function guessIsAdminFlow(hotspotEl) {
    const subContent = hotspotEl.closest('.sub-tab-content');
    const id = subContent?.id || '';

    if (id === 'sub-content-admin' || id.endsWith('-admin') || id.includes('-admin')) return true;
    if (id === 'sub-content-employee' || id.endsWith('-employee') || id.includes('-employee')) return false;

    const tabContent = hotspotEl.closest('.tab-content');
    const activeSubBtn = tabContent?.querySelector('.sub-tab-button.active');
    const subTabValue = activeSubBtn?.dataset?.subTab || '';
    if (subTabValue.includes('admin')) return true;
    if (subTabValue.includes('employee')) return false;

    return false;
  }

  function getSubTabValueFor(tabKey, target) {
    if (!tabKey) return null;
    if (tabKey === 'two-factor') {
      return target === 'admin' ? 'admin' : 'employee';
    }
    return `${tabKey}-${target}`;
  }

  function hasSubTabButton(tabKey, target) {
    const tabContent = getTabContentByTabKey(tabKey);
    const subTabValue = getSubTabValueFor(tabKey, target);
    if (!tabContent || !subTabValue) return false;
    return !!tabContent.querySelector(`.sub-tab-button[data-sub-tab="${subTabValue}"]`);
  }

  function showPopupFor(hotspotEl) {
    ensureStyles();
    const popup = ensurePopup();
    const adminBtn = document.getElementById('admin-config-btn');
    const employeeBtn = document.getElementById('employee-experience-btn');

    const activeMainTab = getActiveMainTab();
    const inAdmin = guessIsAdminFlow(hotspotEl);

    const canGoAdmin = hasSubTabButton(activeMainTab, 'admin');
    const canGoEmployee = hasSubTabButton(activeMainTab, 'employee');

    if (adminBtn) {
      adminBtn.style.display = inAdmin || !canGoAdmin ? 'none' : 'inline-block';
    }
    if (employeeBtn) {
      employeeBtn.style.display = inAdmin && canGoEmployee ? 'inline-block' : 'none';
    }

    popup.style.display = 'flex';
  }

  function computeLastStep(interactiveEl) {
    const images = Array.from(interactiveEl.querySelectorAll('.step-image[data-step]'));
    if (images.length === 0) return null;
    let max = 0;
    for (const img of images) {
      const n = Number(img.getAttribute('data-step'));
      if (Number.isFinite(n) && n > max) max = n;
    }
    return max > 0 ? String(max) : null;
  }

  function setupPopupButtons() {
    ensureStyles();
    const popup = ensurePopup();
    const closeBtn = popup.querySelector('.popup-close');
    const adminBtn = document.getElementById('admin-config-btn');
    const employeeBtn = document.getElementById('employee-experience-btn');
    const nextBtn = document.getElementById('next-btn');

    closeBtn?.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
      if (e.target === popup) closePopup();
    });

    adminBtn?.addEventListener('click', () => {
      const activeMainTab = getActiveMainTab();
      const subTabValue = getSubTabValueFor(activeMainTab, 'admin');
      const tabContent = getTabContentByTabKey(activeMainTab);
      const adminTabBtn = tabContent?.querySelector(`.sub-tab-button[data-sub-tab="${subTabValue}"]`);
      adminTabBtn?.click();
      setTimeout(() => {
        const firstStep = tabContent?.querySelector('.admin-indicators .step-indicator[data-step="1"]');
        firstStep?.click();
      }, 100);
      closePopup();
    });

    employeeBtn?.addEventListener('click', () => {
      const activeMainTab = getActiveMainTab();
      const subTabValue = getSubTabValueFor(activeMainTab, 'employee');
      const tabContent = getTabContentByTabKey(activeMainTab);
      const employeeTabBtn = tabContent?.querySelector(`.sub-tab-button[data-sub-tab="${subTabValue}"]`);
      employeeTabBtn?.click();
      setTimeout(() => {
        const firstStep = tabContent?.querySelector('.step-indicators:not(.admin-indicators) .step-indicator[data-step="1"]');
        firstStep?.click();
      }, 100);
      closePopup();
    });

    nextBtn?.addEventListener('click', () => {
      const allTabButtons = Array.from(document.querySelectorAll('.tab-button'));
      const activeTabButton = document.querySelector('.tab-button.active');
      if (!activeTabButton || allTabButtons.length === 0) {
        closePopup();
        return;
      }

      const currentIndex = allTabButtons.indexOf(activeTabButton);
      const nextIndex = (currentIndex + 1) % allTabButtons.length;
      const nextTabButton = allTabButtons[nextIndex];
      nextTabButton?.click();

      setTimeout(() => {
        const nextTabId = nextTabButton?.dataset?.tab;
        const nextTabContent = getTabContentByTabKey(nextTabId);
        const firstSubTabBtn = nextTabContent?.querySelector('.sub-tab-button:first-child');
        firstSubTabBtn?.click();
        const firstStep = nextTabContent?.querySelector('.step-indicators .step-indicator[data-step="1"]');
        firstStep?.click();
      }, 100);

      closePopup();
    });
  }

  function setupLastStepInterceptor() {
    document.addEventListener(
      'click',
      (e) => {
        const hotspot = e.target?.closest?.('.hotspot');
        if (!hotspot) return;

        const interactive =
          hotspot.closest('.interactive') ||
          hotspot.closest('.two-factor-images') ||
          hotspot.closest('.interactive-container');

        if (!interactive) return;

        const lastStep = computeLastStep(interactive);
        if (!lastStep) return;

        const step = String(hotspot.getAttribute('data-step') || hotspot.dataset.step || '');
        if (step !== lastStep) return;

        showPopupFor(hotspot);
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      true
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupPopupButtons();
    setupLastStepInterceptor();
  });
})();

