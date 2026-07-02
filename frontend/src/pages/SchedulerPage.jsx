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

export default function SchedulerPage({ currentDay = 1, ships = [], setShips }) {
  const [apiData, setApiData]           = useState({ ships: [], berths: [], assignments: [] })
  const [selectedShip, setSelectedShip] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  // Solo in Fase B (USE_MOCK=false) carica i dati dall'API
  useEffect(() => {
    if (!USE_MOCK) {
      Promise.all([getShips("Pending"), getBerths(), getAssignments()])
        .then(([s, b, a]) => setApiData({ ships: s, berths: b, assignments: a }))
        .catch(console.error)
    }
  }, [])

  // Valori calcolati direttamente — nessuno stato intermedio
  const pendingShips = USE_MOCK ? ships.filter(s => s.status === "Pending") : apiData.ships
  const berths       = USE_MOCK ? BERTHS : apiData.berths

  const handleShipClick = (ship) => {
    setSelectedShip(prev => prev?.id === ship.id ? null : ship)
  }

  const handleBerthClick = (berth) => {
    if (!selectedShip || berth.size !== selectedShip.size) return
    if (USE_MOCK) {
      const { startDay, endDay } = calcSlot(berth, selectedShip, ships, currentDay)
      setConfirmModal({ ship: selectedShip, berth, startDay, endDay })
    } else {
      setConfirmModal({ ship: selectedShip, berth, startDay: "?", endDay: "?" })
    }
  }

  const handleConfirm = async () => {
    const { ship, berth, startDay } = confirmModal
    if (USE_MOCK) {
      setShips(prev => prev.map(s =>
        s.id === ship.id
          ? { ...s, status: "Assigned", assignedBerth: berth.name, startDay }
          : s
      ))
    } else {
      await createAssignment(ship.id, berth.id)
      const [s, b, a] = await Promise.all([getShips("Pending"), getBerths(), getAssignments()])
      setApiData({ ships: s, berths: b, assignments: a })
    }
    setConfirmModal(null)
    setSelectedShip(null)
  }

  const getBerthInfo = (berth) => {
    if (USE_MOCK) {
      const assigned = ships.filter(
        s => s.assignedBerth === berth.name && s.status === "Assigned"
      )
      const active = assigned.find(
        s => s.startDay <= currentDay && (s.startDay + s.occupationDuration - 1) >= currentDay
      )
      const inQueue = assigned.filter(s => s.startDay > currentDay)
      return { active, inQueue }
    } else {
      const berthAssignments = apiData.assignments.filter(a => a.berthId === berth.id)
      const active = berthAssignments.find(
        a => a.startDay <= currentDay && a.endDay >= currentDay
      )
      const inQueue = berthAssignments.filter(a => a.startDay > currentDay)
      return {
        active: active ? {
          name: active.ship?.name,
          startDay: active.startDay,
          occupationDuration: active.endDay - active.startDay + 1
        } : null,
        inQueue
      }
    }
  }

  return (
    <div className="scheduler-page">

      {selectedShip && (
        <div className="selection-banner">
          <span>
            Nave selezionata: <strong>{selectedShip.name}</strong>
            &nbsp;·&nbsp; Taglia <span className={`size-badge size-${selectedShip.size.toLowerCase()}`}>{selectedShip.size}</span>
            &nbsp;·&nbsp; Clicca una banchina <strong>{selectedShip.size}</strong>
          </span>
          <button onClick={() => setSelectedShip(null)}>✕ Annulla</button>
        </div>
      )}

      <div className="scheduler-layout">

        <div className="panel pending-panel">
          <h3>⏳ Navi in Attesa <span className="count">{pendingShips.length}</span></h3>
          {pendingShips.length === 0
            ? <p className="empty">✅ Nessuna nave in attesa</p>
            : pendingShips.map(ship => (
              <div
                key={ship.id}
                className={`ship-card ${selectedShip?.id === ship.id ? "selected" : ""}`}
                onClick={() => handleShipClick(ship)}
              >
                <div className="ship-card-top">
                  <span className={`size-badge size-${ship.size.toLowerCase()}`}>{ship.size}</span>
                  <span className="ship-name">{ship.name}</span>
                  {selectedShip?.id === ship.id && <span className="selected-tag">✓</span>}
                </div>
                <div className="ship-card-info">
                  <span>📅 Arrivo: Gg {ship.arrivalDay}</span>
                  <span>⏱ {ship.occupationDuration} giorni</span>
                </div>
              </div>
            ))
          }
        </div>

        <div className="panel berths-panel">
          <h3>⚓ Banchine del Terminal</h3>
          <div className="berths-grid">
            {berths.map(berth => {
              const { active, inQueue } = getBerthInfo(berth)
              const isCompatible = selectedShip && berth.size === selectedShip.size
              const isDimmed     = selectedShip && !isCompatible

              return (
                <div
                  key={berth.id}
                  className={[
                    "berth-card",
                    active       ? "occupied"   : "free",
                    isCompatible ? "compatible" : "",
                    isDimmed     ? "dimmed"     : "",
                  ].join(" ")}
                  onClick={() => handleBerthClick(berth)}
                >
                  <div className="berth-header">
                    <span className={`size-badge size-${berth.size.toLowerCase()}`}>{berth.size}</span>
                    <span className="berth-name">{berth.name}</span>
                    <span className={`dot ${active ? "dot-busy" : "dot-free"}`} />
                  </div>

                  {active
                    ? <div className="berth-ship">
                        🚢 <span>{active.name}</span>
                        <small>Gg {active.startDay}→{active.startDay + active.occupationDuration - 1}</small>
                      </div>
                    : <div className="berth-free">Libera</div>
                  }

                  {inQueue.length > 0 && (
                    <div className="berth-queue">🕐 +{inQueue.length} in coda</div>
                  )}

                  {isCompatible && (
                    <div className="berth-hint">👆 Clicca per assegnare</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Conferma Assegnazione</h3>
            <div className="modal-rows">
              <div className="modal-row"><span>🚢 Nave</span><strong>{confirmModal.ship.name}</strong></div>
              <div className="modal-row"><span>⚓ Banchina</span><strong>{confirmModal.berth.name}</strong></div>
              <hr/>
              <div className="modal-row"><span>📅 Inizio</span><strong className="gold">Giorno {confirmModal.startDay}</strong></div>
              <div className="modal-row"><span>📅 Fine</span><strong className="gold">Giorno {confirmModal.endDay}</strong></div>
              <div className="modal-row"><span>⏱ Durata</span><strong>{confirmModal.ship.occupationDuration} giorni</strong></div>
            </div>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleConfirm}>✅ Conferma</button>
              <button className="btn-cancel" onClick={() => setConfirmModal(null)}>✕ Annulla</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}