// Définition des indicateurs publiés : libellé, calcul, source.
// Ces textes alimentent à la fois l'affichage et la section « Méthodologie » (exigence indicateur 2, guide V10).
export const INDICATEURS = [
  { k: "satisfaction", label: "Taux de satisfaction des apprentis", num: "satisfaits", den: "satRecus",
    calcul: "Apprentis se déclarant satisfaits ou très satisfaits ÷ questionnaires de satisfaction reçus",
    source: "Enquête de satisfaction du CFA (données déclaratives)", unite: "répondants" },
  { k: "retourSat", label: "Taux de retour des enquêtes de satisfaction", num: "satRecus", den: "satEnvoyes",
    calcul: "Questionnaires de satisfaction reçus ÷ questionnaires envoyés",
    source: "Enquête de satisfaction du CFA", unite: "questionnaires" },
  { k: "presentation", label: "Taux de présentation à l'examen", num: "presentes", den: "anneeExamen",
    calcul: "Apprentis présentés à l'examen ÷ apprentis inscrits en année d'examen",
    source: "Convocations et listes officielles des candidats", unite: "apprentis" },
  { k: "nonPresentation", label: "Taux de non-présentation à l'examen", complementDe: "presentation",
    calcul: "(Apprentis en année d'examen − apprentis présentés) ÷ apprentis en année d'examen",
    source: "Convocations et listes officielles des candidats", unite: "apprentis" },
  { k: "obtention", label: "Taux d'obtention du diplôme", num: "diplomes", den: "presentes",
    calcul: "Apprentis diplômés ÷ apprentis présentés à l'examen (à lire avec le taux de présentation)",
    source: "Relevés officiels des résultats d'examen", unite: "présentés" },
  { k: "interruption", label: "Taux d'abandon (interruption en cours de formation)", num: "abandons", den: "inscrits",
    calcul: "Apprentis ayant quitté la formation avant son terme ÷ apprentis inscrits sur la session",
    source: "Dossiers apprentis du CFA", unite: "apprentis" },
  { k: "rupture", label: "Taux de rupture des contrats d'apprentissage", num: "ruptures", den: "contrats",
    calcul: "Contrats d'apprentissage rompus avant leur terme ÷ contrats conclus sur la session",
    source: "Contrats d'apprentissage et notifications de rupture", unite: "contrats" },
  { k: "realisation", label: "Taux de réalisation des heures de formation", num: "heuresRealisees", den: "heuresPrevues",
    calcul: "Heures de formation réalisées ÷ heures de formation prévues au calendrier contractualisé ; en formation à distance asynchrone, les heures réalisées sont appréciées au regard de la progression dans le parcours",
    source: "Plateforme de formation (suivi de progression) et feuilles d'émargement des classes virtuelles", unite: "heures", heures: true },
  { k: "insertion", label: "Taux d'insertion dans l'emploi", num: "enEmploi", den: "repondantsInsertion",
    calcul: "Sortants en emploi à la date de l'enquête ÷ sortants ayant répondu à l'enquête d'insertion",
    source: "Enquête d'insertion du CFA auprès des sortants (données déclaratives)", unite: "répondants" },
  { k: "metierVise", label: "Taux d'insertion dans le métier visé (fiche RNCP)", num: "emploiMetierVise", den: "repondantsInsertion",
    calcul: "Sortants en emploi sur un métier visé par la fiche RNCP de la certification ÷ sortants ayant répondu à l'enquête d'insertion",
    source: "Enquête d'insertion du CFA ; métiers visés : fiche RNCP de France compétences", unite: "répondants" },
  { k: "poursuite", label: "Taux de poursuite d'études", num: "poursuiteEtudes", den: "repondantsInsertion",
    calcul: "Sortants inscrits dans une formation de niveau égal ou supérieur ÷ sortants ayant répondu à l'enquête d'insertion",
    source: "Enquête d'insertion du CFA (données déclaratives)", unite: "répondants" },
  { k: "retourInsertion", label: "Taux de retour de l'enquête d'insertion", num: "repondantsInsertion", den: "sortants",
    calcul: "Sortants ayant répondu à l'enquête d'insertion ÷ sortants de la session",
    source: "Enquête d'insertion du CFA", unite: "sortants" },
];

