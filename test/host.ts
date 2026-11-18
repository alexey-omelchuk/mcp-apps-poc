/**
 * Host mínimo de pruebas (simula lo que hace Claude): conecta al servidor MCP por HTTP,
 * llama a `show-nunsys-overview`, carga la UI en un iframe sandbox y hace de puente con AppBridge.
 * Uso: npm run test:host  → abrir http://localhost:5173/test/host.html
 */
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";

const SERVER = new URLSearchParams(location.search).get("server") ?? "http://localhost:3001/mcp";
const logEl = document.getElementById("log")!;
const log = (...a: unknown[]) => {
  logEl.textContent += a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ") + "\n\n";
  (window as any).__hostLog = logEl.textContent;
};

const client = new Client({ name: "test-host", version: "0.0.1" });
await client.connect(new StreamableHTTPClientTransport(new URL(SERVER)));

const { tools } = await client.listTools();
const tool = tools.find((t) => t.name === "show-nunsys-overview")!;
const uri = (tool._meta as any).ui.resourceUri as string;
log("tool con UI:", tool.name, "→", uri);

const res = await client.readResource({ uri });
const html = (res.contents[0] as { text: string }).text;

const iframe = document.getElementById("f") as HTMLIFrameElement;
const bridge = new AppBridge(client, { name: "test-host", version: "0.0.1" }, {
  serverTools: {}, openLinks: {}, logging: {}, updateModelContext: { text: {} }, message: { text: {} },
} as any, { hostContext: { theme: "light", displayMode: "inline" } } as any);

bridge.onmessage = async (p) => { log("📨 ui/message (la UI escribe en el chat):", p); return {}; };
bridge.onupdatemodelcontext = async (p) => { log("🧠 ui/update-model-context:", p); return {}; };
bridge.onloggingmessage = (p) => log("log:", p);

const args = {};
bridge.oninitialized = async () => {
  log("✅ UI inicializada; enviando tool input + result");
  bridge.sendToolInput({ arguments: args });
  const result = await client.callTool({ name: "show-nunsys-overview", arguments: args });
  bridge.sendToolResult(result as any);
};

iframe.srcdoc = html;
await new Promise((r) => iframe.addEventListener("load", r, { once: true }));
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
