const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

const oldHeader = `<th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Avg. Time
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Links
                  </th>`;

const newHeader = `<th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Avg. Time
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Pages Viewed
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Links
                  </th>`;

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
}

// Add the cell
const oldCell = `<td className="px-4 py-4">
                      <div className="flex flex-col gap-2 items-start">`;

const newCell = `<td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {doc.pagesViewed || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2 items-start">`;

if (code.includes(oldCell)) {
  code = code.replace(oldCell, newCell);
}

// Patch the fetch logic to count unique pages viewed
const oldStatsObj = `const docStats: Record<string, { views: number, timeSum: number, viewEvents: number }> = {}
      docsData.forEach((d: any) => docStats[d.id] = { views: 0, timeSum: 0, viewEvents: 0 })`;

const newStatsObj = `const docStats: Record<string, { views: number, timeSum: number, viewEvents: number, pagesSet: Set<string> }> = {}
      docsData.forEach((d: any) => docStats[d.id] = { views: 0, timeSum: 0, viewEvents: 0, pagesSet: new Set() })`;

code = code.replace(oldStatsObj, newStatsObj);

const oldTrack = `docStats[docId].viewEvents += 1`;
const newTrack = `docStats[docId].viewEvents += 1
          if (t.page_number) docStats[docId].pagesSet.add(\`\${t.viewer_email}-\${t.page_number}\`)`;

if (code.includes(oldTrack)) {
  code = code.replace(oldTrack, newTrack);
}

const oldMap = `totalViews: stats.views,
          avgTimeSpent: stats.viewEvents > 0 ? Math.round(stats.timeSum / stats.viewEvents) : 0,`;
const newMap = `totalViews: stats.views,
          avgTimeSpent: stats.viewEvents > 0 ? Math.round(stats.timeSum / stats.viewEvents) : 0,
          pagesViewed: stats.pagesSet.size,`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
}

fs.writeFileSync(pagePath, code);
