import { useState } from "react";
import { Warehouse, KeyRound, ArrowLeft } from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Login.module.css";
import { API_URL } from "../config";

export default function Login() {
  const [view, setView] = useState<"login" | "reset">("login");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetMsg, setResetMsg] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const login = useAppStore((state) => state.login);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error logging in");

      login({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setResetMsg({ type: "error", text: "New passwords do not match!" });
      return;
    }
    if (newPassword.length < 6) {
      setResetMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          oldPassword: password,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setResetMsg({
        type: "success",
        text: "Password changed successfully! You can now log in.",
      });

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setView("login");
        setResetMsg({ type: "", text: "" });
      }, 2500);
    } catch (err) {
      setResetMsg({
        type: "error",
        text: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (newView: "login" | "reset") => {
    setView(newView);
    setError("");
    setResetMsg({ type: "", text: "" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {/* DYNAMIC HEADER */}
        <div className={styles.header}>
          {view === "login" ? (
            <>
              <Warehouse size={40} className={styles.logoIcon} />
              <h2 className={styles.title}>WarehousePro</h2>
              <p className={styles.subtitle}>Logistics center</p>
            </>
          ) : (
            <>
              <KeyRound size={40} className={styles.logoIcon} />
              <h2 className={styles.title}>Change Password</h2>
              <p className={styles.subtitle}>Update your account credentials</p>
            </>
          )}
        </div>

        {/* LOGIN VIEW */}
        {view === "login" && (
          <form
            onSubmit={handleLoginSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {error && <div className={styles.error}>{error}</div>}
            {resetMsg.text && resetMsg.type === "success" && (
              <div className={`${styles.messageBox} ${styles.messageSuccess}`}>
                {resetMsg.text}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

            {/* FORGOT PASSWORD LINK */}
            <div className={styles.linkContainer}>
              <button
                type="button"
                onClick={() => switchView("reset")}
                className={styles.textLink}
              >
                Change password?
              </button>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === "reset" && (
          <form
            onSubmit={handleResetSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {resetMsg.text && (
              <div
                className={`${styles.messageBox} ${resetMsg.type === "error" ? styles.messageError : styles.messageSuccess}`}
              >
                {resetMsg.text}
              </div>
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Old Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

            <hr className={styles.divider} />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() => switchView("login")}
              className={styles.backLink}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
