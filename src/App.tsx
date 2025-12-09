import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { store } from "./store";


import WelcomePagesLayout from './Layouts/welcomePages/index'
import Home from './pages/welcomepages/Home'
import ContactUs from './pages/welcomepages/ContactUs'
import Tarif  from './pages/welcomepages/Tarif'
import NotFound from "./pages/welcomepages/Errors/NotFound";


function App() {


  return (
    <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePagesLayout />}>
              <Route path="/" index element={<Navigate to={`home`} />} />
              <Route path="/home" element={<Home />} />
              <Route path="/tarif" element={<Tarif />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* <Route path="/auth" element={<AuthLayout />}>
              <Route path=""  element={<Navigate to={`/login`} />} />
              <Route path="login" index element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="otp" element={<VerifiedOTP />} />
              <Route path= "forgotpassword" element={<ForgotPassword/>} />
            </Route> */}
{/* 
            <Route path="admin/" element={<DashboardLayout />}>
              <Route path="" index element={<Dashboard />} />
              <Route path="*" element={<NotfoundDashboard />} />
            </Route> */}
          </Routes>
        </BrowserRouter>
      </Provider>
 
  )
}


export default App
