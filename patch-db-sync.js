const fs = require('fs');

// --- 1. PATCH PAGE.TSX ---
const pagePath = 'src/app/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Replace the mockDocuments initialization
pageCode = pageCode.replace(
  'const [documents, setDocuments] = useState<DocumentType[]>(mockDocuments)',
  'const [documents, setDocuments] = useState<any[]>([])'
);

// Add fetch inside the user effect
const oldEffect = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoadingSession(false)
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])`;

const newEffect = `  useEffect(() => {
    const fetchDocs = async (userId: string) => {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      if (data) {
        setDocuments(data.map(d => ({
          ...d,
          totalViews: d.total_views || 0,
          avgTimeSpent: d.avg_time_spent || 0,
          links: d.links || []
        })))
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoadingSession(false)
      if (session?.user) fetchDocs(session.user.id)
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) fetchDocs(session.user.id)
      else setDocuments([])
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])`;

if (pageCode.includes(oldEffect)) {
  pageCode = pageCode.replace(oldEffect, newEffect);
}

// Update handleUploadSuccess to just use the DB document
const oldUploadSuccess = `  const handleUploadSuccess = (doc: { id: string; name: string; type: 'pdf' | 'video' }) => {
    const newDoc: DocumentType = {
      ...doc,
      storage_path: '',
      owner_id: 'user1',
      space_id: null,
      cta_url: null,
      cta_label: null,
      created_at: new Date().toISOString(),
      totalViews: 0,
      avgTimeSpent: 0,
      links: [],
    }
    setDocuments(prev => [newDoc, ...prev])
  }`;

const newUploadSuccess = `  const handleUploadSuccess = (doc: any) => {
    const newDoc = {
      ...doc,
      totalViews: doc.total_views || 0,
      avgTimeSpent: doc.avg_time_spent || 0,
      links: doc.links || []
    }
    setDocuments(prev => [newDoc, ...prev])
  }`;

if (pageCode.includes(oldUploadSuccess)) {
  pageCode = pageCode.replace(oldUploadSuccess, newUploadSuccess);
}

// Update link generation to save to Supabase
const oldLinkSuccess = `onSuccess={(slug) => {
            setDocuments(prev => prev.map(d => 
              d.id === linkDoc.id ? { ...d, links: [slug, ...d.links] } : d
            ))
          }}`;

const newLinkSuccess = `onSuccess={async (slug) => {
            const currentLinks = linkDoc.links || []
            const newLinks = [slug, ...currentLinks]
            setDocuments(prev => prev.map(d => 
              d.id === linkDoc.id ? { ...d, links: newLinks } : d
            ))
            await supabase.from('documents').update({ links: newLinks }).eq('id', linkDoc.id)
          }}`;

if (pageCode.includes(oldLinkSuccess)) {
  pageCode = pageCode.replace(oldLinkSuccess, newLinkSuccess);
}

fs.writeFileSync(pagePath, pageCode);

// --- 2. PATCH UPLOADMODAL.TSX ---
const modalPath = 'src/components/documents/UploadModal.tsx';
let modalCode = fs.readFileSync(modalPath, 'utf8');

const oldModalInterface = `onSuccess: (doc: { id: string; name: string; type: 'pdf' | 'video' }) => void`;
const newModalInterface = `onSuccess: (doc: any) => void`;
if (modalCode.includes(oldModalInterface)) {
  modalCode = modalCode.replace(oldModalInterface, newModalInterface);
}

const oldSubmit = `      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      onSuccess({
        id: fileName.split('.')[0],
        name: name.trim(),
        type: getFileType(file),
      })`;

const newSubmit = `      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: docData, error: dbError } = await supabase.from('documents').insert({
        owner_id: session.user.id,
        name: name.trim(),
        type: getFileType(file),
        storage_path: filePath,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        total_views: 0,
        avg_time_spent: 0,
        links: []
      }).select().single()

      if (dbError) throw dbError

      onSuccess(docData)`;

if (modalCode.includes(oldSubmit)) {
  modalCode = modalCode.replace(oldSubmit, newSubmit);
}

fs.writeFileSync(modalPath, modalCode);
