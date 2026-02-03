import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from "../hooks/store"
import { selectAuthenticatedUser } from '../store/auth/slice';
const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.authentification.auth.user);


  return (
    <div>
      <h1>Configuration de votre ferme</h1>
    </div>
  );
};

export default OnboardingPage;