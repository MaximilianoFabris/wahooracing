// Apply the saved preference before styles paint; keep the page default on first visit.
try { const saved=localStorage.getItem('wahoo-theme');if(saved==='day'||saved==='night')document.documentElement.dataset.theme=saved; } catch {}
