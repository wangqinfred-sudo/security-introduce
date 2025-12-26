        // 初始化主标签
        function initTabs() {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // 添加标签切换事件
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tab;
                    
                    // 更新按钮状态
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // 更新内容显示
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `content-${targetTab}`) {
                            content.classList.add('active');
                            // 初始化当前标签页的子标签
                            initSubTabs(content);
                        }
                    });
                });
            });
        }
        
        // 初始化子标签
        function initSubTabs(tabContent) {
            const subTabButtons = tabContent.querySelectorAll('.sub-tab-button');
            const subTabContents = tabContent.querySelectorAll('.sub-tab-content');
            
            // 添加子标签切换事件
            subTabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetSubTab = button.dataset.subTab;
                    
                    // 更新按钮状态
                    subTabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // 更新内容显示
                    subTabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `sub-content-${targetSubTab}`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        }
        
        // 初始化所有子标签
        function initAllSubTabs() {
            initSubTabs(document.getElementById('content-audit-logs'));
            initSubTabs(document.getElementById('content-operation-logs'));
            initSubTabs(document.getElementById('content-security-alerts'));
        }
        
        // 初始化图片切换
        function initImageSwitching() {
            const allTabContents = document.querySelectorAll('.tab-content');
            
            allTabContents.forEach(content => {
                // 为热区添加点击事件
                const hotspots = content.querySelectorAll('.hotspot');
                hotspots.forEach(hotspot => {
                    hotspot.addEventListener('click', () => {
                        const nextStep = hotspot.dataset.nextStep;
                        const currentContent = hotspot.closest('.sub-tab-content');
                        
                        if (currentContent && nextStep) {
                            switchImage(currentContent, nextStep);
                        }
                    });
                });
                
                // 为导航点添加点击事件
                const stepIndicators = content.querySelectorAll('.step-indicator');
                stepIndicators.forEach(indicator => {
                    indicator.addEventListener('click', () => {
                        const step = indicator.dataset.step;
                        const currentContent = indicator.closest('.sub-tab-content');
                        
                        if (currentContent && step) {
                            switchImage(currentContent, step);
                        }
                    });
                });
            });
        }
        
        // 切换图片
        function switchImage(contentEl, step) {
            // 更新图片显示
            const stepImages = contentEl.querySelectorAll('.step-image');
            stepImages.forEach(img => {
                img.classList.remove('active');
                if (img.dataset.step === step) {
                    img.classList.add('active');
                }
            });
            
            // 更新指示器状态
            const stepIndicators = contentEl.querySelectorAll('.step-indicator');
            stepIndicators.forEach(indicator => {
                indicator.classList.remove('active');
                if (indicator.dataset.step === step) {
                    indicator.classList.add('active');
                }
            });
            
            // 更新热区显示
            const hotspots = contentEl.querySelectorAll('.hotspot');
            hotspots.forEach(hotspot => {
                hotspot.style.display = hotspot.dataset.step === step ? 'block' : 'none';
            });
        }
        
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', () => {
            initTabs();
            initAllSubTabs();
            initImageSwitching();
        });
</body>
</html>
