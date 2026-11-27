// Génère dist/index.html à partir de data/resultats.json et config.json.
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { head, nav, footer } from "../src/layout.mjs";
import { INDICATEURS, INDICATEURS_ND, byKey, taux, somme, parseCauses } from "../src/indicateurs.mjs";

const config = JSON.parse(await readFile("config.json", "utf8"));
const source = process.argv[2] || "data/resultats.json";
const data = JSON.parse(await readFile(source, "utf8"));
const SEUIL = config.seuilEffectifReduit ?? 10;

// ---------- utilitaires ----------
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nb = n => Number(n).toLocaleString("fr-FR");
const pct = v => `${(Math.round(v * 1000) / 10).toLocaleString("fr-FR")} %`;
const dateFr = iso => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
const ND = `<span class="rc-nd">Donnée non disponible</span>`;
const slug = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function detail(t, ind) {
  if (!t) return "";
  const txt = ind.heures ? `${nb(t.num)} h réalisées sur ${nb(t.den)} h prévues` : `${nb(t.num)} sur ${nb(t.den)} ${ind.unite}`;
  const petit = !ind.heures && t.den < SEUIL ? ` <abbr class="rc-petit" title="Effectif inférieur à ${SEUIL} : taux à interpréter avec prudence">*</abbr>` : "";
  return `${txt}${petit}`;
}

const lignes = (data.lignes || []).filter(l => l.publier !== false && l.formation);
const sessions = [...new Set(lignes.map(l => l.session || "Session non renseignée"))].sort().reverse();
const nd = (data.nonDiplomantes || []).filter(l => l.publier !== false && l.formation);
const annees = [...new Set(nd.map(l => l.annee || "Année non renseignée"))].sort().reverse();
const majIso = [...lignes, ...nd].map(l => l.derniereModification).filter(Boolean).sort().pop() || data.extraitLe || new Date().toISOString();

// ---------- blocs ----------
function tuile(valeur, label, sous) {
  return `<div class="col-lg-3 col-md-4 col-sm-6"><div class="rc-kpi"><div class="rc-kpi-val">${valeur}</div><div class="rc-kpi-label">${label}</div>${sous ? `<div class="rc-kpi-sub">${sous}</div>` : ""}</div></div>`;
}

function tuileTaux(ls, k, label) {
  const ind = byKey[k]; const t = taux(ls, ind);
  return tuile(t ? pct(t.valeur) : "–", label || ind.label, t ? detail(t, ind) : "Donnée non disponible");
}

function chiffresCles(ls, session) {
  const inscrits = somme(ls, "inscrits");
  const delais = [...new Set(ls.map(l => l.delaiInsertion).filter(Boolean))];
  const delai = delais.length === 1 ? ` à ${delais[0]}` : "";
  return `
    <div class="funfacts-and-feedback-area bg-maincolor ptb-100 rc-cles">
        <div class="container">
            <div class="section-title text-center">
                <h2><span style="color:#FFDE59;">Chiffres clés</span><br>Ensemble du CFA – session ${esc(session)}</h2>
            </div>
            <div class="row pt-40">
                ${tuile(inscrits != null ? nb(inscrits) : "–", "Apprentis formés", `${ls.length} formation${ls.length > 1 ? "s" : ""}`)}
                ${tuileTaux(ls, "satisfaction")}
                ${tuileTaux(ls, "obtention")}
                ${tuile(somme(ls, "presentes") != null ? nb(somme(ls, "presentes")) : "–", "Apprentis présentés aux examens", (() => { const t = taux(ls, byKey.presentation); return t ? `Taux de présentation : ${pct(t.valeur)}` : ""; })())}
                ${tuileTaux(ls, "insertion", `Taux d'insertion dans l'emploi${delai}`)}
                ${tuileTaux(ls, "metierVise", `Insertion dans le métier visé${delai}`)}
                ${tuileTaux(ls, "poursuite")}
                ${tuileTaux(ls, "interruption", "Taux d'abandon")}
                ${tuileTaux(ls, "rupture")}
                ${tuileTaux(ls, "realisation")}
                ${tuileTaux(ls, "retourSat")}
                ${tuileTaux(ls, "retourInsertion")}
            </div>
        </div>
    </div>`;
}

