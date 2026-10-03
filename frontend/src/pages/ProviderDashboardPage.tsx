import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getProviderOrders } from "../services/orders";
import type { Order } from "../types/order";
import "./ProviderPages.css";

export default function ProviderDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getProviderOrders();
      setOrders(data);
    } catch {
      setError("Unable to load provider dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "pending",
    ).length;

    const processing = orders.filter(
      (order) =>
        order.status === "confirmed" ||
        order.status === "processing" ||
        order.status === "ready" ||
        order.status === "out_for_delivery",
    ).length;

    const completed = orders.filter(
      (order) => order.status === "delivered",
    ).length;

    const rejected = orders.filter(
      (order) => order.status === "rejected",
    ).length;

    const revenue = orders
      .filter((order) => order.status === "delivered")
      .reduce(
        (total, order) =>
          total + Number(order.total_amount || 0),
        0,
      );

    return {
      total: orders.length,
      pending,
      processing,
      completed,
      rejected,
      revenue,
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "pending":
        return "provider-status provider-status--pending";

      case "confirmed":
      case "processing":
      case "ready":
        return "provider-status provider-status--active";

      case "out_for_delivery":
        return "provider-status provider-status--delivery";

      case "delivered":
        return "provider-status provider-status--completed";

      case "rejected":
      case "cancelled":
        return "provider-status provider-status--rejected";

      default:
        return "provider-status";
    }
  }

  if (loading) {
    return (
      <main className="service-page provider-dashboard-page">
        <section className="service-hero service-hero--travel">
          <div>
            <span className="eyebrow">Provider workspace</span>
            <h1>Provider Dashboard</h1>
            <p>
              Monitor your orders and keep track of your
              business activity.
            </p>
          </div>

          <PackageCheck size={46} />
        </section>

        <div className="travel-panel provider-dashboard-loading">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="service-page provider-dashboard-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">Provider workspace</span>

          <h1>Provider Dashboard</h1>

          <p>
            Monitor your orders, track activity and manage
            customer requests.
          </p>
        </div>

        <PackageCheck size={46} />
      </section>

      {error && (
        <div className="provider-dashboard-error">
          <span>{error}</span>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadDashboard()}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      <section className="provider-dashboard-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h2>Your business activity</h2>
          <p>
            A quick overview of your current provider
            activity.
          </p>
        </div>

        <Link
          to="/provider/orders"
          className="primary-button provider-dashboard-orders-link"
        >
          Manage Orders
          <ArrowRight size={17} />
        </Link>
      </section>

      <section className="provider-stat-grid">
        <article className="provider-stat-card">
          <div className="provider-stat-icon">
            <ShoppingBag size={21} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article className="provider-stat-card">
          <div className="provider-stat-icon provider-stat-icon--pending">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </article>

        <article className="provider-stat-card">
          <div className="provider-stat-icon provider-stat-icon--active">
            <PackageCheck size={21} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.processing}</strong>
          </div>
        </article>

        <article className="provider-stat-card">
          <div className="provider-stat-icon provider-stat-icon--completed">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </article>

        <article className="provider-stat-card">
          <div className="provider-stat-icon provider-stat-icon--delivery">
            <Truck size={21} />
          </div>

          <div>
            <span>Delivery</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.status === "out_for_delivery",
                ).length
              }
            </strong>
          </div>
        </article>

        <article className="provider-stat-card">
          <div className="provider-stat-icon provider-stat-icon--rejected">
            <XCircle size={21} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{stats.rejected}</strong>
          </div>
        </article>
      </section>

      <section className="provider-dashboard-grid">
        <div className="travel-panel provider-revenue-card">
          <div className="provider-section-heading">
            <div>
              <span className="eyebrow">Completed orders</span>
              <h2>Revenue</h2>
            </div>

            <CheckCircle2 size={24} />
          </div>

          <strong className="provider-revenue-value">
            ₹{stats.revenue.toFixed(2)}
          </strong>

          <p>
            Total order value from delivered orders currently
            returned by the provider orders API.
          </p>
        </div>

        <div className="travel-panel provider-status-card">
          <div className="provider-section-heading">
            <div>
              <span className="eyebrow">Order activity</span>
              <h2>Current workload</h2>
            </div>

            <PackageCheck size={24} />
          </div>

          <div className="provider-workload">
            <div>
              <span>Pending requests</span>
              <strong>{stats.pending}</strong>
            </div>

            <div>
              <span>Orders in progress</span>
              <strong>{stats.processing}</strong>
            </div>

            <div>
              <span>Completed orders</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="travel-panel provider-recent-orders">
        <div className="provider-section-heading">
          <div>
            <span className="eyebrow">Latest activity</span>
            <h2>Recent Orders</h2>
            <p>
              Your latest provider orders.
            </p>
          </div>

          <Link
            to="/provider/orders"
            className="provider-view-all"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="provider-empty-state">
            <Clock3 size={22} />
            <span>No orders available yet.</span>
          </div>
        ) : (
          <div className="provider-recent-list">
            {recentOrders.map((order) => (
              <article
                className="provider-recent-order"
                key={order.id}
              >
                <div className="provider-recent-main">
                  <span className="eyebrow">
                    {order.order_number}
                  </span>

                  <strong>
                    ₹{order.total_amount}
                  </strong>

                  <span>
                    {order.order_type}
                  </span>
                </div>

                <div className="provider-recent-meta">
                  <span>
                    {order.delivery_address ||
                      "Service booking"}
                  </span>

                  <span>
                    {order.contact_phone}
                  </span>
                </div>

                <span className={getStatusClass(order.status)}>
                  {formatStatus(order.status)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}