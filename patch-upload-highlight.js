const fs = require('fs');
const path = 'src/components/documents/UploadModal.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldContent = `          {/* Drop Zone */}
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
                dragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drop your file here, or <span className="text-blue-600">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Supports PDF and video files</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {getFileType(file) === 'pdf' ? (
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
              ) : (
                <Video className="w-8 h-8 text-purple-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Document Name */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Series A Pitch Deck"
            />
          </div>`;

const newContent = `          {/* Required Steps Highlight Box */}
          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-4 relative shadow-sm">
            <div className="absolute -top-2.5 left-4 px-2 bg-blue-100 text-xs font-bold text-blue-700 rounded-full border border-blue-200">
              Mandatory
            </div>

            {/* Drop Zone */}
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-white',
                  dragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-800">
                  Drop your file here, or <span className="text-blue-600 font-bold hover:underline">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF and video files</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                {getFileType(file) === 'pdf' ? (
                  <FileText className="w-8 h-8 text-red-500 shrink-0" />
                ) : (
                  <Video className="w-8 h-8 text-purple-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Document Name */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-name" className="text-blue-900 font-medium">Document Name <span className="text-red-500">*</span></Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Series A Pitch Deck"
                className="border-blue-200 focus-visible:ring-blue-500 bg-white"
              />
            </div>
          </div>`;

if (code.includes('          {/* Drop Zone */}')) {
  code = code.replace(oldContent, newContent);
  fs.writeFileSync(path, code);
} else {
  console.log("Could not find the content to replace.");
}
