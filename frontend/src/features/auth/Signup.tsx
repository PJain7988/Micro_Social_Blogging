import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo, Field, MailIcon, LockIcon, UserIcon } from "./AuthParts";
import { ApiError, register, saveToken } from "./authApi";
import "./auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

type Form = {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const API_FIELDS: (keyof Form)[] = ["displayName", "username", "email", "password", "confirmPassword"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
    if (!USERNAME_RE.test(form.username))
      e.username = "3-20 characters: letters, numbers and underscores only";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) e.password = "Add at least one uppercase letter";
    else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = "Add at least one special character";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const token = await register({
        username: form.username,
        email: form.email.trim(),
        displayName: form.displayName.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      saveToken(token, false);
      navigate("/profile");
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped: Partial<Form> = {};
        for (const k of API_FIELDS) {
          if (err.fields[k]) mapped[k] = err.fields[k];
        }
        setErrors(mapped);
        // Errors such as "email already registered" arrive as a plain message.
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
        <Field id="confirmPassword" icon={<LockIcon />} placeholder="Confirm password" isPassword autoComplete="new-password"
          value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />

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