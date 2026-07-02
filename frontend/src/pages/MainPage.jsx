import { useNavigate } from "react-router-dom"
import portImage from "../assets/port.jpg"
import "./MainPage.scss"
import { Anchor, CalendarDays } from "lucide-react"
import starsImage from "../assets/msc.logo.png"


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

    <section className="main-hero" style={{ backgroundImage: `url(${portImage})` }}>
  <div className="hero-overlay" />
    <img className="hero-decoration" src={starsImage} alt="" />
  
  <div className="hero-content">
    <span className="hero-pill">🟢 Sistema Operativo</span>
    <h1>Centro di Controllo<br />delle Operazioni Portuali</h1>
    <p>Gestione efficiente del terminal BlueHarbor.<br />
       Supervisiona, assegna e monitora le navi in porto.</p>
    <div className="hero-actions">
  <button className="hero-btn-primary" onClick={() => navigate("/scheduler")}>
    <CalendarDays size={20} />
    Inizia Operazione
  </button>
  <button className="hero-btn-secondary" onClick={() => navigate("/operatore")}>
    <Anchor size={20} />
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

      <footer className="main-footer">
        <span>© 2025 BlueHarbor Logistics — INTERNAL USE ONLY</span>
      </footer>

    </div>
  )
}