import { useNotifications } from "../../app/providers/NotificationsProvider";

export function NotificationsPage() {
  const { notifications, isLoading, markRead, markAllRead } =
    useNotifications();
  if (isLoading) return <p>Loading notifications…</p>;
  const unread = notifications.filter((item) => !item.read).length;
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Global state</p>
          <h2>
            Notifications <span>{unread} unread</span>
          </h2>
          <p>Updates intentionally begin high in the component tree.</p>
        </div>
        <button onClick={markAllRead}>Mark all as read</button>
      </header>
      <div className="notification-list">
        {notifications.map((item) => (
          <article
            className={`notification ${item.read ? "read" : ""}`}
            key={item.id}
          >
            <div>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
            {!item.read && (
              <button onClick={() => markRead(item.id)}>Mark read</button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
