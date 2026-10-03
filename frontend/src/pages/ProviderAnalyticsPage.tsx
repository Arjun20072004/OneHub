import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
} from "lucide-react";

import { getProviderOrders } from "../services/orders";
import type { Order } from "../types/order";

export default function ProviderAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getProviderOrders()
      .then((data) => {
        if (active) {
          setOrders(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "Unable to load provider analytics.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const completedOrders = orders.filter(
      (order) =>
        order.status === "completed" ||
        order.status === "delivered",
    ).length;

    const pendingOrders = orders.filter(
      (order) =>
        order.status === "pending",
    ).length;

    const revenue = orders
      .filter(
        (order) =>
          order.status !== "cancelled" &&
          order.status !== "rejected",
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total_amount || 0),
        0,
      );

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      revenue,
    };
  }, [orders]);

  if (loading) {
    return (
      <main className="service-page">
        <section className="service-hero service-hero--travel">
          <div>
            <span className="eyebrow">
              Provider workspace
            </span>
            <h1>Analytics</h1>
            <p>Loading your business data...</p>
          </div>
          <BarChart3 size={46} />
        </section>
      </main>
    );
  }

  return (
    <main className="service-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">
            Provider workspace
          </span>

          <h1>Analytics</h1>

          <p>
            Review your order activity and business
            performance.
          </p>
        </div>

        <BarChart3 size={46} />
      </section>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <div className="travel-panel">
          <Package size={22} />
          <span className="eyebrow">
            Total orders
          </span>
          <h2>{stats.totalOrders}</h2>
        </div>

        <div className="travel-panel">
          <CheckCircle2 size={22} />
          <span className="eyebrow">
            Completed
          </span>
          <h2>{stats.completedOrders}</h2>
        </div>

        <div className="travel-panel">
          <Clock3 size={22} />
          <span className="eyebrow">
            Pending
          </span>
          <h2>{stats.pendingOrders}</h2>
        </div>

        <div className="travel-panel">
          <IndianRupee size={22} />
          <span className="eyebrow">
            Order value
          </span>
          <h2>
            ₹{stats.revenue.toFixed(2)}
          </h2>
        </div>
      </div>
    </main>
  );
}