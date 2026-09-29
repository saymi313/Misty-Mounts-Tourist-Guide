import PropTypes from 'prop-types';

export default function FeatureNotice({ feature, state = 'ready', children }) {
  const label = state === 'loading' ? 'Checking availability…' : state === 'error' ? 'Temporarily unavailable' : 'Under construction';
  return <div role="status" className="my-3 rounded-xl border border-current/20 p-3 text-sm">
    <p className="font-semibold">{feature} — {label}</p>
    {children && <p className="mt-1 opacity-80">{children}</p>}
  </div>;
}
FeatureNotice.propTypes = { feature: PropTypes.string.isRequired, state: PropTypes.string, children: PropTypes.node };
