const fs = require('fs');
const path = 'src/components/analytics/AnalyticsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("stats.views: number\n  stats.avg: number", "totalViews: number\n  avgTimeSpent: number");
fs.writeFileSync(path, code);
