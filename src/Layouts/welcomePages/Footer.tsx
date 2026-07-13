import React from "react";
import logo from "../../assets/images/Logo_agropulse.png";

const Footer = () => {
  return (
    <footer className="bg-vert pt-14 pb-8 px-16 max-sm:px-5 font-sans">
      
      {/* Grille principale */}
      <div className="grid xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 max-sm:grid-cols-1 gap-10 pb-10 border-b border-white/20">

        {/* Logo + slogan */}
        <div className="flex flex-col gap-4 xl:col-span-1">
          <img src={logo} alt="AgroPulse" className="w-36" />
          <p className="text-white/70 text-sm leading-relaxed italic">
            " Captez le rythme de votre élevage "
          </p>
          {/* Réseaux sociaux */}
          <div className="flex gap-3 mt-2">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-vert flex items-center justify-center text-white transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-vert flex items-center justify-center text-white transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-vert flex items-center justify-center text-white transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">
            Navigation
          </h3>
          <div className="flex flex-col gap-3">
            {["Accueil", "Fonctionnalités", "Tarifs", "Contact"].map((item) => (
              
             <a   key={item}
                href="#"
                className="text-white/70 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors duration-200" />
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">
            Support
          </h3>
          <div className="flex flex-col gap-3">
            <a href="mailto:Dencorp03@gmail.com" className="text-white/70 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Dencorp03@gmail.com
            </a>
            <a href="tel:+237694180923" className="text-white/70 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +237 694 18 09 23
            </a>
            <a href="#" className="text-white/70 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              FAQ
            </a>
          </div>
        </div>

        {/* Légal */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">
            Légal
          </h3>
          <div className="flex flex-col gap-3">
            {["Confidentialité", "Conditions d'utilisation", "Mentions légales"].map((item) => (
              
             <a  key={item}
              href="#"
                className="text-white/70 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors duration-200" />
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">
            Newsletter
          </h3>
          <p className="text-white/60 text-xs leading-relaxed">
            Recevez nos conseils d'éleveurs et les dernières actualités d'AgroPulse directement dans votre boîte mail.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors duration-200 w-full"
            />
            <button className="bg-white text-vert font-semibold text-sm py-3 px-4 rounded-xl hover:bg-white/90 transition-all duration-200 w-full">
              S'abonner →
            </button>
          </div>
        </div>

      </div>

      {/* Bas du footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8 text-white/50 text-xs">
        <span>
          © {new Date().getFullYear()} <span className="text-white font-semibold">AgroPulse</span>. Tous droits réservés.
        </span>
        <span className="italic">
          Fait avec ❤️ pour les éleveurs africains
        </span>
      </div>

    </footer>
  );
};

export default Footer;