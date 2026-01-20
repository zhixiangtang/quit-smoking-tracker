// 主应用类
class QuitSmokingApp {
    constructor() {
        this.config = {
            version: '2.0.0',
            defaultDailyCost: 30,
            milestones: [1, 3, 7, 14, 30, 60, 90, 180, 365, 730]
        };
        
        this.state = {
            quitDate: null,
            dailyCost: 30,
            theme: 'light',
            data: {
                cravings: [],
                symptoms: [],
                dailyLogs: [],
                achievements: []
            }
        };
        
        this.init();
    }
    
    async init() {
        // 加载数据
        this.loadData();
        
        // 初始化UI
        this.initUI();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始计时器
        this.startTimer();
        
        // 隐藏加载动画
        setTimeout(() => {
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 300);
        }, 500);
    }
    
    loadData() {
        // 从本地存储加载数据
        const saved = localStorage.getItem('quitSmokingData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
            } catch (e) {
                console.error('加载数据失败:', e);
            }
        }
    }
    
    saveData() {
        // 保存数据到本地存储
        localStorage.setItem('quitSmokingData', JSON.stringify(this.state));
    }
    
    initUI() {
        // 初始化主题
        this.initTheme();
        
        // 初始化日期选择器
        this.initDatePicker();
        
        // 更新所有显示
        this.updateAllDisplays();
        
        // 初始化图表
        this.initCharts();
    }
    
    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新切换按钮图标
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.state.theme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    initDatePicker() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('quitDatePicker');
        if (dateInput) {
            dateInput.max = today;
            if (this.state.quitDate) {
                dateInput.value = this.state.quitDate;
            }
        }
    }
    
    calculateTime() {
        if (!this.state.quitDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        const quitDate = new Date(this.state.quitDate + 'T00:00:00');
        const now = new Date();
        const diff = now.getTime() - quitDate.getTime();
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    }
    
    calculateSavings() {
        const time = this.calculateTime();
        const dailyCost = this.state.dailyCost || this.config.defaultDailyCost;
        
        const totalSaved = (time.days * dailyCost).toFixed(2);
        const todaySaved = dailyCost.toFixed(2);
        
        // 计算月度节省（假设一个月30天）
        const monthDays = Math.min(time.days, 30);
        const monthSaved = (monthDays * dailyCost).toFixed(2);
        
        return { totalSaved, todaySaved, monthSaved };
    }
    
    calculateHealthMetrics() {
        const time = this.calculateTime();
        const days = time.days;
        
        // 根据科学研究的恢复时间线计算
        const lungRecovery = Math.min(Math.floor(days * 0.27), 100); // 大约1年完全恢复
        const heartRisk = Math.min(Math.floor(days * 0.137), 50); // 心脏病风险降低50%
        const nicotineFree = Math.min(Math.floor(days * 2.74), 100); // 大约90天清除尼古丁
        
        return { lungRecovery, heartRisk, nicotineFree };
    }
    
    updateTimeDisplay() {
        const time = this.calculateTime();
        
        document.getElementById('days').textContent = time.days;
        document.getElementById('hours').textContent = time.hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = time.minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = time.seconds.toString().padStart(2, '0');
        
        // 更新连续天数
        document.getElementById('currentStreak').textContent = time.days;
    }
    
    updateSavingsDisplay() {
        const savings = this.calculateSavings();
        
        document.getElementById('totalSaved').textContent = savings.totalSaved;
        document.getElementById('totalSavings').textContent = savings.totalSaved + '元';
        document.getElementById('todaySaved').textContent = savings.todaySaved + '元';
        document.getElementById('monthSaved').textContent = savings.monthSaved + '元';
        
        // 计算相当于什么物品
        const coffeeCount = Math.floor(savings.totalSaved / 30);
        document.getElementById('equivalentItem').textContent = coffeeCount + '杯咖啡';
    }
    
    updateHealthDisplay() {
        const health = this.calculateHealthMetrics();
        
        document.getElementById('lungRecovery').textContent = health.lungRecovery + '%';
        document.getElementById('heartRisk').textContent = health.heartRisk + '%';
        document.getElementById('nicotineFree').textContent = health.nicotineFree + '%';
        document.getElementById('healthIndex').textContent = Math.floor((health.lungRecovery + health.heartRisk + health.nicotineFree) / 3);
    }
    
    updateAllDisplays() {
        this.updateTimeDisplay();
        this.updateSavingsDisplay();
        this.updateHealthDisplay();
        this.updateMilestoneProgress();
        this.updateGoalProgress();
        this.updateMotivationText();
    }
    
    updateMilestoneProgress() {
        const time = this.calculateTime();
        const milestones = this.config.milestones;
        const nextMilestone = milestones.find(m => m > time.days) || milestones[milestones.length - 1];
        const prevMilestone = milestones.reverse().find(m => m <= time.days) || 0;
        
        document.getElementById('nextMilestone').textContent = nextMilestone + '天';
        
        const progress = ((time.days - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
        document.getElementById('milestoneProgress').style.width = Math.min(progress, 100) + '%';
    }
    
    updateGoalProgress() {
        const savings = this.calculateSavings();
        const goal = 5000; // 目标存款5000元
        const progress = (parseFloat(savings.totalSaved) / goal) * 100;
        
        document.getElementById('goalProgress').textContent = savings.totalSaved + '/' + goal + '元';
        document.getElementById('goalProgressFill').style.width = Math.min(progress, 100) + '%';
    }
    
    updateMotivationText() {
        const time = this.calculateTime();
        const texts = [
            "坚持下去，每一秒都很宝贵！",
            "你已经战胜了这么多天，继续前进！",
            "健康的未来正在向你招手！",
            "每一次抵抗烟瘾都让你更强大！",
            "为自己骄傲，你正在创造奇迹！"
        ];
        
        const index = time.days % texts.length;
        document.getElementById('motivationText').textContent = texts[index];
    }
    
    startTimer() {
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
        
        // 每分钟更新一次其他数据
        setInterval(() => {
            this.updateAllDisplays();
        }, 60000);
    }
    
    bindEvents() {
        // 导航按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
        
        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // 设置戒烟日期按钮
        document.getElementById('setQuitDateBtn').addEventListener('click', () => this.showModal('quitDateModal'));
        
        // 记录烟瘾按钮
        document.getElementById('addCravingBtn').addEventListener('click', () => this.showModal('cravingModal'));
        
        // 模态框关闭
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // 模态框外部点击关闭
        document.getElementById('modalOverlay').addEventListener('click', () => this.closeModal());
        
        // 确认戒烟日期
        document.getElementById('confirmQuitDate')?.addEventListener('click', () => this.setQuitDate());
        
        // 快速日期按钮
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = parseInt(e.currentTarget.dataset.days);
                this.setQuickDate(days);
            });
        });
        
        // 保存烟瘾记录
        document.getElementById('saveCraving')?.addEventListener('click', () => this.saveCraving());
        
        // 强度选择
        document.querySelectorAll('.intensity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // 更多事件绑定...
    }
    
    switchSection(sectionId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 移除所有导航按钮的活动状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 显示目标页面
        document.getElementById(sectionId).classList.add('active');
        
        // 设置对应的导航按钮为活动状态
        document.querySelector(`.nav-btn[data-section="${sectionId}"]`).classList.add('active');
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showModal(modalId) {
        document.getElementById('modalOverlay').style.display = 'block';
        document.getElementById(modalId).style.display = 'block';
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // 恢复背景滚动
        document.body.style.overflow = 'auto';
    }
    
    setQuitDate() {
        const dateInput = document.getElementById('quitDatePicker');
        if (!dateInput.value) {
            this.showNotification('请选择戒烟日期', 'error');
            return;
        }
        
        this.state.quitDate = dateInput.value;
        this.saveData();
        this.updateAllDisplays();
        this.closeModal();
        this.showNotification('戒烟日期已设置！新的开始，加油！');
    }
    
    setQuickDate(daysOffset) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        document.getElementById('quitDatePicker').value = dateStr;
    }
    
    saveCraving() {
        const intensity = document.querySelector('.intensity-btn.active')?.dataset.intensity;
        const copingMethod = document.getElementById('copingMethod').value;
        const note = document.getElementById('cravingNote').value;
        
        if (!intensity) {
            this.showNotification('请选择烟瘾强度', 'error');
            return;
        }
        
        const craving = {
            id: Date.now(),
            date: new Date().toISOString(),
            intensity: parseInt(intensity),
            copingMethod,
            note
        };
        
        this.state.data.cravings.push(craving);
        this.saveData();
        this.closeModal();
        this.showNotification('烟瘾记录已保存！');
        
        // 清空表单
        document.getElementById('cravingNote').value = '';
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        const icon = notification.querySelector('i');
        
        messageEl.textContent = message;
        
        if (type === 'error') {
            notification.style.background = 'var(--danger-color)';
            icon.className = 'fas fa-exclamation-circle';
        } else {
            notification.style.background = 'var(--success-color)';
            icon.className = 'fas fa-check-circle';
        }
        
        notification.style.display = 'flex';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // 更多方法...
}

// 图表初始化
function initCharts() {
    // 初始化趋势图表
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '每日烟瘾次数',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'var(--primary-color)',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // 初始化烟瘾分布图表
    const cravingCtx = document.getElementById('cravingChart').getContext('2d');
    new Chart(cravingCtx, {
        type: 'doughnut',
        data: {
            labels: ['早晨', '上午', '下午', '晚上', '深夜'],
            datasets: [{
                data: [30, 20, 25, 15, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#9C27B0',
                    '#f44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 初始化应用
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new QuitSmokingApp();
    initCharts();
    
    // 全局导出以便调试
    window.app = app;
});
