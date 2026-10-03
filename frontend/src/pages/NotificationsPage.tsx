import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Circle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./ServicePages.css";

type Notification = {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  action_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type NotificationListResponse =
  | Notification[]
  | {
      results: Notification[];
    };

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<NotificationListResponse>("/notifications/");

      const data = response.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications(data.results ?? []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read/`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markSelected = async () => {
    if (!selected.length) return;

    try {
      setActionLoading(true);

      await Promise.all(
        selected.map((id) => api.post(`/notifications/${id}/read/`))
      );

      setNotifications((current) =>
        current.map((notification) =>
          selected.includes(notification.id)
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );

      setSelected([]);
    } catch (err) {
      console.error("Failed to mark selected notifications:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const markAll = async () => {
    try {
      setActionLoading(true);

      await api.post("/notifications/read-all/");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at ?? new Date().toISOString(),
        }))
      );

      setSelected([]);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelected = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (!notification.is_read) {
      await markRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <main className="service-page notifications-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">OneHub inbox</span>

          <h1>Stay in the loop.</h1>

          <p>
            Your order updates, recommendations and important account
            messages live here.
          </p>
        </div>

        <Bell size={44} />
      </section>

      <div className="notification-toolbar">
        <div>
          <strong>{unreadCount} unread</strong>
          <span> • {notifications.length} total notifications</span>
        </div>

        <div className="notification-actions">
          <button
            onClick={() => void markAll()}
            disabled={!unreadCount || actionLoading}
          >
            {actionLoading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <CheckCheck size={16} />
            )}

            Mark all read
          </button>

          <button
            onClick={() => void markSelected()}
            disabled={!selected.length || actionLoading}
          >
            <Check size={16} />
            Mark selected
          </button>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <Loader2 size={28} className="spin" />
          <h3>Loading notifications</h3>
          <p>Please wait...</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <Bell size={24} />
          <h3>Unable to load notifications</h3>
          <p>{error}</p>

          <button onClick={() => void loadNotifications()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              className={
                notification.is_read
                  ? "notification-row notification-row--read"
                  : "notification-row"
              }
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => void handleNotificationClick(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  void handleNotificationClick(notification);
                }
              }}
            >
              <span
                className="notification-check"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSelected(notification.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSelected(notification.id);
                  }
                }}
              >
                {selected.includes(notification.id) ? (
                  <Check size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </span>

              <span className="notification-icon">
                <Bell size={17} />
              </span>

              <span className="notification-copy">
                <strong>{notification.title}</strong>

                <small>{notification.message}</small>

                <em>{formatTime(notification.created_at)}</em>
              </span>

              {!notification.is_read && <span className="unread-dot" />}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <Bell size={24} />

          <h3>All clear</h3>

          <p>You have no notifications right now.</p>
        </div>
      )}
    </main>
  );
}