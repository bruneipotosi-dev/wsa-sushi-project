import { useState, useEffect } from "react"
import { getShips, getBerths, createAssignment, getAssignments } from "../services/api"
import "./SchedulerPage.scss"

const USE_MOCK = false

const calcSlot = (berth, ship, allShips, currentDay) => {
  const assigned = allShips.filter(
    s => s.assignedBerth === berth.name && s.status === "Assigned"
  )
  let primoGiornoLibero = currentDay
  if (assigned.length > 0) {
    const maxEnd = Math.max(...assigned.map(s => s.startDay + s.occupationDuration - 1))
    primoGiornoLibero = maxEnd + 1
  }
  const startDay = Math.max(ship.arrivalDay, primoGiornoLibero)
  const endDay = startDay + ship.occupationDuration - 1
  return { startDay, endDay }
}

// Stessa formula FindFirstFreeSlot, usata qui solo per l'anteprima nel modal
// in modalità reale (il backend calcola comunque il valore definitivo al POST)
const calcSlotReal = (berth, ship, assignments, currentDay) => {
  const berthAssignments = assignments
    .filter(a => a.berthId === berth.id)
    .sort((a, b) => a.startDay - b.startDay)
  let cand = Math.max(ship.arrivalDay, currentDay)
  const dur = ship.occupationDuration
  for (const a of berthAssignments) {
    if (cand + dur - 1 < a.startDay) break
    if (cand <= a.endDay) cand = a.endDay + 1
  }
  return { startDay: cand, endDay: cand + dur - 1 }
}

const BERTHS = [
  { id: 1, name: "XL-1", size: "XL" },
  { id: 2, name: "L-1",  size: "L"  },
  { id: 3, name: "M-1",  size: "M"  },
  { id: 4, name: "M-2",  size: "M"  },
  { id: 5, name: "S-1",  size: "S"  },
  { id: 6, name: "S-2",  size: "S"  },
  { id: 7, name: "S-3",  size: "S"  },
  { id: 8, name: "S-4",  size: "S"  },
]

const STATUS_THEME = {
  DISPONIBILE: "#46c08a",
  PIANIFICATA: "#C9A84C",
  OCCUPATA:    "#e07a5f",
}

const pad2 = (n) => String(n).padStart(2, "0")