function ligneInd(l, k, label) {
  const ind = byKey[k]; const t = taux([l], ind);
  return `<tr><th scope="row">${label || ind.label}</th><td class="rc-val">${t ? pct(t.valeur) : ND}</td><td class="rc-det">${t ? detail(t, ind) : ""}</td></tr>`;
}

function causesHtml(causes, titre) {
  if (!causes.length) return "";
  const agg = {};
  causes.forEach(c => { agg[c.cause] = (agg[c.cause] || 0) + c.n; });
  const tot = Object.values(agg).reduce((a, b) => a + b, 0);
  const items = Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([c, n]) =>
    `<li><span class="rc-cause-lib">${esc(c)}</span><span class="rc-bar"><span style="width:${Math.round(n / tot * 100)}%"></span></span><span class="rc-cause-n">${nb(n)} (${pct(n / tot)})</span></li>`).join("");
  return `<div class="rc-causes"><h4>${titre}</h4><ul>${items}</ul></div>`;
}

function carteFormation(l) {
  const metiers = (l.metiersVises || "").split(/\n|;/).map(s => s.trim()).filter(Boolean);
  const effectifs = [
    ["Apprentis inscrits", l.inscrits], ["Contrats d'apprentissage conclus", l.contrats],
    ["Apprentis en année d'examen", l.anneeExamen], ["Apprentis présentés à l'examen", l.presentes], ["Apprentis diplômés", l.diplomes],
  ].map(([lab, v]) => `<tr><th scope="row">${lab}</th><td class="rc-val">${v != null ? nb(v) : ND}</td><td></td></tr>`).join("");
  return `
        <article class="rc-formation" id="${slug(l.formation + "-" + (l.session || ""))}">
            <header class="rc-formation-head">
                <h3>${esc(l.formation)}</h3>
                ${l.intitule ? `<p class="rc-intitule">${esc(l.intitule)}</p>` : ""}
                <p class="rc-meta">${l.codeRncp ? (l.lienRncp ? `<a href="${esc(l.lienRncp)}" target="_blank" rel="noopener">${esc(l.codeRncp)} <i class="bx bx-link-external"></i></a>` : esc(l.codeRncp)) : ""}${l.periode ? ` · Période d'observation : ${esc(l.periode)}` : ""}</p>
            </header>
            <div class="row">
                <div class="col-lg-6">
                    <table class="rc-table"><caption>Effectifs et examens</caption><tbody>
                        ${effectifs}
                        ${ligneInd(l, "presentation")}
                        ${ligneInd(l, "nonPresentation")}
                        ${ligneInd(l, "obtention")}
                    </tbody></table>
                    <table class="rc-table"><caption>Déroulement de la formation</caption><tbody>
                        ${ligneInd(l, "realisation")}
                        ${ligneInd(l, "interruption", "Taux d'abandon")}
                        ${ligneInd(l, "rupture")}
                    </tbody></table>
                </div>
                <div class="col-lg-6">
                    <table class="rc-table"><caption>Satisfaction</caption><tbody>
                        ${ligneInd(l, "satisfaction")}
                        ${ligneInd(l, "retourSat")}
                    </tbody></table>
                    <table class="rc-table"><caption>Devenir des apprentis${l.delaiInsertion ? ` à ${esc(l.delaiInsertion)}` : ""}</caption><tbody>
                        ${ligneInd(l, "insertion")}
                        ${ligneInd(l, "metierVise")}
                        ${ligneInd(l, "poursuite")}
                        ${ligneInd(l, "retourInsertion")}
                    </tbody></table>
                    <div class="rc-metiers"><h4>Emplois visés (fiche RNCP)</h4>${metiers.length ? `<ul>${metiers.map(m => `<li>${esc(m)}</li>`).join("")}</ul>` : `<p>${ND}</p>`}</div>
                    ${causesHtml(parseCauses(l.causesAbandons), "Causes des abandons")}
                </div>
            </div>
            ${l.commentaire ? `<p class="rc-comment"><i class="bx bx-info-circle"></i> ${esc(l.commentaire)}</p>` : ""}
        </article>`;
}

function blocSession(session, idx) {
  const ls = lignes.filter(l => (l.session || "Session non renseignée") === session)
    .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.formation.localeCompare(b.formation, "fr"));
  const causes = ls.flatMap(l => parseCauses(l.causesAbandons));
  const contenu = `
    ${chiffresCles(ls, session)}
    <div class="features-area bg-f5f7fa pt-70 pb-70">
        <div class="container">
            <div class="section-title text-center"><h2>Résultats par formation</h2><p>Session ${esc(session)}</p></div>
            <nav class="rc-sommaire">${ls.map(l => `<a href="#${slug(l.formation + "-" + (l.session || ""))}">${esc(l.formation)}</a>`).join("")}</nav>
            ${ls.map(carteFormation).join("")}
            ${causes.length ? `<div class="rc-formation">${causesHtml(causes, `Causes des abandons – ensemble du CFA, session ${esc(session)}`)}</div>` : ""}
        </div>
    </div>`;
  if (idx === 0) return contenu;
  return `<details class="rc-archive container"><summary>Consulter les résultats de la session ${esc(session)}</summary>${contenu}</details>`;
}


// ---------- formations non diplômantes ----------
const estCertifiante = l => /certifiante/i.test(l.type || "");

function celluleND(l, k) {
  const ind = byKey["nd:" + k];
  if (["presentation", "nonPresentation", "obtention"].includes(k) && !estCertifiante(l)) return `<td class="rc-so">Sans objet</td>`;
  const t = taux([l], ind);
  if (!t) return `<td><span class="rc-nd">n.d.</span></td>`;
  return `<td><span class="rc-val">${pct(t.valeur)}</span><br><span class="rc-det">${detail(t, ind)}</span></td>`;
}

function noteMoyenne(ls) {
  let s = 0, n = 0;
  for (const l of ls) if (typeof l.noteSatisfaction === "number" && typeof l.satRecus === "number" && l.satRecus > 0) { s += l.noteSatisfaction * l.satRecus; n += l.satRecus; }
  return n ? { valeur: s / n, n } : null;
}

function blocND(annee, idx) {
  const ls = nd.filter(l => (l.annee || "Année non renseignée") === annee)
    .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.formation.localeCompare(b.formation, "fr"));
  const certif = ls.filter(estCertifiante);
  const note = noteMoyenne(ls);
  const tuileND = (k, label, base = ls) => { const ind = byKey["nd:" + k]; const t = taux(base, ind); return tuile(t ? pct(t.valeur) : "–", label || ind.label, t ? detail(t, ind) : "Donnée non disponible"); };
  const lignesTab = ls.map(l => {
    const metiers = (l.metiersVises || "").split(/\n|;/).map(s => s.trim()).filter(Boolean);
    const fiche = l.codeFiche ? (l.lienFiche ? `<a href="${esc(l.lienFiche)}" target="_blank" rel="noopener">${esc(l.codeFiche)} <i class="bx bx-link-external"></i></a>` : esc(l.codeFiche)) : "";
    const ins = estCertifiante(l)
      ? (l.insertionFiche != null || l.insertionMetierFiche != null
          ? `<td>${l.insertionFiche != null ? `Global : <span class="rc-val">${pct(l.insertionFiche / 100)}</span>` : ""}${l.insertionMetierFiche != null ? `<br>Métier visé : <span class="rc-val">${pct(l.insertionMetierFiche / 100)}</span>` : ""}<br><span class="rc-det">Source : fiche France compétences</span></td>`
          : `<td><span class="rc-nd">n.d.</span></td>`)
      : `<td class="rc-so">Sans objet</td>`;
    return `<tr>
      <th scope="row"><strong>${esc(l.formation)}</strong>
        <div class="rc-tags">${l.type ? `<span class="rc-tag">${esc(l.type)}</span>` : ""}${l.modalite ? `<span class="rc-tag rc-tag-light">${esc(l.modalite)}</span>` : ""}</div>
        ${fiche ? `<div class="rc-det">${fiche}</div>` : ""}
        ${metiers.length ? `<details class="rc-mini"><summary>Métiers visés</summary><ul>${metiers.map(m => `<li>${esc(m)}</li>`).join("")}</ul></details>` : ""}
        ${l.commentaire ? `<div class="rc-det"><i class="bx bx-info-circle"></i> ${esc(l.commentaire)}</div>` : ""}
      </th>
      <td><span class="rc-val">${l.entres != null ? nb(l.entres) : "–"}</span></td>
      ${celluleND(l, "satisfaction")}
      <td>${typeof l.noteSatisfaction === "number" ? `<span class="rc-val">${l.noteSatisfaction.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}/10</span>` : `<span class="rc-nd">n.d.</span>`}</td>
      ${celluleND(l, "retourSat")}
      ${celluleND(l, "realisation")}
      ${celluleND(l, "abandon")}
      ${celluleND(l, "presentation")}
      ${celluleND(l, "obtention")}
      ${ins}
    </tr>`;
  }).join("");
  const causes = ls.flatMap(l => parseCauses(l.causesAbandons));
  const contenu = `
    <div class="features-area pt-70 pb-70" id="non-diplomantes${idx ? "-" + slug(annee) : ""}">
        <div class="container">
            <div class="section-title text-center"><h2>Formations qualifiantes et certifiantes</h2><p>Résultats ${esc(annee)}</p></div>
            <div class="row pt-40 rc-kpi-clair">
                ${tuile(somme(ls, "entres") != null ? nb(somme(ls, "entres")) : "–", "Stagiaires formés", `${ls.length} formation${ls.length > 1 ? "s" : ""}`)}
                ${tuileND("satisfaction")}
                ${tuile(note ? `${note.valeur.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}/10` : "–", "Note moyenne de satisfaction", note ? `${nb(note.n)} répondants` : "Donnée non disponible")}
                ${tuileND("realisation")}
                ${tuileND("abandon")}
                ${certif.length ? tuileND("obtention", "Taux d'obtention des certifications", certif) : ""}
                ${certif.length ? tuileND("presentation", "Taux de présentation à la certification", certif) : ""}
                ${tuileND("retourSat")}
            </div>
            <div class="table-responsive pt-40">
                <table class="rc-table rc-nd-table">
                    <thead><tr><th>Formation</th><th>Stagiaires</th><th>Satisfaction</th><th>Note</th><th>Retour questionnaires</th><th>Réalisation des heures</th><th>Abandon</th><th>Présentation certification</th><th>Obtention certification</th><th>Insertion des titulaires</th></tr></thead>
                    <tbody>${lignesTab}</tbody>
                </table>
            </div>
            ${causes.length ? `<div class="rc-formation">${causesHtml(causes, `Causes des abandons – formations qualifiantes et certifiantes ${esc(annee)}`)}</div>` : ""}
        </div>
    </div>`;
  if (idx === 0) return contenu;
  return `<details class="rc-archive container"><summary>Consulter les résultats ${esc(annee)} des formations qualifiantes et certifiantes</summary>${contenu}</details>`;
}

const methodologie = `
    <div class="features-area pt-70 pb-70" id="methodologie">
        <div class="container">
            <div class="section-title text-center"><h2>Méthodologie</h2><p>Modalités de calcul de chaque indicateur publié sur cette page.</p></div>
            <div class="table-responsive pt-40">
            <table class="rc-table rc-methodo">
                <thead><tr><th>Indicateur</th><th>Mode de calcul</th><th>Source des données</th></tr></thead>
                <tbody>${INDICATEURS.map(i => `<tr><th scope="row">${i.label}</th><td>${i.calcul}</td><td>${i.source}</td></tr>`).join("")}</tbody>
            </table>
            <h3 class="rc-methodo-titre">Formations qualifiantes et certifiantes</h3>
            <table class="rc-table rc-methodo">
                <thead><tr><th>Indicateur</th><th>Mode de calcul</th><th>Source des données</th></tr></thead>
                <tbody>${INDICATEURS_ND.map(i => `<tr><th scope="row">${i.label}</th><td>${i.calcul}</td><td>${i.source}</td></tr>`).join("")}
                <tr><th scope="row">Note moyenne de satisfaction</th><td>Moyenne des notes sur 10 de chaque formation, pondérée par le nombre de questionnaires reçus</td><td>Questionnaire de fin de formation (données déclaratives)</td></tr>
                <tr><th scope="row">Insertion des titulaires</th><td>Taux d'insertion global et dans le métier visé des titulaires de la certification</td><td>Fiche de la certification publiée par France compétences</td></tr></tbody>
            </table>
            </div>
            <ul class="rc-notes">
                <li>Les taux sont arrondis au dixième. Chaque taux est accompagné de ses effectifs (numérateur et dénominateur).</li>
                <li>Le taux d'obtention se lit avec le taux de présentation à l'examen : il porte sur les seuls apprentis présentés.</li>
                <li>Les taux de l'ensemble du CFA sont obtenus en additionnant les effectifs de chaque formation, et non en faisant la moyenne des taux.</li>
                <li><abbr class="rc-petit">*</abbr> Effectif inférieur à ${SEUIL} : le taux est publié mais doit être interprété avec prudence.</li>
                <li>Les indicateurs issus d'enquêtes du CFA (satisfaction, insertion, poursuite d'études) reposent sur les déclarations des répondants ; ils ne se substituent pas aux indicateurs officiels InserJeunes.</li>
                <li>« Donnée non disponible » signifie que l'indicateur n'est pas encore mesurable pour la session (enquête en cours ou examen non passé).</li>
            </ul>
        </div>
    </div>`;

const inserjeunes = `
    <div class="funfacts-and-feedback-area bg-maincolor ptb-100">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="feedback-content">
                        <h2><span style="color:#FFDE59;">Indicateurs officiels</span><br>InserJeunes</h2>
                        <p>Conformément à l'article L. 6111-8 du Code du travail, les taux de poursuite d'études, d'interruption en cours de formation, d'insertion professionnelle des sortants et la valeur ajoutée de l'établissement sont calculés et rendus publics chaque année par les ministères chargés de l'éducation et du travail, dès que les effectifs concernés sont suffisants.</p>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end pt-40">
                    <a href="${esc(config.urlInserJeunes)}" target="_blank" rel="noopener" class="default-btn rc-btn"><i class="bx bx-link-external"></i>Consulter InserJeunes<span></span></a>
                </div>
            </div>
        </div>
    </div>`;

const html = head({
  title: `Nos résultats – OF / CFA ${config.nomEtablissement} | Indicateurs de résultats et de performance`,
  description: `Taux de satisfaction, d'obtention, d'insertion, de poursuite d'études, d'abandon et de rupture des apprentis du ${config.nomCfa}, avec leurs modalités de calcul.`,
  url: config.urlPublique, gtm: config.googleTagManagerId,
}) + nav + `
    <div class="page-title-area page-title-area3">
        <div class="container">
            <div class="page-title-content">
                <h1>Nos résultats<br>OF / CFA ${esc(config.nomEtablissement)}<br><span>Les indicateurs de résultats et de performance</span></h1>
            </div>
        </div>
    </div>

    <div class="features-area pt-70 pb-70">
        <div class="container">
            <div class="section-title text-center">
                <h2>"Des résultats publiés en toute transparence"</h2>
            </div>
            <div class="row justify-content-center pt-40"><div class="col-lg-10">
                <p>${esc(config.nomEtablissement)} publie chaque année les résultats de ses formations diplômantes ou certifiantes, formation par formation : satisfaction des apprentis et des stagiaires, réussite aux examens, déroulement des parcours et devenir des apprentis et des stagiaires après leur formation. Le mode de calcul de chaque indicateur est détaillé en <a href="#methodologie">fin de page</a>.</p>
                ${nd.length ? `<p>Les résultats des formations qualifiantes et certifiantes sont présentés <a href="#non-diplomantes">dans une section dédiée</a>.</p>` : ""}
                <p class="rc-maj"><i class="bx bx-calendar"></i> Dernière mise à jour : <strong>${dateFr(majIso)}</strong>${sessions[0] ? ` · Session présentée : <strong>${esc(sessions[0])}</strong>` : ""}</p>
            </div></div>
        </div>
    </div>
` + (sessions.length ? sessions.map(blocSession).join("\n") : `<div class="container pb-70"><p class="rc-nd">Les résultats de la première session sont en cours de collecte et seront publiés sur cette page.</p></div>`)
  + (annees.length ? annees.map(blocND).join("\n") : "")
  + inserjeunes + methodologie + footer;

await mkdir("dist/assets", { recursive: true });
await writeFile("dist/index.html", html);
await cp("src/resultats.css", "dist/assets/resultats.css");
if (existsSync("CNAME")) await cp("CNAME", "dist/CNAME");
await writeFile("dist/.nojekyll", "");
console.log(`dist/index.html généré : ${lignes.length} ligne(s) apprentissage, ${nd.length} ligne(s) non diplômantes.`);
