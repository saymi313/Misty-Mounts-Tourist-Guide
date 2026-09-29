import { useEffect, useState } from 'react';
import api, { LIVE } from '../data/api';

const unavailable = { gemini: false, whatsapp: false, whatsappAutomation: false };
let pending, checkedAt = 0;
function load(force = false) {
  if (!LIVE) return Promise.resolve({ ...unavailable, state: 'ready' });
  if (force || !pending || Date.now() - checkedAt > 60000) {
    checkedAt = Date.now();
    pending = api.get('/features', { timeout: 8000 }).then(({ data }) => ({
      gemini: data.gemini === true, whatsapp: data.whatsapp === true,
      whatsappAutomation: data.whatsappAutomation === true, state: 'ready',
    })).catch(() => ({ ...unavailable, state: 'error' }));
  }
  return pending;
}
export default function useFeatures() {
  const [features, setFeatures] = useState({ ...unavailable, state: LIVE ? 'loading' : 'ready' });
  useEffect(() => {
    let active = true;
    const refresh = (force = false) => load(force).then(value => { if (active) setFeatures(value); });
    const onFocus = () => { refresh(); };
    refresh();
    const interval = LIVE ? setInterval(() => { refresh(); }, 65000) : null;
    window.addEventListener('focus', onFocus);
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, []);
  return features;
}
