const fs = require('fs');
const path = 'src/components/documents/UploadModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace(
    "import { cn } from '@/lib/utils'",
    "import { cn } from '@/lib/utils'\nimport { supabase } from '@/lib/supabase'"
  );
  
  const oldSubmit = `  const handleSubmit = async () => {
    if (!file || !name.trim()) return
    setUploading(true)
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1200))
    setUploading(false)
    onSuccess({
      id: Math.random().toString(36).substring(2, 8),
      name: name.trim(),
      type: getFileType(file),
    })
    handleClose()
  }`;

  const newSubmit = `  const handleSubmit = async () => {
    if (!file || !name.trim()) return
    setUploading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const fileExt = file.name.split('.').pop()
      const fileName = \`\${Math.random().toString(36).substring(2, 8)}-\${Date.now()}.\${fileExt}\`
      const filePath = \`\${session.user.id}/\${fileName}\`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      onSuccess({
        id: fileName.split('.')[0],
        name: name.trim(),
        type: getFileType(file),
      })
      handleClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }`;

  code = code.replace(oldSubmit, newSubmit);
  fs.writeFileSync(path, code);
}
