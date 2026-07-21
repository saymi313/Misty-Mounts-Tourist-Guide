import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const items = [
  { icon: MapPin, title: 'Address', lines: ['Airport Road, Jutial', 'Gilgit, Gilgit-Baltistan'] },
  { icon: Phone, title: 'Phone', lines: ['+92 5811 123456'] },
  { icon: Mail, title: 'Email', lines: ['hello@mistymounts.pk'] },
  { icon: Clock, title: 'Office hours', lines: ['Mon–Fri: 9AM–6PM', 'Sat: 10AM–4PM'] },
];

const ContactInfo = () => {
  return (
    <div className="p-6 sm:p-8">
      <p className="eyebrow">Our hub</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Reach us directly</h2>
      <div className="mt-6 space-y-5">
        {items.map(({ icon: Icon, title, lines }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-abyss-900 dark:text-frost-50">{title}</h3>
              {lines.map((l) => (
                <p key={l} className="text-sm text-frost-600 dark:text-frost-300">{l}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;
