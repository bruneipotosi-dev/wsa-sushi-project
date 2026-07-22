// src/pages/OperatorePages.jsx
import { useState, useEffect } from "react";
import { createShip, getShips, updateShip, deleteShip } from "../services/api";
import "./OperatorePages.scss";

function generateShipData(currentDay) {
  const sizes = ["XL", "L", "M", "S"];
  return {
    size: sizes[Math.floor(Math.random() * sizes.length)],
    arrivalDay: (currentDay || 1) + Math.floor(Math.random() * 31),
    occupationDuration: Math.floor(Math.random() * 13) + 3
  };
}

// Solo per la visualizzazione: lo stato dal backend resta in inglese
// (usato per filtri e classe CSS), ma testo in inglese in un'interfaccia
// italiana è un problema di lingua per screen reader (WCAG 3.1.2) — qui
// traduciamo solo l'etichetta mostrata, senza toccare ship.status.
const STATUS_LABELS = {
  Pending: "In attesa",
  Assigned: "Assegnata",
  Departed: "Partita",
};

export default function OperatorePage({ ships, setShips, currentDay }) {
  const [name, setName]       = useState("");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const [editingShip, setEditingShip] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSize, setEditSize] = useState("M");
  const [editArrivalDay, setEditArrivalDay] = useState(1);
  const [editDuration, setEditDuration] = useState(5);

  const loadShips = async () => {
    try {
      const data = await getShips();
      setShips(data);
    } catch (err) {
      console.error('Errore caricamento navi:', err);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  const pending  = ships.filter(s => s.status === "Pending");
  const assigned = ships.filter(s => s.status === "Assigned");
  const departed = ships.filter(s => s.status === "Departed");

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Il nome della nave è obbligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const generated = generateShipData(currentDay);
      await createShip({
        name: name.trim(),
        notes: notes.trim(),
        status: "Pending",
        ...generated
      });
      await loadShips();
      setSuccess(`"${name.trim()}" registrata — taglia ${generated.size}, arrivo giorno ${generated.arrivalDay}`);
      setName("");
      setNotes("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteShip(id, shipName) {
    if (!window.confirm(`Sei sicuro di voler eliminare "${shipName}"?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteShip(id);
      await loadShips();
      setSuccess(`"${shipName}" eliminata con successo.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(ship) {
    setEditingShip(ship);
    setEditName(ship.name);
    setEditNotes(ship.notes || "");
    setEditSize(ship.size || "M");
    setEditArrivalDay(ship.arrivalDay || 1);
    setEditDuration(ship.occupationDuration || 5);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) {
      setError("Il nome della nave è obbligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateShip(editingShip.id, {
        name: editName.trim(),
        notes: editNotes.trim(),
        size: editSize,
        arrivalDay: parseInt(editArrivalDay),
        occupationDuration: parseInt(editDuration),
        status: editingShip.status
      });
      await loadShips();
      setSuccess(`"${editName.trim()}" modificata con successo.`);
      setEditingShip(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditingShip(null);
    setError(null);
  }

  return (
    <main className="operatore-page">
      <div className="section-header">
        <div className="section-header-title">
          <h1>Operatore</h1>
          <p className="subtitle">Gestione navi e registrazione</p>
        </div>
      </div>

      <div className="operatore-layout">
        <div className="form-card">
          <h2>Registra nuova nave</h2>

          {error   && <div className="alert alert-error" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="status">{success}</div>}

          <div className="form-group">
            <label htmlFor="ship-name">Nome nave *</label>
            <input
              id="ship-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="es. MSC Aurora"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ship-notes">Note operative</label>
            <textarea
              id="ship-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Carico, provenienza, istruzioni..."
              disabled={loading}
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="btn-submit"
          >
            {loading ? "Registrazione..." : "Registra nave"}
          </button>
        </div>

        <div className="ships-card">
          <div className="ships-card-header">
            <h2>Registro navi</h2>
            <span className="ships-count">{ships.length} navi</span>
          </div>

          {ships.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">🚢</span>
              <p>Nessuna nave registrata.<br/>Usa il form per aggiungerne una.</p>
            </div>
          ) : (
            <div className="ships-list">
              {ships.map(ship => (
                <div className={`ship-card ${editingShip?.id === ship.id ? 'ship-card--editing' : ''}`} key={ship.id}>
                  {editingShip?.id === ship.id ? (
                    <div className="ship-edit-mode">
                      <div className="ship-edit-fields">
                        <div className="ship-edit-field">
                          <label htmlFor="edit-ship-name">Nome</label>
                          <input
                            id="edit-ship-name"
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="ship-edit-field">
                          <label htmlFor="edit-ship-size">Taglia</label>
                          <select
                            id="edit-ship-size"
                            value={editSize}
                            onChange={e => setEditSize(e.target.value)}
                            disabled={loading}
                          >
                            <option value="XL">XL</option>
                            <option value="L">L</option>
                            <option value="M">M</option>
                            <option value="S">S</option>
                          </select>
                        </div>
                        <div className="ship-edit-field">
                          <label htmlFor="edit-ship-arrival">Arrivo (giorno)</label>
                          <input
                            id="edit-ship-arrival"
                            type="number"
                            value={editArrivalDay}
                            onChange={e => setEditArrivalDay(parseInt(e.target.value) || 1)}
                            disabled={loading}
                            min="1"
                          />
                        </div>
                        <div className="ship-edit-field">
                          <label htmlFor="edit-ship-duration">Durata (giorni)</label>
                          <input
                            id="edit-ship-duration"
                            type="number"
                            value={editDuration}
                            onChange={e => setEditDuration(parseInt(e.target.value) || 1)}
                            disabled={loading}
                            min="1"
                          />
                        </div>
                        <div className="ship-edit-field ship-edit-field--full">
                          <label htmlFor="edit-ship-notes">Note</label>
                          <textarea
                            id="edit-ship-notes"
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            disabled={loading}
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="ship-edit-actions">
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading || !editName.trim()}
                          className="btn-edit-save"
                        >
                          {loading ? "Salvataggio..." : "Salva"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="btn-edit-cancel"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ship-row">
                        <div className="ship-info">
                          <span className="ship-name">{ship.name}</span>
                          <span className="ship-chip">{ship.size}</span>
                          <span className={`ship-status status-${ship.status.toLowerCase()}`}>
                            {STATUS_LABELS[ship.status] ?? ship.status}
                          </span>
                        </div>
                        <div className="ship-actions">
                          <button
                            onClick={() => handleEditClick(ship)}
                            className="btn-ship-edit"
                            disabled={loading}
                            title="Modifica"
                            aria-label={`Modifica ${ship.name}`}
                          >
                            <span aria-hidden="true">✏️</span>
                          </button>
                          <button
                            onClick={() => handleDeleteShip(ship.id, ship.name)}
                            className="btn-ship-delete"
                            disabled={loading}
                            title="Elimina"
                            aria-label={`Elimina ${ship.name}`}
                          >
                            <span aria-hidden="true">❌</span>
                          </button>
                        </div>
                      </div>
                      <div className="ship-details">
                        <span>Arrivo: Gg {ship.arrivalDay}</span>
                        <span aria-hidden="true">•</span>
                        <span>Durata: {ship.occupationDuration} giorni</span>
                        {ship.notes && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="ship-notes">{ship.notes}</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STATS SPOSTATE IN BASSO */}
          <div className="stats-container stats-container--bottom">
            <div className="stat-box">
              <div className="stat-label">Totale navi</div>
              <div className="stat-value">{ships.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">In attesa</div>
              <div className="stat-value stat-value-pending">{pending.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Assegnate</div>
              <div className="stat-value stat-value-assigned">{assigned.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Partite</div>
              <div className="stat-value stat-value-departed">{departed.length}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}