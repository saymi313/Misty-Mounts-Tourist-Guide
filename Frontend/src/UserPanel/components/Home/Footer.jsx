import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, MapPin } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      ["Destinations", "/destinations"],
      ["Reviews", "/feedback"],
      ["About us", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Regions",
    links: [
      ["Kaghan & Naran", "/destinations"],
      ["Abbottabad", "/destinations"],
      ["Mansehra", "/destinations"],
      ["Swat Valley", "/destinations"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Our guides", "/about"],
      ["Responsible travel", "/about"],
      ["Terms of service", "#"],
      ["Privacy policy", "#"],
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-night-950 text-white/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link to="/user" className="inline-block">
              <img
                src="/main logo.png"
                alt="Misty Mounts — explore more, discover hidden"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              A local's guide to Hazara — curated spots, honest stays, and the
              people who know these mountains best.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
              <MapPin className="h-4 w-4 text-lime-400" /> Hazara, Pakistan
            </div>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-night-800 text-white/70 transition-colors hover:bg-lime-400 hover:text-night-950"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="text-sm text-white/50 transition-colors hover:text-lime-400">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Misty Mounts. Crafted for the mountains.</p>
          <p>Explore more · Discover hidden</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
