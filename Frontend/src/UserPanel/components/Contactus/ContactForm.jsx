import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tile, Eyebrow, Btn, inputCls } from '../bento/tiles';
import { required, email as emailRule, minLen, validate, hasErrors } from '../../../utils/validation';

const labelCls = 'block text-sm font-semibold text-white/70';
const inputErr = '!border-rose-400/60 focus:!border-rose-400/60 focus:!ring-rose-400/15';
const errNote = 'mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required('Please enter your name')],
      email: [required('Email is required'), emailRule()],
      message: [required('Please write a message'), minLen(10, 'Message must be at least 10 characters')],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Tile glow="lime" pad="p-6 sm:p-8" className="h-full">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Send us a message</h2>
        </div>

        {sent && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-400">
            <CheckCircle2 className="h-4 w-4" /> Thanks! We'll be in touch shortly.
          </div>
        )}

        <div>
          <label className={labelCls} htmlFor="cf-name">Your name</label>
          <input
            id="cf-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Jane Traveller"
            aria-invalid={!!errors.name}
            className={`${inputCls} mt-1.5 ${errors.name ? inputErr : ''}`}
          />
          {errors.name && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.name}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="cf-email">Your email</label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="jane@email.com"
            aria-invalid={!!errors.email}
            className={`${inputCls} mt-1.5 ${errors.email ? inputErr : ''}`}
          />
          {errors.email && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            rows="4"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Tell us about your dream trip…"
            aria-invalid={!!errors.message}
            className={`${inputCls} mt-1.5 ${errors.message ? inputErr : ''}`}
          />
          {errors.message && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.message}</p>}
        </div>

        <Btn type="submit" className="w-full">
          Send message <Send className="h-4 w-4" />
        </Btn>
      </form>
    </Tile>
  );
};

export default ContactForm;
