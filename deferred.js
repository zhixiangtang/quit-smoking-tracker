// 延迟加载的功能模块
(function() {
    'use strict';
    
    // 等待主应用初始化完成
    const checkAppReady = setInterval(() => {
        if (window.quitSmokingApp) {
            clearInterval(checkAppReady);
            initAdvancedFeatures();
        }
    }, 100);
    
    function initAdvancedFeatures() {
        console.log('加载高级功能...');
        
        // 添加更多统计信息
        addMoreStats();
        
        // 初始化图表（如果用户需要）
        initChartsLazily();
        
        // 添加主题切换功能
        addThemeToggle();
        
        // 添加离线支持
        addOfflineSupport();
    }
    
    function addMoreStats() {
        const mainStats = document.querySelector('.main-stats');
        if (!mainStats) return;
        
        // 创建额外的统计卡片
        const extraStats = document.createElement('div');
        extraStats.className = 'stat-card';
        extraStats.innerHTML = `
            <h3>详细统计</h3>
            <div class="detail-stats">
                <div class="detail-stat">
                    <span>已戒烟:</span>
                    <span id="detailedDays">0 天 0 小时</span>
                </div>
                <div class="detail-stat">
                    <span>日均节省:</span>
                    <span id="avgDailySave">0 元</span>
                </div>
                <div class="detail-stat">
                    <span>健康里程碑:</span>
                    <span id="milestoneCount">0/10</span>
                </div>
            </div>
        `;
        
        mainStats.appendChild(extraStats);
        
        // 更新详细统计
        updateDetailedStats();
        setInterval(updateDetailedStats, 60000);
    }
    
    function updateDetailedStats() {
        const time = window.quitSmokingApp.calculateTime();
        const savings = window.quitSmokingApp.calculateSavings();
        
        if (document.getElementById('detailedDays')) {
            document.getElementById('detailedDays').textContent = 
                `${time.days} 天 ${time.hours} 小时`;
        }
        
        if (document.getElementById('avgDailySave')) {
            const dailyAvg = time.days > 0 ? (parseFloat(savings) / time.days).toFixed(2) : '0';
            document.getElementById('avgDailySave').textContent = dailyAvg + ' 元';
        }
        
        // 计算完成的里程碑数量
        const completedMilestones = window.quitSmokingApp.config.milestones.filter(
            m => time.days >= m.days
        ).length;
        
        if (document.getElementById('milestoneCount')) {
            document.getElementById('milestoneCount').textContent = 
                `${completedMilestones}/${window.quitSmokingApp.config.milestones.length}`;
        }
    }
    
    function initChartsLazily() {
        // 只有当用户访问统计页面时才加载图表
        let chartsLoaded = false;
        
        // 监听滚动，当用户向下滚动时加载图表
        window.addEventListener('scroll', function() {
            if (!chartsLoaded && window.scrollY > 500) {
                loadCharts();
                chartsLoaded = true;
            }
        }, { once: true });
    }
    
    function loadCharts() {
        // 动态加载Chart.js（如果需要）
        // 这里简化处理，只显示简单的HTML图表
        console.log('加载图表功能...');
        
        // 可以在这里添加简单的SVG或Canvas图表
        const statsCard = document.querySelector('.main-stats');
        if (statsCard) {
            const chartHTML = `
                <div class="stat-card">
                    <h3>烟瘾趋势</h3>
                    <div class="simple-chart">
                        <div class="chart-bar" style="height: 60%;" title="周一: 3次"></div>
                        <div class="chart-bar" style="height: 80%;" title="周二: 4次"></div>
                        <div class="chart-bar" style="height: 40%;" title="周三: 2次"></div>
                        <div class="chart-bar" style="height: 30%;" title="周四: 1次"></div>
                        <div class="chart-bar" style="height: 20%;" title="周五: 1次"></div>
                    </div>
                </div>
            `;
            
            statsCard.insertAdjacentHTML('beforeend', chartHTML);
            
            // 添加图表样式
            const style = document.createElement('style');
            style.textContent = `
                .simple-chart {
                    display: flex;
                    align-items: flex-end;
                    height: 120px;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .chart-bar {
                    flex: 1;
                    background: linear-gradient(to top, #4CAF50, #8BC34A);
                    border-radius: 4px 4px 0 0;
                    min-height: 10px;
                    transition: height 0.3s ease;
                }
                
                .chart-bar:hover {
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function addThemeToggle() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-toggle';
        themeBtn.innerHTML = '🌙';
        themeBtn.title = '切换主题';
        themeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: auto;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.2s;
        `;
        
        header.appendChild(themeBtn);
        
        // 检查当前主题
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeBtn.innerHTML = '☀️';
        }
        
        // 切换主题
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            themeBtn.innerHTML = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // 应用深色主题样式
            if (isDark) {
                const darkStyles = `
                    .dark-theme body {
                        background: #121212;
                        color: #ffffff;
                    }
                    
                    .dark-theme .header,
                    .dark-theme .stat-card {
                        background: rgba(30, 30, 30, 0.95);
                        color: #ffffff;
                    }
                    
                    .dark-theme .quick-stat,
                    .dark-theme .milestone {
                        background: #2d2d2d;
                    }
                    
                    .dark-theme .btn-secondary {
                        background: #2d2d2d;
                        color: #ffffff;
                        border-color: #444;
                    }
                `;
                
                let styleEl = document.getElementById('dark-theme-styles');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'dark-theme-styles';
                    document.head.appendChild(styleEl);
                }
                styleEl.textContent = darkStyles;
            } else {
                const styleEl = document.getElementById('dark-theme-styles');
                if (styleEl) styleEl.remove();
            }
        });
    }
    
    function addOfflineSupport() {
        // 检查在线状态
        window.addEventListener('online', () => {
            window.quitSmokingApp.showNotification('网络已恢复', 'success');
        });
        
        window.addEventListener('offline', () => {
            window.quitSmokingApp.showNotification('网络已断开，应用仍可离线使用', 'error');
        });
        
        // 添加PWA提示
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            navigator.serviceWorker.register('/service-worker.js').catch(err => {
                console.log('Service Worker 注册失败:', err);
            });
        }
        
        // 添加到主屏幕提示
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // 显示安装提示
            setTimeout(() => {
                if (deferredPrompt) {
                    const installBtn = document.createElement('button');
                    installBtn.textContent = '📱 添加到主屏幕';
                    installBtn.className = 'btn btn-secondary';
                    installBtn.style.marginTop = '10px';
                    installBtn.onclick = () => {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then(() => {
                            deferredPrompt = null;
                        });
                    };
                    
                    const actions = document.querySelector('.actions');
                    if (actions) {
                        actions.appendChild(installBtn);
                    }
                }
            }, 5000);
        });
    }
})();