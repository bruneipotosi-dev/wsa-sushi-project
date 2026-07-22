import { Link } from 'react-router-dom';
import './AccessDenied.scss';

export default function AccessDenied({ role }) {
  const handleResetRole = () => {
    localStorage.removeItem('blueharbor-role');
    window.location.href = '/';
  };

  return (
    <main className="access-denied">
      <div className="access-denied-content">
        <div className="icon" aria-hidden="true">⛔</div>
        <h1>Accesso negato</h1>
        <p>Questa sezione è riservata al ruolo <strong>{role}</strong>.</p>
        <p>Il tuo ruolo attuale non consente l'accesso a questa sezione.</p>
        <div className="actions">
          <Link to="/" className="btn-home">Torna alla home</Link>
          <button onClick={handleResetRole} className="btn-change-role">Cambia ruolo</button>
        </div>
      </div>
    </main>
  );
}