import { FaCheckCircle } from "react-icons/fa";
import appareil from "../../assets/images/ChatGPT_Image_19_févr._2026__15_13_53-removebg-preview.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="">
      {/*   Home */}
      <div className="bg-vert h-full w-full">
        {/* ------------ELEMENTS__DE_LA__PREMIERE__SECTION_HOME */}
        <div className=" grid   grid-cols-[2fr_1.5fr] max-sm:grid-cols-1 xl:px-16 max-md:grid-cols-1 py-40  max-sm:py-28 gap-10 md:px-10  max-md:px-5 ">
          <div className=" flex  flex-col   ">
            <p className=" max-md:text-start  mb-8 text-white text-4xl  text-start   max-lg:text-2xl font-semibold  ">
              Gérez votre cheptel avec une efficacité inégalée grâce à notre
              application intuitive et performante.
            </p>
            <div className="flex flex-col items-start gap-2">
              <div className=" flex justify-center">
                <FaCheckCircle className=" text-white text-2xl mr-2" />
                <span className=" text-white text-lg max-lg:text-sm font-medium">
                  Suivi simplifié de la santé et de la productivité de votre
                  bétail
                </span>
              </div>

              {/* --------------------------- */}
              <div className=" flex justify-center">
                <FaCheckCircle className=" text-white text-2xl mr-2 " />
                <span className=" text-white text-lg max-lg:text-sm font-medium">
                  Accès instantané aux données essentielles pour une prise de
                  décision éclairée
                </span>
              </div>
              {/* --------------------------- */}
              <div className="flex justify-center">
                <FaCheckCircle className=" text-white text-2xl mr-2 " />
                <span className=" text-white text-lg max-lg:text-sm font-medium">
                  Optimisation de la gestion quotidienne de votre exploitation
                  agricole
                </span>
              </div>
              {/* --------------------------- */}
              <div className=" my-4 text-xs text-white">
                <p>
                  Version gratuite jusqu'à 10 bêtes, alors faites nous confiance
                  et tester notre application qui va révolutionner votre manière
                  de travailler ,
                </p>
              </div>
              <button className="bg-jaune max-w-[8rem]   px-4 py-2 rounded-full text-white">
                En savoir +
              </button>
            </div>
          </div>
          {/*   {/* ------------ELEMENTS__DE_LA__PREMIERE__SECTION_HOME FIN */}

          {/* ------------ELEMENTS__DE_LA__DEUXIEME__SECTION_HOME */}
          <div className=" flex justify-center ">
            <img src={appareil} alt="" className=" max-h-96 w-full   " />
          </div>
          {/* ------------ELEMENTS__DE_LA__DEUXIEME__SECTION_HOME FIN */}
        </div>
      </div>
      {/* Fonctionnalites */}
    <div className="h-full bg-white w-full pt-16 max-sm:py-8">
  <div className="max-sm:px-4 px-10 text-center">
    <h1 className="text-text text-[2rem] font-bold max-sm:text-[1.5rem]">
      Découvrez AgroPulse, l'application qui révolutionne l'élevage
    </h1>
    <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto">
      Tout ce dont vous avez besoin pour gérer votre élevage, réuni en une seule application.
    </p>
  </div>

  <div className="grid xl:grid-cols-3 lg:grid-cols-3 max-sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-2 px-16 max-sm:px-5 md:px-10 sm:px-8 gap-8 py-16">

    {/* Card 1 */}
    <div className="group flex flex-col gap-5 border-l-4 border-vert bg-gray-50 hover:bg-vert rounded-2xl px-8 py-10 transition-all duration-300 hover:shadow-xl">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-vert group-hover:bg-white/20 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
        Enregistrement du bétail
      </h2>
      <p className="text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors duration-300">
        Centralisez toutes les informations de votre bétail : espèces, dates de naissance, historique médical et cycles de reproduction en quelques clics.
      </p>
    </div>

    {/* Card 2 */}
    <div className="group flex flex-col gap-5 border-l-4 border-vert bg-gray-50 hover:bg-vert rounded-2xl px-8 py-10 transition-all duration-300 hover:shadow-xl">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-vert group-hover:bg-white/20 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
        Analyses & Rapports
      </h2>
      <p className="text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors duration-300">
        Visualisez les performances de votre ferme grâce à des tableaux de bord intuitifs. Identifiez les tendances et optimisez vos rendements facilement.
      </p>
    </div>

    {/* Card 3 */}
    <div className="group flex flex-col gap-5 border-l-4 border-vert bg-gray-50 hover:bg-vert rounded-2xl px-8 py-10 transition-all duration-300 hover:shadow-xl">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-vert group-hover:bg-white/20 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
        Suivi financier
      </h2>
      <p className="text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors duration-300">
        Suivez vos dépenses, ventes et bénéfices en temps réel. Gardez une vision claire et précise de la santé financière de votre ferme à tout moment.
      </p>
    </div>

  </div>
