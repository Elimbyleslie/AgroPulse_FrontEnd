import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';

const Contact = () => {
    // Typage correct de la ref pour éviter les "as unknown as..."
    const form = useRef<HTMLFormElement>(null);
    const [isSending, setIsSending] = useState(false);

    // Configuration Vite
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!form.current) return;

        setIsSending(true);
        const loadingToast = toast.loading('Envoi de votre message...');

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then(() => {
                toast.success('Message envoyé avec succès !', {
                    id: loadingToast, 
                    duration: 2000,
                    style: {
                        border: '1px solid #10b981',
                        padding: '12px',
                        color: '#065f46',
                    },
                });
                form.current?.reset(); 
            })
            .catch((error) => {
                console.error('Erreur EmailJS:', error);
                toast.error('Échec de l\'envoi. Veuillez réessayer.', {
                    id: loadingToast,
                });
            })
            .finally(() => {
                setIsSending(false);
            });
    };

    return (
        <div className='min-h-screen w-full text-[#2d3436] bg-gray-50 flex flex-col items-center py-20'>
            {/* Le composant Toaster doit être présent pour afficher les notifications */}
            <Toaster position="top-center" reverseOrder={false} />

            {/* Header */}
            <div className='text-center font-bold text-[2rem] py-5'>
                <h1 className='text-darkVert uppercase tracking-wide'>Contactez AgroPulse</h1>
                <div className='h-1 w-20 bg-vert mx-auto mt-2 rounded-full'></div>
            </div>

            {/* Formulaire */}
            <form 
                ref={form} 
                onSubmit={sendEmail}
                className='w-[90%] max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100'
            >
                <div className='space-y-6'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Nom Complet</label>
                        <input
                            type="text"
                            name="user_name"
                            required
                            placeholder="Ex: Amadou Diallo"
                            className='w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-vert focus:border-transparent outline-none transition-all'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Adresse Email</label>
                        <input
                            type="email"
                            name="user_email"
                            required
                            placeholder="nom@exemple.com"
                            className='w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-vert focus:border-transparent outline-none transition-all'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Votre Message</label>
                        <textarea
                            name="message"
                            required
                            rows={5}
                            placeholder="Décrivez votre besoin agricole..."
                            className='w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-vert focus:border-transparent outline-none transition-all resize-none'
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSending}
                        className={`w-full flex justify-center items-center font-bold py-4 px-6 rounded-lg transition-all shadow-lg text-white ${
                            isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                        }`}
                    >
                        {isSending ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Envoyer à l\'équipe'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contact;