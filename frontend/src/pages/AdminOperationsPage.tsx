import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  Package,
  RefreshCcw,
  Save,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminPages.css";

const orders = [
  ["OH-10284", "Arjun Customer", "Food & Dining", "₹840", "Completed"],
  ["OH-10283", "Rahul Kumar", "Shopping", "₹2,450", "In progress"],
  ["OH-10282", "Priya Sharma", "Food & Dining", "₹620", "Completed"],
  ["OH-10281", "Vivek Reddy", "Mechanic", "₹1,200", "Completed"],
  ["OH-10280", "Ananya Rao", "Food & Dining", "₹1,040", "Cancelled"],
] as const;

const payments = [
  ["PAY-90821", "OH-10284", "₹840", "UPI", "Successful"],
  ["PAY-90820", "OH-10283", "₹2,450", "Card", "Successful"],
  ["PAY-90819", "OH-10282", "₹620", "UPI", "Successful"],
  ["PAY-90818", "OH-10281", "₹1,200", "Cash", "Pending"],
  ["PAY-90817", "OH-10280", "₹1,040", "Card", "Refunded"],
] as const;

const restaurants = [
  ["Bawarchi", "Hyderabad", "Active", "4.5", "38"],
  ["Paradise", "Secunderabad", "Active", "4.4", "42"],
  ["Mehfil", "Madhapur", "Review", "4.3", "31"],
  ["AB's Absolute Barbecues", "Gachibowli", "Active", "4.6", "46"],
] as const;

const sectionData = {
  payments: {
    title: "Payments",
    eyebrow: "ADMIN / PAYMENTS",
    description:
      "Monitor transactions, settlements, refunds and payment exceptions.",
    icon: CreditCard,
  },
  reports: {
    title: "Reports & analytics",
    eyebrow: "ADMIN / REPORTS",
    description:
      "Understand platform usage, revenue, service demand and operational trends.",
    icon: BarChart3,
  },
  settings: {
    title: "Platform settings",
    eyebrow: "ADMIN / SETTINGS",
    description:
      "Manage platform defaults and operational controls.",
    icon: Settings,
  },
  restaurants: {
    title: "Restaurants",
    eyebrow: "ADMIN / RESTAURANTS",
    description:
      "Monitor restaurant partners, ratings and published menus.",
    icon: Store,
  },
  orders: {
    title: "Orders",
    eyebrow: "ADMIN / ORDERS",
    description:
      "Monitor customer orders and fulfilment across OneHub.",
    icon: ShoppingBag,
  },
} as const;

type Section = keyof typeof sectionData;

