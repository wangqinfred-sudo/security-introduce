// 页面加载完成后执行动画
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否存在透视卡片容器（6个卡片布局）
    const cardsContainer = document.querySelector('.cards-container');
    if (cardsContainer) {
        // 为透视卡片添加顺序动画
        animateSlantCards();
    }
});

// 为透视卡片添加动画
function animateSlantCards() {
    const slantCards = document.querySelectorAll('.slant-card');
    
    slantCards.forEach((card, index) => {
        // 初始状态设为透明并向下位移
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // 按顺序添加淡入动画
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = ''; // 清除内联样式，让CSS媒体查询控制正确的位置
        }, index * 100); // 每个卡片延迟100ms
    });
}

// 监听窗口大小变化事件，重新计算卡片位置
window.addEventListener('resize', () => {
    const slantCards = document.querySelectorAll('.slant-card');
    slantCards.forEach(card => {
        card.style.transform = ''; // 清除内联样式，让CSS媒体查询控制正确的位置
    });
});

// 移除了与安全卡片（发光球体布局）相关的动画和悬停效果

// 移除了与HTML中<a>标签冲突的点击事件处理代码