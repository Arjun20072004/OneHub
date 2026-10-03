import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import {
  getAdminUsers,
  setUserActive,
} from "../services/admin";
import type { AdminUser } from "../services/admin";
import "./AdminPages.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    void getAdminUsers()
      .then(setUsers)
      .catch(() => setError("Users could not be loaded."));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && user.is_active) ||
        (filter === "inactive" && !user.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [users, query, filter]);

  const active = users.filter((user) => user.is_active).length;
  const inactive = users.filter((user) => !user.is_active).length;

  const toggle = async (user: AdminUser) => {
    try {
      const updated = await setUserActive(
        user.id,
        !user.is_active,
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? updated : item,
        ),
      );
    } catch {
      setError("Account status could not be changed.");
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMIN / USERS</span>
          <h1>User accounts</h1>
          <p>
            Manage customer and provider access while preserving account
            history.
          </p>
        </div>

        <div className="admin-page-header-icon">
          <UserRound size={28} />
        </div>
      </section>

      <section className="admin-kpi-grid admin-kpi-grid--three">
        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <UserRound size={19} />
          </div>
          <span className="admin-kpi-label">Total accounts</span>
          <strong>{users.length}</strong>
          <small>Registered OneHub users</small>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <UserCheck size={19} />
          </div>
          <span className="admin-kpi-label">Active accounts</span>
          <strong>{active}</strong>
          <small>Currently able to sign in</small>
        </article>

        <article className="admin-kpi-card">
          <div className="admin-kpi-icon">
            <UserX size={19} />
          </div>
          <span className="admin-kpi-label">Inactive accounts</span>
          <strong>{inactive}</strong>
          <small>Access currently paused</small>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email..."
            />
          </label>

          <div className="admin-filter-group">
            {["all", "active", "inactive"].map((item) => (
              <button
                key={item}
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

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-user-list">
          {filtered.length === 0 ? (
            <div className="admin-empty-state">
              <UserRound size={28} />
              <strong>No accounts found</strong>
              <span>Try another search or filter.</span>
            </div>
          ) : (
            filtered.map((user) => {
              const fullName =
                `${user.first_name} ${user.last_name}`.trim();

              return (
                <article className="admin-user-row" key={user.id}>
                  <div className="admin-user-avatar">
                    {(
                      fullName ||
                      user.email ||
                      "U"
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="admin-user-main">
                    <strong>{fullName || "Unnamed user"}</strong>
                    <span>{user.email}</span>
                    <small>
                      {user.roles?.join(", ") || "Customer"}
                    </small>
                  </div>

                  <span
                    className={
                      user.is_active
                        ? "admin-status admin-status--successful"
                        : "admin-status admin-status--inactive"
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>

                  <button
                    className="admin-outline-button"
                    onClick={() => void toggle(user)}
                  >
                    {user.is_active ? (
                      <>
                        <UserX size={15} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck size={15} />
                        Activate
                      </>
                    )}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}