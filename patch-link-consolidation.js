const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

const oldLinksCol = `<td className="px-4 py-4">
                      {doc.links.length > 0 ? (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 w-max">
                          <span className="text-xs font-mono text-gray-600">/d/{doc.links[0].substring(0, 8)}</span>
                          <div className="flex items-center gap-1 border-l pl-2">
                            <button
                              onClick={() => handleCopyLink(doc.links[0])}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Copy Link"
                            >
                              {copiedLink === doc.links[0] ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setLinkDoc(doc)}
                              className="text-gray-400 hover:text-orange-600 transition-colors"
                              title="Edit Link Settings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No links</span>
                      )}
                    </td>`;

const newLinksCol = `<td className="px-4 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {doc.links.length > 0 ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 w-max -ml-2"
                              onClick={() => setLinkDoc(doc)}
                            >
                              <Link2 className="w-3 h-3" />
                              Create Link
                            </Button>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 w-max">
                              <span className="text-xs font-mono text-gray-600">/d/{doc.links[0].substring(0, 8)}</span>
                              <div className="flex items-center gap-1 border-l pl-2">
                                <button
                                  onClick={() => handleCopyLink(doc.links[0])}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Copy Link"
                                >
                                  {copiedLink === doc.links[0] ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => setLinkDoc(doc)}
                                  className="text-gray-400 hover:text-orange-600 transition-colors"
                                  title="Edit Link Settings"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 w-max"
                            onClick={() => setLinkDoc(doc)}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Create Link
                          </Button>
                        )}
                      </div>
                    </td>`;

if (code.includes(oldLinksCol)) {
  code = code.replace(oldLinksCol, newLinksCol);
}

const oldActionsLinkBtn = `<Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50"
                          onClick={() => setLinkDoc(doc)}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Link
                        </Button>`;

if (code.includes(oldActionsLinkBtn)) {
  code = code.replace(oldActionsLinkBtn, '');
}

fs.writeFileSync(pagePath, code);
