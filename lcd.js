const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n || 0).toLocaleString("es-CO");
let previewTotal = 0;
let previewCount = 0;

function showEvent(material, points, total, count, dateText, isPreview = false) {
  $("material").textContent = material;
  $("points").textContent = "+" + fmt(points);
  $("total").textContent = fmt(total);
  $("count").textContent = fmt(count);
  $("lastEvent").textContent = dateText || "Evento recibido";
  $("lcdStatus").textContent = isPreview ? "VISTA PREVIA" : "RECICLAJE OK";
  $("lcdStatus").style.color = "#234b1c";
  $("points").animate?.(
    [{ transform: "scale(.88)", opacity: .5 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 300, easing: "ease-out" }
  );
}

function dateLabel(value) {
  if (!value) return "Fecha no disponible";
  try {
    const d = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch { return "Fecha no disponible"; }
}

function normalizeMaterial(evento) {
  const e = String(evento || "").toUpperCase();
  if (e.includes("PLAST")) return "PLÁSTICO";
  if (e.includes("CART")) return "CARTÓN";
  return e || "RECICLAJE";
}

function renderHistory(docs) {
  const host = $("history");
  if (!docs.length) {
    host.className = "empty";
    host.textContent = "Todavía no hay eventos en la colección reciclaje.";
    return;
  }
  host.className = "";
  host.innerHTML = docs.slice(0, 6).map(doc => {
    const d = doc.data();
    const mat = normalizeMaterial(d.evento);
    const pts = Number(d.suma || 0);
    return `<div class="event"><span>${mat} · ${dateLabel(d.fecha)}</span><strong>+${fmt(pts)} pts</strong></div>`;
  }).join("");
}

function startFirebaseListener() {
  if (!window.db) {
    $("connection").textContent = "FIREBASE NO CARGÓ";
    $("lcdStatus").textContent = "SIN CONEXIÓN";
    return;
  }

  $("connection").textContent = "CONECTANDO…";
  window.db.collection("reciclaje")
    .orderBy("fecha", "desc")
    .limit(1000)
    .onSnapshot((snapshot) => {
      $("connection").textContent = "EN TIEMPO REAL";
      $("lcdStatus").textContent = "EN ESPERA";
      if (snapshot.empty) {
        $("material").textContent = "ESPERANDO RECICLAJE";
        $("points").textContent = "+0";
        $("total").textContent = "0";
        $("count").textContent = "0";
        renderHistory([]);
        return;
      }

      const docs = snapshot.docs;
      // "suma" es lo que se ganó en ese evento. "puntos" del Arduino puede ser acumulado.
      const total = docs.reduce((sum, doc) => sum + Number(doc.data().suma || 0), 0);
      const latest = docs[0].data();
      const material = normalizeMaterial(latest.evento);
      const gained = Number(latest.suma || 0);
      showEvent(material, gained, total, docs.length, dateLabel(latest.fecha));
      renderHistory(docs);
    }, (error) => {
      console.error("Error leyendo Firestore:", error);
      $("connection").textContent = "ERROR DE LECTURA";
      $("lcdStatus").textContent = "REVISAR FIREBASE";
      $("history").textContent = "No se pudieron leer los eventos. Revisa las reglas de Firestore y la conexión.";
    });
}

function preview(material, points) {
  previewTotal += points;
  previewCount += 1;
  showEvent(material, points, previewTotal, previewCount, "Prueba local · no se guardó en Firebase", true);
}

$("testPlastic").addEventListener("click", () => preview("PLÁSTICO", 10));
$("testCardboard").addEventListener("click", () => preview("CARTÓN", 15));

startFirebaseListener();
