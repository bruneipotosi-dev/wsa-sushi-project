import { useNavigate } from "react-router-dom"
import { User, CalendarDays, ArrowRight } from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"
import "./MainPage.scss"

export default function MainPage({ onRoleSelect }) {
  const navigate = useNavigate()

  const handleRoleClick = (role) => {
    onRoleSelect?.(role)
    navigate(role === "Operatore" ? "/operatore" : "/scheduler")
  }

  return (
    <div className="main-page">
      {/* ambient background */}
      <div className="bh-ambient" />
      <div className="bh-vignette" />

      <div className="bh-theme-toggle-slot">
        <ThemeToggle />
      </div>

      <main className="bh-hero">
        <div className="bh-eyebrow">
          <span className="bh-eyebrow-line" />
          <span>Centro Operativo Portuale</span>
          <span className="bh-eyebrow-line" />
        </div>

        <h1 className="bh-title">
          Benvenuto nella tua <span className="bh-title-accent">dashboard</span>
        </h1>
        <p className="bh-subtitle">
          Seleziona il tuo ruolo per entrare nel terminale BlueHarbor
          e iniziare le operazioni del giorno.
        </p>

        <div className="bh-role-grid">
          <button
            type="button"
            className="bh-role-card bh-role-card--operatore"
            onClick={() => handleRoleClick("Operatore")}
          >
            <span className="bh-role-top-line" />
            <User className="bh-role-icon-ghost" strokeWidth={0.6} aria-hidden="true" />
            <span className="bh-role-icon-badge">
              <User size={28} strokeWidth={1.7} />
            </span>
            <span className="bh-role-name">Operatore</span>
            <span className="bh-role-cta">
              Entra <ArrowRight size={16} />
            </span>
          </button>

          <button
            type="button"
            className="bh-role-card bh-role-card--scheduler"
            onClick={() => handleRoleClick("Scheduler")}
          >
            <span className="bh-role-top-line" />
            <CalendarDays className="bh-role-icon-ghost" strokeWidth={0.6} aria-hidden="true" />
            <span className="bh-role-icon-badge">
              <CalendarDays size={28} strokeWidth={1.7} />
            </span>
            <span className="bh-role-name">Scheduler</span>
            <span className="bh-role-cta">
              Entra <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </main>

      <footer className="bh-footer">
        <span>© 2025 BlueHarbor Terminal — Centro Operativo Portuale</span>
      </footer>
    </div>
  )
}