'use client';

/* ============================================================
   YOOBANTÉ — Registre des 36 écrans
   Chaque écran : objectif UX, décisions de design, composants, flux suivant
   ============================================================ */
import * as React from 'react';
import {
  SplashScr, OnboardingScr, AuthScr, HomeScr, DriverLandingScr,
} from '@/components/yb/screens/screens-a';
import {
  SendAddrScr, SendParcelScr, SendOptionsScr, SendTataScr, SendPayScr, MatchingScr, SendConfirmScr,
} from '@/components/yb/screens/screens-b';
import {
  TrackLiveScr, TrackDetailScr, ChatScr, NotificationsScr, HistoryScr,
} from '@/components/yb/screens/screens-c';
import {
  PickupArriveScr, PickupCodeScr, PickupConfirmScr, RatingScr,
} from '@/components/yb/screens/screens-d';
import {
  RecDashboardScr, RecRequestsScr, RecScanScr, RecCodeScr, RecHandoverScr, RecEarningsScr, RecProfileScr,
} from '@/components/yb/screens/screens-e';
import {
  AdminOverviewScr, AdminParcelsScr, AdminTatasScr, AdminDisputesScr, AdminFinanceScr,
} from '@/components/yb/screens/screens-f';
import {
  SysEmptyScr, SysErrorScr, SysSettingsScr,
} from '@/components/yb/screens/screens-g';

export type ScreenKind = 'mobile' | 'desktop';

export interface YScreen {
  id: string;
  group: string;
  title: string;
  desc: string;
  goal: string;
  decisions: string[];
  components: string[];
  next: string;
  kind: ScreenKind;
  render: () => React.ReactNode;
}

export const GROUPS: Array<{ name: string; color: string; label: string }> = [
  { name: 'A', color: '#084C41', label: 'Découverte' },
  { name: 'B', color: '#2C6BA8', label: 'Envoi d’un colis' },
  { name: 'C', color: '#F9A50A', label: 'Suivi en direct' },
  { name: 'D', color: '#D64545', label: 'Retrait' },
  { name: 'E', color: '#6B4FA1', label: 'Receveur Tata' },
  { name: 'F', color: '#06332B', label: 'Console admin' },
  { name: 'G', color: '#5C6B64', label: 'Système & états' },
];

