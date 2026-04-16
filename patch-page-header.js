const fs = require('fs');
const path = 'src/app/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldHeader = `<div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your shared documents
            </p>
          </div>
          <div className="flex gap-3">
            {!user ? (
              <Button variant="outline" onClick={() => router.push("/login")}>
                Sign In / Sign Up
              </Button>
            ) : (
              <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.refresh(); }}>
                Sign Out
              </Button>
            )}
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={() => user ? setUploadOpen(true) : router.push("/login")}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
          </div>
        </div>`;

const newHeader = `<div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your shared documents
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={() => user ? setUploadOpen(true) : router.push("/login")}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>`;

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  fs.writeFileSync(path, code);
}
