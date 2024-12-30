import React from 'react';

const FAQ: React.FC = () => {
  const faqItems = [
    {
      question: "Comment configurer les alertes ?",
      answer: "Rendez-vous dans l'onglet Paramètres, puis dans la section 'Alertes'. Vous pourrez y définir les seuils d'alerte et les destinataires des notifications."
    },
    {
      question: "Comment ajouter une nouvelle laverie ?",
      answer: "Dans l'onglet Laveries, cliquez sur le bouton 'Ajouter une laverie' en haut à droite. Remplissez ensuite les informations requises dans le formulaire."
    },
    {
      question: "Comment gérer les interventions ?",
      answer: "L'onglet Interventions vous permet de planifier et suivre toutes les interventions. Vous pouvez créer une nouvelle intervention en cliquant sur le bouton '+' en haut à droite."
    },
    {
      question: "Comment contacter le support ?",
      answer: "Vous pouvez nous contacter via l'onglet Assistance ou par email à support@wewash.fr. Notre équipe est disponible 7j/7 de 8h à 20h."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Foire Aux Questions</h1>
      
      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-[#1A1D1D] rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">{item.question}</h3>
            <p className="text-gray-300">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