export const SCREENS: YScreen[] = [
  /* ================= GROUPE A — DÉCOUVERTE ================= */
  {
    id: 'A1', group: 'A', kind: 'mobile',
    title: 'Splash',
    desc: 'Écran de démarrage avec logo animé et promesse de marque.',
    goal: 'Installer la marque en moins de 2 secondes : logo officiel (fichier fourni, non modifié) sur carte blanche en pop, slogan réservé « Réserver. Suivre. Récupérer. ». Chargement silencieux en arrière-plan.',
    decisions: [
      'Fond uni #06332B (dégradé abandonné : rendu incohérent selon GPU)',
      'Logo officiel (image fournie, détouré sans retouche) sur carte blanche, animé yb-pop',
      'Slogan réservé « Réserver. Suivre. Récupérer. » — Récupérer en ambre, une seule couleur d’accent pour ne pas concurrencer le logo',
      'Barre de progression subtile en bas, disparaît avant Onboarding',
    ],
    components: ['StatusBar dark', 'Logo officiel PNG', 'Slogan réservé', 'Indeterminate loader'],
    next: 'A2',
    render: () => <SplashScr />,
  },
  {
    id: 'A2', group: 'A', kind: 'mobile',
    title: 'Onboarding',
    desc: '3 slides carrousel : problème, solution, preuve.',
    goal: 'Expliquer le concept du covoiturage de colis en 3 gestes. Chaque slide = 1 bénéfice chiffré, illustration plate cohérente, indicateur de progression.',
    decisions: [
      'Carrousel horizontal contrôlable (swipe + boutons)',
      'Chiffres clés en ambre : « 500+ Tatas », « 12 000 FCFA économisés/mois »',
      'CTA « Commencer » fixé en bas, toujours visible',
    ],
    components: ['ViewPager', 'PageIndicator', 'Illustration SVG', 'YBtn'],
    next: 'A3',
    render: () => <OnboardingScr />,
  },
  {
    id: 'A3', group: 'A', kind: 'mobile',
    title: 'Connexion / Inscription',
    desc: 'Auth par téléphone avec OTP 4 chiffres.',
    goal: 'Authentifier sans friction : numéro sénégalais (+221), OTP auto-formaté, bascule inscription/connexion sans changer d’écran.',
    decisions: [
      'Clavier OTP 4 cases avec auto-focus et collage',
      'Pays verrouillé +221 (marché unique Dakar v1)',
      'Boutons Wave / Orange Money visibles dès l’accueil pour ancrer le paiement',
    ],
    components: ['YInput tel', 'OTP 4 cases', 'Segmented control', 'YBtn', 'Liens légaux'],
    next: 'A4',
    render: () => <AuthScr />,
  },
  {
    id: 'A4', group: 'A', kind: 'mobile',
    title: 'Accueil expéditeur',
    desc: 'Tableau de bord : salutation, envoi express, envois actifs.',
    goal: 'Donner accès à l’action n°1 (envoyer un colis) en 1 tap, et rassurer sur les envois en cours via cartes compactes avec statut couleur.',
    decisions: [
      'Bloc « Nouvel envoi » héro ambigu : vert émeraude, illustration Tata',
      'Actions rapides 4 icônes (adresse, code, historique, aide)',
      'Cartes envois actifs : timeline mini + ETA ambre',
    ],
    components: ['YHeader', 'QuickActions', 'ActiveShipmentCard', 'MapMock mini', 'YBottomNav'],
    next: 'B1',
    render: () => <HomeScr />,
  },
  {
    id: 'A5', group: 'A', kind: 'mobile',
    title: 'Devenez partenaire Tata',
    desc: 'Landing recrutement chauffeurs/receveurs.',
    goal: 'Convertir les chauffeurs de Tata en partenaires : promesse de revenu mensuel net, exigences transparentes, 3 étapes d’inscription.',
    decisions: [
      'Hero photo-free : illustration véhicule + badge revenus',
      'Chiffres de preuve sociale (187 partenaires actifs)',
      'Formulaire téléphone en 1 champ, CTA ambre',
    ],
    components: ['Hero', 'StepList', 'ProofStats', 'YInput', 'YBtn amber'],
    next: 'A4',
    render: () => <DriverLandingScr />,
  },

  /* ================= GROUPE B — ENVOI ================= */
  {
    id: 'B1', group: 'B', kind: 'mobile',
    title: 'Nouvel envoi · 1/5 Adresses',
    desc: 'Choix départ (point relais) et destination.',
    goal: 'Saisir les adresses sans clavier : recherche par quartier (Keur Massar, Pikine…), favoris et carte de prévisualisation immédiate.',
    decisions: [
      'Champs reliés par ligne pointillée verticale (métaphore trajet)',
      'Autocomplete quartiers avec icônes dispensaires/marchés',
      'Mini-carte live mise à jour à la sélection',
    ],
    components: ['YStepper 1/5', 'YInput recherche', 'AddressSwap', 'MapMock route', 'YBtn'],
    next: 'B2',
    render: () => <SendAddrScr />,
  },
  {
    id: 'B2', group: 'B', kind: 'mobile',
    title: 'Nouvel envoi · 2/5 Colis',
    desc: 'Type, dimensions et contenu du colis.',
    goal: 'Qualifier le colis en 3 choix visuels (sacs, électronique, nourriture) + slider poids. Éviter toute saisie manuelle inutile.',
    decisions: [
      'Cartes de type avec pictos et exemples locaux (mangues, tissus, téléphone)',
      'Slider poids 0–30 kg avec estimation tarifaire live',
      'Champ description optionnel replié',
    ],
    components: ['YStepper 2/5', 'TypeCards', 'PoidsSlider', 'YInput description'],
    next: 'B3',
    render: () => <SendParcelScr />,
  },
  {
    id: 'B3', group: 'B', kind: 'mobile',
    title: 'Nouvel envoi · 3/5 Options',
    desc: 'Fragile, express, assurance et photo.',
    goal: 'Upsell responsable : chaque option explique son prix en FCFA et son impact sur le délai. Aucun pré-cochage caché.',
    decisions: [
      'Switches avec prix unitaire aligné à droite',
      'Option « Photo à la remise » offerte (confiance)',
      'Total recalculé en sticky footer',
    ],
    components: ['YStepper 3/5', 'OptionSwitch', 'PriceDelta', 'StickyTotal'],
    next: 'B4',
    render: () => <SendOptionsScr />,
  },
  {
    id: 'B4', group: 'B', kind: 'mobile',
    title: 'Nouvel envoi · 4/5 Choix du Tata',
    desc: 'Liste des Tatas disponibles avec prix et délais.',
    goal: 'Comparer 3 Tatas sur prix/ETA/note. Le recommandé est mis en avant sans masquer les alternatives.',
    decisions: [
      'Carte recommandée avec liseré ambre + badge « Le plus rapide »',
      'Chaque carte : plaque, note, voyages, prix clair',
      'Info-bulle prix : « dont 15% commission receveur »',
    ],
    components: ['YStepper 4/5', 'DriverCard ×3', 'SortChips', 'InfoBanner'],
    next: 'B5',
    render: () => <SendTataScr />,
  },
  {
    id: 'B5', group: 'B', kind: 'mobile',
    title: 'Nouvel envoi · 5/5 Paiement',
    desc: 'Wave, Orange Money, Free Money ou espèces.',
    goal: 'Payer en 2 taps avec l’application mobile money dominante. Code de retrait généré et expliqué.',
    decisions: [
      'Wave en premier : part de marché n°1 à Dakar',
      'Encart pédagogique code retrait 4 chiffres',
      'Récapitulatif prix complet avant validation',
    ],
    components: ['YStepper 5/5', 'PaymentRadio', 'YRow récap', 'YBtn primary', 'SecureNote'],
    next: 'B6',
    render: () => <SendPayScr />,
  },
  {
    id: 'B6', group: 'B', kind: 'mobile',
    title: 'Recherche de Tata',
    desc: 'Matching animé : radar, candidatures entrantes.',
    goal: 'Rendre l’attente vivante et courte : radar animé, chauffeurs qui « arrivent » un à un, auto-sélection du meilleur après 4,2 s.',
    decisions: [
      'Radar SVG concentrique animé yb-ping',
      'Candidature chauffeur apparait en yb-pop (stagger)',
      'Auto-avancement vers confirmation après 4,2 s',
    ],
    components: ['MapMock radar', 'CandidateCard', 'ProgressRing', 'YBtn annuler'],
    next: 'B7',
    render: () => <MatchingScr />,
  },
  {
    id: 'B7', group: 'B', kind: 'mobile',
    title: 'Envoi confirmé',
    desc: 'Récap complet + code retrait + partage.',
    goal: 'Rassurer : toutes les infos critiques (code 5831, receveur, plaque) sur un seul écran, partageables par WhatsApp.',
    decisions: [
      'Check animé vert en hero + confettis discrets',
      'Code 5831 en typographie XXL ambre, copiable',
      'Carte receveur avec avatar et horaire point relais',
    ],
    components: ['SuccessCheck', 'CodeHero', 'ReceiverCard', 'ShareRow', 'YBtn suivi'],
    next: 'C1',
    render: () => <SendConfirmScr />,
  },

  /* ================= GROUPE C — SUIVI ================= */
  {
    id: 'C1', group: 'C', kind: 'mobile',
    title: 'Suivi temps réel',
    desc: 'Carte live, véhicule en marche, timeline.',
    goal: 'Répondre à « où est mon colis ? » sans attendre : carte 60% de l’écran, véhicule animé, ETA mise à jour, contact chauffeur 1 tap.',
    decisions: [
      'Carte en haut (pas de scroll nécessaire pour voir le véhicule)',
      'Timeline 4 états avec étape active en ambre pulsant',
      'Sheet glissante : plaque, chauffeur, actions appel/chat',
    ],
    components: ['MapMock live + driver', 'YTimeline', 'DriverSheet', 'ActionPair'],
    next: 'C2',
    render: () => <TrackLiveScr />,
  },
  {
    id: 'C2', group: 'C', kind: 'mobile',
    title: 'Détails du colis',
    desc: 'Récapitulatif complet, reçus et preuves.',
    goal: 'Centraliser tout l’historique documentaire : photos, signatures, reçus Wave. Utile en cas de litige.',
    decisions: [
      'Sections repliables (colis, trajet, paiement, preuves)',
      'Vignettes photo 56px cliquables',
      'Badge statut en en-tête réutilisé partout',
    ],
    components: ['YBadge', 'AccordionSection', 'PhotoGrid', 'ReceiptRow', 'YBtn litige'],
    next: 'C3',
    render: () => <TrackDetailScr />,
  },
  {
    id: 'C3', group: 'C', kind: 'mobile',
    title: 'Chat chauffeur',
    desc: 'Messagerie avec réponses rapides intégrées.',
    goal: 'Résoudre 80% des questions sans appel : 4 réponses rapides pré-écrites, statut de lecture, fallback appel.',
    decisions: [
      'Bulles vertes à droite / grises à gauche, timestamps',
      'Quick replies contextuels (« Je suis en route »)',
      'Banner chauffeur sticky en haut avec appel direct',
    ],
    components: ['ChatBubble', 'QuickReplyChips', 'DriverBanner', 'InputBar'],
    next: 'C4',
    render: () => <ChatScr />,
  },
  {
    id: 'C4', group: 'C', kind: 'mobile',
    title: 'Notifications',
    desc: 'Flux groupé par jour avec états lus/non-lus.',
    goal: 'Prioriser : événements de colis (non-lus) au-dessus, marketing replié en bas. Chaque notification est actionnable.',
    decisions: [
      'Groupes « Aujourd’hui / Hier »',
      'Pastille verte pour non-lus, opacité réduite pour lus',
      'Swipe actions (marquer lu) suggérées par bouton',
    ],
    components: ['DayGroup', 'NotifRow', 'UnreadDot', 'MarkAllBtn'],
    next: 'C5',
    render: () => <NotificationsScr />,
  },
  {
    id: 'C5', group: 'C', kind: 'mobile',
    title: 'Historique des envois',
    desc: 'Onglets en cours / terminés, recherche.',
    goal: 'Retrouver un envoi en 2 gestes : filtres onglets + recherche par code. Chaque ligne rouvre les détails.',
    decisions: [
      'Onglets segmentés avec compteurs',
      'Lignes compactes : icône statut colorée, code mono',
      'Empty state utile si filtre vide',
    ],
    components: ['YTabs', 'HistoryRow ×N', 'SearchInput', 'EmptyMini'],
    next: 'C1',
    render: () => <HistoryScr />,
  },

  /* ================= GROUPE D — RETRAIT ================= */
  {
    id: 'D1', group: 'D', kind: 'mobile',
    title: 'Colis arrivé au point relais',
    desc: 'Notification d’arrivée + infos retrait.',
    goal: 'Déclencher le retrait sous 24h : adresse du point, horaires, documents requis. CTA « Voir le code » dominant.',
    decisions: [
      'Bandeau ambre « Prêt pour retrait »',
      'Horaires du point relais + carte statique',
      'Rappel : code nécessaire, pièce d’identité conseillée',
    ],
    components: ['ArrivalBanner', 'PointCard', 'MapMock statique', 'YBtn amber', 'Checklist'],
    next: 'D2',
    render: () => <PickupArriveScr />,
  },
  {
    id: 'D2', group: 'D', kind: 'mobile',
    title: 'Code de retrait',
    desc: 'Code 4 chiffres à présenter au receveur.',
    goal: 'Montrer le code de façon lisible en plein soleil : gros chiffres, contraste maximal, mode « présenter » plein écran.',
    decisions: [
      'Code 5831 en 96px, espacé, fond blanc pur',
      'Compte à rebours validité 48h',
      'Bouton luminosité max (mode présentaire)',
    ],
    components: ['CodeDisplay XL', 'ValidityCountdown', 'BrightnessBtn', 'Instructions'],
    next: 'D3',
    render: () => <PickupCodeScr />,
  },
  {
    id: 'D3', group: 'D', kind: 'mobile',
    title: 'Remise confirmée',
    desc: 'Preuve de remise : photo + heure + receveur.',
    goal: 'Clôturer le cycle avec preuve opposable : photo du colis remis, nom du receveur, horodatage, bouton litige 48h.',
    decisions: [
      'Photo preuve en carte 4:3 avec badge horodatage',
      'Note litige : « Signaler un problème sous 48h »',
      'CTA secondaire : noter le voyage',
    ],
    components: ['ProofPhoto', 'TimestampBadge', 'LitigeNote', 'YBtn noter'],
    next: 'D4',
    render: () => <PickupConfirmScr />,
  },
  {
    id: 'D4', group: 'D', kind: 'mobile',
    title: 'Notation du voyage',
    desc: 'Étoiles chauffeur + étiquettes rapides.',
    goal: 'Récolter une note en 5 secondes : étoiles, puis étiquettes contextuelles seulement si note ≤ 3. Bonus conducteur visible.',
    decisions: [
      'Étoiles 44px avec retour haptique simulé',
      'Étiquettes chips (« Colis intact », « Ponctuel »…)',
      'Tip conducteur optionnel par tranches FCFA',
    ],
    components: ['StarRating XL', 'TagChips', 'TipSelector', 'YBtn envoyer'],
    next: 'A4',
    render: () => <RatingScr />,
  },

  /* ================= GROUPE E — RECEVEUR ================= */
  {
    id: 'E1', group: 'E', kind: 'mobile',
    title: 'Tableau de bord Receveur',
    desc: 'Colis du jour, alertes, raccourcis scan.',
    goal: 'Piloter la journée du receveur d’un Tata : colis à bord, à remettre, terminés. Le scan est l’action la plus proche du pouce.',
    decisions: [
      'Compteurs 3 couleurs (à bord ambre, à remettre vert, livrés gris)',
      'Liste colis avec codes et destinations courtes',
      'Bouton scan flottant ambre 64px',
      'Bandeau « Demandes en direct » avec pastille pulsante — porte d’entrée du flux temps réel (E2)',
    ],
    components: ['CounterRow', 'ParcelQueue', 'FloatingScanBtn', 'YHeader dark'],
    next: 'E2',
    render: () => <RecDashboardScr />,
  },
  {
    id: 'E2', group: 'E', kind: 'mobile',
    title: 'Demandes en temps réel',
    desc: 'Flux live des demandes proches de la ligne, acceptation en 1 tap.',
    goal: 'Donner au receveur un flux vivant : chaque demande d’envoi déposée près de son itinéraire arrive en direct avec tout ce qu’il faut pour décider en 5 secondes — trajet, colis, gain net — et deux actions immédiates : Accepter ou Refuser.',
    decisions: [
      'Cartes animées yb-pop : badge « Nouveau » ambre sur la dernière demande arrivée',
      '« Votre part » (85% après commission plateforme) plus visible que le prix brut',
      'Barre de déclinaison auto 60 s + simulateur : une nouvelle demande toutes les 9 s',
      'Accepter → carte verte avec point de récupération ; Refuser → transmise à un autre Tata',
    ],
    components: ['LiveBadge EN DIRECT', 'DemandCard animée', 'CountdownBar', 'YBtn Accepter/Refuser', 'YToast', 'Compteurs réactifs'],
    next: 'E3',
    render: () => <RecRequestsScr />,
  },
  {
    id: 'E3', group: 'E', kind: 'mobile',
    title: 'Vérification colis',
    desc: 'Détail colis avant remise : photo, dims, destinataire.',
    goal: 'Éviter les erreurs de remise : photo du colis, destinataire attendu, contrôle « code demandé » avant d’ouvrir la saisie.',
    decisions: [
      'Photo colis en haut, métadonnées en grille 2 colonnes',
      'Checklist sécurité (integrité, destinataire) avant code',
      'Bouton saisir code verrouillé tant que checklist incomplète',
    ],
    components: ['ParcelPhoto', 'MetaGrid', 'SafetyChecklist', 'LockedCTA'],
    next: 'E4',
    render: () => <RecScanScr />,
  },
  {
    id: 'E4', group: 'E', kind: 'mobile',
    title: 'Saisie du code de retrait',
    desc: 'Pavé numérique pour valider le code.',
    goal: 'Valider la remise sans erreur : pavé large, cases remplies au fil de la frappe, CTA débloqué seulement au 4e chiffre (5831 en démo).',
    decisions: [
      'Pavé 1-9, 0, effacer — cibles 64px',
      'Cases 5831 réellement saisissables, CTA verrouillé avant',
      'Astuce : « Le client peut aussi scanner son QR »',
    ],
    components: ['YCodeInput interactif', 'Keypad 64px', 'UnlockCTA', 'QrHint'],
    next: 'E5',
    render: () => <RecCodeScr />,
  },
  {
    id: 'E5', group: 'E', kind: 'mobile',
    title: 'Remise du colis',
    desc: 'Photo preuve + signature digitale du destinataire.',
    goal: 'Produire une preuve incontestable : photo obligatoire, signature au doigt, résumé horodaté envoyé aux deux parties.',
    decisions: [
      'Canvas signature 180px avec ligne de base',
      'Photo obligatoire avant validation (verrou)',
      'Confirmation d’envoi double (SMS + push)',
    ],
    components: ['PhotoRequired', 'SignaturePad', 'SummaryRow', 'YBtn valider'],
    next: 'E6',
    render: () => <RecHandoverScr />,
  },
  {
    id: 'E6', group: 'E', kind: 'mobile',
    title: 'Revenus du Receveur',
    desc: 'Gains du jour/semaine/mois + commissions.',
    goal: 'Rendre le revenu lisible et motivant : total en gros, commission 15% détaillée, historique par voyage, payout Wave.',
    decisions: [
      'Solde XXL vert + delta hebdo ambre',
      'Graphique barres 7 jours inline (CSS pur)',
      'Ligne payout : « Wave • Samedi »',
    ],
    components: ['BalanceHero', 'WeekBars', 'TripEarningsList', 'PayoutRow'],
    next: 'E7',
    render: () => <RecEarningsScr />,
  },
  {
    id: 'E7', group: 'E', kind: 'mobile',
    title: 'Profil Receveur & véhicule',
    desc: 'Documents, statut vérification, véhicule.',
    goal: 'Donner au receveur le contrôle de son statut pro : badges de vérification, documents avec dates d’expiration, infos véhicule éditables.',
    decisions: [
      'Badge « Vérifié » vert en en-tête avec date',
      'Documents : statut + expiration codés couleur',
      'Véhicule : type Tata, plaque, capacité colis',
    ],
    components: ['VerifiedBadge', 'DocRow ×3', 'VehicleCard', 'YBtn support'],
    next: 'E1',
    render: () => <RecProfileScr />,
  },

  /* ================= GROUPE F — CONSOLE ADMIN ================= */
  {
    id: 'F1', group: 'F', kind: 'desktop',
    title: 'Console · Vue d’ensemble',
    desc: '1440×900 — KPIs, carte exploitation live, flux temps réel.',
    goal: 'Voir la santé opérationnelle en 5 secondes : 5 KPIs, carte des colis en mouvement, flux d’événements. Thème sombre pour salle d’opérations.',
    decisions: [
      '5 KPIs : 176 colis / 31 en transit / 141 livrés / 4 incidents / 35 200 FCFA',
      'Carte SVG exploitation avec véhicules animés',
      'Flux événements scrollant à droite',
    ],
    components: ['ASidebar', 'AKpi ×5', 'OpsMap SVG', 'EventFeed', 'HourBars'],
    next: 'F2',
    render: () => <AdminOverviewScr />,
  },
  {
    id: 'F2', group: 'F', kind: 'desktop',
    title: 'Console · Gestion des colis',
    desc: 'Table filtrable, détail latéral, actions masse.',
    goal: 'Résoudre les blocages rapidement : filtres statut, lignes à risque surlignées, panneau détail sans changer de page.',
    decisions: [
      'Table 8 colonnes avec tri visuel sur « Statut »',
      'Lignes incidents : liseré rouge gauche',
      'Actions masse : réassigner, rembourser, contacter',
    ],
    components: ['ATable 8 col', 'FilterChips', 'SideDetail', 'MassActions'],
    next: 'F3',
    render: () => <AdminParcelsScr />,
  },
  {
    id: 'F3', group: 'F', kind: 'desktop',
    title: 'Console · Tatas & Chauffeurs',
    desc: 'Parc partenaires, statut vérification, performance.',
    goal: 'Suivre la flotte : disponibilité, notes moyennes, documents expirants. Onglets actifs / en attente / suspendus.',
    decisions: [
      'Onglets avec compteurs par statut',
      'Colonnes performance : note, voyages, taux livraison',
      'Badge document « Expire sous 12j » ambre',
    ],
    components: ['ATable flotte', 'StatusTabs', 'ScoreBars', 'DocExpiry'],
    next: 'F4',
    render: () => <AdminTatasScr />,
  },
  {
    id: 'F4', group: 'F', kind: 'desktop',
    title: 'Console · Litiges & incidents',
    desc: 'File de traitement, SLA, médiation.',
    goal: 'Traiter les litiges par priorité SLA : file triée par ancienneté, contexte complet en 1 clic, réponses modèles.',
    decisions: [
      'File priorisée : SLA < 4h en rouge',
      'Panneau médiation : timeline + photos + messages',
      'Réponses modèles et remboursement en 2 taps',
    ],
    components: ['QueueList', 'SLABadge', 'MediationPanel', 'CannedReplies'],
    next: 'F5',
    render: () => <AdminDisputesScr />,
  },
  {
    id: 'F5', group: 'F', kind: 'desktop',
    title: 'Console · Finances',
    desc: 'Commissions, paiements Wave/OM, payouts.',
    goal: 'Piloter la trésorerie : recettes commissions, payouts partenaires en attente, réconciliation mobile money. Export comptable.',
    decisions: [
      'Cartes recettes / payouts / solde Wave',
      'Graphique 30 jours revenus (barres CSS)',
      'Table payouts avec bouton « Payer maintenant »',
    ],
    components: ['FinanceCards', 'RevenueBars 30j', 'ATable payouts', 'ExportBtn'],
    next: 'F1',
    render: () => <AdminFinanceScr />,
  },

  /* ================= GROUPE G — SYSTÈME ================= */
  {
    id: 'G1', group: 'G', kind: 'mobile',
    title: 'États vides & chargement',
    desc: 'Skeletons, empty states, loaders de marque.',
    goal: 'Ne jamais laisser un écran vide ou figé : skeletons shimmer aux formes réelles, empty states avec action de sortie.',
    decisions: [
      'Skeletons yb-shimmer (carte, liste, carte map)',
      'Empty : illustration + phrase + CTA « Créer un envoi »',
      'Spinner de marque : logo qui respire',
    ],
    components: ['SkeletonCard', 'SkeletonList', 'EmptyState', 'BrandSpinner'],
    next: 'G2',
    render: () => <SysEmptyScr />,
  },
  {
    id: 'G2', group: 'G', kind: 'mobile',
    title: 'Erreurs & réseau instable',
    desc: 'Offline, échec paiement, erreur serveur.',
    goal: 'Transformer les erreurs en orientation : message clair, cause probable, action de rattrapage. Bannière offline persistante.',
    decisions: [
      'Bannière offline ambre collée sous le header',
      'Erreur paiement : numéro de suivi + réessayer Wave',
      'Erreur 500 : illustration + statut page system.yoobante.sn',
    ],
    components: ['OfflineBanner', 'PaymentError', 'ServerError', 'RetryBtn'],
    next: 'G3',
    render: () => <SysErrorScr />,
  },
  {
    id: 'G3', group: 'G', kind: 'mobile',
    title: 'Paramètres & sécurité',
    desc: 'Compte, langues, confidentialité, support.',
    goal: 'Donner le contrôle : langue (Français), confidentialité (données, publicité), sécurité (PIN, sessions), support WhatsApp.',
    decisions: [
      'Sections groupées avec séparateurs fins',
      'Sélecteur langue : Français / Wolof / Pulaar (préparé)',
      'Support : WhatsApp direct + ligne verte',
    ],
    components: ['SettingsGroup', 'LangSelector', 'SecurityToggles', 'SupportRow'],
    next: 'A1',
    render: () => <SysSettingsScr />,
  },
];

export const screenById = (id: string) => SCREENS.find(s => s.id === id);
