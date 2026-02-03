// hooks/useAuthPersistence.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { setUserSession } from "../store/auth/slice";
import { AgroPulseStorage } from "../guards/storage";


export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector((state) => state.authentification.auth.token);
  const currentUser = useAppSelector((state) => state.authentification.auth.user);

  useEffect(() => {
    // Si Redux n'a pas de données mais le storage oui, restaurer la session
    if (!currentToken && !currentUser) {
      const storedToken = AgroPulseStorage.getAccessToken();
      const storedUser = AgroPulseStorage.getUser();

      if (storedToken && storedUser) {
        console.log("✅ Restauration de la session depuis le storage");
        dispatch(setUserSession({ 
          token: storedToken, 
          user: storedUser 
        }));
      }
    }
  }, [dispatch, currentToken, currentUser]);
};