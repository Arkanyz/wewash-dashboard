export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Base de connaissances WeWash
const RESPONSES = {
    default: "Je ne comprends pas votre question. Pourriez-vous la reformuler ou consulter notre FAQ ?",
    
    greeting: [
        "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        "Bienvenue ! Que puis-je faire pour vous ?",
        "Bonjour ! Je suis là pour répondre à vos questions."
    ],

    dashboard: {
        navigation: "Le tableau de bord principal vous donne accès à toutes les fonctionnalités :\n- Vue d'ensemble des machines\n- Statistiques d'utilisation\n- Notifications\n- Paramètres",
        stats: "Les statistiques vous montrent :\n- Taux d'occupation des machines\n- Historique d'utilisation\n- Consommation énergétique\n- Coûts mensuels",
        notifications: "Les notifications vous informent en temps réel :\n- Fin de cycle\n- Maintenance planifiée\n- Promotions\n- Messages importants"
    },

    machine: {
        status: "Vous pouvez voir l'état de vos machines en temps réel dans l'onglet 'Machines'. Chaque machine affiche son statut (disponible, en cours, maintenance) et le temps restant si elle est en cours d'utilisation.",
        reservation: "Pour réserver une machine, rendez-vous dans l'onglet 'Machines', sélectionnez une machine disponible et choisissez votre créneau horaire. Le paiement se fait directement en ligne.",
        problem: "Si vous rencontrez un problème avec une machine, vous pouvez :\n1. Signaler le problème via l'application\n2. Contacter le support technique\n3. Demander un remboursement si nécessaire",
        types: "Nous proposons différents types de machines :\n- Machines à laver standard (8kg)\n- Machines à laver grande capacité (12kg)\n- Sèche-linge\n- Machines spéciales (couettes, etc.)"
    },

    payment: {
        methods: "Nous acceptons plusieurs moyens de paiement :\n- Carte bancaire\n- Porte-monnaie virtuel\n- Prélèvement automatique",
        invoice: "Vos factures sont disponibles dans la section 'Facturation' de votre compte. Vous pouvez les télécharger au format PDF.",
        refund: "Pour un remboursement, contactez notre support client avec le numéro de transaction. Nous traiterons votre demande sous 48h.",
        pricing: "Nos tarifs sont calculés en fonction :\n- Du type de machine\n- De la durée d'utilisation\n- Des options sélectionnées\n- Des promotions en cours"
    },

    account: {
        creation: "Pour créer un compte, cliquez sur 'S'inscrire' et suivez les étapes. Vous aurez besoin de :\n- Une adresse email\n- Un numéro de téléphone\n- Une pièce d'identité",
        settings: "Dans les paramètres de votre compte, vous pouvez :\n- Modifier vos informations personnelles\n- Gérer vos moyens de paiement\n- Configurer vos notifications",
        delete: "Pour supprimer votre compte, contactez notre support client. Nous conserverons certaines données conformément au RGPD.",
        preferences: "Personnalisez votre expérience dans les préférences :\n- Langue de l'interface\n- Thème clair/sombre\n- Format des notifications\n- Devise préférée"
    },

    maintenance: {
        schedule: "La maintenance préventive est effectuée régulièrement. Les horaires sont affichés dans l'application 48h à l'avance.",
        report: "Pour signaler un problème technique :\n1. Sélectionnez la machine concernée\n2. Cliquez sur 'Signaler un problème'\n3. Décrivez le problème rencontré",
        contact: "Notre équipe technique est disponible 7j/7 de 8h à 20h. En dehors de ces horaires, laissez un message et nous vous recontacterons.",
        history: "L'historique de maintenance est disponible pour chaque machine :\n- Dernières interventions\n- Problèmes signalés\n- Prochaine maintenance prévue"
    },

    security: {
        data: "Vos données sont protégées conformément au RGPD. Nous utilisons un chiffrement de bout en bout pour toutes les transactions.",
        privacy: "Notre politique de confidentialité détaille l'utilisation de vos données. Consultez-la dans les paramètres de l'application.",
        password: "Pour changer votre mot de passe :\n1. Allez dans les paramètres\n2. Sélectionnez 'Sécurité'\n3. Suivez les instructions",
        authentication: "La sécurité de votre compte est assurée par :\n- Authentification à deux facteurs\n- Détection des connexions suspectes\n- Historique des connexions"
    },

    features: {
        mobile: "Notre application mobile offre :\n- Réservation rapide\n- Notifications push\n- Paiement mobile\n- Scanner de QR code",
        qrcode: "Les QR codes permettent :\n- D'identifier rapidement une machine\n- D'accéder à son historique\n- De signaler un problème\n- De démarrer un cycle",
        rewards: "Notre programme de fidélité propose :\n- Points bonus par utilisation\n- Réductions régulières\n- Avantages exclusifs\n- Promotions spéciales",
        eco: "Nos fonctionnalités écologiques :\n- Suivi de consommation\n- Conseils d'économie\n- Programmes éco\n- Statistiques environnementales"
    },

    support: {
        chat: "Le chat en direct est disponible :\n- Du lundi au vendredi : 8h-20h\n- Samedi : 9h-18h\n- Dimanche : 10h-17h",
        faq: "Notre FAQ couvre les sujets principaux :\n- Utilisation des machines\n- Paiement et facturation\n- Problèmes techniques\n- Questions générales",
        contact: "Contactez-nous par :\n- Chat en direct\n- Email : support@wewash.fr\n- Téléphone : 01 23 45 67 89\n- Formulaire de contact",
        feedback: "Vos retours nous sont précieux :\n- Évaluez votre expérience\n- Suggérez des améliorations\n- Signalez des bugs\n- Participez aux enquêtes"
    },

    business: {
        pro: "Notre offre professionnelle comprend :\n- Gestion multi-sites\n- Facturation entreprise\n- Support prioritaire\n- Tableau de bord avancé",
        integration: "Nous proposons des intégrations avec :\n- Systèmes de gestion\n- Solutions de paiement\n- Logiciels de comptabilité\n- APIs personnalisées",
        analytics: "Les analyses professionnelles incluent :\n- Rapports détaillés\n- Prévisions d'utilisation\n- KPIs personnalisés\n- Export de données",
        custom: "Solutions personnalisées disponibles :\n- Interface sur mesure\n- Fonctionnalités spécifiques\n- Configuration adaptée\n- Formation dédiée"
    }
};

