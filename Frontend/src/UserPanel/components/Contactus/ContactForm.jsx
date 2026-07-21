import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

const fieldCls =
  'w-full rounded-xl border border-abyss-900/12 bg-white py-3 pl-11 pr-4 text-sm text-abyss-900 placeholder-frost-400 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50';

const ContactForm = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
      <div>
        <p className="eyebrow">Get in touch</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Send us a message</h2>
      </div>

      {sent && (
        <div className="flex items-center gap-2.5 rounded-xl border border-glacier-500/25 bg-glacier-500/5 px-4 py-3 text-sm text-glacier-700 dark:text-glacier-300">
          <CheckCircle2 className="h-4 w-4" /> Thanks! We'll be in touch shortly.
        </div>
      )}

      <div className="relative">
        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
        <input type="text" required placeholder="Your name" className={fieldCls} />
      </div>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
        <input type="email" required placeholder="Your email" className={fieldCls} />
      </div>
      <div className="relative">
        <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-frost-500 dark:text-frost-400" />
        <textarea rows="4" required placeholder="Tell us about your dream trip…" className={`${fieldCls} pt-3`} />
      </div>
      <button type="submit" className="btn-primary w-full">
        Send message <Send className="h-4 w-4" />
      </button>
    </form>
  );
};

export default ContactForm;
