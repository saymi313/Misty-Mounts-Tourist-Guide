import PropTypes from 'prop-types';
import Pagination from './Pagination';
export default function ServerListControls({ list }) {
  return <div aria-busy={list.loading}>
    {list.error && <p role="alert">{list.error} <button type="button" onClick={list.reload}>Retry</button></p>}
    {list.loading && <p className="text-sm text-slate-500">Loading records...</p>}
    <Pagination page={list.page} pageCount={list.pageCount} setPage={list.setPage} />
  </div>;
}
ServerListControls.propTypes = { list: PropTypes.shape({ loading: PropTypes.bool, error: PropTypes.string,
  reload: PropTypes.func, page: PropTypes.number, pageCount: PropTypes.number, setPage: PropTypes.func }).isRequired };
