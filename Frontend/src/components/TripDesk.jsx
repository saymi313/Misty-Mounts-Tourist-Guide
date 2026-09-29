import useFeatures from "../hooks/useFeatures";
import FeatureNotice from "../components/FeatureNotice";
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api, { LIVE } from '../data/api';
import { startCheckout, submitCheckout, getPayConfig } from '../data/paymentApi';
import Navbar from '../UserPanel/components/Navbar';
import AdminLayout from '../AdminFrontend/AdminLayout';
import HotelLayout from '../HotelPannel/HotelLayout';
import GuideLayout from '../LocalGuidePannel/GuideLayout';
import TravelAgencyLayout from '../TravelAgencyPannel/TravelAgencyLayout';

const box = 'rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm';
const input = 'mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-700';
const button = 'min-h-11 rounded-lg bg-green-800 px-4 py-2 font-semibold text-white hover:bg-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';
const currency = value => `PKR ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
function Field({ label, children }) { return <label className="block text-sm font-medium">{label}{children}</label>; }
Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

function RequestForm({ onCreated }) {
  const [draft, setDraft] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem('mm-quote-draft') || '{}'); } catch { /* Start empty. */ }
    return { service: 'complete trip', destination: '', startDate: '', endDate: '', people: 2, budget: 100000, requirements: '', itinerary: '', ...saved };
  });
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const update = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })); setRequestKey(crypto.randomUUID()); };
  useEffect(() => {
    let active = true;
    setSupplierId(''); setLoadingSuppliers(true); setError('');
    api.get('/trip-requests/suppliers', { params: { service: draft.service } }).then(({ data }) => { if (active) setSuppliers(data.suppliers); }).catch(() => { if (active) { setSuppliers([]); setError('Could not load suppliers. Refresh to retry.'); } }).finally(() => { if (active) setLoadingSuppliers(false); });
    return () => { active = false; };
  }, [draft.service]);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.post('/trip-requests', { ...draft, supplierId, requestKey, people: Number(draft.people), budget: Number(draft.budget) });
      try { sessionStorage.removeItem('mm-quote-draft'); } catch { /* Request is already saved on the server. */ }
      onCreated();
    } catch (err) { setError(err.response?.data?.error || 'Request could not be sent. Retry with the same details.'); }
    finally { setBusy(false); }
  };
  const selected = suppliers.find(supplier => supplier.id === supplierId);
  return <form onSubmit={submit} className={box}>
    <h2 className="text-xl font-bold">Request a confirmed quote</h2>
    <p className="mt-2 text-sm text-slate-600">A supplier checks your dates and sends a price. Your budget and AI itinerary are estimates until you accept their quote.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Service"><select className={input} value={draft.service} onChange={event => update('service', event.target.value)}>{['complete trip', 'stay', 'guide', 'transport'].map(service => <option key={service} value={service}>{service}</option>)}</select></Field>
      <Field label="Destination"><input className={input} required maxLength={120} value={draft.destination} onChange={event => update('destination', event.target.value)} /></Field>
      {['startDate', 'endDate'].map((key, i) => <Field key={key} label={i ? 'Last travel day' : 'First travel day'}><input className={input} type="date" required min={new Date().toISOString().slice(0, 10)} value={draft[key]} onChange={event => update(key, event.target.value)} /></Field>)}
      <Field label="Travelers"><input className={input} type="number" min="1" max="100" required value={draft.people} onChange={event => update('people', event.target.value)} /></Field>
      <Field label="Total budget (PKR)"><input className={input} type="number" min="1" max="10000000" required value={draft.budget} onChange={event => update('budget', event.target.value)} /></Field>
      <Field label="Supplier"><select className={input} required disabled={loadingSuppliers} value={supplierId} onChange={event => { setSupplierId(event.target.value); setRequestKey(crypto.randomUUID()); }}><option value="">{loadingSuppliers ? 'Loading suppliers…' : 'Choose a supplier'}</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}{supplier.city ? ` — ${supplier.city}` : ''}</option>)}</select></Field>
      <p className="self-center text-sm text-slate-600">{selected ? selected.identityReviewed ? 'Identity document reviewed by an administrator. This does not certify service quality or availability.' : 'Identity document has not been verified.' : 'Choose a supplier serving your destination. Availability is confirmed in their quote.'}</p>
    </div>
    {!loadingSuppliers && !suppliers.length && <p className="mt-3 text-sm">No approved suppliers for this service yet. Try another service or contact support.</p>}
    <div className="mt-4"><Field label="Requirements, inclusions and accessibility needs"><textarea className={input} rows={3} required maxLength={2000} value={draft.requirements} onChange={event => update('requirements', event.target.value)} /></Field></div>
    <div className="mt-4"><Field label="Proposed itinerary (optional)"><textarea className={input} rows={4} maxLength={12000} value={draft.itinerary} onChange={event => update('itinerary', event.target.value)} /></Field></div>
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    <button className={`${button} mt-4`} disabled={busy || !supplierId}>{busy ? 'Sending…' : 'Send quote request'}</button>
  </form>;
}
RequestForm.propTypes = { onCreated: PropTypes.func.isRequired };

function QuoteForm({ submit, busy, commission }) {
  const [items, setItems] = useState([{ label: '', quantity: 1, unitPrice: 0 }]);
  const change = (index, key, value) => setItems(previous => previous.map((item, i) => i === index ? { ...item, [key]: value } : item));
  return <form className="mt-4 space-y-3" onSubmit={event => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    submit({ action: 'quote', ...data, expiresAt: new Date(data.expiresAt).toISOString(), availabilityConfirmed: data.availabilityConfirmed === 'on', items: items.map(item => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) });
  }}>
    <p className="text-sm text-slate-600">Quote the full requested service, including taxes and charges. The platform commission is {commission ?? 'the configured rate'}{commission != null ? '%' : ''} of the confirmed total.</p>
    {items.map((item, index) => <fieldset key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3"><legend className="px-1 text-sm">Price item {index + 1}</legend><Field label="Description"><input className={input} required maxLength={160} value={item.label} onChange={event => change(index, 'label', event.target.value)} /></Field><Field label="Quantity"><input className={input} type="number" min="1" max="1000" required value={item.quantity} onChange={event => change(index, 'quantity', event.target.value)} /></Field><Field label="Unit price (PKR)"><input className={input} type="number" step="0.01" min="0" max="10000000" required value={item.unitPrice} onChange={event => change(index, 'unitPrice', event.target.value)} /></Field>{items.length > 1 && <button type="button" className="min-h-11 text-red-700 underline" onClick={() => setItems(previous => previous.filter((_, i) => i !== index))}>Remove item</button>}</fieldset>)}
    <button type="button" className="min-h-11 font-medium underline" disabled={items.length >= 30} onClick={() => setItems(previous => [...previous, { label: '', quantity: 1, unitPrice: 0 }])}>Add price item</button>
    <Field label="Hold availability and price until"><input className={input} name="expiresAt" type="datetime-local" required /></Field>
    <Field label="Payment instructions and cancellation/refund terms"><textarea className={input} name="terms" required maxLength={2000} /></Field>
    <Field label="Excluded services and costs (write None if fully inclusive)"><textarea className={input} name="exclusions" required maxLength={2000} /></Field>
    <label className="flex items-start gap-3 py-3 text-sm"><input name="availabilityConfirmed" type="checkbox" required className="mt-1 h-5 w-5" />I confirm availability for the requested dates and can honor this quote until its expiry.</label>
    <button className={button} disabled={busy}>Send confirmed quote</button>
  </form>;
}
QuoteForm.propTypes = { submit: PropTypes.func.isRequired, busy: PropTypes.bool, commission: PropTypes.number };

function TripCard({ trip, mode, refresh, online, whatsappNumber, commission }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [action, setAction] = useState('');
  const owner = mode === 'traveler', admin = mode === 'admin', supplier = !owner && !admin;
  const expired = trip.quote?.expiresAt && new Date(trip.quote.expiresAt) <= new Date();
  const act = async payload => {
    setBusy(true); setError('');
    try { await api.post(`/trip-requests/${trip._id}/action`, payload); setAction(''); await refresh(); }
    catch (err) { setError(err.response?.data?.error || 'Could not update this trip. Please retry.'); }
    finally { setBusy(false); }
  };
  const options = [];
  if (owner && ['requested', 'quoted', 'accepted'].includes(trip.status)) options.push(['cancel', 'Cancel request']);
  if (owner && trip.status === 'quoted' && !expired) options.push(['accept', 'Accept quote and terms']);
  if (owner && trip.status === 'paid') { options.push(['request-refund', 'Request cancellation / refund']); if (new Date() >= new Date(`${trip.endDate}T23:59:59Z`)) options.push(['complete', 'Confirm trip completed']); }
  if (owner && trip.status === 'completed' && !trip.review?.createdAt) options.push(['review', 'Review completed trip']);
  if (owner && !trip.support?.openedAt) options.push(['support', 'Ask for support']);
  if (supplier && trip.status === 'requested') options.push(['quote', 'Prepare quote'], ['decline', 'Decline request']);
  if (admin && trip.status === 'accepted' && !expired) options.push(['record-payment', 'Record verified payment']);
  if (admin && trip.status === 'refund_requested') options.push(['record-refund', 'Record transferred refund']);
  if (admin && trip.status === 'completed' && !trip.payoutReference) options.push(['record-payout', 'Record supplier payout']);
  if (admin && trip.support?.openedAt && !trip.support.closedAt) options.push(['resolve-support', 'Resolve support request']);
  return <article className={box}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{trip.destination} · {trip.service}</h2><p className="mt-1 text-sm text-slate-600">{trip.startDate} → {trip.endDate} · {trip.people} travelers · Budget {currency(trip.budget)}</p><p className="mt-1 text-sm">Supplier: {trip.supplierName}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{trip.status.replaceAll('_', ' ')}</span></div>
    <p className="mt-3 break-all text-xs text-slate-500">{trip.ref}</p>
    <p className="mt-3 whitespace-pre-wrap">{trip.requirements}</p>
    {trip.itinerary && <details className="mt-3"><summary className="min-h-11 cursor-pointer font-medium">Proposed itinerary · not a confirmed reservation</summary><p className="whitespace-pre-wrap text-sm">{trip.itinerary}</p></details>}
    {trip.quote?.confirmedAt && <div className="mt-5 rounded-xl bg-slate-50 p-4"><h3 className="font-bold">Supplier-confirmed quote</h3><ul className="mt-3 space-y-2">{trip.quote.items.map((item, i) => <li key={i} className="flex flex-wrap justify-between gap-2 text-sm"><span>{item.label} · {item.quantity} × {currency(item.unitPrice)}</span><span>{currency(item.total)}</span></li>)}</ul><p className="mt-4 font-bold">Total: {currency(trip.quote.total)}</p><p className="mt-1 text-sm">{expired ? 'Quote expired' : 'Price and availability held until'}: {new Date(trip.quote.expiresAt).toLocaleString()}</p><h4 className="mt-4 font-semibold">Payment and cancellation terms</h4><p data-no-translate className="whitespace-pre-wrap text-sm">{trip.quote.terms}</p><h4 className="mt-3 font-semibold">Exclusions</h4><p data-no-translate className="whitespace-pre-wrap text-sm">{trip.quote.exclusions}</p>{(admin || supplier) && <p className="mt-3 text-sm">Commission {trip.quote.commissionPercent}% · Supplier amount {currency(Math.round(trip.quote.total * (1 - trip.quote.commissionPercent / 100) * 100) / 100)}</p>}</div>}
    {trip.paidAt && <p className="mt-3 text-sm">Payment verified on {new Date(trip.paidAt).toLocaleDateString()}. {trip.paymentReference || ''}</p>}
    {trip.refundNote && <p className="mt-3 text-sm">Refund request: {trip.refundNote}</p>}
    {trip.refundReference && <p className="mt-3 text-sm">Refund recorded: {currency(trip.refundAmount)} · {trip.refundReference}</p>}
    {trip.payoutReference && <p className="mt-3 text-sm">Supplier payout recorded: {currency(trip.payoutAmount)} · {trip.payoutReference}</p>}
    {trip.review?.createdAt && <p className="mt-3 text-sm">Completed-trip review · {trip.review.rating}/5: {trip.review.text}</p>}
    {trip.support?.openedAt && <div className="mt-3 rounded-lg border p-3 text-sm"><p>Support: {trip.support.message}</p><p>{trip.support.closedAt ? `Resolved: ${trip.support.resolution}` : 'Awaiting administrator response'}</p></div>}
    {owner && trip.status === 'accepted' && !expired && <div className="mt-4"><p className="mb-3 text-sm text-slate-600">Follow the agreed payment instructions. The booking remains unpaid until receipt is independently verified.</p>{online && <button disabled={busy} className={button} onClick={async () => { setBusy(true); setError(''); try { submitCheckout(await startCheckout('trip', trip.ref)); } catch (err) { setError(err.response?.data?.error || 'Checkout is unavailable.'); } finally { setBusy(false); } }}>Pay {currency(trip.quote.total)} online</button>}</div>}
    {owner && whatsappNumber && <a className="mt-3 inline-flex min-h-11 items-center font-semibold text-green-800 underline" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I need help with my Misty Mounts trip request ${trip.ref}.`)}`} target="_blank" rel="noreferrer">Contact support on WhatsApp</a>}
    {options.length > 0 && <div className="mt-4"><Field label="Next action"><select className={input} value={action} onChange={event => setAction(event.target.value)}><option value="">Choose an action</option>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field></div>}
    {action === 'quote' ? <QuoteForm submit={act} busy={busy} commission={commission} /> : action && <form className="mt-4 space-y-3" onSubmit={event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
      act({ action, ...data, ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}), ...(data.rating ? { rating: Number(data.rating) } : {}), ...(data.minutes ? { minutes: Number(data.minutes) } : {}), acceptTerms: data.confirmed === 'on', confirmed: data.confirmed === 'on' });
    }}>
      {['record-payment', 'record-refund', 'record-payout'].includes(action) && <><Field label="Amount actually transferred (PKR)"><input className={input} name="amount" type="number" step="0.01" min="0.01" required /></Field><Field label="External bank / processor transaction reference"><input className={input} name="reference" maxLength={200} required /></Field><p className="text-sm text-slate-600">This records an independently verified transfer. It does not move money.</p></>}
      {action === 'request-refund' && <Field label="Reason for cancellation / refund"><textarea className={input} name="note" maxLength={2000} required /></Field>}
      {action === 'support' && <Field label="What do you need help with?"><textarea className={input} name="message" maxLength={2000} required /></Field>}
      {action === 'review' && <><Field label="Rating"><select className={input} name="rating">{[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating}</option>)}</select></Field><Field label="Your experience"><textarea className={input} name="text" maxLength={1000} required /></Field></>}
      {action === 'resolve-support' && <><Field label="Resolution"><textarea className={input} name="resolution" maxLength={2000} required /></Field><Field label="Support time spent (minutes)"><input className={input} name="minutes" type="number" min="1" max="10000" required /></Field></>}
      <label className="flex items-start gap-3 py-3 text-sm"><input className="mt-1 h-5 w-5" type="checkbox" name="confirmed" required />{action === 'accept' ? 'I accept this total, the listed services, exclusions, payment instructions and cancellation terms.' : 'I have checked the details and confirm this action.'}</label>
      <button className={button} disabled={busy}>{busy ? 'Saving…' : options.find(([value]) => value === action)?.[1] || 'Confirm'}</button>
    </form>}
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
  </article>;
}
TripCard.propTypes = { trip: PropTypes.object.isRequired, mode: PropTypes.string.isRequired, refresh: PropTypes.func.isRequired, online: PropTypes.bool, whatsappNumber: PropTypes.string, commission: PropTypes.number };

export default function TripDesk({ mode = 'traveler' }) {
  const features = useFeatures();
  const [trips, setTrips] = useState([]), [metrics, setMetrics] = useState(null), [config, setConfig] = useState({}), [online, setOnline] = useState(false);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [page, setPage] = useState(1), [hasMore, setHasMore] = useState(false), [notice, setNotice] = useState('');
  const refresh = useCallback(async () => {
    if (!LIVE) { setLoading(false); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.get('/trip-requests', { params: { page } }); setTrips(data.trips); setHasMore(data.hasMore);
      if (mode === 'admin') setMetrics((await api.get('/trip-requests/metrics')).data);
    } catch (err) { setError(err.response?.data?.error || 'Could not load trips. Please retry.'); }
    finally { setLoading(false); }
  }, [page, mode]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (LIVE) { api.get('/trip-requests/config').then(({ data }) => setConfig(data)).catch(() => {}); getPayConfig().then(data => setOnline(data.enabled)); } }, []);
  const content = <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">{mode === 'admin' ? 'Trip operations' : mode === 'traveler' ? 'Your trip requests' : 'Supplier quote desk'}</h1><p className="mt-2 text-sm text-slate-600">Request → supplier quote → your approval → verified payment → completed trip</p></div><button className={button} onClick={refresh} disabled={loading}>Refresh status</button></div>
    {mode === 'traveler' && !features.whatsapp && <FeatureNotice feature="WhatsApp support" state={features.state}>Use the support action on your trip request to contact the team.</FeatureNotice>}
    {mode === 'traveler' && <FeatureNotice feature="Automated WhatsApp concierge">Trip requests and supplier quotes are available here on the website.</FeatureNotice>}
    {!LIVE ? <p className={box}>Connect the live API to request quotes. Demo mode cannot create bookings or record payments.</p> : <>
      {error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-800">{notice}</p>}
      {metrics && <section className={box}><h2 className="text-xl font-bold">Booking funnel · all time</h2><p className="mt-2 text-sm text-slate-600">{metrics.scope}</p><dl className="mt-4 grid grid-cols-2 gap-5 lg:grid-cols-4">{[['Requests', metrics.inquiries], ['Quoted', metrics.quoted], ['Accepted', metrics.accepted], ['Paid', metrics.paid], ['Completed', metrics.completed], ['Cancelled / refunded', metrics.cancelled], ['Request → paid', `${metrics.conversionPercent}%`], ['Average quote response', metrics.averageQuoteHours == null ? 'No quotes yet' : `${metrics.averageQuoteHours.toFixed(1)} hours`], ['Gross booking value', currency(metrics.grossBookingValue)], ['Refunds recorded', currency(metrics.refunds)], ['Earned commission', currency(metrics.earnedCommission)], ['Supplier payouts recorded', currency(metrics.supplierPayouts)], ['Support time', `${metrics.supportMinutes} minutes`]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd></div>)}</dl></section>}
      {mode === 'traveler' && <RequestForm onCreated={() => { setNotice('Request sent. Your supplier can now review it in their quote desk.'); setPage(1); refresh(); }} />}
      {loading && <p role="status">Loading trip requests…</p>}
      {!loading && !error && !trips.length && <p className={box}>No trip requests yet.{mode !== 'traveler' ? ' Requests will appear here when a traveler chooses your service.' : ' Start with a supplier quote above.'}</p>}
      {trips.map(trip => <TripCard key={trip._id} trip={trip} mode={mode} refresh={refresh} online={online} whatsappNumber={config.whatsappNumber} commission={config.commissionPercent} />)}
      <nav aria-label="Trip request pages" className="flex items-center gap-4"><button className={button} disabled={page === 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button className={button} disabled={!hasMore || loading} onClick={() => setPage(value => value + 1)}>Next</button></nav>
    </>}
  </div>;
  const Layout = { admin: AdminLayout, hotel: HotelLayout, guide: GuideLayout, agency: TravelAgencyLayout }[mode];
  if (Layout) return <Layout greeting="Trip requests" subtitle="Quotes, fulfillment and support">{content}</Layout>;
  return <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar /><main className="mx-auto max-w-5xl space-y-5 px-4 py-10"><Link className="inline-block min-h-11 font-medium text-green-800 underline" to="/plan">Back to trip planner</Link>{content}</main></div>;
}
TripDesk.propTypes = { mode: PropTypes.oneOf(['traveler', 'admin', 'hotel', 'guide', 'agency']) };
