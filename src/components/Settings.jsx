import { useState } from "react";
import { connectMT5Account, syncMT5Trades } from "../services/api";

export default function Settings({ user, accountMode }) {
  const [broker, setBroker] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await connectMT5Account({ broker, login, password, server, accountMode });
      setStatus(response.message);
      setPassword("");
    } catch (error) {
      setStatus(error.message || "Unable to connect MT5 account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await syncMT5Trades(accountMode);
      setStatus(response.message);
    } catch (error) {
      setStatus(error.message || "Unable to sync trades.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section">
      <section className="card settings-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h2>Account &amp; Preferences</h2>
          </div>
        </div>

        <div className="settings-grid">
          <div className="setting-card">
            <h3>Profile</h3>
            <p>Name: {user?.name}</p>
            <p>Email: {user?.email}</p>
          </div>
          <div className="setting-card">
            <h3>Platform</h3>
            <p>Dark mode is the default experience.</p>
            <p>Backend-ready API structure ready for future integration.</p>
          </div>
        </div>

        <div className="section-header" style={{ marginTop: "24px" }}>
          <div>
            <p className="eyebrow">MT5 Integration</p>
            <h2>Connect Account</h2>
          </div>
        </div>

        <div className="integration-grid">
          <div className="integration-card">
            <label>
              Broker
              <input value={broker} onChange={(e) => setBroker(e.target.value)} placeholder="Example: IC Markets" />
            </label>
            <label>
              Login
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="MT5 login" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="MT5 password" />
            </label>
            <label>
              Server
              <input value={server} onChange={(e) => setServer(e.target.value)} placeholder="Server name" />
            </label>

            <div className="settings-actions">
              <button className="primary-button" onClick={handleConnect} disabled={loading} type="button">
                {loading ? "Connecting..." : "Connect Account"}
              </button>
              <button className="secondary-button" onClick={handleSync} disabled={loading} type="button">
                {loading ? "Syncing..." : "Sync Trades"}
              </button>
            </div>

            {status && <p className="status-message">{status}</p>}
            <p className="credential-note">
              Credentials are handled only during this request and are not stored in local storage or browser state persistently.
            </p>
          </div>

          <div className="integration-card">
            <h3>Future backend integration</h3>
            <p>
              This section is now connected to the backend. MT5 credentials are sent securely to the API for login and trade history retrieval.
            </p>
            <p>
              If the backend is running, credentials are handled only during the request and not stored persistently in local storage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
