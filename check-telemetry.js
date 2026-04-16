const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function check() {
    const { data: telemetry, error: tErr } = await supabase.from('telemetry').select('*');
    console.log("TELEMETRY DB ERROR:", tErr);
    console.log("TELEMETRY DOCS:", telemetry ? telemetry.length : 0);
    console.log("TELEMETRY ROWS:", JSON.stringify(telemetry?.slice(0, 5), null, 2));

    const { data: links, error: lErr } = await supabase.from('links').select('*');
    console.log("LINKS ROWS:", JSON.stringify(links?.slice(0, 5), null, 2));
  }
  check();
}
