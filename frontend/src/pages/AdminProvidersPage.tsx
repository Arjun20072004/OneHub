import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getAdminProviders,
  setProviderStatus,
} from "../services/admin";

import type { AdminProvider } from "../services/admin";

import "./AdminPages.css";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [changingProviderId, setChangingProviderId] =
    useState<number | null>(null);

  async function loadProviders() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminProviders();
      setProviders(data);
    } catch (requestError: any) {
      const detail =
        requestError?.response?.data?.detail;

      setError(
        detail ||
          "Providers could not be loaded. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProviders();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return providers.filter((provider) => {
      const searchableText = [
        provider.business_name,
        provider.email,
        provider.city,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        provider.verification_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [providers, query, filter]);

  const pending = providers.filter(
    (provider) =>
      provider.verification_status === "pending",
  ).length;

  const approved = providers.filter(
    (provider) =>
      provider.verification_status === "approved",
  ).length;

  const rejected = providers.filter(
    (provider) =>
      provider.verification_status === "rejected",
  ).length;

  const change = async (
    provider: AdminProvider,
    newStatus: AdminProvider["verification_status"],
    rejectionReason = "",
  ) => {
    if (changingProviderId !== null) {
      return;
    }

    if (
      provider.verification_status === newStatus &&
      newStatus !== "rejected"
    ) {
      return;
    }

    setError("");
    setChangingProviderId(provider.id);

    try {
      const updated = await setProviderStatus(
        provider.id,
        newStatus,
        rejectionReason,
      );

      setProviders((current) =>
        current.map((item) =>
          item.id === provider.id
            ? updated
            : item,
        ),
      );
    } catch (requestError: any) {
      const detail =
        requestError?.response?.data?.detail;

      const reasonError =
        requestError?.response?.data?.reason;

      setError(
        detail ||
          reasonError ||
          "Provider status could not be changed.",
      );
    } finally {
      setChangingProviderId(null);
    }
  };

  const handleReject = (provider: AdminProvider) => {
    const reason = window.prompt(
      `Enter the rejection reason for ${provider.business_name}:`,
    );

    // Cancel pressed
    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(
        "A rejection reason is required.",
      );
      return;
    }

    void change(
      provider,
      "rejected",
      trimmedReason,
    );
  };

  return (
    <main className="admin-page">
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            ADMIN / PROVIDERS
          </span>

          <h1>
            Provider verification
          </h1>

          <p>
            Review business partners and control
            who can operate services on OneHub.
          </p>
        </div>

        <div className="admin-page-header-icon">
          <ShieldCheck size={28} />
        </div>
      </section>

      <section className="admin-kpi-grid admin-kpi-grid--three">
        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <Clock3 size={19} />
          </div>

          <span className="admin-kpi-label">
            Pending review
          </span>

          <strong>{pending}</strong>

          <small>
            Requires administrator attention
          </small>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <Check size={19} />
          </div>

          <span className="admin-kpi-label">
            Approved
          </span>

          <strong>{approved}</strong>

          <small>
            Verified providers
          </small>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <X size={19} />
          </div>

          <span className="admin-kpi-label">
            Rejected
          </span>

          <strong>{rejected}</strong>

          <small>
            Providers not approved
          </small>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search providers, email or city..."
            />
          </label>

          <div className="admin-filter-group">
            {[
              "all",
              "pending",
              "approved",
              "rejected",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "admin-filter admin-filter--active"
                    : "admin-filter"
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="admin-error">
            {error}
          </p>
        )}

        <div className="admin-provider-list">
          {loading ? (
            <div className="admin-empty-state">
              <ShieldCheck size={28} />

              <strong>
                Loading providers...
              </strong>

              <span>
                Please wait while provider data is loaded.
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty-state">
              <ShieldCheck size={28} />

              <strong>
                No providers found
              </strong>

              <span>
                Try changing your search or verification filter.
              </span>
            </div>
          ) : (
            filtered.map((provider) => {
              const changing =
                changingProviderId === provider.id;

              return (
                <article
                  className="admin-provider-row"
                  key={provider.id}
                >
                  <div className="admin-provider-avatar">
                    {provider.business_name
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="admin-provider-main">
                    <strong>
                      {provider.business_name}
                    </strong>

                    <span>
                      {provider.email} · {provider.city}
                    </span>

                    <small>
                      {provider.experience} years experience
                    </small>

                    {provider.rejection_reason && (
                      <small>
                        Reason:{" "}
                        {provider.rejection_reason}
                      </small>
                    )}
                  </div>

                  <span
                    className={`admin-status admin-status--${provider.verification_status}`}
                  >
                    {provider.verification_status}
                  </span>

                  <div className="admin-provider-actions">
                    <button
                      type="button"
                      disabled={changing}
                      className="admin-small-button admin-small-button--approve"
                      onClick={() =>
                        void change(
                          provider,
                          "approved",
                        )
                      }
                    >
                      <Check size={14} />

                      {changing &&
                      provider.verification_status !==
                        "approved"
                        ? "Updating..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={changing}
                      className="admin-small-button admin-small-button--reject"
                      onClick={() =>
                        handleReject(provider)
                      }
                    >
                      <X size={14} />

                      {changing &&
                      provider.verification_status !==
                        "rejected"
                        ? "Updating..."
                        : "Reject"}
                    </button>

                    <button
                      type="button"
                      disabled={changing}
                      className="admin-small-button"
                      onClick={() =>
                        void change(
                          provider,
                          "pending",
                        )
                      }
                    >
                      Set pending
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}