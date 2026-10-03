import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";

import {
  getProviderOrders,
  updateProviderOrder,
} from "../services/orders";

import "./ProviderPages.css";
import type { Order } from "../types/order";

type OrderFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<OrderFilter>("all");

  async function loadOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getProviderOrders();
      setOrders(data);
    } catch {
      setError("Unable to load provider orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function act(
    orderId: number,
    action: "accept" | "reject" | "status",
    nextStatus?: string,
  ) {
    try {
      setError("");

      const updated = await updateProviderOrder(
        orderId,
        action,
        nextStatus,
      );

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? updated
            : order,
        ),
      );
    } catch {
      setError(
        "That order could not be updated.",
      );
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        order.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        order.order_number
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.order_type
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.status
          .toLowerCase()
          .includes(normalizedSearch) ||
        (order.delivery_address || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.contact_phone
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(
        (order) => order.status === "pending",
      ).length,
      confirmed: orders.filter(
        (order) => order.status === "confirmed",
      ).length,
      processing: orders.filter(
        (order) => order.status === "processing",
      ).length,
      ready: orders.filter(
        (order) => order.status === "ready",
      ).length,
      out_for_delivery: orders.filter(
        (order) =>
          order.status === "out_for_delivery",
      ).length,
      delivered: orders.filter(
        (order) => order.status === "delivered",
      ).length,
      rejected: orders.filter(
        (order) => order.status === "rejected",
      ).length,
      cancelled: orders.filter(
        (order) => order.status === "cancelled",
      ).length,
    };
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

  function renderActions(order: Order) {
    if (order.status === "pending") {
      return (
        <>
          <button
            className="primary-button"
            onClick={() =>
              void act(
                order.id,
                "accept",
              )
            }
          >
            <Check size={16} />
            Accept
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              void act(
                order.id,
                "reject",
              )
            }
          >
            <X size={16} />
            Reject
          </button>
        </>
      );
    }

    if (order.status === "confirmed") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            void act(
              order.id,
              "status",
              "processing",
            )
          }
        >
          <PackageCheck size={16} />
          Start preparing
        </button>
      );
    }

    if (order.status === "processing") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            void act(
              order.id,
              "status",
              "ready",
            )
          }
        >
          <PackageCheck size={16} />
          Mark ready
        </button>
      );
    }

    if (order.status === "ready") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            void act(
              order.id,
              "status",
              "out_for_delivery",
            )
          }
        >
          <Truck size={16} />
          Out for delivery
        </button>
      );
    }

    if (order.status === "out_for_delivery") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            void act(
              order.id,
              "status",
              "delivered",
            )
          }
        >
          <Check size={16} />
          Mark delivered
        </button>
      );
    }

    return (
      <span className="provider-order-complete">
        No action required
      </span>
    );
  }

  if (loading) {
    return (
      <main className="service-page provider-orders-page">
        <section className="service-hero service-hero--travel">
          <div>
            <span className="eyebrow">
              Provider workspace
            </span>

            <h1>Orders</h1>

            <p>
              Manage incoming orders and keep customers
              updated on their progress.
            </p>
          </div>

          <PackageCheck size={46} />
        </section>

        <div className="travel-panel provider-orders-loading">
          Loading orders...
        </div>
      </main>
    );
  }

  return (
    <main className="service-page provider-orders-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">
            Provider workspace
          </span>

          <h1>Orders</h1>

          <p>
            Manage incoming orders, update statuses and
            keep customers informed.
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
            onClick={() => void loadOrders(true)}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      <section className="provider-orders-toolbar">
        <div className="provider-order-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search order, type, status, address..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="secondary-button"
          disabled={refreshing}
          onClick={() => void loadOrders(true)}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "provider-spin"
                : undefined
            }
          />
          Refresh
        </button>
      </section>

      <section className="provider-order-filters">
        <button
          type="button"
          className={
            filter === "all"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("all")}
        >
          All
          <span>{counts.all}</span>
        </button>

        <button
          type="button"
          className={
            filter === "pending"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("pending")}
        >
          Pending
          <span>{counts.pending}</span>
        </button>

        <button
          type="button"
          className={
            filter === "confirmed"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
          <span>{counts.confirmed}</span>
        </button>

        <button
          type="button"
          className={
            filter === "processing"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("processing")}
        >
          Processing
          <span>{counts.processing}</span>
        </button>

        <button
          type="button"
          className={
            filter === "ready"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("ready")}
        >
          Ready
          <span>{counts.ready}</span>
        </button>

        <button
          type="button"
          className={
            filter === "out_for_delivery"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() =>
            setFilter("out_for_delivery")
          }
        >
          Delivery
          <span>
            {counts.out_for_delivery}
          </span>
        </button>

        <button
          type="button"
          className={
            filter === "delivered"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("delivered")}
        >
          Delivered
          <span>{counts.delivered}</span>
        </button>

        <button
          type="button"
          className={
            filter === "rejected"
              ? "provider-filter provider-filter--active"
              : "provider-filter"
          }
          onClick={() => setFilter("rejected")}
        >
          Rejected
          <span>{counts.rejected}</span>
        </button>
      </section>

      <section className="provider-orders-result-heading">
        <div>
          <span className="eyebrow">
            Order management
          </span>

          <h2>
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1
              ? "order"
              : "orders"}
          </h2>
        </div>
      </section>

      {filteredOrders.length === 0 ? (
        <div className="travel-panel provider-empty-state">
          <Clock3 size={22} />

          <div>
            <strong>No matching orders</strong>
            <p>
              Try changing the status filter or search
              term.
            </p>
          </div>
        </div>
      ) : (
        <div className="provider-orders">
          {filteredOrders.map((order) => (
            <article
              className="travel-panel provider-order"
              key={order.id}
            >
              <div className="provider-order-main">
                <div>
                  <span className="eyebrow">
                    {order.order_number} •{" "}
                    {order.order_type}
                  </span>

                  <h2>
                    ₹{order.total_amount}
                  </h2>
                </div>

                <span
                  className={getStatusClass(
                    order.status,
                  )}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="provider-order-details">
                <div>
                  <span>Delivery / Service</span>

                  <strong>
                    {order.delivery_address ||
                      "Service booking"}
                  </strong>
                </div>

                <div>
                  <span>Contact</span>

                  <strong>
                    {order.contact_phone}
                  </strong>
                </div>

                <div>
                  <span>Order type</span>

                  <strong>
                    {order.order_type}
                  </strong>
                </div>
              </div>

              <div className="provider-actions">
                {renderActions(order)}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}