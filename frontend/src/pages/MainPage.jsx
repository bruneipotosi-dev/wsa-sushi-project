import { useNavigate } from "react-router-dom"
import portImage from "../assets/port.jpg"
import "./MainPage.scss"


const stats = [
  { label: "Navi in Porto",        value: "08", sub: "/ 8 banchine", icon: "🚢" },
  { label: "Navi in Attesa",       value: "03", sub: "da assegnare", icon: "⏳" },
  { label: "Banchine Disponibili", value: "06", sub: "libere oggi",  icon: "⚓" },
  { label: "Giorno Corrente",      value: "04", sub: "virtuale",     icon: "📅" },
]

export default function MainPage() {
  const navigate = useNavigate()

  return (
    <div className="main-page">

      <nav className="main-nav">
        <div className="nav-logo">
          <span className="nav-logo-icon">⚓</span>
          BlueHarbor
        </div>
        <span className="nav-tag">Sistema Interno</span>
      </nav>

    <section className="main-hero" style={{ backgroundImage: `url(${portImage})` }}>
  <div className="hero-overlay" />
  
  <div className="hero-content">
    <span className="hero-pill">🟢 Sistema Operativo</span>
    <h1>Centro di Controllo<br />delle Operazioni Portuali</h1>
    <p>Gestione efficiente del terminal BlueHarbor.<br />
       Supervisiona, assegna e monitora le navi in porto.</p>
    <div className="hero-actions">
      <button className="hero-btn-primary" onClick={() => navigate("/scheduler")}>
        Inizia Operazione →
      </button>
      <button className="hero-btn-secondary" onClick={() => navigate("/operatore")}>
        Area Operatore
      </button>
    </div>
  </div>

  <div className="hero-stats">
    {stats.map((s) => (
      <div className="hero-stat-card" key={s.label}>
        <span className="hero-stat-label">{s.label}</span>
        <span className="hero-stat-value">{s.value}</span>
        <span className="hero-stat-sub">{s.sub}</span>
      </div>
    ))}
  </div>

</section>

      <div className="main-body">

        <section className="quick-access">
          <h2>Accessi Rapidi</h2>
          <div className="role-cards">

            <div className="role-card" onClick={() => navigate("/operatore")}>
              <div className="role-card-top">
                <div className="role-icon">⚓</div>
                <span className="role-badge">Operatore</span>
              </div>
              <h3>Area Operatore</h3>
              <p>Registra e gestisci le navi nel sistema portuale.</p>
              <button>Entra →</button>
            </div>

            <div className="role-card featured" onClick={() => navigate("/scheduler")}>
              <div className="role-card-top">
                <div className="role-icon">📅</div>
                <span className="role-badge">Scheduler</span>
              </div>
              <h3>Area Scheduler</h3>
              <p>Assegna le navi alle banchine e gestisci i turni.</p>
              <button>Entra →</button>
            </div>

          </div>
        </section>

        <section className="operative-summary">
          <h2>Riepilogo Operativo</h2>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-header">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-icon">{s.icon}</span>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer className="main-footer">
        <span>© 2025 BlueHarbor Logistics — INTERNAL USE ONLY</span>
      </footer>

    </div>
  )
}