import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundMain() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      {/* Illustration */}
      <div className="max-w-md">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100%" height="100%" fill="#F5F5F5" />
          <circle cx="200" cy="150" r="80" fill="#0D8849" opacity="0.15" />
          <circle cx="200" cy="150" r="60" fill="#0D8849" opacity="0.2" />
          <circle cx="200" cy="150" r="40" fill="#0D8849" opacity="0.3" />
          <text
            x="50%"
            y="52%"
            textAnchor="middle"
            fill="#1B5E20"
            fontSize="76"
            fontWeight="700"
            fontFamily="Inter"
          >
            404
          </text>
        </svg>
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-gray-900 mt-8">
        Page introuvable
      </h1>

      {/* Texte */}
      <p className="text-gray-600 mt-3 text-center max-w-md">
        Oups… La page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      {/* Bouton de retour */}
      <Link
        to="/main"
        className="mt-6 inline-flex items-center gap-2 bg-[#0D8849] text-white px-5 py-2.5 rounded-xl shadow transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>
    </div>
  );
}
