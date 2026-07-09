import { Link } from 'react-router-dom';
import './AccessDenied.scss';

export default function AccessDenied({ role }) {
  const handleResetRole = () => {
    localStorage.removeItem('blueharbor-role');
    window.location.href = '/';
  };

  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <div className="icon">⛔</div>
        <h2>Accesso Negato</h2>
        <p>Questa pagina è riservata al ruolo <strong>{role}</strong>.</p>
        <p>Il tuo ruolo attuale non ti permette di accedere a questa sezione.</p>
        <div className="actions">
          <Link to="/" className="btn-home">Torna alla Home</Link>
          <button onClick={handleResetRole} className="btn-change-role">Cambia ruolo</button>
        </div>
      </div>
    </div>
  );
}