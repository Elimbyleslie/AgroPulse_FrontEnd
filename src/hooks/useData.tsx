
import React from 'react';
import { useAppSelector } from '../hooks/store';
import { Link } from 'react-router-dom';

export const SettingsMenu: React.FC = () => {

const { user } = useAppSelector((state) => state.authentification.auth);

// Vérifier si l'un de ses rôles est ORGANIZATION_OWNER
const isOrgOwner = user?.roles?.some(r => r === "ORGANIZATION_OWNER");

return (
  <nav>
    <Link to="/dashboard">Tableau de bord</Link>
    
    {/* ✅ Ce menu n'apparaît que pour les propriétaires d'organisation */}
    {isOrgOwner && (
      <>
        <Link to="/settings/billing">Abonnement & Factures</Link>
        <Link to="/settings/team">Gérer l'équipe</Link>
      </>
    )}
  </nav>
);

};