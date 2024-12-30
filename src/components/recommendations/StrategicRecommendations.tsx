import React, { useState } from 'react';
import { Lightbulb, TrendingUp, ArrowRight, Calendar, ChartBar } from 'lucide-react';
import Modal from '../ui/Modal';

interface Impact {
  metric: string;
  value: string;
  trend: 'positive' | 'negative';
}

interface Action {
  type: 'schedule' | 'analyze';
  label: string;
  onClick: () => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'operational' | 'strategic';
  priority: 'high' | 'medium' | 'low';
  location: string;
  impacts: Impact[];
  actions: Action[];
  data: {
    callsCount?: number;
    timeFrame?: string;
    savingsEstimate?: string;
    revenueIncrease?: string;
  };
}

const StrategicRecommendations: React.FC = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Données mockées (à remplacer par l'API)
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Maintenance préventive requise',
      description: 'Machine #5 à la laverie Lyon Centre a généré 12 appels ce mois-ci. Une maintenance préventive réduirait significativement les pannes.',
      type: 'operational',
      priority: 'high',
      location: 'Lyon Centre',
      impacts: [
        { metric: 'Réduction des appels', value: '-20%', trend: 'positive' },
        { metric: 'Satisfaction client', value: '+15%', trend: 'positive' }
      ],
      actions: [
        { type: 'schedule', label: 'Planifier maintenance', onClick: () => console.log('Planifier') },
        { type: 'analyze', label: 'Voir analyse détaillée', onClick: () => console.log('Analyser') }
      ],
      data: {
        callsCount: 12,
        timeFrame: '30 jours',
        savingsEstimate: '450€/mois'
      }
    },
    {
      id: '2',
      title: 'Opportunité d\'expansion',
      description: 'La laverie Saint-Michel montre une forte demande. L\'ajout de machines supplémentaires augmenterait significativement les revenus.',
      type: 'strategic',
      priority: 'medium',
      location: 'Paris Saint-Michel',
      impacts: [
        { metric: 'Revenus estimés', value: '+20%', trend: 'positive' },
        { metric: 'ROI estimé', value: '6 mois', trend: 'positive' }
      ],
      actions: [
        { type: 'analyze', label: 'Étude détaillée', onClick: () => console.log('Étudier') }
      ],
      data: {
        timeFrame: '12 mois',
        revenueIncrease: '2500€/mois'
      }
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'operational':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'strategic':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Recommandations opérationnelles */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h2 className="text-lg font-bold text-white">Optimisation Opérationnelle</h2>
        </div>

        <div className="space-y-2">
          {recommendations
            .filter(rec => rec.type === 'operational')
            .map(recommendation => (
              <div
                key={recommendation.id}
                className={"relative p-2 rounded-lg border " + getPriorityColor(recommendation.priority)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white text-sm">{recommendation.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {recommendation.location}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400">{recommendation.description}</p>

                  <div className="flex flex-wrap gap-3">
                    {recommendation.impacts.map((impact, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className={
                          impact.trend === 'positive' ? 'text-green-500 text-xs' : 'text-red-500 text-xs'
                        }>
                          {impact.value}
                        </span>
                        <span className="text-xs text-gray-400">{impact.metric}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {recommendation.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedRecommendation(recommendation);
                          if (action.type === 'analyze') {
                            setShowAnalysisModal(true);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
                      >
                        {action.type === 'schedule' ? (
                          <Calendar className="w-3 h-3" />
                        ) : (
                          <ChartBar className="w-3 h-3" />
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recommandations stratégiques */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Optimisation Stratégique</h2>
        </div>

        <div className="space-y-2">
          {recommendations
            .filter(rec => rec.type === 'strategic')
            .map(recommendation => (
              <div
                key={recommendation.id}
                className={"relative p-2 rounded-lg border " + getPriorityColor(recommendation.priority)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white text-sm">{recommendation.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {recommendation.location}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400">{recommendation.description}</p>

                  <div className="flex flex-wrap gap-3">
                    {recommendation.impacts.map((impact, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className={
                          impact.trend === 'positive' ? 'text-green-500 text-xs' : 'text-red-500 text-xs'
                        }>
                          {impact.value}
                        </span>
                        <span className="text-xs text-gray-400">{impact.metric}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {recommendation.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedRecommendation(recommendation);
                          if (action.type === 'analyze') {
                            setShowAnalysisModal(true);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
                      >
                        <ChartBar className="w-3 h-3" />
                        {action.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal d'analyse détaillée */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="Analyse détaillée"
      >
        {selectedRecommendation && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedRecommendation.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {selectedRecommendation.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedRecommendation.data.callsCount && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Appels générés</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedRecommendation.data.callsCount}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    sur {selectedRecommendation.data.timeFrame}
                  </p>
                </div>
              )}

              {selectedRecommendation.data.savingsEstimate && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Économies estimées</p>
                  <p className="text-xl font-bold text-green-500 mt-1">
                    {selectedRecommendation.data.savingsEstimate}
                  </p>
                </div>
              )}

              {selectedRecommendation.data.revenueIncrease && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Augmentation des revenus</p>
                  <p className="text-xl font-bold text-green-500 mt-1">
                    {selectedRecommendation.data.revenueIncrease}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Impacts attendus</h4>
              <div className="space-y-2">
                {selectedRecommendation.impacts.map((impact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{impact.metric}</span>
                    <span className={
                      impact.trend === 'positive' ? 'text-green-500' : 'text-red-500'
                    }>
                      {impact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StrategicRecommendations;
