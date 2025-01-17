import React, { useState } from "react";
import { ChevronRight, Wrench, TrendingUp, Users, MessageSquare } from "lucide-react";
import { useSupabase } from "../../providers/SupabaseProvider";
import AllRecommendationsModal from "./AllRecommendationsModal";
import RecommendationDetailsModal from "./RecommendationDetailsModal";

interface Recommendation {
  id: string;
  type: 'maintenance' | 'cost' | 'partnership' | 'customer';
  priority: number;
  title: string;
  description: string;
  impact: {
    value: string;
    type: 'positive' | 'negative';
  };
  roi?: {
    value: string;
    type: 'positive' | 'negative';
  };
  action: string;
  details: string;
  steps: string[];
}

const StrategicRecommendations: React.FC = () => {
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const { supabase } = useSupabase();

  // Simuler les données pour le moment
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'maintenance',
      priority: 1,
      title: 'Maintenance préventive recommandée',
      description: 'Une maintenance préventive de vos machines pourrait prévenir des pannes futures.',
      impact: {
        value: '-25%',
        type: 'positive'
      },
      roi: {
        value: '+15%',
        type: 'positive'
      },
      action: 'Planifier la maintenance',
      details: 'La maintenance préventive régulière peut augmenter significativement la durée de vie de vos machines et réduire les coûts de réparation à long terme.',
      steps: [
        'Identifier les machines nécessitant une maintenance',
        'Contacter notre équipe technique',
        'Planifier une intervention à un moment optimal',
        'Suivre les recommandations post-maintenance'
      ]
    },
    {
      id: '2',
      type: 'cost',
      priority: 2,
      title: 'Optimisation des coûts possible',
      description: 'Nous avons identifié des opportunités de réduction des coûts opérationnels.',
      impact: {
        value: '-15%',
        type: 'positive'
      },
      roi: {
        value: '+10%',
        type: 'positive'
      },
      action: 'Voir le plan d\'optimisation',
      details: 'Une analyse détaillée de vos opérations a révélé plusieurs domaines où des économies significatives peuvent être réalisées sans compromettre la qualité du service.',
      steps: [
        'Examiner le rapport détaillé',
        'Sélectionner les mesures à mettre en place',
        'Implémenter les changements progressivement',
        'Suivre les résultats mensuellement'
      ]
    },
    {
      id: '3',
      type: 'partnership',
      priority: 2,
      title: 'Partenariat Hôtel Mercure',
      description: 'Opportunité de service blanchisserie',
      impact: {
        value: '+25%',
        type: 'positive'
      },
      action: 'Contacter',
      details: 'Un partenariat avec l\'hôtel Mercure pourrait augmenter vos revenus et améliorer votre visibilité.',
      steps: [
        'Contacter l\'hôtel Mercure',
        'Discuter des détails du partenariat',
        'Signer un accord de partenariat',
        'Mettre en place le service de blanchisserie'
      ]
    },
    {
      id: '4',
      type: 'customer',
      priority: 2,
      title: 'Amélioration Support Client',
      description: '70% des appels : aide utilisation',
      impact: {
        value: '-45%',
        type: 'positive'
      },
      action: 'Installer QR codes',
      details: 'L\'amélioration du support client peut augmenter la satisfaction des clients et réduire les coûts de support.',
      steps: [
        'Identifier les domaines d\'amélioration',
        'Créer des QR codes pour les instructions',
        'Installer les QR codes',
        'Suivre les résultats'
      ]
    }
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'cost':
        return <TrendingUp className="w-5 h-5" />;
      case 'partnership':
        return <Users className="w-5 h-5" />;
      case 'customer':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getBackgroundForType = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'cost':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'partnership':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'customer':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
  };

  // Filtrer les 2 recommandations prioritaires
  const priorityRecommendations = recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2);

  return (
    <>
      <div className="bg-white rounded-3xl p-4 md:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="mb-3 md:mb-0">
            <h2 className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-1">Recommandations Stratégiques</h2>
            <p className="text-sm text-[#666666]">Basées sur vos données des 30 derniers jours</p>
          </div>
          <button
            onClick={() => setShowAllRecommendations(true)}
            className="flex items-center gap-2 text-sm text-[#286BD4] hover:text-[#1D5BB9] transition-colors w-full md:w-auto justify-center md:justify-start"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#FAFBFF] border border-[#E5E9F2] rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Première recommandation */}
          <div 
            onClick={() => handleRecommendationClick(priorityRecommendations[0])}
            className="cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md rounded-xl p-3 md:p-4 -m-3 md:-m-4"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#286BD4] to-[#3B7BE9] self-start">
                {getIconForType(priorityRecommendations[0].type)}
              </div>
              <div className="flex-grow">
                <h3 className="text-base font-medium text-[#1a1a1a]">{priorityRecommendations[0].title}</h3>
                <p className="text-sm text-[#666666] mt-1 mb-3">{priorityRecommendations[0].description}</p>
                
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-white rounded-xl p-2 md:p-3 border border-[#E5E9F2]">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#38AF2E]"></div>
                      <span className="text-xs md:text-sm font-medium text-[#1a1a1a]">Impact</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base md:text-lg font-semibold text-[#38AF2E]">{priorityRecommendations[0].impact.value}</span>
                      <span className="text-xs text-[#666666]">d'appels</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-2 md:p-3 border border-[#E5E9F2]">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#286BD4]"></div>
                      <span className="text-xs md:text-sm font-medium text-[#1a1a1a]">ROI</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base md:text-lg font-semibold text-[#286BD4]">{priorityRecommendations[0].roi?.value}</span>
                      <span className="text-xs text-[#666666]">économies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deuxième recommandation */}
          <div 
            onClick={() => handleRecommendationClick(priorityRecommendations[1])}
            className="cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md rounded-xl p-3 md:p-4 -m-3 md:-m-4 mt-0"
          >
            <div className="pt-3 md:pt-4 border-t border-[#E5E9F2]">
              <div className="flex flex-col md:flex-row md:items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-[#38AF2E] to-[#4CC924] self-start">
                  {getIconForType(priorityRecommendations[1].type)}
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-medium text-[#1a1a1a]">{priorityRecommendations[1].title}</h3>
                  <p className="text-sm text-[#666666] mt-1 mb-3">{priorityRecommendations[1].description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-white rounded-xl p-2 md:p-3 border border-[#E5E9F2]">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#38AF2E]"></div>
                        <span className="text-xs md:text-sm font-medium text-[#1a1a1a]">Impact</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base md:text-lg font-semibold text-[#38AF2E]">{priorityRecommendations[1].impact.value}</span>
                        <span className="text-xs text-[#666666]">coûts</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-2 md:p-3 border border-[#E5E9F2]">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#286BD4]"></div>
                        <span className="text-xs md:text-sm font-medium text-[#1a1a1a]">ROI</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base md:text-lg font-semibold text-[#286BD4]">{priorityRecommendations[1].roi?.value}</span>
                        <span className="text-xs text-[#666666]">retour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowAllRecommendations(true)}
            className="w-full mt-3 px-3 md:px-4 py-2 bg-white border border-[#E5E9F2] rounded-xl text-xs md:text-sm text-[#286BD4] hover:bg-[#F5F7FA] transition-colors flex items-center justify-center gap-2"
          >
            <span>Voir toutes les recommandations</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18 6 15 3 18"/>
            </svg>
          </button>
        </div>
      </div>

      <AllRecommendationsModal
        isOpen={showAllRecommendations}
        onClose={() => setShowAllRecommendations(false)}
        recommendations={recommendations}
      />

      <RecommendationDetailsModal
        isOpen={selectedRecommendation !== null}
        onClose={() => setSelectedRecommendation(null)}
        recommendation={selectedRecommendation}
      />
    </>
  );
};

export default StrategicRecommendations;
