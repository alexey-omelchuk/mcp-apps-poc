/**
 * Datos de ejemplo para la POC, sacados de la información pública de la
 * Memoria 2025 de Nunsys Group (nunsys.com). Solo sirven para la demo:
 * la POC no se conecta a ningún sistema de Nunsys.
 *
 * Se guardan en memoria a nivel de módulo para que sobrevivan entre peticiones
 * HTTP (el servidor HTTP es stateless y crea un McpServer por petición).
 */

export type Category = "unidad" | "producto" | "empresa";

export interface Item {
  id: string;
  name: string;
  category: Category;
  summary: string;
  details: string;
  tags: string[];
  shortlisted: boolean;
}

export const CATEGORIES: Category[] = ["unidad", "producto", "empresa"];

export const KPIS = {
  revenue: "305 M€",
  employees: "2.744",
  countries: "45",
  clients: "+8.500",
  source: "Memoria 2025 de Nunsys Group (datos agregados no consolidados)",
};

const items: Item[] = [
  // ─── Unidades de negocio ─────────────────────────────────────────────
  {
    id: "U-DATA",
    name: "Data & AI",
    category: "unidad",
    summary: "Datos, analítica e inteligencia artificial.",
    details: "Unidad centrada en proyectos de datos, analítica avanzada e IA aplicada a negocio. Trabaja con tecnologías como IBM (Cognos Analytics, Watsonx Orchestrate, Planning Analytics) y Microsoft.",
    tags: ["IA", "datos", "analítica"],
    shortlisted: false,
  },
  {
    id: "U-CIBER",
    name: "Ciberseguridad y Servicios Gestionados",
    category: "unidad",
    summary: "Seguridad y operación gestionada, incluido SOC.",
    details: "Servicios de ciberseguridad y operación gestionada de infraestructuras, con centro de operaciones de seguridad (SOC).",
    tags: ["seguridad", "SOC", "servicios gestionados"],
    shortlisted: false,
  },
  {
    id: "U-CLOUD",
    name: "Cloud",
    category: "unidad",
    summary: "Servicios en la nube y centro de datos propio.",
    details: "Migraciones y servicios cloud (por ejemplo, migraciones a Azure) y operación del centro de datos propio Nunsys Cloud.",
    tags: ["cloud", "Azure", "CPD"],
    shortlisted: false,
  },
  {
    id: "U-SAP",
    name: "SAP",
    category: "unidad",
    summary: "Soluciones sobre el ecosistema SAP.",
    details: "Implantación y soluciones sobre SAP, con soluciones sectoriales propias como Sothis4/Farma y Sothis4/PYMES. Partner Platinum a través de United VARs.",
    tags: ["ERP", "SAP"],
    shortlisted: false,
  },
  {
    id: "U-MSFT",
    name: "Microsoft",
    category: "unidad",
    summary: "Soluciones sobre tecnología Microsoft.",
    details: "Más de 20 años de relación con Microsoft y las 8 designaciones avanzadas completadas, incluida la Especialización Avanzada en Seguridad en la Nube.",
    tags: ["Microsoft", "Dynamics", "Azure"],
    shortlisted: false,
  },
  {
    id: "U-IND",
    name: "Industria Digital",
    category: "unidad",
    summary: "Digitalización de procesos industriales.",
    details: "Proyectos de digitalización de planta y procesos industriales, con socios como Siemens Digital Industries Software.",
    tags: ["industria", "OT"],
    shortlisted: false,
  },
  {
    id: "U-SALUD",
    name: "Salud",
    category: "unidad",
    summary: "Tecnología para el sector sanitario.",
    details: "Soluciones tecnológicas para hospitales y sanidad, incluida la alianza con Dedalus para historia clínica digital.",
    tags: ["sanidad", "HCE"],
    shortlisted: false,
  },
  {
    id: "U-AV",
    name: "Audiovisuales",
    category: "unidad",
    summary: "Integración audiovisual y pantallas.",
    details: "Proyectos audiovisuales singulares como la integración del Roig Arena o el mapping 3D de la Escalera Dorada de la Catedral de Burgos.",
    tags: ["audiovisual", "experiencias"],
    shortlisted: false,
  },
  {
    id: "U-COM",
    name: "Comunicaciones",
    category: "unidad",
    summary: "Redes y comunicaciones unificadas.",
    details: "Redes, comunicaciones unificadas y telefonía, reforzada en 2025 con las incorporaciones de Kaizen Networks e InforTel.",
    tags: ["redes", "UC"],
    shortlisted: false,
  },
  {
    id: "U-DEV",
    name: "Desarrollo",
    category: "unidad",
    summary: "Desarrollo de software a medida.",
    details: "Desarrollo de aplicaciones y software a medida para clientes de distintos sectores.",
    tags: ["software", "desarrollo"],
    shortlisted: false,
  },

  // ─── Productos propios ───────────────────────────────────────────────
  {
    id: "P-VEKAI",
    name: "VEKAI",
    category: "producto",
    summary: "Plataforma de IA privada para empresas.",
    details: "Plataforma de inteligencia artificial privada que se entrena con la documentación y los procesos de cada empresa.",
    tags: ["IA", "IA privada", "producto propio"],
    shortlisted: false,
  },
  {
    id: "P-HAPPY",
    name: "Happÿdonia",
    category: "producto",
    summary: "Comunicación interna y gestión de personas.",
    details: "Plataforma de comunicación interna, gestión de personas y motivación, con más de 200.000 usuarios.",
    tags: ["RRHH", "comunicación interna"],
    shortlisted: false,
  },
  {
    id: "P-BOR",
    name: "BatOnRoute",
    category: "producto",
    summary: "Optimización de rutas de transporte escolar y autobuses.",
    details: "Software de optimización de rutas de transporte escolar y de autobuses, presente en más de 25 países. Más de 1.000 nuevas rutas en 2025.",
    tags: ["transporte", "rutas"],
    shortlisted: false,
  },
  {
    id: "P-SIRENA",
    name: "SIRENA",
    category: "producto",
    summary: "Ciberseguridad para entornos TI y OT.",
    details: "Plataforma de ciberseguridad integrada con Nozomi Networks para proteger entornos TI y OT.",
    tags: ["seguridad", "OT"],
    shortlisted: false,
  },
  {
    id: "P-WMS",
    name: "WMS Mobile by Nunsys",
    category: "producto",
    summary: "Gestión de almacén móvil sobre Business Central.",
    details: "Sistema de gestión de almacén móvil sobre Microsoft Dynamics 365 Business Central.",
    tags: ["logística", "Dynamics"],
    shortlisted: false,
  },
  {
    id: "P-CLOUD",
    name: "Nunsys Cloud",
    category: "producto",
    summary: "Centro de datos propio.",
    details: "Centro de datos propio de 450 m² y 1,5 MW, en ampliación a 3 MW. Mantuvo la continuidad durante el apagón nacional de 2025.",
    tags: ["CPD", "cloud"],
    shortlisted: false,
  },

  // ─── Empresas del grupo ──────────────────────────────────────────────
  {
    id: "E-SOTHIS",
    name: "Sothis by Nunsys Group",
    category: "empresa",
    summary: "Soluciones de negocio, con foco en SAP.",
    details: "Empresa del grupo especializada en soluciones de negocio, con productos como Sothis4/Farma, Sothis4/PYMES y Sothis Concrete.",
    tags: ["SAP", "ERP"],
    shortlisted: false,
  },
  {
    id: "E-INYCOM",
    name: "Inycom by Nunsys Group",
    category: "empresa",
    summary: "Empresa tecnológica del grupo con sede en Zaragoza.",
    details: "Empresa integrada en el grupo, con presencia en Zaragoza.",
    tags: ["grupo"],
    shortlisted: false,
  },
  {
    id: "E-ESFERA",
    name: "Esfera Ingeniería by Nunsys Group",
    category: "empresa",
    summary: "Ingeniería.",
    details: "Empresa de ingeniería integrada en el grupo.",
    tags: ["ingeniería"],
    shortlisted: false,
  },
  {
    id: "E-EDTECH",
    name: "Nunsys EdTech Solutions",
    category: "empresa",
    summary: "Soluciones para el sector educativo.",
    details: "Empresa del grupo dedicada a soluciones tecnológicas para educación.",
    tags: ["educación"],
    shortlisted: false,
  },
  {
    id: "E-KAIZEN",
    name: "Kaizen Networks",
    category: "empresa",
    summary: "Comunicaciones unificadas (Madrid). Incorporada en 2025.",
    details: "Especialista en comunicaciones unificadas con sede en Madrid, adquirida en 2025.",
    tags: ["UC", "adquisición 2025"],
    shortlisted: false,
  },
  {
    id: "E-GISPERT",
    name: "Gispert Business",
    category: "empresa",
    summary: "Impresión y gestión documental (Murcia). Incorporada en 2025.",
    details: "Empresa de impresión y gestión documental con sede en Murcia, adquirida en 2025.",
    tags: ["documental", "adquisición 2025"],
    shortlisted: false,
  },
];

export function listItems(filter?: { category?: Category; query?: string }): Item[] {
  const q = filter?.query?.trim();
  // Busca palabras completas (así "IA" no coincide con "relación")
  const re = q
    ? new RegExp(`(^|[^\\p{L}\\p{N}])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "iu")
    : null;
  return items
    .filter((i) => !filter?.category || i.category === filter.category)
    .filter((i) => !re || [i.name, i.summary, i.details, ...i.tags].some((s) => re.test(s)));
}

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}

export function setShortlisted(id: string, shortlisted: boolean): Item | undefined {
  const i = getItem(id);
  if (i) i.shortlisted = shortlisted;
  return i;
}

export function countByCategory(list: Item[]): Record<Category, number> {
  const out: Record<Category, number> = { unidad: 0, producto: 0, empresa: 0 };
  for (const i of list) out[i.category]++;
  return out;
}
