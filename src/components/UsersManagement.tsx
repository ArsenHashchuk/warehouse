import { useState, useEffect } from "react";
import { Users, ShieldUser, Trash2 } from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./UsersManagement.module.css";

interface UserData {
  id: number;
  email: string;
  role: string;
}

export default function UsersManagement() {
  const { user } = useAppStore();
  const token = user?.token;

  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "WORKER",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsersList(await res.json());
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const res = await fetch("http://localhost:3000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setUsersList(await res.json());
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    })();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (formData.password.length < 8) {
      setMsg({
        type: "error",
        text: "Password must be at least 8 characters long!",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create user");

      setMsg({ type: "success", text: "Staff member registered!" });
      setFormData({ email: "", password: "", role: "WORKER" });
      fetchUsers();
    } catch {
      setMsg({ type: "error", text: "Error creating user" });
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `http://localhost:3000/users/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (!res.ok) throw new Error("Cannot delete this user");

      setDeleteTarget(null);
      fetchUsers();
      setAlertModal({
        title: "User Deleted",
        message: "Staff member removed successfully.",
        type: "success",
      });
    } catch (err) {
      setDeleteTarget(null);
      setAlertModal({
        title: "Action Failed",
        message: err instanceof Error ? err.message : "Error deleting user",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.header}>Staff Management</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <ShieldUser size={20} /> Register New Staff
            </h3>
            {msg.text && (
              <div
                className={`${styles.message} ${styles[msg.type as "success" | "error"]}`}
              >
                {msg.text}
              </div>
            )}
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  className="input-field"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>System Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="WORKER">Warehouse Worker</option>
                  <option value="ADMIN">Technical Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </form>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Users size={20} /> Registered Users
            </h3>
            <div className={styles.listContainer}>
              {usersList.map((u) => (
                <div key={u.id} className={styles.listItem}>
                  <div className={styles.userInfo}>
                    <span className={styles.userEmail}>{u.email}</span>
                    <span className={styles.userRole}>Role: {u.role}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(u)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* confirmation modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">Confirm Deletion</h3>
            <p className="modal-body">
              Are you sure you want to remove user{" "}
              <strong>{deleteTarget.email}</strong>? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={executeDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* alert modal */}
      {alertModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3
              className="modal-header"
              style={{
                color:
                  alertModal.type === "error"
                    ? "#ef4444"
                    : "var(--text-primary)",
              }}
            >
              {alertModal.title}
            </h3>
            <p className="modal-body">{alertModal.message}</p>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setAlertModal(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
