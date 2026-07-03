// src/services/api.js
// BASE_URL verrà aggiornata in Fase B con la porta di Hussni
const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error
      || (err.errors && Object.values(err.errors).flat().join(" ; "))
      || `Errore HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// NAVI
export const getShips = (status = null) =>
  request(status ? `/ships?status=${status}` : "/ships");
export const createShip = (shipData) =>
  request("/ships", { method: "POST", body: JSON.stringify(shipData) });

// BANCHINE
export const getBerths = () => request("/berths");

// ASSIGNMENTS
export const getAssignments = () => request("/assignments");
export const createAssignment = (shipId, berthId) =>
  request("/assignments", {
    method: "POST",
    body: JSON.stringify({ shipId, berthId }),
  });

// GIORNO VIRTUALE
export const getCurrentDay = () => request("/day");
export const advanceDay = () =>
  request("/advance-day", { method: "POST" });

// RESET
export const resetSystem = () => request("/reset", { method: "POST" });