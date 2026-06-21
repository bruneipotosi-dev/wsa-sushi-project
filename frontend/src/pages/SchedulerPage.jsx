import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence, animate } from "framer-motion"
import { Toaster, toast } from "react-hot-toast"
import {
  DndContext, DragOverlay,
  useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { getShips, getBerths, createAssignment } from "../services/api"
import "./SchedulerPage.scss"

const USE_MOCK = true

const BERTHS = [
  { id: 1, name: "XL-1", size: "XL", index: "01" },
  { id: 2, name: "L-1",  size: "L",  index: "02" },
  { id: 3, name: "M-1",  size: "M",  index: "03" },
  { id: 4, name: "M-2",  size: "M",  index: "04" },
  { id: 5, name: "S-1",  size: "S",  index: "05" },
  { id: 6, name: "S-2",  size: "S",  index: "06" },
  { id: 7, name: "S-3",  size: "S",  index: "07" },
  { id: 8, name: "S-4",  size: "S",  index: "08" },
]

const SIZE_COLOR = {
  XL: { bg: "rgba(201,168,76,0.12)",  border: "rgba(201,168,76,0.35)", color: "#c9a84c" },
  L:  { bg: "rgba(77,141,246,0.12)",  border: "rgba(77,141,246,0.35)", color: "#4d8df6" },
  M:  { bg: "rgba(155,89,182,0.12)",  border: "rgba(155,89,182,0.35)", color: "#9b59b6" },
  S:  { bg: "rgba(70,192,138,0.12)",  border: "rgba(70,192,138,0.35)", color: "#46c08a" },
}

const calcSlot = (berth, ship, allShips, currentDay) => {
  const assigned = allShips.filter(
    s => s.assignedBerth === berth.name && s.status === "Assigned"
  )
  let primoLibero = currentDay
  if (assigned.length > 0) {
    const maxEnd = Math.max(...assigned.map(s => s.startDay + s.occupationDuration - 1))
    primoLibero = maxEnd + 1
  }
  const startDay = Math.max(ship.arrivalDay, primoLibero)
  const endDay   = startDay + ship.occupationDuration - 1
  return { startDay, endDay }
}

const getBerthInfo = (berth, ships, currentDay) => {
  const assigned = ships.filter(
    s => s.assignedBerth === berth.name && s.status === "Assigned"
  )
  const active  = assigned.find(
    s => s.startDay <= currentDay && (s.startDay + s.occupationDuration - 1) >= currentDay
  )
  const inQueue = assigned
    .filter(s => s.startDay > currentDay)
    .sort((a, b) => a.startDay - b.startDay)
  return { active, inQueue, nextShip: inQueue[0] || null }
}

// ── Contatore animato ─────────────────────────────────
const AnimNum = memo(function AnimNum({ value, format = n => n }) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.6, ease: "easeOut",
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [value])
  return <>{format(display)}</>
})

// ── Timeline ──────────────────────────────────────────
const TimelineBars = memo(function TimelineBars({ startDay, endDay, currentDay }) {
  const cells = useMemo(() => {
    const from = Math.max(startDay - 1, currentDay)
    return Array.from({ length: Math.min(endDay - from + 2, 7) }, (_, i) => from + i)
  }, [startDay, endDay, currentDay])

  return (
    <div className="timeline-row">
      {cells.map(d => (
        <div key={d} className="timeline-cell">
          <div className={`tl-bar ${d >= startDay && d <= endDay ? "tl-active" : "tl-empty"} ${d === currentDay ? "tl-today" : ""}`} />
          <div className="tl-label">G{d}</div>
        </div>
      ))}
    </div>
  )
})

