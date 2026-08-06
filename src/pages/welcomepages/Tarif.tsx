// src/pages/Tarifs.tsx
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";

interface Plan {
  id: string;
  name: string;
  price: number | "gratuit";
  period?: string;
  badge: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Découverte",
    price: "gratuit",
    badge: "Gratuit",
    description: "Idéal pour tester AgroPulse sur une petite exploitation.",
    features: [
      "1 ferme",
      "Jusqu'à 20 animaux",
      "Suivi de base des tâches",
      "Support communautaire",
    ],
    ctaText: "Commencer gratuitement",
  },
  {
    id: "starter",
    name: "Essentiel",
    price: 5000,
    period: "/mois",
    badge: "5000 F",
    description: "Pour les petites exploitations en croissance.",
    features: [
      "3 fermes",
      "Jusqu'à 150 animaux",
      "Notifications & rappels",
      "Rapports mensuels",
      "Support par email",
    ],
    ctaText: "Choisir Essentiel",
  },
  {
    id: "pro",
    name: "Professionnel",
    price: 10000,
    period: "/mois",
    badge: "10 000 F",
    description: "Le plus choisi par les exploitants sérieux.",
    features: [
      "Fermes illimitées",
      "Animaux illimités",
      "Gestion multi-utilisateurs",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    highlighted: true,
    ctaText: "Choisir Professionnel",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    price: 15000,
    period: "/mois",
    badge: "15 000 F",
    description: "Pour les coopératives et grandes structures.",
    features: [
      "Tout le plan Professionnel",
      "Organisations multiples",
      "Rôles & permissions avancés",
      "Accès API",
      "Accompagnement dédié",
    ],
    ctaText: "Nous contacter",
  },
];

const Tarifs = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan: Plan) => {
    navigate(`/checkout?plan=${plan.id}`);
  };

  return (
    <div className="pt-24 pb-16 font-poppins px-4 sm:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-darkText">
          Choisissez le plan qui vous convient
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Des offres pensées pour accompagner votre exploitation à chaque
          étape de sa croissance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col bg-white p-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 ${
              plan.highlighted
                ? "border-2 border-vert shadow-vert/20 scale-[1.03]"
                : "border border-gray-100 shadow-black/10"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vert text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Le plus populaire
              </span>
            )}

            <div className="absolute -right-1 -top-1 bg-jaune w-16 h-16 rounded-full flex items-center justify-center shadow-md">
              <p className="text-white text-xs font-bold text-center leading-tight px-1">
                {plan.badge}
              </p>
            </div>

            <h2 className="text-darkText text-lg font-semibold mt-4">
              {plan.name}
            </h2>

            <div className="my-3">
              {plan.price === "gratuit" ? (
                <span className="text-3xl font-bold text-darkText">0 F</span>
              ) : (
                <span className="text-3xl font-bold text-darkText">
                  {plan.price.toLocaleString("fr-FR")} F
                  <span className="text-sm font-normal text-gray-400">
                    {plan.period}
                  </span>
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <Check size={16} className="text-vert mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPlan(plan)}
              className={`w-full py-2.5 font-medium ${
                plan.highlighted
                  ? "bg-vert text-white"
                  : "bg-gray-100 text-darkText hover:bg-gray-200"
              }`}
            >
              {plan.ctaText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tarifs;