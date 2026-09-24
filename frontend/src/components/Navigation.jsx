export default function Navigation({
  user,
  onDashboard,
  onLogout,
  showDashboardBtn = true,
}) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
      <div className="text-2xl font-heading font-bold">
        <span className="text-accent-cyan">Place</span>
        <span className="text-text-light">IQ</span>
      </div>

      <div className="flex items-center gap-3">
        {user && <span className="text-text-muted text-sm">{user.name}</span>}
        {showDashboardBtn && (
          <button type="button" onClick={onDashboard} className="btn-ghost">
            Dashboard
          </button>
        )}
        <button type="button" onClick={onLogout} className="btn-ghost">
          Logout
        </button>
      </div>
    </nav>
  );
}