// ── Ship card con badge URGENTE ───────────────────────
const DraggableShipCard = memo(function DraggableShipCard({ ship, isSelected, onSelect, currentDay }) {
  const s = SIZE_COLOR[ship.size]
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ship-${ship.id}`, data: { ship },
  })
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  // Logica urgenza
  const daysLeft  = ship.arrivalDay - currentDay
  const isUrgent  = daysLeft <= 3 && daysLeft >= 0
  const isOverdue = daysLeft < 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "ship-card",
        isSelected  ? "ship-sel"    : "",
        isDragging  ? "ship-drag"   : "",
        isUrgent    ? "ship-urgent" : "",
        isOverdue   ? "ship-overdue": "",
      ].join(" ")}
      onClick={() => onSelect(ship)}
      {...listeners}
      {...attributes}
    >
      <div className="sc-top">
        <span className="sc-name">{ship.name}</span>
        <span className="size-chip"
          style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
          {ship.size}
        </span>
      </div>

      <div className="sc-meta">
        <div className="sc-meta-item">
          <span className="sc-meta-label">ARRIVO</span>
          <span className="sc-meta-val">Giorno {ship.arrivalDay}</span>
        </div>
        <div className="sc-meta-item">
          <span className="sc-meta-label">DURATA</span>
          <span className="sc-meta-val">
            {ship.occupationDuration} {ship.occupationDuration === 1 ? "giorno" : "giorni"}
          </span>
        </div>
      </div>

      {isOverdue && (
        <div className="sc-overdue-badge">
          ⚠ SCADUTA — {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "giorno" : "giorni"} fa
        </div>
      )}

      {isUrgent && !isOverdue && (
        <div className="sc-urgent-badge">
          ⚠ {daysLeft === 0 ? "ARRIVA OGGI!" : `URGENTE — tra ${daysLeft} ${daysLeft === 1 ? "giorno" : "giorni"}`}
        </div>
      )}

      {isSelected && (
        <div className="sc-selected-hint">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="#4d8df6" strokeWidth="2.6" strokeLinecap="round">
            <path d="M5 9l3.5 8L19 5"/>
          </svg>
          Scegli banchina
        </div>
      )}
    </div>
  )
})

// ── Berth card ────────────────────────────────────────
const DroppableBerthCard = memo(function DroppableBerthCard({
  berth, active, inQueue, nextShip,
  isCompatible, isDimmed,
  currentDay, selectedShip, allShips,
  onClick, index,
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `berth-${berth.id}`, data: { berth } })
  const s = SIZE_COLOR[berth.size]
  const isDropTarget = isOver && isCompatible

  const endDay    = active ? active.startDay + active.occupationDuration - 1 : null
  const daysUntil = nextShip ? nextShip.startDay - currentDay : null

  const slot = useMemo(() => {
    if (!isCompatible || !selectedShip) return null
    return calcSlot(berth, selectedShip, allShips, currentDay)
  }, [isCompatible, selectedShip, berth, allShips, currentDay])

  const status = useMemo(() => (
    active       ? { label: "Occupata",    color: "#e07a5f", dot: "#e07a5f" }
    : nextShip   ? { label: "Pianificata", color: "#c9a84c", dot: "#c9a84c" }
    : isCompatible ? { label: "Compatibile", color: "#4d8df6", dot: "#4d8df6" }
    : { label: "Disponibile", color: "#46c08a", dot: "#46c08a" }
  ), [active, nextShip, isCompatible])

  const anchorColor = isDropTarget || isCompatible ? "#4d8df6" : "#3a3a3a"

  return (
    <motion.div
      ref={setNodeRef}
      className={[
        "berth-card",
        isCompatible ? "bc-compat" : "",
        isDropTarget ? "bc-drop"   : "",
        isDimmed     ? "bc-dimmed" : "",
      ].join(" ")}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDimmed ? 0.2 : 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="bc-header">
        <div>
          <div className="bc-index">BANCHINA {berth.index}</div>
          <div className="bc-title-row">
            <span className="bc-name">{berth.name}</span>
            <span className="size-chip"
              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
              {berth.size}
            </span>
          </div>
        </div>
        <div className="bc-badge"
          style={{ color: status.color, background: `${status.dot}14`, border: `1px solid ${status.dot}35` }}>
          <span className="bc-dot" style={{ background: status.dot }} />
          {status.label}
        </div>
      </div>

      <div className="bc-center">
        {active ? (
          <div className="bc-occ">
            <div className="bco-top">
              <div>
                <div className="bco-name">{active.name}</div>
                <div className="bco-meta" style={{ color: SIZE_COLOR[active.size]?.color }}>
                  {active.size} · {active.occupationDuration} giorni
                </div>
              </div>
              <span className="size-chip"
                style={{ background: SIZE_COLOR[active.size]?.bg, border: `1px solid ${SIZE_COLOR[active.size]?.border}`, color: SIZE_COLOR[active.size]?.color }}>
                {active.size}
              </span>
            </div>
            <div>
              <div className="bco-window-label">
                <span>FINESTRA</span>
                <span style={{ color: "#9a9a9a" }}>G{active.startDay} – G{endDay}</span>
              </div>
              <TimelineBars startDay={active.startDay} endDay={endDay} currentDay={currentDay} />
            </div>
            {inQueue.length > 0 && (
              <div className="bc-queue">+{inQueue.length} in coda</div>
            )}
          </div>

        ) : nextShip ? (
          <div className="bc-planned">
            <div className="bco-top">
              <div>
                <div className="bco-name">{nextShip.name}</div>
                <div className="bco-meta" style={{ color: "#9a9a9a" }}>
                  {daysUntil !== null
                    ? `In arrivo tra ${daysUntil} ${daysUntil === 1 ? "giorno" : "giorni"}`
                    : ""}
                </div>
              </div>
              <span className="size-chip"
                style={{ background: SIZE_COLOR[nextShip.size]?.bg, border: `1px solid ${SIZE_COLOR[nextShip.size]?.border}`, color: SIZE_COLOR[nextShip.size]?.color }}>
                {nextShip.size}
              </span>
            </div>
            <div className="bco-window-label">
              <span>FINESTRA</span>
              <span style={{ color: "#9a9a9a" }}>
                G{nextShip.startDay} – G{nextShip.startDay + nextShip.occupationDuration - 1}
              </span>
            </div>
          </div>

        ) : (
          <>
            <div className="bc-anchor-box"
              style={{ borderColor: `${anchorColor}40`, background: `${anchorColor}0d` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={anchorColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2.4"/>
                <path d="M12 7.4V21M5 12a7 7 0 0 0 14 0M5 12H3m16 0h2"/>
              </svg>
            </div>
            <div className="bc-center-label" style={{ color: anchorColor }}>
              {isDropTarget    ? "RILASCIA PER ASSEGNARE"
               : isCompatible  ? "TRASCINA O CLICCA QUI"
               : "Libera per ormeggio"}
            </div>
          </>
        )}
      </div>

      <div className="bc-footer">
        {isCompatible && slot && !active && (
          <div className="bc-slot-label">
            Slot calcolato · G{slot.startDay} → G{slot.endDay}
          </div>
        )}
        <button
          className={`bc-cta ${isCompatible && !active ? "bc-cta-active" : "bc-cta-disabled"}`}
          disabled={!isCompatible || !!active}
          onClick={onClick}
        >
          {isCompatible && !active ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M5 12l4.5 5L19 6"/>
              </svg>
              Assegna
            </>
          ) : active ? "Occupata" : "Seleziona nave"}
        </button>
      </div>
    </motion.div>
  )
})

// ── Drag preview ──────────────────────────────────────
const DragPreview = memo(function DragPreview({ ship }) {
  const s = SIZE_COLOR[ship.size]
  return (
    <div className="drag-preview">
      <span className="size-chip"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        {ship.size}
      </span>
      <span className="dp-name">{ship.name}</span>
    </div>
  )
})

// ── Componente principale ─────────────────────────────
export default function SchedulerPage({ currentDay = 1, ships = [], setShips }) {
  const [apiData, setApiData]           = useState({ ships: [], berths: [] })
  const [selectedShip, setSelectedShip] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [activeShip, setActiveShip]     = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ESC per annullare selezione
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedShip(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!USE_MOCK) {
      Promise.all([getShips("Pending"), getBerths()])
        .then(([s, b]) => setApiData({ ships: s, berths: b }))
        .catch(console.error)
    }
  }, [])

  const pendingShips = USE_MOCK ? ships.filter(s => s.status === "Pending") : apiData.ships
  const berths       = USE_MOCK ? BERTHS : apiData.berths

  // Ordina per urgenza: prima le scadute, poi le urgenti, poi per giorno arrivo
  const sortedPendingShips = useMemo(() => [...pendingShips].sort((a, b) => {
    const urgA = a.arrivalDay - currentDay
    const urgB = b.arrivalDay - currentDay
    return urgA - urgB // prima le più urgenti
  }), [pendingShips, currentDay])

  const berthInfos = useMemo(
    () => berths.map(b => ({ ...b, ...getBerthInfo(b, ships, currentDay) })),
    [berths, ships, currentDay]
  )

  const { occupiedCount, plannedCount, freeCount, utilSegments } = useMemo(() => {
    const occ  = berthInfos.filter(b =>  b.active).length
    const plan = berthInfos.filter(b => !b.active && b.nextShip).length
    const free = berthInfos.filter(b => !b.active && !b.nextShip).length
    return {
      occupiedCount: occ,
      plannedCount:  plan,
      freeCount:     free,
      utilSegments: [
        ...Array(occ).fill({ type: "occ" }),
        ...Array(plan).fill({ type: "plan" }),
        ...Array(free).fill({ type: "free" }),
      ],
    }
  }, [berthInfos])

  const handleShipClick = useCallback((ship) => {
    setSelectedShip(prev => prev?.id === ship.id ? null : ship)
  }, [])

  const handleBerthClick = useCallback((berth) => {
    if (!selectedShip || berth.size !== selectedShip.size) return
    const slot = calcSlot(berth, selectedShip, ships, currentDay)
    setConfirmModal({ ship: selectedShip, berth, ...slot })
  }, [selectedShip, ships, currentDay])

  const handleDragStart = useCallback(({ active: a }) => {
    const ship = a.data.current?.ship
    if (ship) { setActiveShip(ship); setSelectedShip(ship) }
  }, [])

  const handleDragEnd = useCallback(({ over, active: a }) => {
    setActiveShip(null)
    if (!over) return
    const ship  = a.data.current?.ship
    const berth = over.data.current?.berth
    if (!ship || !berth || berth.size !== ship.size) return
    const slot = calcSlot(berth, ship, ships, currentDay)
    setConfirmModal({ ship, berth, ...slot })
  }, [ships, currentDay])

  const handleConfirm = useCallback(async () => {
    if (!confirmModal) return
    const { ship, berth, startDay, endDay } = confirmModal
    if (USE_MOCK) {
      setShips(prev => prev.map(s =>
        s.id === ship.id
          ? { ...s, status: "Assigned", assignedBerth: berth.name, startDay }
          : s
      ))
    } else {
      await createAssignment(ship.id, berth.id)
      const [s, b] = await Promise.all([getShips("Pending"), getBerths()])
      setApiData({ ships: s, berths: b })
    }
    toast.custom((t) => (
      <div className={`custom-toast ${t.visible ? "toast-in" : "toast-out"}`}>
        <div className="toast-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#46c08a" strokeWidth="2.6" strokeLinecap="round">
            <path d="M5 12l4.5 5L19 6"/>
          </svg>
        </div>
        <div>
          <div className="toast-title">{ship.name} assegnata</div>
          <div className="toast-msg">{berth.name} · G{startDay} – G{endDay}</div>
        </div>
      </div>
    ), { duration: 4000, position: "bottom-right" })
    setConfirmModal(null)
    setSelectedShip(null)
  }, [confirmModal, setShips])

  const s_modal = confirmModal?.ship  ? SIZE_COLOR[confirmModal.ship.size]  : null
  const b_modal = confirmModal?.berth ? SIZE_COLOR[confirmModal.berth.size] : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="sch-page">
        <Toaster position="bottom-right" />

        <div className="sec-header">
          <div>
            <div className="sec-kicker">Matrice di assegnazione</div>
            <h1 className="sec-title">
              Giorno Operativo
              <span className="sec-day"><AnimNum value={currentDay} /></span>
              <span className="sec-dot" />
            </h1>
          </div>
          <div className="sec-stats">
            <div className="stat-box">
              <div className="stat-label">Navi in attesa</div>
              <div className="stat-num">
                <AnimNum value={sortedPendingShips.length} format={n => String(n).padStart(2,"0")} />
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Banchine libere</div>
              <div className="stat-num green">
                <AnimNum value={freeCount} format={n => String(n).padStart(2,"0")} />
              </div>
            </div>
          </div>
        </div>

        <div className="util-bar">
          <span className="util-label">Occupazione terminale</span>
          <div className="util-track">
            {utilSegments.map((seg, i) => (
              <div key={i} className={`util-seg util-${seg.type}`} />
            ))}
          </div>
          <span className="util-text">
            <span style={{ color: "#e07a5f" }}>{occupiedCount} occupate</span>
            {" · "}
            <span style={{ color: "#c9a84c" }}>{plannedCount} pianificate</span>
            {" · "}
            <span style={{ color: "#46c08a" }}>{freeCount} libere</span>
          </span>
        </div>

        <div className="sch-body">
          <aside className="queue-col">
            <div className="queue-header">
              <span className="queue-title">Coda di attesa</span>
              <span className="queue-count">{sortedPendingShips.length}</span>
            </div>
            <div className="queue-list">
              {sortedPendingShips.length === 0 ? (
                <div className="queue-empty">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="#4a4a4a" strokeWidth="1.3" strokeLinecap="round">
                    <path d="M3 14l1.5 4.5a2 2 0 0 0 1.9 1.5h11.2a2 2 0 0 0 1.9-1.5L21 14M3 14h18M5 14l1-7h12l1 7M9 7V4h6v3"/>
                  </svg>
                  <div className="empty-title">Nessuna nave in coda</div>
                  <div className="empty-sub">Tutte le navi sono assegnate</div>
                </div>
              ) : (
                sortedPendingShips.map(ship => (
                  <DraggableShipCard
                    key={ship.id}
                    ship={ship}
                    isSelected={selectedShip?.id === ship.id}
                    onSelect={handleShipClick}
                    currentDay={currentDay}
                  />
                ))
              )}
            </div>
          </aside>

          <main className="berths-grid">
            {berthInfos.map((info, i) => {
              const isCompatible = !!(selectedShip && info.size === selectedShip.size)
              const isDimmed     = !!(selectedShip && !isCompatible && !info.active)
              return (
                <DroppableBerthCard
                  key={info.id}
                  berth={{ id: info.id, name: info.name, size: info.size, index: info.index }}
                  active={info.active}
                  inQueue={info.inQueue}
                  nextShip={info.nextShip}
                  isCompatible={isCompatible}
                  isDimmed={isDimmed}
                  currentDay={currentDay}
                  selectedShip={selectedShip}
                  allShips={ships}
                  index={i}
                  onClick={() => handleBerthClick(info)}
                />
              )
            })}
          </main>
        </div>

        <AnimatePresence>
          {confirmModal && (
            <motion.div className="modal-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
            >
              <motion.div className="modal-box"
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-head">
                  <span className="modal-dot" />
                  <span className="modal-kicker">Conferma assegnazione</span>
                </div>
                <div className="modal-compare">
                  <div className="modal-entity">
                    <span className="me-label">NAVE</span>
                    <span className="me-name">{confirmModal.ship.name}</span>
                    <span className="size-chip"
                      style={{ background: s_modal?.bg, border: `1px solid ${s_modal?.border}`, color: s_modal?.color }}>
                      {confirmModal.ship.size}
                    </span>
                  </div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="#5c5c5c" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                  <div className="modal-entity">
                    <span className="me-label">BANCHINA</span>
                    <span className="me-name">{confirmModal.berth.name}</span>
                    <span className="size-chip"
                      style={{ background: b_modal?.bg, border: `1px solid ${b_modal?.border}`, color: b_modal?.color }}>
                      {confirmModal.berth.size}
                    </span>
                  </div>
                </div>
                <div className="modal-grid">
                  <div className="mg-cell">
                    <div className="mg-label">GIORNO INIZIO</div>
                    <div className="mg-val blue">G{confirmModal.startDay}</div>
                  </div>
                  <div className="mg-cell">
                    <div className="mg-label">GIORNO FINE</div>
                    <div className="mg-val">G{confirmModal.endDay}</div>
                  </div>
                  <div className="mg-cell">
                    <div className="mg-label">DURATA</div>
                    <div className="mg-val sm">{confirmModal.ship.occupationDuration} giorni</div>
                  </div>
                  <div className="mg-cell">
                    <div className="mg-label">PROTOCOLLO</div>
                    <div className="mg-val sm muted">PRIMO SLOT</div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setConfirmModal(null)}>Annulla</button>
                  <motion.button className="btn-confirm" onClick={handleConfirm}
                    whileHover={{ background: "#6aa0ff" }} whileTap={{ scale: 0.97 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M5 12l4.5 5L19 6"/>
                    </svg>
                    Conferma Ormeggio
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeShip ? <DragPreview ship={activeShip} /> : null}
      </DragOverlay>
    </DndContext>
  )
}