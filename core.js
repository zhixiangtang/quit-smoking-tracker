// 戒烟应用 - 核心功能
class QuitSmokingCore {
    constructor() {
        // 基础配置
        this.config = {
            dailyCost: 30,
            milestones: [
                { days: 1, text: '血压恢复正常' },
                { days: 2, text: '味觉嗅觉改善' },
                { days: 3, text: '呼吸更顺畅' },
                { days: 7, text: '循环系统改善' },
                { days: 14, text: '肺功能提升' },
                { days: 30, text: '咳嗽减少' },
                { days: 90, text: '心脏病风险降低' },
                { days: 180, text: '中风风险降低' },
                { days: 365, text: '心脏病风险减半' },
                { days: 1825, text: '癌症风险降低' }
            ]
        };
        
        // 状态
        this.state = {
            quitDate: null,
            lastUpdated: Date.now()
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        // 加载数据
        this.loadData();
        
        // 设置事件监听
        this.bindEvents();
        
        // 更新显示
        this.updateDisplay();
        
        // 隐藏加载动画，显示主内容
        setTimeout(() => {
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('main-content').classList.add('loaded');
                
                // 显示欢迎信息
                if (!this.state.quitDate) {
                    this.showNotification('欢迎使用戒烟助手！请先设置戒烟日期。');
                }
            }, 300);
        }, 800);
        
        // 开始计时器
        this.startTimer();
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('quitSmokingData');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.quitDate = data.quitDate;
                this.config.dailyCost = data.dailyCost || this.config.dailyCost;
                
