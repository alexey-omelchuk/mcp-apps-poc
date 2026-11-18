# POC – MCP Apps (Explorador Nunsys Group)

## Objetivo
Demostrar que un servidor MCP puede devolver **una UI HTML interactiva** (MCP Apps,
extensión oficial de MCP) en lugar de solo texto, y que esa UI puede hablar de vuelta
con el servidor y con el chat.

El tema (un explorador de Nunsys Group con datos públicos de su Memoria 2025) es solo
el ejemplo: lo que se valida es el mecanismo.

## Qué demuestra la POC (checklist)
| Capacidad MCP Apps | Dónde se ve |
|---|---|
| Tool con `_meta.ui.resourceUri` → el host renderiza un iframe | `show-nunsys-overview` |
| Recurso `ui://…` con mimeType `text/html;profile=mcp-app` | `ui://nunsys-explorer/mcp-app.html` |
| El host empuja el resultado del tool a la UI (`ontoolresult`) | Cifras clave + tarjetas iniciales |
| La UI llama a tools del servidor (`callServerTool`) | Filtros, buscador, detalle, marcar interesante |
| Tools solo para la UI (`visibility: ["app"]`) | `get-item-detail`, `toggle-shortlist` |
| La UI escribe en el chat (`sendMessage`) | Botón "Pedir a Claude que me lo explique" |
| La UI actualiza el contexto del modelo (`updateModelContext`) | Al abrir un detalle o marcar como interesante |
| Tema del host (claro/oscuro, variables CSS) | `onhostcontextchanged` |
| Fallback en texto para hosts sin soporte | `content[].text` en cada tool |

## Arquitectura
```
main.ts            -> arranque: HTTP (Streamable HTTP, :3001/mcp) o --stdio
server.ts          -> registra tools + recurso UI (ext-apps/server helpers)
src/data.ts        -> datos de ejemplo (en memoria)
mcp-app.html       -> HTML de la UI
src/mcp-app.ts     -> lógica UI con la clase App (@modelcontextprotocol/ext-apps)
vite (singlefile)  -> empaqueta la UI en un único dist/mcp-app.html
tsc                -> compila el servidor a build/*.js
Docker             -> imagen multi-stage; `docker compose up -d`
```

## Fuera de alcance
Auth, persistencia, conexión a sistemas reales.

## Verificación realizada
Typecheck y build; llamadas JSON-RPC por HTTP y stdio; render real de la UI en un host
de pruebas basado en AppBridge (Playwright) comprobando filtros, búsqueda, detalle,
marcar interesante, `updateModelContext` y `sendMessage`; imagen Docker con healthcheck;
conexión a Claude Desktop vía stdio.
