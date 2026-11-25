// En-tête et pied de page repris à l'identique du site www.eformacampus.fr (relevé du 25/11/2026).
// Les feuilles de style et scripts sont chargés depuis le site officiel : toute évolution de la charte
// y est donc répercutée automatiquement.
const SITE = "https://www.eformacampus.fr";

export const head = ({ title, description, url, gtm }) => `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="${url}">

    <link rel="stylesheet" href="${SITE}/assets/css/animate.min.css">
    <link rel="stylesheet" href="${SITE}/assets/css/bootstrap.min.css">
    <!-- Icônes : même bibliothèque (Boxicons) que le site, servie par CDN car le site officiel ne
         partage pas ses fichiers de police avec d'autres domaines. -->
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="stylesheet" href="${SITE}/assets/css/style.css?v=2.1">
    <link rel="stylesheet" href="${SITE}/assets/css/responsive.css?v=2.2">
    <link rel="stylesheet" href="assets/resultats.css">
    <link rel="shortcut icon" href="${SITE}/assets/img/favicon.png" type="image/x-icon">

    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${SITE}/assets/img/elearning.webp">
${gtm ? `    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');</script>\n` : ""}</head>
<body>
<a id="top"></a>
`;

export const nav = `    <div class="vdemy-nav">
        <div class="container-fluid">
            <nav class="navbar navbar-expand-lg navbar-light">
                <a href="${SITE}/index.html" class="navbar-brand">
                    <img src="${SITE}/assets/img/logo-eformacampus-blanc.png" alt=" E-Forma Campus">
                </a>
                <div class="navbar-toggler" aria-pressed="false">
                    <i class="bx bx-menu"></i><i class="bx bx-x"></i>
                </div>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav">
                        <li class="nav-item"><a href="${SITE}/index.html" class="nav-link"><i class="bx bxs-home"></i></a></li>
                        <li class="nav-item navbloc"><a href="${SITE}/nos-formations-diplomantes.html" class="nav-link navformations" style="padding:14px 26px;">Apprentissage<br>du BTS au Mastère</a></li>
                        <li class="nav-item megamenu">
                            <a href="#" class="nav-link">&nbsp;&nbsp;&nbsp; Formations <i class="bx bx-chevron-down"></i></a>
                            <ul class="dropdown-menu">
                                <li class="nav-item">
                                    <div class="mobile">
                                        <a href="${SITE}/nos-formations-certifiantes.html">Formations professionnelles certifiantes</a>
                                        <a href="${SITE}/nos-formations-qualifiantes.html">Formations qualifiantes :</a>
                                        <ul>
                                            <li><a href="${SITE}/formations-bureautique.html">Bureautique</a></li><li><a href="${SITE}/formations-langues.html">Langues</a></li><li><a href="${SITE}/formations-infographie.html">Infographie</a></li><li><a href="${SITE}/formations-management-rh.html">Management / RH</a></li><li><a href="${SITE}/formations-productivite.html">Productivité</a></li><li><a href="${SITE}/formations-comptabilite-paie.html">Comptabilité / Paie</a></li><li><a href="${SITE}/formations-accompagnement-bien-etre.html">Accompagnement / Bien-Être</a></li><li><a href="${SITE}/formations-cao-dao.html">Dessin technique CAO-DAO</a></li><li><a href="${SITE}/formations-montage-video.html">Montage vidéo</a></li><li><a href="${SITE}/formations-securite.html">Sécurité</a></li><li><a href="${SITE}/formations-developpement.html">Développement</a></li><li><a href="${SITE}/formations-vente-marketing-digital.html">Vente &amp; Marketing Digital</a></li><li><a href="${SITE}/formations-immobilier.html">Immobilier</a></li><li><a href="${SITE}/formations-soft-skills.html">Soft Skills</a></li><li><a href="${SITE}/formations-data-et-intelligence-artificielle.html">Data et Intelligence Artificielle</a></li>
                                        </ul>
                                    </div>
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-lg-12 col-sm-12 col-md-4 col-6 p-0" style="border-bottom:1px solid;#062383;">
                                                <div class="single-category-widget">
                                                    <div class="icon"><i class="bx bx-layer"></i></div>
                                                    <h3>Formations professionnelles certifiantes</h3>
                                                    <span class="sub-title">Formations éligibles au CPF</span><a href="${SITE}/nos-formations-certifiantes.html" class="link-btn"></a>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="single-category-widget2">
                                                    <div class="icon"><i class="bx bx-layer"></i></div>
                                                    <h3>Formations qualifiantes</h3>
                                                    <span class="sub-title">Choisissez une thématique :</span><a href="${SITE}/nos-formations-qualifiantes.html" class="link-btn"></a>
                                                </div>
                                            </div>
                                            <div class="col">
                                                <ul class="megamenu-submenu">
                                                    <li><a href="${SITE}/formations-bureautique.html">Bureautique</a></li><li><a href="${SITE}/formations-langues.html">Langues</a></li><li><a href="${SITE}/formations-infographie.html">Infographie</a></li><li><a href="${SITE}/formations-management-rh.html">Management / RH</a></li><li><a href="${SITE}/formations-productivite.html">Productivité</a></li>
                                                </ul>
                                            </div>
                                            <div class="col">
                                                <ul class="megamenu-submenu">
                                                    <li><a href="${SITE}/formations-comptabilite-paie.html">Comptabilité / Paie</a></li><li><a href="${SITE}/formations-accompagnement-bien-etre.html">Accompagnement / Bien-Être</a></li><li><a href="${SITE}/formations-cao-dao.html">Dessin technique CAO-DAO</a></li><li><a href="${SITE}/formations-montage-video.html">Montage vidéo</a></li><li><a href="${SITE}/formations-securite.html">Sécurité</a></li>
                                                </ul>
                                            </div>
                                            <div class="col">
                                                <ul class="megamenu-submenu">
                                                    <li><a href="${SITE}/formations-developpement.html">Développement</a></li><li><a href="${SITE}/formations-vente-marketing-digital.html">Vente &amp; Marketing Digital</a></li><li><a href="${SITE}/formations-immobilier.html">Immobilier</a></li><li><a href="${SITE}/formations-soft-skills.html">Soft Skills</a></li><li><a href="${SITE}/formations-data-et-intelligence-artificielle.html">Data et Intelligence Artificielle</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item"><a href="${SITE}/nos-offres-emplois.html" class="nav-link nav-link2">Offres d'emplois</a></li>
                        <li class="nav-item"><a href="${SITE}/centre-de-formation.html" class="nav-link nav-link2">Centre de formation</a></li>
                        <li class="nav-item"><a href="${SITE}/methode.html" class="nav-link">Méthode</a></li>
                        <li class="nav-item"><a href="${SITE}/contact.html" class="nav-link">Contact</a></li>
                        <li class="nav-item navbloc"><a href="https://formation.eformacampus.fr/" target="_blank" class="nav-link" style="background:#2a4293;color:#fff;">&nbsp;Mon Espace&nbsp;</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
