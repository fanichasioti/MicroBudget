import { useState } from "react";
import BottomNav from "./BottomNav.jsx";
import Toast from "./Toast.jsx";

export default function AppLayout({
  children,
  activePage,
  onNavigate,
  profile,
  onEditProfile,
  toast,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  theme,
  onToggleTheme,
  onLoadDemo,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const initials = profile.name.trim().slice(0, 1).toLocaleUpperCase("el-GR") || "Μ";

  function toggleNotifications() {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening && unreadCount > 0) onMarkAllRead();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => onNavigate("dashboard")} aria-label="MicroBudget αρχική">
          <span className="brand-mark" aria-hidden="true">μ</span>
          <span>MicroBudget</span>
        </button>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ενεργοποίηση φωτεινής εμφάνισης" : "Ενεργοποίηση σκοτεινής εμφάνισης"}
            title={theme === "dark" ? "Φωτεινή εμφάνιση" : "Σκοτεινή εμφάνιση"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" /></svg>
            )}
          </button>
          <div className="notification-anchor">
            <button
              className="notification-bell"
              type="button"
              onClick={toggleNotifications}
              aria-label={unreadCount > 0 ? `Ειδοποιήσεις, ${unreadCount} μη αναγνωσμένες` : "Ειδοποιήσεις"}
              aria-expanded={notificationsOpen}
              aria-controls="notification-panel"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              {unreadCount > 0 && <span className="unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <section className="notification-panel" id="notification-panel" aria-label="Κέντρο ειδοποιήσεων">
                <div className="notification-panel-heading">
                  <h2>Ειδοποιήσεις</h2>
                  <button type="button" className="icon-button" onClick={() => setNotificationsOpen(false)} aria-label="Κλείσιμο ειδοποιήσεων">×</button>
                </div>
                {notifications.length === 0 ? (
                  <p className="notification-empty">Δεν έχεις ειδοποιήσεις ακόμα.</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.slice(0, 8).map((notification) => (
                      <li className={notification.read ? "" : "notification-unread"} key={notification.id}>
                        <button
                          type="button"
                          className="notification-item"
                          onClick={() => onMarkRead(notification.id)}
                        >
                          <span className="notification-dot" aria-hidden="true" />
                          <span>
                            <strong>{notification.title}</strong>
                            <small>{notification.body}</small>
                            <time>{new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(notification.createdAt))}</time>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
          <div className="profile-menu-anchor">
            <button
              className="profile-button"
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label={`Μενού προφίλ: ${profile.name}`}
              aria-expanded={profileMenuOpen}
            >
              <span className="avatar">{initials}</span>
              <span className="profile-name">{profile.name}</span>
              <span aria-hidden="true">⌄</span>
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <button type="button" onClick={() => { setProfileMenuOpen(false); onEditProfile(); }}>
                  <span aria-hidden="true">◉</span> Επεξεργασία προφίλ
                </button>
                <button type="button" onClick={() => { setProfileMenuOpen(false); onLoadDemo(); }}>
                  <span aria-hidden="true">✦</span> Φόρτωση Demo Δεδομένων
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
