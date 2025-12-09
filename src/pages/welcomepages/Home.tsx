import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import appareil from "../../assets/images/Appareils.png";
import fiche from "../../assets/images/Groupe 588.png";
import iphone from "../../assets/images/iphone.png";
import {Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="">
      {/*   Home */}
      <div className="bg-vert h-full w-full">
        {/* ------------ELEMENTS__DE_LA__PREMIERE__SECTION_HOME */}
        <div className=" grid   grid-cols-[2fr_1fr] max-sm:grid-cols-1 xl:px-16 max-md:flex-wrap py-40  max-sm:py-28 gap-10 md:px-10  max-md:px-5 ">
          <div className=" flex  flex-col   ">
            <p className=" mb-8 text-white text-4xl  text-start max-md:text-center  max-lg:text-2xl font-semibold  ">
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
          <div className=" flex justify-center">
            <img src={appareil} alt="" className=" max-h-80 w-66" />
          </div>
          {/* ------------ELEMENTS__DE_LA__DEUXIEME__SECTION_HOME FIN */}
        </div>
      </div>
      {/* Fonctionnalites */}
      <div className="h-full bg-white w-full text-center  py-16 max-sm:py-8 ">
        <div className=" max-sm:px-4 px-10">
          <h1 className=" text-text text-[2rem] font-bold  max-sm:text-[1.5rem] ">
            Découvrez AgroPulse, l'application qui révolutionne l'élevage
          </h1>
        </div>
        <div className="  grid xl:grid-cols-3 lg:grid-cols-3 max-sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-2 px-10  max-sm:px-5 gap-10 py-20">
          {/* ----------------------------------- */}
          <div className=" bg-vert px-6 text-white py-10 relative rounded-2xl">
            <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2  w-20 h-20  flex justify-center items-center">
              <img src={fiche} alt="" />
            </div>
            <h1 className="text-xl font-semibold py-4">
              Enregistrement du betail
            </h1>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores
              excepturi id a, quia iure maiores animi ipsum sit esse impedit
              iste
            </p>
          </div>
          {/* ----------------------------------------------- */}
          <div className=" bg-vert px-6 text-white py-10 relative rounded-2xl">
            <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2  w-20 h-20  flex justify-center items-center">
              <img src={fiche} alt="" />
            </div>
            <h1 className="text-xl font-semibold py-4">
              Enregistrement du betail
            </h1>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores
              excepturi id a, quia iure maiores animi ipsum sit esse impedit
              iste
            </p>
          </div>
          {/* ----------------------------------- */}
          <div className=" bg-vert px-6 text-white py-10 relative rounded-2xl">
            <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2  w-20 h-20  flex justify-center items-center">
              <img src={fiche} alt="" />
            </div>
            <h1 className="text-xl font-semibold py-4">
              Enregistrement du betail
            </h1>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores
              excepturi id a, quia iure maiores animi ipsum sit esse impedit
              iste
            </p>
          </div>
        </div>
      </div>
      {/* Comment ça marche */}
      <div>
        <div className=" text-center text-text py-16 max-sm:py-8 px-10 max-sm:px-4">
          <h1 className=" underline font-bold underline-offset-8 text-[2rem]">
            Comment ca marche ?
          </h1>
        </div>
        <div className=" text-text grid grid-cols-2 px-20 xl:pb-20 lg:pb-20 md:pb-16 sm:pb-10 justify-center max-sm:px-4 max-sm:grid-cols-1 md:px-10 sm:px-10  ">
          <div className=" flex flex-col items-start gap-6  max-sm:items-center">
            <h1 className=" font-semibold text-[1.8rem] max-sm:text-2xl max-sm:text-center">
              Enregistrez les données du betail
            </h1>
            <p className="text-2xl text-start max-sm:text-center sm:text-[1.3rem] max-sm:mb-10 max-sm:text-xl ">
              Ajouter des détails précis sur votre bétail, tels que les espèces
              ,dates de naissance,le cycle de reproduction. Gardez toutes les
              informations sur votre ferme en un seul endroit.
            </p>
          </div>
          {/* ------------------------------- */}
          <div className="flex justify-center ">
            <img
              src={iphone}
              alt=""
              className=" mx-auto max-sm:mb-20  max-w-[220px]  max-sm:max-w-40"
            />
          </div>

          {/* -------------------------------- */}
        </div>
        {/* ---------------- */}
        <div className=" text-text grid grid-cols-2 max-sm:flex-col-reverse xl:pb-20 lg:pb-20 md:pb-16 sm:pb-10  max-sm:flex  px-16 justify-center max-sm:px-4 max-sm:grid-cols-1 md:px-10 sm:px-10  ">
          {/* ------------------------------- */}
          <div className="flex justify-center">
            <img
              src={iphone}
              alt=""
              className=" mx-auto max-sm:mb-20 max-w-[220px]  max-sm:max-w-40 "
            />
          </div>
          <div className=" flex flex-col items-start gap-6   max-sm:items-center">
            <h1 className=" font-semibold text-[1.8rem]  max-sm:text-2xl max-sm:text-center ">
              Analyses et Optimisation
            </h1>
            <p className="text-2xl text-start max-sm:text-center max-sm:mb-10 sm:text-[1.3rem]  max-sm:text-xl ">
              Accédez à toutes les analyses et rapports pour un suivie à la
              trace de votre ferme. Profiter des systèmes d'automatisation des
              tâches récurrentes du quotidien pour vous faciliter la vie.
            </p>
          </div>
          {/* -------------------------------- */}
        </div>
        {/* ---------------- */}
        <div className=" text-text grid grid-cols-2  px-16 justify-center max-sm:px-4 xl:pb-20 lg:pb-20 md:pb-16 sm:pb-10 max-sm:grid-cols-1 md:px-10 sm:px-10  pb-20">
          <div className=" flex flex-col items-start gap-6 max-sm:items-center ">
            <h1 className=" font-semibold text-[1.8rem] max-sm:text-2xl max-sm:text-center ">
              Tracker vos finances{" "}
            </h1>
            <p className="text-2xl text-start max-sm:text-center max-sm:text-xl max-sm:mb-10 sm:text-[1.3rem]   ">
              Surveiller les finances de votre ferme. Enregistrez les dépenses ,
              les ventes et les bénéfices que font votre ferme pour avoir une
              idée claire de l'état financier de votre ferme.
            </p>
          </div>
          {/* ------------------------------- */}
          <div className="flex justify-center">
            <img
              src={iphone}
              alt=""
              className=" mx-auto max-sm:mb-20 max-w-[220px] max-sm:max-w-40"
            />
          </div>
          {/* -------------------------------- */}
        </div>
      </div>
      {/* pourquoi nous choisir */}
      <div className="w-full h-full bg-vert ">
        <div className="flex justify-center max-sm:px-5 py-10">
          <h1 className="text-[1.8rem] font-bold text-white max-sm:text-2xl max-sm:text-center  ">
            Pourquoi choisir Agropulse{" "}
          </h1>
        </div>
        <div className=" grid grid-cols-2 max-sm:grid-cols-1 gap-5 px-16 sm:px-8 max-sm:px-4 py-16">
          <div>
            <img
              src={iphone}
              alt="Iphone"
              className="mx-auto max-sm:mb-20 xl:w-[300px]  lg:w-[300px] md:w-[250px] max-sm:max-w-40 sm:w-[200px]"
            />
          </div>
          {/* ---------------------------- */}
          <div className="flex flex-col gap-8 ">
            <div className="bg-white xl:w-2/3 lg:w-5/6 md:w-4/5 sm:w-full  max-sm:w-full rounded-2xl p-3">
              <h1 className="font-semibold text-xl py-2 text-center">
                Facile à utilisé
              </h1>
              <p className="text-center">
                AgroPulse est conçu pour être facile à utiliser , même pour ceux
                qui ne sont pas très technologiques
              </p>
            </div>
            {/* -------------------------------------------------- */}
            <div  className="bg-white w-2/3 xl:w-2/3 lg:w-5/6 md:w-4/5 sm:w-full max-sm:w-full rounded-2xl p-3" >
              <h1 className="font-semibold text-xl py-2 text-center">
                sécurité des données{" "}
              </h1>
              <p className="text-center">
                AgroPulse est conçu pour être facile à utiliser , même pour ceux
                qui ne sont pas très technologiques
              </p>
            </div>
            {/* ------------------------------------------------------- */}
            <div className="bg-white w-2/3 xl:w-2/3 lg:w-5/6 md:w-4/5 sm:w-full  max-sm:w-full rounded-2xl p-3">
              <h1 className="font-semibold text-xl py-2 text-center">
                Facile à utilisé
              </h1>
              <p className="text-center">
                AgroPulse est conçu pour être facile à utiliser , même pour ceux
                qui ne sont pas très technologiques
              </p>
            </div>
            {/* ----------------------------------------------- */}
          </div>
        </div>
      </div>
      {/* ---Nous_contacter---- */}
      <div className="w-full h-full pt-10 pb-20 max-sm:px-5 max-sm:pt-5 max-sm:pb-14 ">
        <div className="flex justify-center py-10 ">
          <h1 className="text-[1.8rem] font-bold text-center max-sm:text-[1.4rem]">Contactez-nous</h1>
        </div>
        <div className="flex items-center text-center  flex-col gap-y-4 text-[1.4rem] max-sm:text-base">
          <p>Contactez nous dès  maintenant et nous répondons à toutes vos questions </p>
          <p>Nos horaires: <span className="font-semibold"> Lundi , Mardi, Mercredi, Jeudi, Vendredi  de 8h  à  18h  et samedi de 9h à  16h.</span></p>
          <p>Appelez nous  au <span className="text-vert font-semibold">+237 649 70 57 78</span></p>
          <Link to={""}>WhatsApp : <span className="text-vert font-semibold ">+237 6 20 78 64 77</span></Link>
            <Link  to={'/Contact'} className="bg-jaune py-2 px-5 rounded-xl mt-5 max-sm:text-base text-white">Formulaire de contact</Link>
        </div>
      
      </div>
      {/* ------------------------------ */}
    </div>
  );
};

export default Home;
