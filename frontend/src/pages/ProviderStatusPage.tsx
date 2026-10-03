import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import "./ProviderStatusPage.css";

export default function ProviderStatusPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const provider = user?.provider_profile;
  const status = provider?.verification_status;

  return (
    <main className="provider-status-page">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="provider-bg-glow provider-bg-glow-one" />
      <div className="provider-bg-glow provider-bg-glow-two" />
      <div className="provider-bg-glow provider-bg-glow-three" />

      <div className="provider-bg-grid" />
      <div className="provider-bg-dots" />

      <div className="provider-orbit provider-orbit-one" />
      <div className="provider-orbit provider-orbit-two" />

      <div className="provider-particle provider-particle-one" />
      <div className="provider-particle provider-particle-two" />
      <div className="provider-particle provider-particle-three" />
      <div className="provider-particle provider-particle-four" />
      <div className="provider-particle provider-particle-five" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="provider-status-content">

        {/* ===================================================
            REJECTED APPLICATION
        ==================================================== */}

        {status === "rejected" && (
          <section className="provider-status-card">

            <div className="card-glow card-glow-one" />
            <div className="card-glow card-glow-two" />

            <header className="provider-status-header">

              <div className="onehub-brand">
                <div className="onehub-brand-icon">
                  <Sparkles size={19} strokeWidth={2} />
                </div>

                <span className="onehub-brand-name">
                  OneHub
                </span>
              </div>

              <div className="provider-status-icon-wrapper">
                <div className="provider-status-icon-glow" />

                <div className="provider-status-icon">
                  <AlertCircle
                    size={42}
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              <p className="provider-eyebrow">
                Provider Verification
              </p>

              <h1 className="provider-status-title">
                Provider Application
              </h1>

              <div className="provider-status-badge">
                <span className="provider-status-dot" />
                Application Rejected
              </div>

            </header>

            <div className="provider-status-body">

              <p className="provider-intro">
                Your provider application was rejected by the
                OneHub administration team. Review the information
                below for further details.
              </p>

              <div className="application-status-box">

                <div className="application-status-icon">
                  <ShieldCheck
                    size={21}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="application-status-info">

                  <p className="application-status-label">
                    Application Status
                  </p>

                  <p className="application-status-value">
                    Rejected
                  </p>

                </div>

                <div className="application-closed-badge">
                  <span />
                  Closed
                </div>

              </div>

              <div className="rejection-reason-box">

                <div className="rejection-reason-header">
                  <span className="rejection-reason-dot" />

                  <span>
                    Rejection Reason
                  </span>
                </div>

                <p className="rejection-reason-text">
                  {provider?.rejection_reason ||
                    "No rejection reason was provided."}
                </p>

              </div>

              <div className="provider-support">

                <p className="provider-support-question">
                  Need clarification about your application?
                </p>

                <p className="provider-support-message">
                  Contact the OneHub administration team.
                </p>

              </div>

              <div className="provider-support-grid">

                <a
                  href="tel:+919000011122"
                  className="provider-support-card"
                >
                  <div className="provider-support-icon provider-phone-icon">
                    <Phone
                      size={20}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="provider-support-details">
                    <p className="provider-support-label">
                      Support Phone
                    </p>

                    <p className="provider-support-value">
                      +91 90000 11122
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:youronehubb@onehub.com"
                  className="provider-support-card provider-email-card"
                >
                  <div className="provider-support-icon provider-email-icon">
                    <Mail
                      size={20}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="provider-support-details">
                    <p className="provider-support-label">
                      Support Email
                    </p>

                    <p className="provider-support-value">
                      youronehubb@onehub.com
                    </p>
                  </div>
                </a>

              </div>

              {/* Back to Login */}

              <button
                type="button"
                className="provider-back-login-button"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft
                  size={18}
                  strokeWidth={2}
                />

                <span>
                  Back to Login
                </span>
              </button>

            </div>

            <footer className="provider-status-footer">

              <CheckCircle2
                size={15}
                strokeWidth={2}
              />

              <div>

                <p className="provider-footer-title">
                  OneHub Provider Services
                </p>

                <p className="provider-footer-subtitle">
                  Provider verification & support
                </p>

              </div>

            </footer>

          </section>
        )}

        {/* ===================================================
            PENDING APPLICATION
        ==================================================== */}

        {status === "pending" && (
          <section className="provider-status-card pending-card">

            <div className="card-glow card-glow-one" />

            <header className="provider-status-header pending-header">

              <div className="onehub-brand">

                <div className="onehub-brand-icon">
                  <Sparkles
                    size={19}
                    strokeWidth={2}
                  />
                </div>

                <span className="onehub-brand-name">
                  OneHub
                </span>

              </div>

              <div className="pending-status-icon">
                <AlertCircle
                  size={42}
                  strokeWidth={1.8}
                />
              </div>

              <p className="provider-eyebrow">
                Provider Verification
              </p>

              <h1 className="provider-status-title">
                Application Under Review
              </h1>

              <div className="pending-status-badge">

                <span className="pending-status-dot" />

                Pending Verification

              </div>

            </header>

            <div className="pending-body">

              <p>
                Your provider application is currently being
                reviewed by the OneHub administration team.
              </p>

              <p className="pending-subtext">
                You will be able to access provider services
                after your application has been approved.
              </p>

              {/* Back to Login */}

              <button
                type="button"
                className="provider-back-login-button"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft
                  size={18}
                  strokeWidth={2}
                />

                <span>
                  Back to Login
                </span>
              </button>

            </div>

            <footer className="provider-status-footer">

              <CheckCircle2
                size={15}
                strokeWidth={2}
              />

              <div>

                <p className="provider-footer-title">
                  OneHub Provider Services
                </p>

                <p className="provider-footer-subtitle">
                  Provider verification & support
                </p>

              </div>

            </footer>

          </section>
        )}

        {/* ===================================================
            FALLBACK
        ==================================================== */}

        {!status && (
          <section className="provider-status-card">

            <div className="provider-empty-state">

              <div className="provider-empty-icon">
                <ShieldCheck size={38} />
              </div>

              <h1>
                Provider Application
              </h1>

              <p>
                Your provider application status is currently
                unavailable.
              </p>

            </div>

          </section>
        )}

      </div>

    </main>
  );
