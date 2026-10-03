import {
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "./AdminPages.css";

export default function AdminProfilePage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "OneHub Admin";

  const role = user?.roles?.join(", ") || "Administrator";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="admin-page">
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMIN ACCOUNT</span>

          <h1>Profile & security</h1>

          <p>
            Manage your administrator identity, account information and
            security access.
          </p>
        </div>

        <div className="admin-page-header-icon">
          <User size={28} />
        </div>
      </section>

      <section className="admin-profile-layout">
        {/* PROFILE HERO */}
        <article className="admin-profile-hero">
          <div className="admin-avatar">
            {fullName
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div className="admin-profile-identity">
            <span className="admin-eyebrow">SIGNED IN AS</span>

            <h2>{fullName}</h2>

            <p>{user?.email || "admin@onehub.local"}</p>

            <div className="admin-profile-badges">
              <span className="admin-status admin-status--successful">
                <CheckCircle2 size={13} />
                Active
              </span>

              <span className="admin-role-badge">
                <Shield size={13} />
                {role}
              </span>
            </div>
          </div>
        </article>

        <section className="admin-profile-grid">
          {/* IDENTITY */}
          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  ACCOUNT INFORMATION
                </span>

                <h2>Identity</h2>
              </div>
            </div>

            <div className="admin-info-list">
              <div>
                <div className="admin-info-icon">
                  <User size={17} />
                </div>

                <span>
                  <small>Full name</small>
                  <strong>{fullName}</strong>
                </span>
              </div>

              <div>
                <div className="admin-info-icon">
                  <Mail size={17} />
                </div>

                <span>
                  <small>Email address</small>
                  <strong>
                    {user?.email || "admin@onehub.local"}
                  </strong>
                </span>
              </div>

              <div>
                <div className="admin-info-icon">
                  <User size={17} />
                </div>

                <span>
                  <small>Phone number</small>
                  <strong>
                    {user?.phone || "No phone number configured"}
                  </strong>
                </span>
              </div>
            </div>
          </article>

          {/* PERMISSIONS */}
          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">ACCESS</span>

                <h2>Administrator permissions</h2>
              </div>
            </div>

            <div className="admin-access-list">
              {[
                "Manage customer accounts",
                "Manage provider verification",
                "Monitor platform orders",
                "Review payment activity",
                "Access reports and analytics",
                "Manage platform settings",
              ].map((permission) => (
                <div key={permission}>
                  <CheckCircle2 size={17} />
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </article>

          {/* SECURITY */}
          <article className="admin-panel admin-security-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">SECURITY</span>

                <h2>Password & access</h2>
              </div>
            </div>

            <div className="admin-security-row">
              <div className="admin-security-icon">
                <KeyRound size={20} />
              </div>

              <div>
                <strong>Password</strong>

                <span>
                  Your administrator account is protected by
                  password authentication.
                </span>
              </div>

              <button
                type="button"
                className="admin-outline-button"
                disabled
              >
                Change password
              </button>
            </div>
          </article>

          {/* LOGOUT */}
          <article className="admin-panel admin-logout-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">SESSION</span>

                <h2>Sign out</h2>
              </div>
            </div>

            <div className="admin-logout-row">
              <div>
                <strong>Logout from OneHub</strong>

                <span>
                  End your current administrator session on this
                  device.
                </span>
              </div>

              <button
                type="button"
                className="admin-danger-button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}