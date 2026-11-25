// Récupère les lignes publiées des bases Notion et écrit data/resultats.json.
// Variables d'environnement :
//   NOTION_TOKEN                        secret de l'intégration Notion
//   NOTION_DATABASE_ID                  base « Résultats CFA » (apprentissage)
//   NOTION_DATABASE_ID_NON_DIPLOMANTES  base « formations non diplômantes » (facultative)
import { writeFile, mkdir } from "node:fs/promises";
import { FIELDS, FIELDS_ND, fromNotionPage } from "../src/schema.mjs";

const token = process.env.NOTION_TOKEN;
const idOf = v => (v || "").replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0];
const dbCfa = idOf(process.env.NOTION_DATABASE_ID);
const dbNd = idOf(process.env.NOTION_DATABASE_ID_NON_DIPLOMANTES);
if (!token || !dbCfa) {
  console.error("NOTION_TOKEN et NOTION_DATABASE_ID sont requis.");
  process.exit(1);
}

async function notion(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion ${res.status} : ${await res.text()}`);
  return res.json();
}

async function lire(dbId, fields, nom) {
  const rows = [];
  let cursor;
  do {
    const r = await notion(`databases/${dbId}/query`, {
      page_size: 100,
      start_cursor: cursor,
      filter: { property: fields.publier.notion, checkbox: { equals: true } },
    });
    rows.push(...r.results.map(p => fromNotionPage(p, fields)));
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  // Contrôle : propriété absente de la base (colonne renommée).
  const manquantes = [...new Set(rows.flatMap(r => r._manquantes))];
  if (manquantes.length) console.warn(`${nom} : colonnes introuvables dans Notion → ${manquantes.join(", ")}`);
  rows.forEach(r => delete r._manquantes);
  console.log(`${nom} : ${rows.length} ligne(s) publiée(s).`);
  return rows;
}

const lignes = await lire(dbCfa, FIELDS, "Apprentissage");
const nonDiplomantes = dbNd ? await lire(dbNd, FIELDS_ND, "Non diplômantes") : [];

await mkdir("data", { recursive: true });
await writeFile("data/resultats.json", JSON.stringify({ extraitLe: new Date().toISOString(), lignes, nonDiplomantes }, null, 2));
