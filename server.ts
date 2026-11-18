/**
 * Servidor MCP con una MCP App.
 *
 * Patrón MCP Apps = 2 primitivas unidas por una URI `ui://`:
 *   1. Un TOOL que declara `_meta.ui.resourceUri` → el host sabe que tiene UI.
 *   2. Un RESOURCE en esa URI que devuelve el HTML (mimeType text/html;profile=mcp-app).
 * El host renderiza el HTML en un iframe sandbox y le pasa el resultado del tool.
 */
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import {
  McpServer,
  type CallToolResult,
  type ReadResourceResult,
} from "@modelcontextprotocol/server";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  CATEGORIES,
  countByCategory,
  getItem,
  KPIS,
  listItems,
  setShortlisted,
  type Item,
} from "./src/data.js";

// Funciona tanto desde el fuente (./server.ts con tsx) como compilado (./build/server.js).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.basename(HERE) === "build" ? path.dirname(HERE) : HERE;
const UI_HTML_PATH = path.join(ROOT, "dist", "mcp-app.html");

export const RESOURCE_URI = "ui://nunsys-explorer/mcp-app.html";

const CATEGORY_LABEL = { unidad: "Unidad de negocio", producto: "Producto propio", empresa: "Empresa del grupo" };

const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(CATEGORIES),
  summary: z.string(),
  details: z.string(),
  tags: z.array(z.string()),
  shortlisted: z.boolean(),
});

/** Fallback en texto plano para hosts que no soportan MCP Apps (y para el modelo). */
function itemsAsText(list: Item[]): string {
  if (list.length === 0) return "No hay resultados con esos filtros.";
  return list.map((i) => `- ${i.name} [${CATEGORY_LABEL[i.category]}]: ${i.summary}`).join("\n");
}

export function createServer(): McpServer {
  const server = new McpServer({ name: "mcp-apps-poc", version: "0.2.0" });

  // ─── 1. Tool principal (visible para el modelo) con UI ────────────────────
  registerAppTool(
    server,
    "show-nunsys-overview",
    {
      title: "Explorar Nunsys Group",
      description:
        "Muestra un explorador interactivo de Nunsys Group: cifras clave, unidades de negocio, productos propios " +
        "(como VEKAI, Happÿdonia o BatOnRoute) y empresas del grupo. Permite filtrar por categoría o buscar por texto. " +
        "Úsalo cuando el usuario pregunte qué es o qué hace Nunsys, sus soluciones, productos o empresas.",
      inputSchema: z.object({
        category: z.enum(CATEGORIES).optional().describe("Filtrar: unidad, producto o empresa"),
        query: z.string().optional().describe("Texto a buscar (p. ej. 'IA', 'SAP', 'sanidad')"),
      }),
      outputSchema: z.object({
        kpis: z.object({
          revenue: z.string(),
          employees: z.string(),
          countries: z.string(),
          clients: z.string(),
          source: z.string(),
        }),
        items: z.array(itemSchema),
        counts: z.object({ unidad: z.number(), producto: z.number(), empresa: z.number() }),
        filter: z.object({ category: z.enum(CATEGORIES).optional(), query: z.string().optional() }),
      }),
      _meta: { ui: { resourceUri: RESOURCE_URI } }, // ← esto es lo que lo convierte en MCP App
    },
    async ({ category, query }): Promise<CallToolResult> => {
      const list = listItems({ category, query });
      return {
        content: [
          {
            type: "text",
            text:
              `Nunsys Group: ${KPIS.revenue} de facturación, ${KPIS.employees} personas, ${KPIS.countries} países, ${KPIS.clients} clientes (${KPIS.source}).\n` +
              `${list.length} resultados:\n${itemsAsText(list)}`,
          },
        ],
        // Los contadores de los filtros cuentan todas las categorías (respetando la búsqueda)
        structuredContent: { kpis: KPIS, items: list, counts: countByCategory(listItems({ query })), filter: { category, query } },
      };
    },
  );

  // ─── 2. Tools solo para la UI (visibility: ["app"]) ───────────────────────
  // El modelo no las ve; la UI las llama con app.callServerTool().
  registerAppTool(
    server,
    "get-item-detail",
    {
      title: "Detalle de un elemento",
      description: "Devuelve el detalle de una unidad, producto o empresa por ID (usado por la UI).",
      inputSchema: z.object({ id: z.string() }),
      _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["app"] } },
    },
    async ({ id }): Promise<CallToolResult> => {
      const i = getItem(id);
      if (!i) return { isError: true, content: [{ type: "text", text: `No existe ${id}` }] };
      return {
        content: [{ type: "text", text: `${i.name} (${CATEGORY_LABEL[i.category]})\n${i.details}` }],
        structuredContent: { item: i },
      };
    },
  );

  registerAppTool(
    server,
    "toggle-shortlist",
    {
      title: "Marcar como interesante",
      description: "Añade o quita un elemento de la lista de interés del usuario (usado por la UI).",
      inputSchema: z.object({ id: z.string(), shortlisted: z.boolean() }),
      _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["app"] } },
    },
    async ({ id, shortlisted }): Promise<CallToolResult> => {
      const i = setShortlisted(id, shortlisted);
      if (!i) return { isError: true, content: [{ type: "text", text: `No existe ${id}` }] };
      return {
        content: [{ type: "text", text: `${i.name} → ${shortlisted ? "marcado" : "desmarcado"}` }],
        structuredContent: { item: i },
      };
    },
  );

  // ─── 3. Recurso UI: el HTML empaquetado (vite singlefile) ─────────────────
  registerAppResource(
    server,
    "Explorador Nunsys Group",
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE, description: "Explorador interactivo de Nunsys Group" },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(UI_HTML_PATH, "utf-8");
      return { contents: [{ uri: RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html }] };
    },
  );

  return server;
}