</div>
      {/* Comment ça marche */}
      <div className="w-full h-full bg-gray-50 ">
        <div className="text-center text-text py-16 max-sm:py-8 px-10 max-sm:px-4 ">
          <h1 className="underline font-bold underline-offset-8 text-[2rem]">
            Comment ça marche ?
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            3 étapes simples pour gérer votre ferme efficacement
          </p>
        </div>

        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1  gap-8 px-16 max-sm:px-6 md:px-10 pb-24 max-sm:pb-12">
          {/* Carte 1 */}
          <div className="flex flex-col items-center text-center gap-5 bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-3-3v6M4 6c-.5-1-1-2.5 0-3.5C5.5 1 7 2.5 6 4M20 6c.5-1 1-2.5 0-3.5C18.5 1 17 2.5 18 4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5C7.5 5 4 8 4 11.5c0 1.8.9 3.4 2.3 4.6L6 19l3-1.5c1 .3 2 .5 3 .5 4.5 0 8-3 8-6.5S16.5 5 12 5z"
                />
              </svg>
            </div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Étape 1
            </span>
            <h2 className="font-bold text-xl text-gray-800">
              Enregistrez le bétail
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Ajoutez les espèces, dates de naissance et cycles de reproduction.
              Toutes les infos de votre ferme centralisées en un seul endroit.
            </p>
          </div>

          {/* Carte 2 */}
          <div className="flex flex-col items-center text-center gap-5 bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v18h18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16l4-5 4 3 4-7"
                />
                <circle cx="19" cy="7" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Étape 2
            </span>
            <h2 className="font-bold text-xl text-gray-800">
              Analyses & Optimisation
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Accédez aux rapports détaillés et automatisez les tâches
              récurrentes pour optimiser le fonctionnement quotidien de votre
              ferme.
            </p>
          </div>

          {/* Carte 3 */}
          <div className="flex flex-col items-center text-center gap-5 bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v2m0 16v2M6 12H4m16 0h-2"
                />
                <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v4m-1.5-2.5h3"
                />
              </svg>
            </div>
            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Étape 3
            </span>
            <h2 className="font-bold text-xl text-gray-800">
              Tracker vos finances
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Enregistrez dépenses, ventes et bénéfices pour avoir une vision
              claire et précise de la santé financière de votre ferme.
            </p>
          </div>
        </div>
      </div>
      {/* pourquoi nous choisir */}
     <div className="w-full h-full bg-vert">
  <div className="flex justify-center max-sm:px-5 py-10">
    <h1 className="text-[1.8rem] font-bold text-white max-sm:text-2xl max-sm:text-center">
      Pourquoi choisir Agropulse ?
    </h1>
  </div>

  <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6 px-16 sm:px-8 max-sm:px-4 pb-20">

    {/* Card 1 */}
    <div className="flex flex-col items-center text-center gap-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/25 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <h2 className="font-bold text-xl text-white">
        Facile à utiliser
      </h2>
      <p className="text-white/80 text-base leading-relaxed">
        AgroPulse a été pensé pour tous les agriculteurs, même ceux peu habitués aux outils numériques. Une interface claire et intuitive dès le premier jour.
      </p>
    </div>

    {/* Card 2 */}
    <div className="flex flex-col items-center text-center gap-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/25 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <h2 className="font-bold text-xl text-white">
        Sécurité des données
      </h2>
      <p className="text-white/80 text-base leading-relaxed">
        Vos données sont protégées et stockées en toute sécurité. Accédez à vos informations en toute confiance, où que vous soyez et à tout moment.
      </p>
    </div>

    {/* Card 3 */}
    <div className="flex flex-col items-center text-center gap-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/25 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h2 className="font-bold text-xl text-white">
        Suivi en temps réel
      </h2>
      <p className="text-white/80 text-base leading-relaxed">
        Suivez les performances de votre ferme en temps réel grâce à des tableaux de bord clairs. Prenez les bonnes décisions au bon moment.
      </p>
    </div>

  </div>
</div>
      {/* ---Nous_contacter---- */}
     <div className="w-full h-full pt-10 pb-20 max-sm:px-5 max-sm:pt-5 max-sm:pb-14">
  <div className="flex justify-center py-10">
    <h1 className="text-[1.8rem] font-bold text-center max-sm:text-[1.4rem]">
      Contactez-nous
    </h1>
  </div>

  <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-6 px-16 sm:px-8 max-sm:px-4 mb-12">

    {/* Horaires */}
    <div className="flex flex-col items-center text-center gap-4 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-vert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-bold text-lg">Nos horaires</h2>
      <p className="text-gray-500 text-sm leading-relaxed">
        Lun – Ven &nbsp;<span className="font-semibold text-gray-700">8h – 18h</span><br />
        Samedi &nbsp;<span className="font-semibold text-gray-700">9h – 16h</span>
      </p>
    </div>

    {/* Téléphone */}
    <div className="flex flex-col items-center text-center gap-4 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-vert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      </div>
      <h2 className="font-bold text-lg">Appelez-nous</h2>
      
       <a href="tel:+237649705778"
        className="text-vert font-semibold text-lg hover:underline">
        +237 649 70 57 78
      </a>
      <p className="text-gray-400 text-sm">Disponible pendant les horaires d'ouverture</p>
    </div>

    {/* WhatsApp */}
    <div className="flex flex-col items-center text-center gap-4 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-vert" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
      <h2 className="font-bold text-lg">WhatsApp</h2>
      <Link
        to={""}
        className="text-vert font-semibold text-lg hover:underline"
      >
        +237 6 20 78 64 77
      </Link>
      <p className="text-gray-400 text-sm">Réponse rapide garantie</p>
    </div>

  </div>

  {/* CTA */}
  <div className="flex flex-col items-center gap-3 text-center px-4">
    <p className="text-gray-500 text-base max-w-md">
      Vous préférez nous écrire ? Remplissez notre formulaire et nous vous répondons dans les plus brefs délais.
    </p>
    <Link
      to={"/Contact"}
      className="bg-jaune py-3 px-8 rounded-2xl mt-3 text-white font-semibold text-base hover:opacity-90 transition-opacity duration-200 shadow-md"
    >
      Formulaire de contact →
    </Link>
  </div>
</div>
</div>
  );
};

export default Home;