                if (data.milestones) {
                    this.config.milestones = data.milestones;
                }
            }
        } catch (e) {
            console.error('加载数据失败:', e);
        }
    }
    
    saveData() {
        try {
            const data = {
                quitDate: this.state.quitDate,
                dailyCost: this.config.dailyCost,
                milestones: this.config.milestones,
                lastUpdated: Date.now()
            };
            localStorage.setItem('quitSmokingData', JSON.stringify(data));
        } catch (e) {
            console.error('保存数据失败:', e);
        }
    }
    
    bindEvents() {
        // 设置日期按钮
        document.getElementById('setDateBtn').addEventListener('click', () => this.showDateModal());
        
        // 记录烟瘾按钮
        document.getElementById('recordCravingBtn').addEventListener('click', () => this.showCravingModal());
        
        // 分享按钮
        document.getElementById('shareBtn').addEventListener('click', () => this.shareProgress());
    }
    
    calculateTime() {
        if (!this.state.quitDate) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
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
        return (time.days * this.config.dailyCost).toFixed(2);
    }
    
    calculateHealthScore() {
        const time = this.calculateTime();
        const days = time.days;
        
        // 根据戒烟时间计算健康恢复百分比
        if (days >= 1825) return 100; // 5年
        if (days >= 365) return 80;   // 1年
        if (days >= 180) return 65;   // 6个月
        if (days >= 90) return 50;    // 3个月
        if (days >= 30) return 35;    // 1个月
        if (days >= 14) return 25;    // 2周
        if (days >= 7) return 15;     // 1周
        if (days >= 3) return 10;     // 3天
        if (days >= 1) return 5;      // 1天
        return 0;
    }
    
    updateDisplay() {
        const time = this.calculateTime();
        const savings = this.calculateSavings();
        const healthScore = this.calculateHealthScore();
        
        // 更新天数
        document.getElementById('daysCount').textContent = time.days;
        
        // 更新节省金额
        document.getElementById('moneySaved').textContent = savings;
        
        // 更新健康分数
        document.getElementById('healthScore').textContent = healthScore + '%';
        
        // 更新里程碑
        this.updateMilestones(time.days);
    }
    
    updateMilestones(currentDays) {
        const container = document.getElementById('milestones');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.config.milestones.forEach(milestone => {
            const isCompleted = currentDays >= milestone.days;
            const milestoneEl = document.createElement('div');
            milestoneEl.className = 'milestone' + (isCompleted ? ' completed' : '');
            milestoneEl.innerHTML = `
                <span class="milestone-days">${milestone.days}天</span>
                <span class="milestone-text">${milestone.text}</span>
            `;
            container.appendChild(milestoneEl);
        });
    }
    
    startTimer() {
        // 每秒更新一次时间显示
        setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        // 每分钟保存一次数据
        setInterval(() => {
            this.saveData();
        }, 60000);
    }
    
    showDateModal() {
        const modalHTML = `
            <div class="modal-overlay" id="dateModalOverlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>设置戒烟日期</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="date" id="quitDateInput" 
                               max="${new Date().toISOString().split('T')[0]}"
                               value="${this.state.quitDate || ''}"
                               class="modal-input">
                        <div class="modal-actions">
                            <button id="confirmDate" class="btn btn-primary">确认</button>
                            <button class="modal-close btn btn-secondary">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHTML, () => {
            // 绑定确认按钮事件
            document.getElementById('confirmDate').addEventListener('click', () => {
                const dateInput = document.getElementById('quitDateInput');
                if (dateInput.value) {
                    this.state.quitDate = dateInput.value;
                    this.saveData();
                    this.updateDisplay();
                    this.closeModal();
                    this.showNotification('戒烟日期已设置！新的开始，加油！');
                }
            });
            
            // 绑定关闭事件
            this.bindModalClose();
        });
    }
    
    showCravingModal() {
        const modalHTML = `
            <div class="modal-overlay" id="cravingModalOverlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>记录烟瘾</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>烟瘾强度</label>
                            <div class="intensity-selector">
                                <button class="intensity-btn" data-level="1">轻微</button>
                                <button class="intensity-btn" data-level="2">中等</button>
                                <button class="intensity-btn active" data-level="3">强烈</button>
                                <button class="intensity-btn" data-level="4">非常强烈</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>应对方式</label>
                            <select id="copingMethod" class="modal-input">
                                <option value="喝水">喝水</option>
                                <option value="散步">散步</option>
                                <option value="深呼吸">深呼吸</option>
                                <option value="吃零食">吃零食</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button id="saveCraving" class="btn btn-primary">保存记录</button>
                            <button class="modal-close btn btn-secondary">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHTML, () => {
            // 绑定强度选择
            document.querySelectorAll('.intensity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });
            
            // 绑定保存按钮
            document.getElementById('saveCraving').addEventListener('click', () => {
                const intensity = document.querySelector('.intensity-btn.active').dataset.level;
                const method = document.getElementById('copingMethod').value;
                
                // 保存烟瘾记录（简化版）
                const craving = {
                    time: new Date().toISOString(),
                    intensity,
                    method
                };
                
                // 添加到本地存储
                this.saveCravingRecord(craving);
                this.closeModal();
                this.showNotification('烟瘾记录已保存！继续保持！');
            });
            
            // 绑定关闭事件
            this.bindModalClose();
        });
    }
    
    saveCravingRecord(craving) {
        try {
            const records = JSON.parse(localStorage.getItem('cravingRecords') || '[]');
            records.push(craving);
            
            // 只保留最近100条记录
            if (records.length > 100) {
                records.splice(0, records.length - 100);
            }
            
            localStorage.setItem('cravingRecords', JSON.stringify(records));
        } catch (e) {
            console.error('保存烟瘾记录失败:', e);
        }
    }
    
    shareProgress() {
        const time = this.calculateTime();
        const savings = this.calculateSavings();
        
        const text = `🚭 我已成功戒烟 ${time.days} 天！\n` +
                    `💰 节省了 ${savings} 元\n` +
                    `💪 健康恢复 ${this.calculateHealthScore()}%\n` +
                    `#戒烟记录 #健康生活`;
        
        // 尝试使用Web Share API
        if (navigator.share) {
            navigator.share({
                title: '我的戒烟成就',
                text: text,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('分享文本已复制到剪贴板！');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showNotification('请手动复制文本', 'error');
        });
    }
    
    showModal(html, onShow) {
        // 移除现有的模态框
        this.closeModal();
        
        // 添加到页面
        document.getElementById('modalContainer').innerHTML = html;
        
        // 显示模态框
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // 回调函数
            if (onShow) onShow();
        }
    }
    
    bindModalClose() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        });
    }
    
    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
        document.body.style.overflow = 'auto';
    }
    
    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = type === 'error' ? '#f44336' : '#4CAF50';
        notification.innerHTML = message;
        
        container.appendChild(notification);
        notification.style.display = 'block';
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.quitSmokingApp = new QuitSmokingCore();
});