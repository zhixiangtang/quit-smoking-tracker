// 图表管理和数据处理
class ChartManager {
    constructor(app) {
        this.app = app;
        this.charts = {};
    }
    
    initAllCharts() {
        this.initTrendChart();
        this.initCravingChart();
        this.initProgressChart();
    }
    
    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart.update) chart.update();
        });
    }
}