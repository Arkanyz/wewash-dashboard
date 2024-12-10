import React from 'react';
import { FaChartLine, FaTools, FaMobile, FaShieldAlt, FaBell, FaUsers, FaRocket, FaCrown, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PricingCard = ({ title, price, features, ideal, isPopular = false }) => (
  <div className={`relative flex flex-col ${isPopular ? 'scale-105' : ''}`}>
    {isPopular && (
      <div className="absolute -top-5 left-0 right-0 flex justify-center">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Plus populaire
        </span>
      </div>
    )}
    <div className={`flex flex-col p-8 mx-auto max-w-lg text-center bg-white rounded-3xl border ${isPopular ? 'border-blue-600 shadow-xl' : 'border-gray-200'} h-full`}>
      <h3 className="mb-4 text-2xl font-bold">{title}</h3>
      <div className="flex justify-center items-baseline my-8">
        <span className="mr-2 text-5xl font-extrabold">{price}</span>
        <span className="text-gray-500">/mois</span>
      </div>
      <ul role="list" className="mb-8 space-y-4 text-left">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className="text-gray-500 mb-8">{ideal}</p>
      <button className={`w-full ${isPopular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-105`}>
        Commencer maintenant
      </button>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      title: "Formule Essentielle",
      price: "99€",
      features: [
        "Gestion basique des laveries",
        "Intégration ChatGPT IA",
        "Tableau de bord analytique simple",
        "Extractions de données",
        "Recommandations IA"
      ],
      ideal: "Idéal pour : Petites laveries indépendantes",
      icon: FaRocket
    },
    {
      title: "Formule Pro",
      price: "199€",
      features: [
        "Toutes les fonctionnalités Essentielles",
        "Gestion avancée des tickets",
        "Rapports personnalisés",
        "Automatisations des actions",
        "Contrôle à distance des machines"
      ],
      ideal: "Idéal pour : Chaînes de laveries moyennes",
      isPopular: true,
      icon: FaCrown
    },
    {
      title: "Formule Entreprise",
      price: "599€",
      features: [
        "Toutes les fonctionnalités Pro",
        "API complète",
        "Support dédié prioritaire",
        "Personnalisation sur mesure",
        "Outils d'analyse avancés"
      ],
      ideal: "Idéal pour : Grandes chaînes de laveries et franchises",
      icon: FaBuilding
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="WeWash Logo"
              />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">WeWash</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition duration-300"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-300 transform hover:scale-105"
              >
                Essai gratuit
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Gérez vos laveries</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">en toute simplicité</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              La solution complète pour la gestion de vos laveries automatiques.
              Supervision en temps réel, maintenance préventive et analyses détaillées.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition duration-300 transform hover:scale-105"
                >
                  Commencer maintenant
                </button>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button
                  onClick={() => {/* Scroll to features */}}
                  className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition duration-300"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Une suite complète d'outils pour optimiser la gestion de vos laveries
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Cards */}
              {[
                {
                  icon: FaChartLine,
                  title: "Analyses détaillées",
                  description: "Suivez vos performances en temps réel et prenez des décisions éclairées"
                },
                {
                  icon: FaTools,
                  title: "Maintenance prédictive",
                  description: "Anticipez les problèmes avant qu'ils ne surviennent"
                },
                {
                  icon: FaMobile,
                  title: "Application mobile",
                  description: "Gérez vos laveries où que vous soyez"
                },
                {
                  icon: FaShieldAlt,
                  title: "Sécurité avancée",
                  description: "Protection des données et des transactions"
                },
                {
                  icon: FaBell,
                  title: "Alertes en temps réel",
                  description: "Soyez informé instantanément des événements importants"
                },
                {
                  icon: FaUsers,
                  title: "Support client",
                  description: "Une équipe dédiée à votre réussite"
                }
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-8 bg-white ring-1 ring-gray-900/5 rounded-2xl leading-none flex items-top justify-start space-x-6 group-hover:scale-[1.02] transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </p>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-500">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="mt-20 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500"> 2024 WeWash. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
