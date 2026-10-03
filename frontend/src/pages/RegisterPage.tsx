import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Building2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  registerUser,
  resendRegistrationOTP,
  verifyRegistrationOTP,
} from "../services/auth";

import "./LoginPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [type, setType] = useState<"customer" | "provider">("customer");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
    business_name: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (form.password !== form.password_confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        ...form,
        account_type: type,
      });

      setOtpSent(true);

      setMessage(
        "Verification code sent to your email. Enter the OTP to complete registration.",
      );
    } catch (error: any) {
      const responseMessage =
        error?.response?.data?.detail;

      setMessage(
        responseMessage ||
          "We could not start registration. Check your details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      await verifyRegistrationOTP(
        form.email,
        otp,
      );

      setMessage(
        "Your account has been created successfully. Redirecting to sign in...",
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error: any) {
      const responseData =
        error?.response?.data;

      const responseMessage =
        responseData?.detail ||
        responseData?.otp?.[0] ||
        "Invalid or expired verification code.";

      setMessage(responseMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOtp() {
    setMessage("");
    setIsLoading(true);

    try {
      await resendRegistrationOTP(form.email);

      setMessage(
        "A new verification code has been sent to your email.",
      );
    } catch (error: any) {
      const responseMessage =
        error?.response?.data?.detail;

      setMessage(
        responseMessage ||
          "We could not resend the verification code.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft size={16} />
          Back to sign in
        </button>

        <div className="login-brand">
          One<span>Hub</span>
        </div>

        <div className="showcase-copy">
          <p className="login-kicker">
            Join OneHub
          </p>

          <h1>
            One account for everyday life.
          </h1>

          <p>
            Discover trusted services, order what
            you need, and get help close to home.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel__heading">
          <p className="login-kicker">
            {otpSent
              ? "Verify your email"
              : "Create your account"}
          </p>

          <h2>
            {otpSent
              ? "Enter verification code"
              : "Start with OneHub"}
          </h2>

          <p>
            {otpSent
              ? `We sent a 6-digit code to ${form.email}.`
              : "Choose how you will use the platform."}
          </p>
        </div>

        {!otpSent ? (
          <>
            <div className="account-choice">
              <button
                type="button"
                className={
                  type === "customer"
                    ? "account-choice__item account-choice__item--active"
                    : "account-choice__item"
                }
                onClick={() =>
                  setType("customer")
                }
              >
                <UserRound size={19} />

                <span>
                  <strong>
                    Customer
                  </strong>

                  <small>
                    Discover and book services
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={
                  type === "provider"
                    ? "account-choice__item account-choice__item--active"
                    : "account-choice__item"
                }
                onClick={() =>
                  setType("provider")
                }
              >
                <Building2 size={19} />

                <span>
                  <strong>
                    Provider
                  </strong>

                  <small>
                    Offer services on OneHub
                  </small>
                </span>
              </button>
            </div>

            <form
              className="login-form"
              onSubmit={submit}
            >
              <div className="form-row">
                <label>
                  First name

                  <input
                    value={form.first_name}
                    onChange={(event) =>
                      update(
                        "first_name",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Last name

                  <input
                    value={form.last_name}
                    onChange={(event) =>
                      update(
                        "last_name",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Email address

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Phone number

                <input
                  value={form.phone}
                  onChange={(event) =>
                    update(
                      "phone",
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              {type === "provider" && (
                <label>
                  Business name

                  <input
                    value={form.business_name}
                    onChange={(event) =>
                      update(
                        "business_name",
                        event.target.value,
                      )
                    }
                    placeholder="Restaurant, clinic, workshop..."
                    required
                  />
                </label>
              )}

              <label>
                Password

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    update(
                      "password",
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              <label>
                Confirm password

                <input
                  type="password"
                  value={form.password_confirm}
                  onChange={(event) =>
                    update(
                      "password_confirm",
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              {message && (
                <p
                  className="login-error"
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creating..."
                  : `Create ${type} account`}

                {!isLoading && (
                  <span>→</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <form
            className="login-form"
            onSubmit={verifyOtp}
          >
            <label>
              Verification code

              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                placeholder="Enter 6-digit OTP"
                required
              />
            </label>

            {message && (
              <p
                className="login-error"
                role="status"
              >
                {message}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Verifying..."
                : "Verify email"}

              {!isLoading && (
                <span>→</span>
              )}
            </button>

            <button
              className="login-link-button"
              type="button"
              onClick={resendOtp}
              disabled={isLoading}
            >
              Resend verification code
            </button>
          </form>
        )}

        <button
          className="login-link-button"
          type="button"
          onClick={() => navigate("/login")}
        >
          Already have an account? Sign in
        </button>
      </section>
    </main>
  );
}