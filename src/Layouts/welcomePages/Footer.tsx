import React from "react";
import logo from "../../assets/images/Logo_agropulse.png";

const Footer = () => {
  return (
    <div className="bg-vert py-10 px-16 font-sans   max-sm:px-5">
      <div className="bg-dark_vert grid px-10 rounded-md max-sm:justify-center max-sm:px-5  text-white text-lg  py-5 xl:grid-cols-5  md:grid-cols-3 sm:grid-cols-2 max-sm:grid-cols-1  gap-5">
        <div>
          <img src={logo} alt="" className=" px-10" />
          <p className="text-sm mt-6 text-center">
            {" "}
            " Captez le rythme de votre élevage "
          </p>
        </div>
        {/* ----------------------------------------- */}
        <div>
          <h1 className="mb-4 font-bold text-xl underline-offset-4  max-sm:text-lg  underline">
            Navigation
          </h1>
          <div className=" flex flex-col gap-1 max-sm:text-sm">
            <a href="#">Accueil</a>
            <a href="#">Fonctionnalités</a>
            <a href="#">Tarifs</a>
            <a href="#">Contact</a>
          </div>
        </div>
        {/* ------------------------------------------------ */}
        <div>
          <h1 className="mb-4 font-bold text-xl underline-offset-4  max-sm:text-lg underline ">
            Support{" "}
          </h1>
          <div className=" flex flex-col gap-1 max-sm:text-sm">
            <a href="#">Dencorp03@gmail.com</a>
            <a href="#">+237 694180923</a>
            <a href="#">Faq </a>
          </div>
        </div>
        {/* ------------------------------------------------------ */}
        <div>
          <h1 className="mb-4 font-bold text-xl underline-offset-4 max-sm:text-lg underline">
            social{" "}
          </h1>
          <div className=" flex flex-col gap-1 max-sm:text-sm">
            <a href="#">@agropulse</a>
            <a href="#">agropulse</a>
            <a href="#">Faq </a>
          </div>
        </div>
        {/* ---------------------------------------------------------- */}
        <div className="w-full">
          <h1 className="mb-6 font-bold text-xl underline-offset-4  max-sm:text-lg underline">
            NewsLetters{" "}
          </h1>
          <div className=" text-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className=" bg-news rounded-md py-2 mb-4 outline-none placeholder:px-2 w-full"
            />
            <button className="bg-vert text-[12px] px-2 w-full   max-sm:text-xs py-4 rounded-md">
              Recevoir des astuces d'éleveurs
            </button>
          </div>
        </div>
        {/* ------------------------------------------------------- */}
      </div>
    </div>
  );
};

export default Footer;
