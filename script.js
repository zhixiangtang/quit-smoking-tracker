class QuitSmokingTracker {
    constructor() {
        this.init();
        this.bindEvents();
        this.updateDisplay();
        this.startTimer();
    }

    init() {
        // 设置日期输入的最大值为今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quitDateInput').max = today;
        
        // 加载保存的数据
        this.loadData();
    }

    bindEvents() {
        // 设置戒烟日期按钮
        document.getElementById('setDateBtn').addEventListener('click', () => this.setQuitDate());
        
        // 快捷按钮
        document.getElementById('todayBtn').addEventListener('click', () => this.setToday());
        document.getElementById('yesterdayBtn').addEventListener('click', () => this.setYesterday());
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => this.resetData());
        
        // 设置变化监听
        document.getElementById('dailyCost').addEventListener('change', () => this.saveSettings());
        document.querySelectorAll('input[name="unit"]').forEach(radio => {
            radio.addEventListener('change', () => this.saveSettings());
        });
        
        // 分享按钮
        document.getElementById('shareTextBtn').addEventListener('click', () => this.copyShareText());
        document.getElementById('shareImageBtn').addEventListener('click', () => this.generateShareImage());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        
        // 关闭模态框
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('imagePreview').style.display = 'none';
        });
        
        // 点击外部关闭模态框
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('imagePreview')) {
                document.getElementById('imagePreview').style.display = 'none';
            }
        });
    }

    loadData() {
        this.quitDate = localStorage.getItem('quitDate');
        this.dailyCost = localStorage.getItem('dailyCost') || 30;
        this.unit = localStorage.getItem('displayUnit') || 'days';
        
        // 更新UI
        document.getElementById('dailyCost').value = this.dailyCost;
        document.querySelector(`input[name="unit"][value="${this.unit}"]`).checked = true;
    }

    saveSettings() {
        this.dailyCost = parseFloat(document.getElementById('dailyCost').value) || 30;
        this.unit = document.querySelector('input[name="unit"]:checked').value;
        
        localStorage.setItem('dailyCost', this.dailyCost);
        localStorage.setItem('displayUnit', this.unit);
        
        this.updateDisplay();
        this.showNotification('设置已保存');
    }

    setQuitDate() {
        const inputDate = document.getElementById('quitDateInput').value;
        if (!inputDate) {
            this.showNotification('请选择日期', 'error');
            return;
        }
        
        this.quitDate = inputDate;
        localStorage.setItem('quitDate', this.quitDate);
        
        this.updateDisplay();
        this.showNotification('戒烟日期已设置！加油！');
    }

    setToday() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quitDateInput').value = today;
        this.setQuitDate();
    }

    setYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        document.getElementById('quitDateInput').value = yesterdayStr;
        this.setQuitDate();
    }

    calculateDays() {
        if (!this.quitDate) return 0;
        
        const quitDate = new Date(this.quitDate);
        const now = new Date();
        const diffTime = now.getTime() - quitDate.getTime();
        
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateDuration() {
        if (!this.quitDate) return { days: 0, hours: 0, minutes: 0 };
        
        const quitDate = new Date(this.quitDate);
        const now = new Date();
        const diffTime = now.getTime() - quitDate.getTime();
        
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        return { days, hours, minutes };
    }

    updateDisplay() {
        const days = this.calculateDays();
        const duration = this.calculateDuration();
        
        // 更新天数显示
        document.getElementById('daysCount').textContent = days;
        
        // 更新节省金额
        const moneySaved = (days * this.dailyCost).toFixed(2);
        document.getElementById('moneySaved').textContent = moneySaved;
        document.getElementById('shareMoney').textContent = moneySaved;
        
        // 更新健康评分（基于天数的简单算法）
        const healthScore = Math.min(Math.floor(days * 10), 1000);
        document.getElementById('healthScore').textContent = healthScore;
        
        // 更新日期信息
        document.getElementById('quitDate').textContent = this.quitDate || '未设置';
        document.getElementById('shareDays').textContent = days;
        
        // 更新时长显示
        let durationText = '';
        switch(this.unit) {
            case 'days':
                durationText = `${days} 天`;
                break;
            case 'hours':
                const hours = days * 24 + duration.hours;
                durationText = `${hours} 小时`;
                break;
            case 'minutes':
                const minutes = days * 24 * 60 + duration.hours * 60 + duration.minutes;
                durationText = `${minutes} 分钟`;
                break;
        }
        document.getElementById('quitDuration').textContent = durationText;
        
        // 更新里程碑
        this.updateMilestones(days);
    }

    updateMilestones(days) {
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(milestone => {
            const targetDays = parseInt(milestone.dataset.days);
            if (days >= targetDays) {
                milestone.classList.add('completed');
                milestone.innerHTML = `<i class="fas fa-check-circle"></i> ${milestone.textContent}`;
            }
        });
    }

    startTimer() {
        // 每秒更新一次
        setInterval(() => {
            if (this.quitDate) {
                this.updateDisplay();
            }
        }, 1000);
    }

    resetData() {
        if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
            localStorage.removeItem('quitDate');
            localStorage.removeItem('dailyCost');
            localStorage.removeItem('displayUnit');
            
            this.quitDate = null;
            this.dailyCost = 30;
            this.unit = 'days';
            
            document.getElementById('dailyCost').value = this.dailyCost;
            document.querySelector('input[name="unit"][value="days"]').checked = true;
            document.getElementById('quitDateInput').value = '';
            
            this.updateDisplay();
            this.showNotification('数据已重置');
        }
    }

    copyShareText() {
        const days = this.calculateDays();
        const moneySaved = (days * this.dailyCost).toFixed(2);
        
        const text = `🚭 我已成功戒烟 ${days} 天！\n` +
                    `💰 节省了 ${moneySaved} 元\n` +
                    `💪 坚持就是胜利！\n` +
                    `#戒烟记录 #健康生活`;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('分享文本已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showNotification('复制失败，请手动复制', 'error');
        });
    }

    generateShareImage() {
        const days = this.calculateDays();
        const moneySaved = (days * this.dailyCost).toFixed(2);
        const duration = this.calculateDuration();
        
        const canvas = document.getElementById('shareCanvas');
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2196F3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 标题
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('🚭 戒烟成就', canvas.width / 2, 80);
        
        // 天数
        ctx.font = 'bold 72px "Segoe UI"';
        ctx.fillText(`${days} 天`, canvas.width / 2, 180);
        
        // 统计信息
        ctx.font = 'bold 32px "Segoe UI"';
        ctx.fillText(`节省金额: ${moneySaved} 元`, canvas.width / 2, 250);
        ctx.fillText(`戒烟时长: ${duration.days}天${duration.hours}小时${duration.minutes}分`, canvas.width / 2, 300);
        
        // 鼓励语
        ctx.font = 'bold 28px "Segoe UI"';
        ctx.fillText('坚持就是胜利！继续加油！', canvas.width / 2, 350);
        
        // 底部信息
        ctx.font = '20px "Segoe UI"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('戒烟日期记录 - quitsmoking.tracker', canvas.width / 2, 390);
        
        // 显示模态框
        document.getElementById('imagePreview').style.display = 'block';
    }

    downloadImage() {
        const canvas = document.getElementById('shareCanvas');
        const link = document.createElement('a');
        link.download = `戒烟成就-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.background = type === 'error' ? '#f44336' : '#4CAF50';
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// PWA 支持
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker 注册失败:', err);
        });
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuitSmokingTracker();
    
    // 添加到全局对象，方便调试
    window.app = app;
    
    // 初始加载完成后显示欢迎信息
    setTimeout(() => {
        if (!app.quitDate) {
            app.showNotification('欢迎使用戒烟日期记录！请先设置戒烟日期。');
        }
    }, 1000);
});

// 监听页面可见性变化，切换回来时更新数据
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(() => {
            if (window.app) {
                window.app.updateDisplay();
            }
        }, 100);
    }
});