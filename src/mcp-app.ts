/**
 * UI de la MCP App. Corre dentro de un iframe sandbox en el host (Claude, VS Code…)
 * y se comunica con él por postMessage a través de la clase `App`.
 */
import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/client";
import type { Category, Item } from "./data.ts";
import "./global.css";
import "./mcp-app.css";

const CAT_LABEL: Record<Category, string> = {
  unidad: "Unidad de negocio",
  producto: "Producto propio",
  empresa: "Empresa del grupo",
};

interface Overview {
  kpis: { revenue: string; employees: string; countries: string; clients: string; source: string };
  items: Item[];
  counts: Record<Category, number>;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const mainEl = document.querySelector(".main") as HTMLElement;
const statusLine = $("status-line");
const gridEl = $("grid");
const detailEl = $("detail");
const searchEl = $<HTMLInputElement>("search");
const dStar = $<HTMLButtonElement>("d-star");
const dAsk = $<HTMLButtonElement>("d-ask");

let items: Item[] = [];
let selected: Item | null = null;
let kpisRendered = false;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// ─── Render ──────────────────────────────────────────────────────────────────
function render(data: Overview) {
  items = data.items;

  if (!kpisRendered) {
    const k = data.kpis;
    $("kpis").innerHTML = [
      [k.revenue, "Facturación 2025"],
      [k.employees, "Personas"],
      [k.countries, "Países"],
      [k.clients, "Clientes activos"],
    ]
      .map(([n, l]) => `<div class="kpi"><div class="n">${esc(n)}</div><div class="l">${l}</div></div>`)
      .join("");
    $("kpi-source").textContent = `Fuente: ${k.source}`;
    kpisRendered = true;
  }

  const total = data.counts.unidad + data.counts.producto + data.counts.empresa;
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const c = el.dataset.count as Category | "";
    el.textContent = String(c ? data.counts[c] : total);
  });

  gridEl.innerHTML = items.length
    ? items
        .map(
          (i) => `<button class="card ${selected?.id === i.id ? "selected" : ""}" data-id="${i.id}">
            <span class="top"><span class="pill cat-${i.category}">${CAT_LABEL[i.category]}</span>${i.shortlisted ? '<span class="star">★</span>' : ""}</span>
            <span class="name">${esc(i.name)}</span>
            <span class="sum">${esc(i.summary)}</span>
          </button>`,
        )
        .join("")
    : `<p class="muted">Sin resultados.</p>`;

  statusLine.textContent = `${items.length} resultados`;
}

function renderDetail(i: Item) {
  selected = i;
  detailEl.hidden = false;
  const cat = $("d-cat");
  cat.className = `pill cat-${i.category}`;
  cat.textContent = CAT_LABEL[i.category];
  $("d-title").textContent = i.name;
  $("d-desc").textContent = i.details;
  $("d-tags").innerHTML = i.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  dStar.textContent = i.shortlisted ? "★ Quitar de interesantes" : "☆ Marcar como interesante";
  gridEl.querySelectorAll<HTMLElement>(".card").forEach((c) => c.classList.toggle("selected", c.dataset.id === i.id));
  detailEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function applyResult(result: CallToolResult) {
  const sc = result.structuredContent as Overview | undefined;
  if (sc?.items && sc.kpis) render(sc);
  else statusLine.textContent = "El tool no devolvió datos estructurados";
}

// ─── Host ↔ App ──────────────────────────────────────────────────────────────
function handleHostContextChanged(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
  if (ctx.safeAreaInsets) {
    const { top, right, bottom, left } = ctx.safeAreaInsets;
    mainEl.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
  }
}

const app = new App({ name: "Explorador Nunsys Group", version: "0.2.0" });

// Registrar handlers ANTES de connect()
app.ontoolinput = (params) => console.info("[app] tool input", params);
// El host empuja aquí el resultado de `show-nunsys-overview` cuando lo llama el modelo
app.ontoolresult = (result) => applyResult(result);
app.onhostcontextchanged = handleHostContextChanged;
app.onerror = console.error;
app.onteardown = async () => ({});

/** Cuenta al modelo qué está haciendo el usuario, sin escribir en el chat. */
async function syncModelContext(note: string) {
  const starred = items.filter((i) => i.shortlisted).map((i) => i.name);
  try {
    await app.updateModelContext({
      content: [
        {
          type: "text",
          text: `${note}\nElementos marcados como interesantes por el usuario: ${starred.length ? starred.join(", ") : "ninguno"}.`,
        },
      ],
    });
  } catch (e) {
    console.warn("[app] updateModelContext no soportado/rechazado", e);
  }
}

/** Vuelve a pedir datos al servidor con el filtro y la búsqueda actuales. */
async function refresh() {
  const category = (document.querySelector(".chip.active") as HTMLElement)?.dataset.cat || undefined;
  const query = searchEl.value.trim() || undefined;
  statusLine.textContent = "Cargando…";
  try {
    applyResult(
      await app.callServerTool({
        name: "show-nunsys-overview",
        arguments: { ...(category && { category }), ...(query && { query }) },
      }),
    );
  } catch (e) {
    statusLine.textContent = `Error: ${e}`;
  }
}

// Filtros y búsqueda → la UI llama directamente a un tool del servidor
document.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
    void refresh();
  }),
);
let searchTimer: number | undefined;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(refresh, 300);
});

// Clic en tarjeta → tool solo-app `get-item-detail`
gridEl.addEventListener("click", async (ev) => {
  const id = (ev.target as HTMLElement).closest<HTMLElement>(".card")?.dataset.id;
  if (!id) return;
  const res = await app.callServerTool({ name: "get-item-detail", arguments: { id } });
  const i = (res.structuredContent as { item?: Item })?.item;
  if (i) {
    renderDetail(i);
    void syncModelContext(`El usuario está viendo el detalle de "${i.name}" (${CAT_LABEL[i.category]}).`);
  }
});

$("d-close").addEventListener("click", () => {
  detailEl.hidden = true;
  selected = null;
  gridEl.querySelectorAll(".card").forEach((c) => c.classList.remove("selected"));
});

// Marcar interesante → tool solo-app `toggle-shortlist` + refresco + contexto del modelo
dStar.addEventListener("click", async () => {
  if (!selected) return;
  dStar.disabled = true;
  try {
    const next = !selected.shortlisted;
    const res = await app.callServerTool({ name: "toggle-shortlist", arguments: { id: selected.id, shortlisted: next } });
    const updated = (res.structuredContent as { item?: Item })?.item;
    await refresh();
    if (updated) renderDetail(updated);
    await syncModelContext(`El usuario ha ${next ? "marcado" : "desmarcado"} "${selected.name}" como interesante.`);
  } finally {
    dStar.disabled = false;
  }
});

// Pedir a Claude → la UI escribe un mensaje en el chat como si fuera el usuario
dAsk.addEventListener("click", async () => {
  if (!selected) return;
  const i = selected;
  const { isError } = await app.sendMessage({
    role: "user",
    content: [
      {
        type: "text",
        text: `Explícame de forma sencilla qué es "${i.name}" de Nunsys Group (${CAT_LABEL[i.category].toLowerCase()}): ${i.details} ¿Para qué tipo de cliente o caso de uso tendría sentido?`,
      },
    ],
  });
  statusLine.textContent = isError ? "El host rechazó el mensaje" : "Mensaje enviado al chat ✓";
});

// Conectar con el host
app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) handleHostContextChanged(ctx);
});
