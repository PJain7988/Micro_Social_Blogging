import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo, Field, MailIcon, LockIcon, UserIcon } from "./AuthParts";
import { ApiError, register } from "./authApi";
import "./auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

type Form = { displayName: string; username: string; email: string; password: string; confirm: string };
const API_FIELDS: (keyof Form)[] = ["displayName", "username", "email", "password"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ displayName: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<Form> = {};
    const name = form.displayName.trim();
    if (!name) e.displayName = "Enter your full name";
    else if (name.length > 50) e.displayName = "Name can be at most 50 characters";
    if (!USERNAME_RE.test(form.username)) e.username = "3-20 characters: letters, numbers and underscores only";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      e.password = "At least 8 characters, with a letter and a number";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        email: form.email.trim(),
        username: form.username,
        password: form.password,
        displayName: form.displayName.trim(),
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped: Partial<Form> = {};
        for (const k of API_FIELDS) {
          if (err.fields[k]) mapped[k] = err.fields[k];
        }
        setErrors(mapped);
        setServerError(Object.keys(mapped).length ? "" : err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <Logo />
        <h1>Create your account</h1>
        <p className="auth-sub">Join Microblog and share your thoughts</p>

        {serverError && <div className="auth-server-error">{serverError}</div>}

        <Field id="displayName" icon={<UserIcon />} placeholder="Full name" autoComplete="name"
          value={form.displayName} onChange={set("displayName")} error={errors.displayName} />
        <Field id="username" icon={<UserIcon />} placeholder="Username" autoComplete="username"
          value={form.username} onChange={set("username")} error={errors.username} />
        <Field id="email" icon={<MailIcon />} placeholder="Email address" type="email" autoComplete="email"
          value={form.email} onChange={set("email")} error={errors.email} />
        <Field id="password" icon={<LockIcon />} placeholder="Password" isPassword autoComplete="new-password"
          value={form.password} onChange={set("password")} error={errors.password} />
        <Field id="confirm" icon={<LockIcon />} placeholder="Confirm password" isPassword autoComplete="new-password"
          value={form.confirm} onChange={set("confirm")} error={errors.confirm} />

        <button className="auth-btn" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </form>
    </div>
  );
}