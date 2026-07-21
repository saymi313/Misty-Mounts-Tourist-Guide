import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Tile, Eyebrow } from '../bento/tiles';

const items = [
  { icon: MapPin, title: 'Address', lines: ['Airport Road, Jutial', 'Gilgit, Gilgit-Baltistan'] },
  { icon: Phone, title: 'Phone', lines: ['+92 5811 123456'] },
  { icon: Mail, title: 'Email', lines: ['hello@mistymounts.pk'] },
  { icon: Clock, title: 'Office hours', lines: ['Mon–Fri: 9AM–6PM', 'Sat: 10AM–4PM'] },
];

const ContactInfo = () => {
  return (
    <Tile glow="green" pad="p-6 sm:p-8">
      <Eyebrow>Our hub</Eyebrow>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Reach us directly</h2>
      <div className="mt-6 space-y-5">
        {items.map(({ icon: Icon, title, lines }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              {lines.map((l) => (
                <p key={l} className="text-sm text-white/60">{l}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Tile>
  );
};

export default ContactInfo;
