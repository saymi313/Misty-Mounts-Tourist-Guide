import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { pageMetadata, structuredData, safeJsonLd, siteOrigin, isDetailPath } from '../data/seoPages';
const origin = siteOrigin(import.meta.env.VITE_SITE_URL || 'https://www.mistymounts.pk');
const indexable = import.meta.env.VITE_SEO_INDEXABLE === 'true' && Boolean(import.meta.env.VITE_API_URL);
const overrides = new Map();
function meta(attr, key, content) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute(attr, key); document.head.appendChild(element); }
  element.content = content;
}
function apply(path) {
  const override = overrides.get(path) || {};
  const values = pageMetadata(path, override, origin, indexable);
  document.title = values.title; meta('name', 'description', values.description); meta('name', 'robots', values.robots);
  for (const [key, value] of Object.entries({ title: values.title, description: values.description, type: values.type, url: values.canonical, site_name: 'Misty Mounts', image: values.image, 'image:alt': override.title || 'Misty Mounts — Pakistan travel', locale: 'en_PK' })) meta('property', `og:${key}`, value);
  for (const [key, value] of Object.entries({ card: 'summary_large_image', title: values.title, description: values.description, image: values.image, 'image:alt': override.title || 'Misty Mounts — Pakistan travel' })) meta('name', `twitter:${key}`, value);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = values.canonical;
  document.getElementById('mm-jsonld')?.remove();
  const data = structuredData(path, values, override.jsonLd);
  if (data) { const script = document.createElement('script'); script.id = 'mm-jsonld'; script.type = 'application/ld+json'; script.textContent = safeJsonLd(data); document.head.appendChild(script); }
  document.documentElement.dataset.seoReady = String(!isDetailPath(path) || overrides.has(path));
}
export function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => { apply(pathname); }, [pathname]);
  return null;
}
export default function Seo(props) {
  const { pathname } = useLocation();
  const serialized = JSON.stringify(props);
  useEffect(() => {
    overrides.set(pathname, JSON.parse(serialized)); apply(pathname);
    return () => { overrides.delete(pathname); if (window.location.pathname === pathname) apply(pathname); };
  }, [pathname, serialized]);
  return null;
}
Seo.propTypes = { title: PropTypes.string, description: PropTypes.string, image: PropTypes.string, type: PropTypes.string, jsonLd: PropTypes.object, noindex: PropTypes.bool };