export default function AdminOperationsPage() {
  const { section = "reports" } = useParams();
  const navigate = useNavigate();

  const activeSection = (
    Object.keys(sectionData).includes(section) ? section : "reports"
  ) as Section;

  const data = sectionData[activeSection];
  const Icon = data.icon;

  const [maintenance, setMaintenance] = useState(false);
  const [reviews, setReviews] = useState(true);
  const [cod, setCod] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="admin-page">
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>

        <div className="admin-page-header-icon">
          <Icon size={28} />
        </div>
      </section>

      {activeSection === "payments" && (
        <>
          <section className="admin-kpi-grid admin-kpi-grid--three">
            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <CircleDollarSign size={19} />
              </div>
              <span className="admin-kpi-label">Successful today</span>
              <strong>₹4,82,400</strong>
              <small>1,136 successful transactions</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <RefreshCcw size={19} />
              </div>
              <span className="admin-kpi-label">Pending settlement</span>
              <strong>₹18,650</strong>
              <small>Scheduled for settlement</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <CreditCard size={19} />
              </div>
              <span className="admin-kpi-label">Exceptions</span>
              <strong>12</strong>
              <small>Transactions requiring review</small>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">TRANSACTIONS</span>
                <h2>Recent payments</h2>
              </div>

              <button className="admin-outline-button">
                <Download size={15} />
                Export
              </button>
            </div>

            <div className="admin-table">
              {payments.map(
                ([id, order, amount, method, status]) => (
                  <div className="admin-table-row" key={id}>
                    <div>
                      <strong>{id}</strong>
                      <small>{order}</small>
                    </div>

                    <span>{method}</span>

                    <strong>{amount}</strong>

                    <span
                      className={`admin-status admin-status--${status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {status}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </>
      )}

      {activeSection === "orders" && (
        <>
          <section className="admin-kpi-grid admin-kpi-grid--three">
            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <ShoppingBag size={19} />
              </div>
              <span className="admin-kpi-label">Orders today</span>
              <strong>1,248</strong>
              <small>Across all OneHub services</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Activity size={19} />
              </div>
              <span className="admin-kpi-label">In progress</span>
              <strong>58%</strong>
              <small>Current fulfilment rate</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <CheckCircle2 size={19} />
              </div>
              <span className="admin-kpi-label">Completed</span>
              <strong>82%</strong>
              <small>Today's completion rate</small>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">ORDER MONITOR</span>
                <h2>Recent orders</h2>
              </div>
            </div>

            <div className="admin-table">
              {orders.map(
                ([id, customer, service, amount, status]) => (
                  <div className="admin-table-row" key={id}>
                    <div>
                      <strong>{id}</strong>
                      <small>{customer}</small>
                    </div>

                    <span>{service}</span>

                    <strong>{amount}</strong>

                    <span
                      className={`admin-status admin-status--${status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {status}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </>
      )}

      {activeSection === "restaurants" && (
        <>
          <section className="admin-kpi-grid admin-kpi-grid--three">
            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Store size={19} />
              </div>
              <span className="admin-kpi-label">Active restaurants</span>
              <strong>3</strong>
              <small>Currently publishing menus</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Users size={19} />
              </div>
              <span className="admin-kpi-label">Restaurant partners</span>
              <strong>4</strong>
              <small>Registered on OneHub</small>
            </article>

            <article className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Package size={19} />
              </div>
              <span className="admin-kpi-label">Menu items</span>
              <strong>157</strong>
              <small>Published food items</small>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">RESTAURANT PARTNERS</span>
                <h2>Restaurant directory</h2>
              </div>
            </div>

            <div className="admin-table">
              {restaurants.map(
                ([name, city, status, rating, menuItems]) => (
                  <div className="admin-table-row" key={name}>
                    <div>
                      <strong>{name}</strong>
                      <small>{city}</small>
                    </div>

                    <span>{rating} ★</span>

                    <span>{menuItems} menu items</span>

                    <span
                      className={`admin-status ${
                        status === "Active"
                          ? "admin-status--successful"
                          : "admin-status--pending"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </>
      )}

      {activeSection === "reports" && (
        <>
          <section className="admin-kpi-grid admin-kpi-grid--three">
            <article className="admin-kpi-card">
              <span className="admin-kpi-label">Daily active users</span>
              <strong>8,430</strong>
              <small>Users active today</small>
            </article>

            <article className="admin-kpi-card">
              <span className="admin-kpi-label">Conversion rate</span>
              <strong>14.8%</strong>
              <small>Customer action conversion</small>
            </article>

            <article className="admin-kpi-card">
              <span className="admin-kpi-label">Repeat customers</span>
              <strong>62%</strong>
              <small>Returning customers</small>
            </article>
          </section>

          <section className="admin-content-grid">
            <article className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">REVENUE</span>
                  <h2>Revenue overview</h2>
                </div>
              </div>

              <div className="admin-report-number">
                <strong>₹4,82,400</strong>
                <span>Today's platform revenue</span>
              </div>

              <div className="admin-mini-chart">
                {[48, 64, 52, 76, 61, 84, 72, 92, 80, 96].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">SERVICES</span>
                  <h2>Demand breakdown</h2>
                </div>
              </div>

              <div className="admin-demand-list">
                <div>
                  <span>Food & Dining</span>
                  <strong>46%</strong>
                </div>
                <div>
                  <span>Shopping</span>
                  <strong>22%</strong>
                </div>
                <div>
                  <span>Travel & Stay</span>
                  <strong>18%</strong>
                </div>
                <div>
                  <span>Health & Medicine</span>
                  <strong>9%</strong>
                </div>
                <div>
                  <span>Mechanic</span>
                  <strong>5%</strong>
                </div>
              </div>
            </article>
          </section>
        </>
      )}

      {activeSection === "settings" && (
        <section className="admin-settings-grid">
          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">PLATFORM</span>
                <h2>Operational controls</h2>
              </div>
            </div>

            <div className="admin-setting-row">
              <div>
                <strong>Maintenance mode</strong>
                <span>Temporarily restrict customer access.</span>
              </div>

              <button
                className={`admin-switch ${
                  maintenance ? "admin-switch--on" : ""
                }`}
                onClick={() => setMaintenance(!maintenance)}
                aria-label="Toggle maintenance mode"
              >
                <span />
              </button>
            </div>

            <div className="admin-setting-row">
              <div>
                <strong>Review moderation</strong>
                <span>Moderate customer reviews before publishing.</span>
              </div>

              <button
                className={`admin-switch ${
                  reviews ? "admin-switch--on" : ""
                }`}
                onClick={() => setReviews(!reviews)}
                aria-label="Toggle review moderation"
              >
                <span />
              </button>
            </div>

            <div className="admin-setting-row">
              <div>
                <strong>Cash on delivery</strong>
                <span>Allow COD where supported by providers.</span>
              </div>

              <button
                className={`admin-switch ${
                  cod ? "admin-switch--on" : ""
                }`}
                onClick={() => setCod(!cod)}
                aria-label="Toggle cash on delivery"
              >
                <span />
              </button>
            </div>

            <button
              className="admin-primary-button"
              onClick={saveSettings}
            >
              <Save size={16} />
              {saved ? "Settings saved" : "Save settings"}
            </button>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">DEFAULTS</span>
                <h2>Platform configuration</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                <span>Support number</span>
                <input defaultValue="+91 90000 11122" />
              </label>

              <label>
                <span>Delivery radius</span>
                <input defaultValue="50 km" />
              </label>

              <label>
                <span>Default currency</span>
                <input defaultValue="INR (₹)" disabled />
              </label>

              <label>
                <span>Platform timezone</span>
                <input defaultValue="Asia/Kolkata" disabled />
              </label>
            </div>
          </article>
        </section>
      )}

      <div className="admin-bottom-actions">
        <button
          className="admin-outline-button"
          onClick={() => navigate("/admin")}
        >
          Back to dashboard
        </button>
      </div>
    </main>
  );
}