`;

export const footer = `    <footer class="footer-area">
        <div class="container">
            <div class="row">
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="single-footer-widget">
                        <a href="${SITE}/" class="logo">
                            <img src="${SITE}/assets/img/logo-eformacampus-blanc.png" alt="logo eforma campus">
                        </a>
                        <p>vous propose des formations originales, professionnelles, exigeantes et qualifiantes, ainsi qu’un accompagnement dédié afin de vous permettre de vous former sans contrainte en fonction de vos besoins, de votre rythme et de vos possibilités.</p>
                        <ul class="social-link">
                            <li><a href="https://www.facebook.com/profile.php?id=100093124781702" class="d-block" target="_blank"><i class="bx bxl-facebook"></i></a></li>
                            <li><a href="https://www.instagram.com/eformacampus/" class="d-block" target="_blank"><i class="bx bxl-instagram"></i></a></li>
                            <li><a href="https://www.linkedin.com/company/e-forma-campus/" class="d-block" target="_blank"><i class="bx bxl-linkedin"></i></a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-12 col-sm-12">
                    <div class="single-footer-widget pl-5">
                        <h3>Nos formations</h3>
                        <ul class="footer-links-list">
                            <li><a href="${SITE}/nos-formations-diplomantes.html" style="background:#00071D;padding: 10px;display: block;">Diplômantes</a></li>
                            <li><a href="${SITE}/nos-formations-qualifiantes.html" style="background:#FFDE59;color:#062383;padding: 10px;display: block;">Qualifiantes</a></li>
                            <li><a href="${SITE}/nos-formations-certifiantes.html" style="background:#3DC4D9;padding: 10px;display: block;">Certifiantes</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="single-footer-widget pl-5">
                        <h3>Nous contacter</h3>
                        <ul class="footer-contact-info">
                            <li><i class="bx bx-map"></i> Siège social<br>
                                    515 Avenue Pablo Picasso<br>
                                    83160 La Valette du Var </li>
                            <li><i class="bx bx-phone-call"></i><a href="tel:+33494213642">04 94 21 36 42</a></li>
                            <li><i class="bx bx-envelope"></i><a href="${SITE}/contact.html">Nous écrire</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="single-footer-widget pl-5">
                        <a href="${SITE}/upload/certificat-qualiopi-eformacampus.pdf?v=2" target="_blank"><img src="${SITE}/assets/img/qualiopi-certification2.png" alt="Qualiopi" style="border-radius: 10px 10px 10px 10px;"></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom-area">
                <div class="row align-items-center">
                    <div class="col-lg-6 col-md-6"></div>
                    <div class="col-lg-6 col-md-6">
                        <ul>
                            <li><a href="${SITE}/politique-confidentialite.html">Confidentialité </a></li>
                            <li><a href="${SITE}/mentions-legales.html"> Mentions légales</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <div class="back-to-top-btn go-top">
        <a href="#top"><i class="bx bx-chevron-up"></i></a>
    </div>

    <script src="${SITE}/assets/js/bootstrap.min.js"></script>
    <script src="${SITE}/assets/js/jquery.min.js"></script>
    <script src="${SITE}/assets/js/jquery.bxslider.min.js"></script>
    <script src="${SITE}/assets/js/scripts.js?v=2.1"></script>
</body>
</html>
`;
