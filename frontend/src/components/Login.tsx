import { useState } from "react";
import { Warehouse } from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Login.module.css";
import { API_URL } from "../config";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const login = useAppStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

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
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.header}>
          <Warehouse size={40} className={styles.logoIcon} />
          <h2 className={styles.title}>WarehousePro</h2>
          <p className={styles.subtitle}>Logistics center</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

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
        <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
          Login
        </button>
      </form>
    </div>
  );
}
