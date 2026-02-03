/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { QrCode, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const AnimalTracking: React.FC = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // ✅ Succès : Le QR Code est lu
        setScanResult(decodedText);
        scanner.clear(); // On arrête la caméra
        
        // On extrait l'ID de l'URL ou on utilise le texte brut
        // Si le QR contient juste l'ID, on redirige vers la fiche
        navigate(`/main/animals/${decodedText}`);
      },
      (error) => {
        console.warn("QR Code non détecté : ", error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Erreur arrêt scanner", err));
    };
  }, [navigate]);

  return (
    <div className="p-6 pt-24 min-h-screen bg-gray-50 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scanner un Animal</h1>
          <p className="text-gray-500 mb-6">
            Placez le QR Code de l'oreille de l'animal face à la caméra pour l'identifier.
          </p>

          {/* LA ZONE DE LA CAMÉRA */}
          <div id="reader" className="overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300"></div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 text-gray-600 hover:text-green-600 font-medium transition"
          >
            <RefreshCw size={18} /> Réinitialiser la caméra
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimalTracking;