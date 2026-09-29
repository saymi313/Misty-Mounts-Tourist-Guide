import useFeatures from "../../hooks/useFeatures";
import FeatureNotice from "../../components/FeatureNotice";
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, Loader2 } from 'lucide-react';
import api, { LIVE } from '../../data/api';

const control = 'mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:outline-lime-600';
const button = 'min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus:outline-lime-600 disabled:opacity-50';

export default function AiDraftAssistant({ facts, onApply }) {
  const features = useFeatures();
  const [mode, setMode] = useState('description');
  const [language, setLanguage] = useState('en');
  const [source, setSource] = useState('');
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const locked = useRef(false);
  const generate = async () => {
    if (locked.current || !features.gemini) return;
    locked.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.post('/ai/draft', { mode, language, facts, source: mode === 'translate' ? facts.description || '' : source }, { timeout: 30000 });
      setDraft({ ...data, contextKey: JSON.stringify(facts) });
    } catch (err) { setError(err.response?.data?.error || 'Could not generate a draft. Your existing text is unchanged.'); }
    finally { locked.current = false; setBusy(false); }
  };
  const reset = () => { setDraft(null); setError(''); setNotice(''); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(draft.text); setNotice('Draft copied. Review it before sharing.'); }
    catch { setError('Clipboard is unavailable. Select and copy the draft text manually.'); }
  };
  if (!features.gemini) return <div className="text-slate-700"><FeatureNotice feature="AI writing assistant" state={features.state}>You can write and save your description manually.</FeatureNotice></div>;
  return <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <summary className="min-h-11 cursor-pointer text-sm font-bold text-slate-800"><Sparkles className="mr-2 inline h-4 w-4" />AI writing assistant</summary>
    <p className="mb-4 text-xs leading-relaxed text-slate-600">Draft from the facts in this form. Review the result before applying or sharing it. Text you submit is sent to the AI provider; omit private guest details.</p>
    {!LIVE && <p role="status" className="mb-3 text-sm text-slate-700">AI drafting requires a connected backend and a hotel or guide account.</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">Task
        <select className={control} disabled={busy} value={mode} onChange={e => { setMode(e.target.value); reset(); }}>
          <option value="description">Write description</option><option value="translate">Translate current description</option><option value="guest-reply">Draft guest reply</option><option value="review-reply">Draft review response</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">Output language
        <select className={control} disabled={busy} value={language} onChange={e => { setLanguage(e.target.value); reset(); }}><option value="en">English</option><option value="ur">Urdu</option></select>
      </label>
    </div>
    {mode.endsWith('reply') && <label className="mt-3 block text-sm font-semibold text-slate-700">{mode === 'guest-reply' ? 'Guest message' : 'Review text'}
      <textarea className={control} rows={3} maxLength={3000} disabled={busy} value={source} onChange={e => { setSource(e.target.value); reset(); }} />
    </label>}
    <button type="button" className={`${button} mt-4`} disabled={busy || !LIVE} onClick={generate}>{busy ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Drafting…</> : 'Generate draft'}</button>
    {busy && <p role="status" className="mt-2 text-xs text-slate-600">Your draft may take up to 30 seconds.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    {draft && <div className="mt-4">
      {draft.contextKey !== JSON.stringify(facts) && <p className="mb-2 text-xs text-slate-600">Form details changed since this draft was generated. Check the draft against the latest details before using it.</p>}
      <label className="block text-sm font-semibold text-slate-700">Editable draft
        <textarea dir={draft.language === 'ur' ? 'rtl' : 'ltr'} lang={draft.language} className={control} rows={6} maxLength={5000} value={draft.text} onChange={e => setDraft(previous => ({ ...previous, text: e.target.value }))} />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {['description', 'translate'].includes(draft.mode) && <button type="button" disabled={busy || !draft.text.trim()} className={button} onClick={() => { onApply(draft.text); setNotice('Description updated in the form. Save the listing when ready.'); }}>Use as description</button>}
        <button type="button" disabled={busy || !draft.text.trim()} className={button} onClick={copy}>Copy draft</button>
        <button type="button" disabled={busy} className={button} onClick={reset}>Discard</button>
      </div>
    </div>}
    {notice && <p role="status" className="mt-3 text-sm text-slate-700">{notice}</p>}
  </details>;
}
AiDraftAssistant.propTypes = { facts: PropTypes.object.isRequired, onApply: PropTypes.func.isRequired };
