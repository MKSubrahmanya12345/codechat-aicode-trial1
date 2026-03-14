// ??$$$ Toast notification container
const ToastContainer = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map((t) => (
      <div key={t.id} className={`toast ${t.type}`}>
        <span className="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <div className="toast-body">
          <div className="toast-title">{t.title}</div>
          {t.msg && <div className="toast-msg">{t.msg}</div>}
        </div>
      </div>
    ))}
  </div>
);

export default ToastContainer;
