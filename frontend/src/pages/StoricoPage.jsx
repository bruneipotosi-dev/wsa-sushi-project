// src/pages/StoricoPage.jsx
import { useState, useEffect } from "react";
import { getPortLogs } from "../services/api";
import "./StoricoPage.scss";

const ACTION_LABELS = {
  Assigned: "Assegnata",
  Departed: "Partita",
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StoricoPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPortLogs()
      .then(setLogs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="storico-page">
      <div className="storico-header">
        <h1>Storico</h1>
        <p className="storico-subtitle">Eventi operativi del terminal</p>
      </div>

      {error && <div className="storico-alert" role="alert">{error}</div>}

      {loading ? (
        <p className="storico-loading">Caricamento…</p>
      ) : logs.length === 0 ? (
        <div className="storico-empty">
          <span aria-hidden="true">📋</span>
          <p>Nessun evento registrato.<br />Gli eventi appariranno qui dopo un&apos;assegnazione o una partenza.</p>
        </div>
      ) : (
        <ul className="storico-list">
          {logs.map(log => (
            <li className="storico-row" key={log.id}>
              <span className={`storico-action storico-action--${log.action.toLowerCase()}`}>
                {ACTION_LABELS[log.action] ?? log.action}
              </span>
              <span className="storico-details">{log.details}</span>
              <span className="storico-window">
                G{log.arrivalDay} → G{log.departureDay} · {log.duration} {log.duration === 1 ? "giorno" : "giorni"}
              </span>
              <time className="storico-time" dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
