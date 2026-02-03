import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useEffect } from 'react';
import { getAnimalById } from '../../../store/animal/action';
import { ChevronLeft, Tag, Mars, Venus, Calendar, TrendingUp, Printer, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../constants/env';
import { QRCodeSVG } from 'qrcode.react';

const AnimalDetail = () => {
  const { id } = useParams(); 
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const animal = useAppSelector((state) => state.animal.selectedAnimal);

  useEffect(() => {
    if (id) {
      dispatch(getAnimalById(Number(id))); 
    }
  }, [id, dispatch]);

  // Fonction pour télécharger le QR Code en image PNG
  const downloadQRCode = () => {
    const svg = document.getElementById("animal-qr") as HTMLElement & SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${animal?.entities?.name || 'animal'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  if (!animal || !animal.entities) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  const data = animal.entities;

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-20">
      {/* Bouton Retour - Caché à l'impression */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition print:hidden"
      >
        <ChevronLeft size={20} /> Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE : Photo et Statut */}
        <div className="space-y-6 print:hidden">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-green-50 mb-4">
              <img 
                src={data.photo ? `${env.noreact}${data.photo}` : "/placeholder-animal.png"} 
                alt={data.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
              {data.status || 'Actif'}
            </span>
          </div>

          {/* SECTION QR CODE - Affichage écran */}
          <div id="printable-badge" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-700 mb-4 print:block hidden">AgroPulse - Badge Officiel</h3>
            
            <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl">
              <QRCodeSVG 
                id="animal-qr"
                value={data.id.toString()}
                size={160}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="text-center mt-4">
              <p className="text-lg font-bold text-gray-900">{data.name}</p>
              <p className="text-xs text-gray-500 font-mono">ID: #{data.id}</p>
            </div>

            {/* Actions QR Code - Cachées à l'impression */}
            <div className="flex gap-2 mt-6 w-full print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                <Printer size={18} /> Imprimer
              </button>
              <button 
                onClick={downloadQRCode}
                className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition"
                title="Télécharger l'image"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Détails techniques */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit print:hidden">
          
          {/* Carte Espèce/Race */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Tag /></div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Espèce / Race</p>
              <p className="text-gray-900 font-bold">
                {data.species?.name || '—'} / {data.breed?.name || 'Non spécifiée'}
              </p>
            </div>
          </div>

          {/* Carte Genre */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${data.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
              {data.gender === 'male' ? <Mars /> : <Venus />}
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Genre</p>
              <p className="text-gray-900 font-bold">{data.gender === 'male' ? 'Mâle' : 'Femelle'}</p>
            </div>
          </div>

          {/* Carte Date de Naissance */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Calendar /></div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Date de naissance</p>
              <p className="text-gray-900 font-bold">
                {data.birthDate ? new Date(data.birthDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Carte Poids */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600"><TrendingUp /></div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Dernier poids enregistré</p>
              <p className="text-gray-900 font-bold">{data.weight} kg</p>
            </div>
          </div>

          {/* Section Historique / Soins (Vide pour l'instant) */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 py-12">
             <div className="bg-gray-50 p-4 rounded-full mb-3">
                <TrendingUp size={30} />
             </div>
             <p className="text-sm">Aucun suivi de santé enregistré pour le moment.</p>
          </div>
        </div>
      </div>

      {/* Styles CSS pour l'impression */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #printable-badge {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            border: 2px solid #eee !important;
            box-shadow: none !important;
            visibility: visible !important;
            width: 300px !important;
          }
          /* Masquer tout le reste sauf le badge */
          div:not(#printable-badge) {
            visibility: hidden;
          }
          #printable-badge, #printable-badge * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimalDetail;