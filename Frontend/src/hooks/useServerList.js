import { useCallback, useEffect, useState } from 'react';

export default function useServerList(fetchPage, key, enabled) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reload = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true); setError('');
    fetchPage({ page, limit: 20 }).then((data) => {
      if (!active) return;
      const last = Math.max(1, Math.ceil(data.pagination.total / 20));
      if (page > last) { setPage(last); return; }
      setItems(data[key]); setTotal(data.pagination.total);
    }).catch(() => { if (active) setError('Could not load records. Please retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchPage, key, enabled, page, revision]);
  return { items, page, setPage, pageCount: Math.ceil(total / 20), total, loading, error, reload };
}
