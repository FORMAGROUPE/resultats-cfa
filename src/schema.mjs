// Correspondance entre les propriétés de la base Notion et les clés utilisées par la page.
// Le nom Notion doit être identique au caractère près (accents, apostrophes droites ').
export const FIELDS = {
  formation:            { notion: "Formation", type: "title" },
  intitule:             { notion: "Intitulé officiel", type: "rich_text" },
  codeRncp:             { notion: "Code RNCP", type: "rich_text" },
  lienRncp:             { notion: "Lien fiche RNCP", type: "url" },
  metiersVises:         { notion: "Métiers visés (fiche RNCP)", type: "rich_text" },
  session:              { notion: "Session", type: "select" },
  publier:              { notion: "Publier", type: "checkbox" },
  ordre:                { notion: "Ordre d'affichage", type: "number" },

  inscrits:             { notion: "Apprentis inscrits", type: "number" },
  contrats:             { notion: "Contrats conclus", type: "number" },
  anneeExamen:          { notion: "Apprentis en année d'examen", type: "number" },
  presentes:            { notion: "Apprentis présentés à l'examen", type: "number" },
  diplomes:             { notion: "Apprentis diplômés", type: "number" },

  abandons:             { notion: "Abandons", type: "number" },
  causesAbandons:       { notion: "Causes des abandons", type: "rich_text" },
  ruptures:             { notion: "Ruptures de contrat", type: "number" },

  satEnvoyes:           { notion: "Questionnaires satisfaction envoyés", type: "number" },
  satRecus:             { notion: "Questionnaires satisfaction reçus", type: "number" },
  satisfaits:           { notion: "Apprentis satisfaits", type: "number" },

  sortants:             { notion: "Sortants", type: "number" },
  repondantsInsertion:  { notion: "Sortants répondants enquête insertion", type: "number" },
  enEmploi:             { notion: "En emploi", type: "number" },
  emploiMetierVise:     { notion: "En emploi dans le métier visé", type: "number" },
  poursuiteEtudes:      { notion: "En poursuite d'études", type: "number" },
  delaiInsertion:       { notion: "Délai enquête insertion", type: "select" },

  heuresPrevues:        { notion: "Heures de formation prévues", type: "number" },
  heuresRealisees:      { notion: "Heures de formation réalisées", type: "number" },

  periode:              { notion: "Période d'observation", type: "rich_text" },
  commentaire:          { notion: "Commentaire public", type: "rich_text" },
};

// Base « formations non diplômantes » (qualifiantes et certifiantes RS / RNCP).
export const FIELDS_ND = {
  formation:            { notion: "Formation", type: "title" },
  type:                 { notion: "Type", type: "select" },
  thematique:           { notion: "Thématique", type: "select" },
  annee:                { notion: "Année", type: "select" },
  publier:              { notion: "Publier", type: "checkbox" },
  ordre:                { notion: "Ordre d'affichage", type: "number" },
  modalite:             { notion: "Modalité", type: "select" },
  codeFiche:            { notion: "Code RS ou RNCP", type: "rich_text" },
  lienFiche:            { notion: "Lien fiche France compétences", type: "url" },
  entres:               { notion: "Stagiaires entrés", type: "number" },
  enCours:              { notion: "Nombre d'inscrits en cours de formation", type: "number", facultatif: true },
  abandons:             { notion: "Abandons", type: "number" },
  causesAbandons:       { notion: "Causes des abandons", type: "rich_text" },
  heuresPrevues:        { notion: "Heures de formation prévues", type: "number" },
  heuresRealisees:      { notion: "Heures de formation réalisées", type: "number" },
  satEnvoyes:           { notion: "Questionnaires satisfaction envoyés", type: "number" },
  satRecus:             { notion: "Questionnaires satisfaction reçus", type: "number" },
  satisfaits:           { notion: "Stagiaires satisfaits", type: "number" },
  noteSatisfaction:     { notion: "Note moyenne satisfaction sur 10", type: "number" },
  inscritsCertif:       { notion: "Candidats inscrits à la certification", type: "number" },
  presentesCertif:      { notion: "Candidats présentés à la certification", type: "number" },
  certifies:            { notion: "Candidats certifiés", type: "number" },
  insertionFiche:       { notion: "Taux insertion global fiche (%)", type: "number" },
  insertionMetierFiche: { notion: "Taux insertion métier visé fiche (%)", type: "number" },
  metiersVises:         { notion: "Métiers visés", type: "rich_text" },
  commentaire:          { notion: "Commentaire public", type: "rich_text" },
};

// Conversion d'une page Notion (réponse API) en objet simple.
export function fromNotionPage(page, fields = FIELDS) {
  const out = { id: page.id, derniereModification: page.last_edited_time, _manquantes: [] };
  for (const [key, def] of Object.entries(fields)) {
    const p = page.properties?.[def.notion];
    if (!p) { out[key] = null; if (!def.facultatif) out._manquantes.push(def.notion); continue; }
    switch (p.type) {
      case "title":
      case "rich_text":
        out[key] = (p[p.type] || []).map(t => t.plain_text).join("").trim() || null; break;
      case "number": out[key] = p.number ?? null; break;
      case "select": out[key] = p.select?.name ?? null; break;
      case "checkbox": out[key] = !!p.checkbox; break;
      case "url": out[key] = p.url ?? null; break;
      case "formula": out[key] = p.formula?.[p.formula.type] ?? null; break;
      default: out[key] = null;
    }
  }
  return out;
}