export default function SchedulerPage({ currentDay = 1, ships = [], setShips }) {
  const [apiData, setApiData]           = useState({ ships: [], berths: [], assignments: [] })
  const [selectedShip, setSelectedShip] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const [toast, setToast]               = useState(null)
  const [dragOverBerthId, setDragOverBerthId] = useState(null)

  useEffect(() => {
    if (!USE_MOCK) {
      Promise.all([getShips("Pending"), getBerths(), getAssignments()])
        .then(([s, b, a]) => setApiData({ ships: s, berths: b, assignments: a }))
        .catch(console.error)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const pendingShips = USE_MOCK ? ships.filter(s => s.status === "Pending") : apiData.ships
  const berths        = USE_MOCK ? BERTHS : apiData.berths
  const overdueShips  = pendingShips.filter(ship => ship.arrivalDay <= currentDay)

  // Calcola active + upcoming (piu vicino) + finestra a 7 giorni per una banchina
  const getBerthState = (berth) => {
    let assigns
    if (USE_MOCK) {
      assigns = ships
        .filter(s => s.assignedBerth === berth.name && s.status === "Assigned")
        .map(s => ({ startDay: s.startDay, endDay: s.startDay + s.occupationDuration - 1, name: s.name }))
    } else {
      assigns = apiData.assignments
        .filter(a => a.berthId === berth.id)
        .map(a => ({ startDay: a.startDay, endDay: a.endDay, name: a.ship?.name }))
    }
    assigns.sort((p, q) => p.startDay - q.startDay)

    const active   = assigns.find(a => a.startDay <= currentDay && currentDay <= a.endDay)
    const upcoming = assigns.find(a => a.startDay > currentDay)
    const status = active ? "OCCUPATA" : (upcoming ? "PIANIFICATA" : "DISPONIBILE")
    const occ = active || upcoming || null

    let occMeta = "", occMetaColor = "#9a9a9a"
    if (active) {
      const left = active.endDay - currentDay + 1
      occMeta = `Libera tra ${left} ${left === 1 ? "giorno" : "giorni"}`
      occMetaColor = "#e07a5f"
    } else if (upcoming) {
      const inn = upcoming.startDay - currentDay
      occMeta = `In arrivo tra ${inn} ${inn === 1 ? "giorno" : "giorni"}`
      occMetaColor = "#C9A84C"
    }

    const timeline = []
    if (occ) {
      for (let k = 0; k < 7; k++) {
        const d = currentDay + k
        const cov = assigns.find(a => a.startDay <= d && d <= a.endDay)
        let bg = "rgba(255,255,255,0.06)"
        if (cov) {
          const isActiveToday = cov.startDay <= currentDay && currentDay <= cov.endDay
          bg = isActiveToday ? "#e07a5f" : "rgba(201,168,76,0.55)"
        }
        const isToday = d === currentDay
        timeline.push({ dayLabel: d, bg, isToday })
      }
    }

    return { status, active, upcoming, occ, occMeta, occMetaColor, timeline }
  }

  const berthStates = berths.map(b => ({ berth: b, state: getBerthState(b) }))
  const occCount  = berthStates.filter(x => x.state.status === "OCCUPATA").length
  const planCount = berthStates.filter(x => x.state.status === "PIANIFICATA").length
  const freeCount = berthStates.filter(x => x.state.status === "DISPONIBILE").length

  const openAssignModal = (ship, berth) => {
    if (!ship || berth.size !== ship.size) return
    let startDay, endDay
    if (USE_MOCK) {
      ({ startDay, endDay } = calcSlot(berth, ship, ships, currentDay))
    } else {
      ({ startDay, endDay } = calcSlotReal(berth, ship, apiData.assignments, currentDay))
    }
    setConfirmError(null)
    setConfirmModal({ ship, berth, startDay, endDay })
  }

  const handleShipClick = (ship) => {
    setSelectedShip(prev => prev?.id === ship.id ? null : ship)
  }

  const handleBerthClick = (berth) => {
    openAssignModal(selectedShip, berth)
  }

  const handleDragStart = (e, ship) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(ship.id))
    setSelectedShip(ship)
  }

  const handleDragOver = (e, berth) => {
    if (!selectedShip || berth.size !== selectedShip.size) return
    e.preventDefault()
    setDragOverBerthId(berth.id)
  }

  const handleDrop = (e, berth) => {
    e.preventDefault()
    setDragOverBerthId(null)
    openAssignModal(selectedShip, berth)
  }

  const handleConfirm = async () => {
    const { ship, berth, startDay, endDay } = confirmModal
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      if (USE_MOCK) {
        setShips(prev => prev.map(s =>
          s.id === ship.id
            ? { ...s, status: "Assigned", assignedBerth: berth.name, startDay }
            : s
        ))
        setToast({
          title: "Assegnazione confermata",
          msg: `${ship.name} → ${berth.name} · Finestra G${startDay}–G${endDay}`,
        })
      } else {
        // Usiamo la finestra restituita dal backend (fonte di verità), non
        // quella di anteprima calcolata lato client per il modal.
        const result = await createAssignment(ship.id, berth.id)
        const [s, b, a] = await Promise.all([getShips("Pending"), getBerths(), getAssignments()])
        setApiData({ ships: s, berths: b, assignments: a })
        setToast({
          title: "Assegnazione confermata",
          msg: `${ship.name} → ${berth.name} · Finestra G${result.startDay}–G${result.endDay}`,
        })
      }
      setConfirmModal(null)
      setSelectedShip(null)
    } catch (err) {
      setConfirmError(err.message || "Errore durante l'assegnazione della banchina.")
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="scheduler-page">

      {/* SECTION HEADER */}
      <div className="sch-topline">
        <div>
          <h1 className="sch-title">Matrice di assegnazione</h1>
        </div>
        <div className="sch-stats">
          <div className="sch-stat-box">
            <div className="sch-stat-label">Navi in attesa</div>
            <div className="sch-stat-value">{pad2(pendingShips.length)}</div>
          </div>
          <div className="sch-stat-box">
            <div className="sch-stat-label">Banchine libere</div>
            <div className="sch-stat-value sch-stat-value--free">{pad2(freeCount)}</div>
          </div>
        </div>
      </div>

      {/* UTILIZATION BAR */}
      <div className="sch-util">
        <span className="sch-util-label">Occupazione terminale</span>
        <div className="sch-util-track">
          {berthStates.map(({ berth, state }) => (
            <div
              key={berth.id}
              className="sch-util-seg"
              style={{ background: state.status === "OCCUPATA" ? "#e07a5f" : state.status === "PIANIFICATA" ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
        <span className="sch-util-count">{occCount} occupate · {planCount} pianificate</span>
      </div>

      {selectedShip && (
        <div className="selection-banner">
          <span>
            Nave selezionata: <strong>{selectedShip.name}</strong>
            &nbsp;·&nbsp; Taglia <span className="sch-chip">{selectedShip.size}</span>
            &nbsp;·&nbsp; Clicca o trascina su una banchina <strong>{selectedShip.size}</strong>
          </span>
          <button onClick={() => setSelectedShip(null)}>✕ Annulla</button>
        </div>
      )}

      {overdueShips.length > 0 && (
        <div className="warning-banner">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Attenzione:</strong> ci sono <strong>{overdueShips.length}</strong> navi in attesa già arrivate.
            <br />
            <small>Assegnale prima di proseguire con il giorno operativo.</small>
          </div>
        </div>
      )}

      <div className="sch-body">

        {/* QUEUE */}
        <aside className="sch-queue">
          <div className="sch-queue-head">
            <span>Coda di attesa</span>
          </div>

          {pendingShips.length === 0 ? (
            <div className="sch-queue-empty">
              <div className="sch-queue-empty-title">Nessuna nave in coda</div>
              <div className="sch-queue-empty-sub">Tutte le navi sono assegnate</div>
            </div>
          ) : (
            <div className="sch-queue-list">
              {pendingShips.map(ship => (
                <div
                  key={ship.id}
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedShip?.id === ship.id}
                  aria-label={`Nave ${ship.name}, taglia ${ship.size}, arrivo giorno ${ship.arrivalDay}, durata ${ship.occupationDuration} ${ship.occupationDuration === 1 ? "giorno" : "giorni"}`}
                  onDragStart={(e) => handleDragStart(e, ship)}
                  onClick={() => handleShipClick(ship)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleShipClick(ship) }
                  }}
                  className={`sch-ship-card ${selectedShip?.id === ship.id ? "sch-ship-card--selected" : ""}`}
                >
                  <div className="sch-ship-card-top">
                    <span className="sch-ship-name">{ship.name}</span>
                    <span className="sch-chip">{ship.size}</span>
                  </div>
                  <div className="sch-ship-card-meta">
                    <div><span className="sch-meta-label">ARRIVO</span><span className="sch-meta-val">Giorno {ship.arrivalDay}</span></div>
                    <div><span className="sch-meta-label">DURATA</span><span className="sch-meta-val">{ship.occupationDuration} {ship.occupationDuration === 1 ? "giorno" : "giorni"}</span></div>
                  </div>
                  {selectedShip?.id === ship.id && (
                    <div className="sch-ship-selected-tag">✓ Scegli banchina</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* BERTH GRID */}
        <main className="sch-berth-grid">
          {berthStates.map(({ berth, state }, i) => {
            const isCompatible = !!(selectedShip && berth.size === selectedShip.size)
            const isDimmed     = !!(selectedShip && !isCompatible)
            const isDragOver   = dragOverBerthId === berth.id
            const themeColor   = STATUS_THEME[state.status]

            return (
              <div
                key={berth.id}
                role="button"
                tabIndex={isCompatible ? 0 : -1}
                aria-disabled={!isCompatible}
                aria-label={`Banchina ${berth.name}, taglia ${berth.size}, stato ${state.status}${state.occMeta ? `, ${state.occMeta}` : ""}`}
                onClick={() => isCompatible && handleBerthClick(berth)}
                onKeyDown={(e) => {
                  if (isCompatible && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleBerthClick(berth) }
                }}
                onDragOver={(e) => handleDragOver(e, berth)}
                onDragLeave={() => setDragOverBerthId(null)}
                onDrop={(e) => handleDrop(e, berth)}
                className={[
                  "sch-berth-card",
                  isCompatible ? "sch-berth-card--compatible" : "",
                  isDimmed ? "sch-berth-card--dimmed" : "",
                  isDragOver ? "sch-berth-card--dragover" : "",
                ].join(" ")}
              >
                <div className="sch-berth-head">
                  <div className="sch-berth-index">BANCHINA {pad2(i + 1)}</div>
                  <div className="sch-berth-badge">
                    <span className="sch-berth-badge-dot" style={{ background: themeColor }} />
                    {state.status}
                  </div>
                </div>
                <div className="sch-berth-name-row">
                  <span className="sch-berth-name">{berth.name}</span>
                </div>

                <div className="sch-berth-center">
                  {state.status === "DISPONIBILE" ? (
                    <>
                      <div className={`sch-berth-anchor-box ${isCompatible ? "sch-berth-anchor-box--compatible" : ""}`}>
                        <span style={{ color: isCompatible ? "#4d8df6" : "#757575" }}>⚓</span>
                      </div>
                      <div className="sch-berth-center-label" style={{ color: isCompatible ? "#4d8df6" : "#8a8a8a" }}>
                        {isCompatible ? "TRASCINA O CLICCA" : "LIBERA PER ORMEGGIO"}
                      </div>
                    </>
                  ) : (
                    <div className="sch-berth-occupant">
                      <div className="sch-berth-occupant-top">
                        <span className="sch-berth-occupant-name">{state.occ.name}</span>
                      </div>
                      <div className="sch-berth-occupant-meta" style={{ color: state.occMetaColor }}>{state.occMeta}</div>
                      <div className="sch-berth-occupant-range">
                        <span>FINESTRA</span>
                        <span>G{state.occ.startDay} – G{state.occ.endDay}</span>
                      </div>
                      <div className="sch-berth-timeline">
                        {state.timeline.map((cell, idx) => (
                          <div key={idx} className="sch-timeline-cell">
                            <div className="sch-timeline-bar" style={{ background: cell.bg, border: cell.isToday ? "1.5px solid rgba(255,255,255,0.45)" : "1px solid transparent" }} />
                            <div className="sch-timeline-label" style={{ color: cell.isToday ? "#ededed" : "#8a8a8a", fontWeight: cell.isToday ? 500 : 400 }}>{cell.dayLabel}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sch-berth-footer">
                  <button
                    className={`sch-berth-cta ${isCompatible ? "sch-berth-cta--compatible" : ""}`}
                    disabled={!isCompatible}
                    onClick={(e) => { e.stopPropagation(); handleBerthClick(berth) }}
                  >
                    {isCompatible ? "ASSEGNA QUI" : "SELEZIONA NAVE"}
                  </button>
                </div>
              </div>
            )
          })}
        </main>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <div className="sch-modal-overlay" onClick={() => !confirmLoading && setConfirmModal(null)}>
          <div className="sch-modal" onClick={e => e.stopPropagation()}>
            <div className="sch-modal-head">
              <span className="sch-modal-head-dot" />
              Conferma assegnazione
            </div>
            <div className="sch-modal-body">
              <div className="sch-modal-compare">
                <div className="sch-modal-compare-item">
                  <span>NAVE</span>
                  <strong>{confirmModal.ship.name}</strong>
                  <span className="sch-chip">{confirmModal.ship.size}</span>
                </div>
                <span className="sch-modal-arrow">→</span>
                <div className="sch-modal-compare-item">
                  <span>BANCHINA</span>
                  <strong>{confirmModal.berth.name}</strong>
                </div>
              </div>
              <div className="sch-modal-grid">
                <div><span>GIORNO INIZIO</span><strong className="sch-modal-accent">G{confirmModal.startDay}</strong></div>
                <div><span>GIORNO FINE</span><strong>G{confirmModal.endDay}</strong></div>
                <div><span>DURATA</span><strong>{confirmModal.endDay - confirmModal.startDay + 1} giorni</strong></div>
              </div>
              {confirmError && <div className="sch-modal-error">{confirmError}</div>}
              <div className="sch-modal-actions">
                <button className="sch-btn-cancel" onClick={() => setConfirmModal(null)} disabled={confirmLoading}>Annulla</button>
                <button className="sch-btn-confirm" onClick={handleConfirm} disabled={confirmLoading}>
                  {confirmLoading ? "Conferma in corso…" : "Conferma"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="sch-toast">
          <div className="sch-toast-icon">✓</div>
          <div>
            <div className="sch-toast-title">{toast.title}</div>
            <div className="sch-toast-msg">{toast.msg}</div>
          </div>
        </div>
      )}

    </div>
  )
}