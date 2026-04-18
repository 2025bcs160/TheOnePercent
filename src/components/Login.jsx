import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccounts, saveAccounts } from "../services/api";

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    const accounts = await fetchAccounts();
    const existingAccount = accounts.find((account) => account.email === trimmedEmail);

    if (mode === "register") {
      if (!name.trim()) {
        setError("Enter your full name.");
        return;
      }

      if (!confirmPassword) {
        setError("Confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (existingAccount) {
        setError("An account with that email already exists.");
        return;
      }

      const newAccount = {
        name: name.trim(),
        email: trimmedEmail,
        password,
      };

      await saveAccounts([...accounts, newAccount]);
      onLogin({ name: newAccount.name, email: newAccount.email });
      resetFields();
      navigate("/analytics");
      return;
    }

    if (!existingAccount || existingAccount.password !== password) {
      setError("Email or password is incorrect.");
      return;
    }

    onLogin({ name: existingAccount.name, email: existingAccount.email });
    resetFields();
    navigate("/analytics");
  };

  return (
    <main className="login-page">
      <div className="login-card card">
        <div className="login-brand">1%</div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="login-copy">
          {mode === "login"
            ? "Sign in to TheOnePercent and unlock premium trading analytics."
            : "Create your account to access elite performance insights and trade tracking."}
        </p>

        {mode === "register" && (
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" />
          </label>
        )}

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>

        {mode === "register" && (
          <label>
            Confirm password
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
          </label>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          className="primary-button"
          type="button"
          onClick={handleSubmit}
          disabled={!email || !password || (mode === "register" && (!name.trim() || !confirmPassword))}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
