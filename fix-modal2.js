const fs = require('fs');
const path = 'src/components/analytics/AnalyticsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("value: totalViews", "value: stats.views");
code = code.replace("formatDuration(avgTimeSpent)", "formatDuration(stats.avg)");

fs.writeFileSync(path, code);
