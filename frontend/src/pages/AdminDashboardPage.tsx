import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminPages.css";

const stats = [
  {
    label: "Total customers",
    value: "12,540",
    change: "+8.4%",
    positive: true,
    icon: Users,
  },
  {
    label: "Active providers",
    value: "328",
    change: "+5 this week",
    positive: true,
    icon: ShieldCheck,
  },
  {
    label: "Orders today",
    value: "1,248",
    change: "+14.2%",
    positive: true,
    icon: ShoppingBag,
  },
  {
    label: "Revenue today",
    value: "₹4,82,400",
    change: "+11.6%",
    positive: true,
    icon: CircleDollarSign,
  },
] as const;

const activities = [
  {
    title: "New provider registration",
    description: "A provider submitted a verification request.",
    time: "2 min ago",
    icon: ShieldCheck,
  },
  {
    title: "Restaurant verification requested",
    description: "A restaurant partner is waiting for review.",
    time: "18 min ago",
    icon: Store,
  },
  {
    title: "Order completed",
    description: "Order OH-10284 was successfully completed.",
    time: "32 min ago",
    icon: PackageCheck,
  },
  {
    title: "Customer account created",
    description: "A new customer joined OneHub.",
    time: "1 hr ago",
    icon: Users,
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <main className="admin-page">
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">ONEHUB OPERATIONS</span>
          <h1>Good morning, Admin.</h1>
          <p>
            Monitor your platform, review activity and keep OneHub services
            running smoothly.
          </p>
        </div>

        <div className="admin-welcome-status">
          <span className="admin-live-dot" />
          All systems operational
        </div>
      </section>

      <section className="admin-kpi-grid">
        {stats.map(({ label, value, change, positive, icon: Icon }) => (
          <article className="admin-kpi-card" key={label}>
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon">
                <Icon size={19} />
              </div>

              <span
                className={
                  positive
                    ? "admin-change admin-change--positive"
                    : "admin-change"
                }
              >
                {positive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {change}
              </span>
            </div>

            <span className="admin-kpi-label">{label}</span>
            <strong>{value}</strong>
            <small>Compared with previous period</small>
          </article>
        ))}
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel admin-panel--large">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">PLATFORM ACTIVITY</span>
              <h2>Today's overview</h2>
            </div>

            <button
              className="admin-text-button"
              onClick={() => navigate("/admin/reports")}
            >
              View reports
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="admin-activity-bars">
            <div className="admin-bar-row">
              <div>
                <span>Orders</span>
                <strong>1,248</strong>
              </div>
              <div className="admin-progress">
                <span style={{ width: "86%" }} />
              </div>
            </div>

            <div className="admin-bar-row">
              <div>
                <span>Customers</span>
                <strong>842</strong>
              </div>
              <div className="admin-progress">
                <span style={{ width: "68%" }} />
              </div>
            </div>

            <div className="admin-bar-row">
              <div>
                <span>Providers</span>
                <strong>328</strong>
              </div>
              <div className="admin-progress">
                <span style={{ width: "48%" }} />
              </div>
            </div>

            <div className="admin-bar-row">
              <div>
                <span>Payments</span>
                <strong>₹4.82L</strong>
              </div>
              <div className="admin-progress">
                <span style={{ width: "74%" }} />
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">QUICK ACTIONS</span>
              <h2>Manage OneHub</h2>
            </div>
          </div>

          <div className="admin-quick-actions">
            <button onClick={() => navigate("/admin/providers")}>
              <ShieldCheck size={18} />
              <span>
                <strong>Review providers</strong>
                <small>17 pending approvals</small>
              </span>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate("/admin/users")}>
              <Users size={18} />
              <span>
                <strong>Manage users</strong>
                <small>Customer and provider accounts</small>
              </span>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate("/admin/orders")}>
              <ShoppingBag size={18} />
              <span>
                <strong>View orders</strong>
                <small>Monitor today's fulfilment</small>
              </span>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate("/admin/reports")}>
              <Activity size={18} />
              <span>
                <strong>Open analytics</strong>
                <small>Platform performance</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </section>

      <section className="admin-content-grid admin-content-grid--bottom">
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">REVIEW QUEUE</span>
              <h2>Needs attention</h2>
            </div>
          </div>

          <div className="admin-review-list">
            <button onClick={() => navigate("/admin/providers")}>
              <div className="admin-review-icon admin-review-icon--warning">
                <Clock3 size={17} />
              </div>
              <div>
                <strong>Provider approvals</strong>
                <span>17 providers awaiting review</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate("/admin/restaurants")}>
              <div className="admin-review-icon">
                <Store size={17} />
              </div>
              <div>
                <strong>Restaurant reviews</strong>
                <span>3 restaurants need attention</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate("/admin/payments")}>
              <div className="admin-review-icon">
                <CircleDollarSign size={17} />
              </div>
              <div>
                <strong>Payment exceptions</strong>
                <span>12 transactions require review</span>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">RECENT ACTIVITY</span>
              <h2>Latest events</h2>
            </div>
          </div>

          <div className="admin-timeline">
            {activities.map(({ title, description, time, icon: Icon }) => (
              <div className="admin-timeline-item" key={title}>
                <div className="admin-timeline-icon">
                  <Icon size={15} />
                </div>

                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                  <small>{time}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}