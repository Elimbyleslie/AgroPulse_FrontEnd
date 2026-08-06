import { Link } from 'react-router-dom'


const Footer = () =>{
return (
  <div>
<footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-darkText">
                © {new Date().getFullYear()} <span className=' text-vert font-semibold'>Agro</span><span className=' text-jaune font_semibold'>Pulse</span>. Tous droits réservés.
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <Link to="/dashboard/help" className="hover:text-blue-600 transition-colors">
                  Aide
                </Link>
                <Link to="/dashboard/privacy" className="hover:text-blue-600 transition-colors">
                  Confidentialité
                </Link>
                <Link to="/dashboard/terms" className="hover:text-blue-600 transition-colors">
                  Conditions
                </Link>
              </div>
            </div>
          </footer>
  </div>
)
  
}

export default Footer ;