function findBestMatch(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Dashboard et Navigation
    if (lowerInput.match(/dashboard|tableau|bord|accueil|menu/)) {
        if (lowerInput.match(/navigation|menu|trouver/)) return RESPONSES.dashboard.navigation;
        if (lowerInput.match(/stat|graphique|données/)) return RESPONSES.dashboard.stats;
        if (lowerInput.match(/notif|alerte|message/)) return RESPONSES.dashboard.notifications;
    }

    // Machines
    if (lowerInput.match(/machine|laver|séchoir|disponible|réserver/)) {
        if (lowerInput.match(/état|status|disponible/)) return RESPONSES.machine.status;
        if (lowerInput.match(/réserver|quand|horaire/)) return RESPONSES.machine.reservation;
        if (lowerInput.match(/problème|panne|marche pas/)) return RESPONSES.machine.problem;
        if (lowerInput.match(/type|modèle|capacité/)) return RESPONSES.machine.types;
    }

    // Paiement
    if (lowerInput.match(/payer|paiement|prix|coût|tarif|facture|remboursement/)) {
        if (lowerInput.match(/moyen|comment|carte/)) return RESPONSES.payment.methods;
        if (lowerInput.match(/facture|reçu/)) return RESPONSES.payment.invoice;
        if (lowerInput.match(/rembours/)) return RESPONSES.payment.refund;
        if (lowerInput.match(/prix|tarif|coût/)) return RESPONSES.payment.pricing;
    }

    // Compte
    if (lowerInput.match(/compte|profil|inscription|connexion/)) {
        if (lowerInput.match(/créer|inscription|inscrire/)) return RESPONSES.account.creation;
        if (lowerInput.match(/paramètre|modifier|changement/)) return RESPONSES.account.settings;
        if (lowerInput.match(/supprimer|suppression/)) return RESPONSES.account.delete;
        if (lowerInput.match(/préférence|personnalis/)) return RESPONSES.account.preferences;
    }

    // Maintenance
    if (lowerInput.match(/maintenance|réparation|technique|panne/)) {
        if (lowerInput.match(/horaire|quand|planning/)) return RESPONSES.maintenance.schedule;
        if (lowerInput.match(/signaler|problème|panne/)) return RESPONSES.maintenance.report;
        if (lowerInput.match(/contact|joindre|appeler/)) return RESPONSES.maintenance.contact;
        if (lowerInput.match(/historique|passé|précédent/)) return RESPONSES.maintenance.history;
    }

    // Sécurité
    if (lowerInput.match(/sécurité|données|confidentialité|rgpd|mot de passe/)) {
        if (lowerInput.match(/donnée|information/)) return RESPONSES.security.data;
        if (lowerInput.match(/confidentialité|privé|rgpd/)) return RESPONSES.security.privacy;
        if (lowerInput.match(/mot de passe|mdp|password/)) return RESPONSES.security.password;
        if (lowerInput.match(/authentification|connexion|2fa/)) return RESPONSES.security.authentication;
    }

    // Fonctionnalités
    if (lowerInput.match(/fonctionnalité|feature|option|service/)) {
        if (lowerInput.match(/mobile|app|téléphone/)) return RESPONSES.features.mobile;
        if (lowerInput.match(/qr|code|scanner/)) return RESPONSES.features.qrcode;
        if (lowerInput.match(/fidélité|point|bonus|reward/)) return RESPONSES.features.rewards;
        if (lowerInput.match(/éco|environnement|green/)) return RESPONSES.features.eco;
    }

    // Support
    if (lowerInput.match(/support|aide|assistance/)) {
        if (lowerInput.match(/chat|direct|message/)) return RESPONSES.support.chat;
        if (lowerInput.match(/faq|question|aide/)) return RESPONSES.support.faq;
        if (lowerInput.match(/contact|joindre|email/)) return RESPONSES.support.contact;
        if (lowerInput.match(/avis|feedback|suggestion/)) return RESPONSES.support.feedback;
    }

    // Business
    if (lowerInput.match(/business|pro|entreprise|commerce/)) {
        if (lowerInput.match(/pro|professionnel/)) return RESPONSES.business.pro;
        if (lowerInput.match(/intégration|api|connect/)) return RESPONSES.business.integration;
        if (lowerInput.match(/analyse|statistique|rapport/)) return RESPONSES.business.analytics;
        if (lowerInput.match(/personnalis|custom|adapté/)) return RESPONSES.business.custom;
    }

    // Salutations (à la fin pour privilégier les réponses plus spécifiques)
    if (lowerInput.match(/bonjour|salut|hey|hello|hi|coucou/)) {
        return RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)];
    }

    return RESPONSES.default;
}

export const generateChatResponse = async (messages: ChatMessage[]): Promise<string> => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') return RESPONSES.default;
    
    return findBestMatch(lastMessage.content);
};
