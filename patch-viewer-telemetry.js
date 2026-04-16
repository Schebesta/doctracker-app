const fs = require('fs');
const path = 'src/app/d/[slug]/viewer-client.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldEffect = `  useEffect(() => {
    if (step !== 'viewer') return

    // Post open event
    postTelemetry('open')

    // Heartbeat every 5 seconds
    heartbeatRef.current = setInterval(() => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
      postTelemetry('page_view', currentPage, duration)
    }, 5000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
      postTelemetry('close', currentPage, duration)
    }
  }, [step, postTelemetry, currentPage])`;

const newEffect = `  // Run once when viewer opens
  useEffect(() => {
    if (step === 'viewer') {
      postTelemetry('open')
    }
  }, [step, postTelemetry])

  // Handle heartbeat and page tracking
  useEffect(() => {
    if (step !== 'viewer') return

    heartbeatRef.current = setInterval(() => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
      postTelemetry('page_view', currentPage, duration)
    }, 5000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      // Only send close event if we are actually closing the page, 
      // but since this unmounts on page change, we let handlePageChange do the exact tracking.
    }
  }, [step, postTelemetry, currentPage])`;

if (code.includes(oldEffect)) {
  code = code.replace(oldEffect, newEffect);
  fs.writeFileSync(path, code);
}