export const byKey = Object.fromEntries(INDICATEURS.map(i => [i.k, i]));

// Calcule un taux pour une ou plusieurs lignes (agrégation par somme des numérateurs et dénominateurs).
export function taux(lignes, ind) {
  if (ind.complementDe) {
    const base = taux(lignes, byKey[ind.complementDe]);
    return base ? { num: base.den - base.num, den: base.den, valeur: 1 - base.valeur } : null;
  }
  let num = 0, den = 0, n = 0;
  for (const l of lignes) {
    if (typeof l[ind.num] === "number" && typeof l[ind.den] === "number" && l[ind.den] > 0) {
      num += l[ind.num]; den += l[ind.den]; n++;
    }
  }
  return n ? { num, den, valeur: num / den } : null;
}

export function somme(lignes, champ) {
  const v = lignes.map(l => l[champ]).filter(x => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) : null;
}

// « Cause : 3 » par ligne (ou séparées par « ; »). Une cause sans nombre compte pour 1.
export function parseCauses(texte) {
  if (!texte) return [];
  return texte.split(/\n|;/).map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^(.*?)[\s:–-]+(\d+)\s*$/);
    return m ? { cause: m[1].trim(), n: Number(m[2]) } : { cause: s, n: 1 };
  });
}

// Formations non diplômantes (qualifiantes et certifiantes) – indicateur 2 et, pour les certifiantes, indicateur 3.
export const INDICATEURS_ND = [
  { k: "satisfaction", label: "Taux de satisfaction des stagiaires", num: "satisfaits", den: "satRecus",
    calcul: "Stagiaires se déclarant satisfaits ou très satisfaits ÷ questionnaires de satisfaction reçus",
    source: "Questionnaire de fin de formation (données déclaratives)", unite: "répondants" },
  { k: "retourSat", label: "Taux de retour des questionnaires", num: "satRecus", den: "satEnvoyes",
    calcul: "Questionnaires de satisfaction reçus ÷ questionnaires envoyés",
    source: "Questionnaire de fin de formation", unite: "questionnaires" },
  { k: "realisation", label: "Taux de réalisation des heures de formation", num: "heuresRealisees", den: "heuresPrevues",
    calcul: "Heures réalisées ÷ heures prévues ; en e-learning asynchrone, les heures réalisées sont appréciées au regard de la progression de chaque stagiaire dans le parcours",
    source: "Plateforme de formation (suivi de progression)", unite: "heures", heures: true },
  { k: "abandon", label: "Taux d'abandon", num: "abandons", den: "entres",
    calcul: "Stagiaires ayant arrêté avant la fin du parcours ÷ stagiaires entrés en formation",
    source: "Suivi administratif des parcours", unite: "stagiaires" },
  { k: "presentation", label: "Taux de présentation à la certification", num: "presentesCertif", den: "inscritsCertif",
    calcul: "Candidats présentés à l'épreuve de certification ÷ candidats inscrits à la certification (formations certifiantes)",
    source: "Listes de passage transmises au certificateur", unite: "candidats" },
  { k: "nonPresentation", label: "Taux de non-présentation à la certification", complementDe: "presentation",
    calcul: "(Candidats inscrits − candidats présentés) ÷ candidats inscrits à la certification",
    source: "Listes de passage transmises au certificateur", unite: "candidats" },
  { k: "obtention", label: "Taux d'obtention de la certification", num: "certifies", den: "presentesCertif",
    calcul: "Candidats certifiés ÷ candidats présentés (à lire avec le taux de présentation)",
    source: "Résultats communiqués par le certificateur", unite: "présentés" },
];
INDICATEURS_ND.forEach(i => { if (i.complementDe) i.complementDe = "nd:" + i.complementDe; });
for (const i of INDICATEURS_ND) byKey["nd:" + i.k] = i;
