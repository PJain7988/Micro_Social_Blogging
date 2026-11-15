import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo, Field, MailIcon, LockIcon, GoogleIcon, GitHubIcon } from "./AuthParts";
import { ApiError, login, saveToken } from "./authApi";
import "./auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean((location.state as { registered?: boolean } | null)?.registered);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const token = await login(email.trim(), password);
      saveToken(token, remember);
      navigate("/profile");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <Logo />
        <h1>Welcome back!</h1>
        <p className="auth-sub">Sign in to continue to your account</p>

        {justRegistered && !serverError && (
          <div className="auth-success">Account created. Please sign in.</div>
        )}
        {serverError && <div className="auth-server-error">{serverError}</div>}

        <Field id="email" icon={<MailIcon />} placeholder="Email address" type="email"
          autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field id="password" icon={<LockIcon />} placeholder="Password" isPassword
          autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />

        <div className="auth-row">
          <label className="auth-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>

        <button className="auth-btn" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>

        <div className="auth-divider">or continue with</div>
        <div className="auth-social">
          <button type="button"><GoogleIcon /> Google</button>
          <button type="button"><GitHubIcon /> GitHub</button>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </form>
    </div>
  );
}