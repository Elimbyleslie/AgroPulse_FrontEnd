import { useNavigate } from "react-router";
import Button from '../../components/UI/Button';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
     <h1 className="font-bold "> Accès refusé</h1>
      <Button className="font-bold text-vert rounded-md" onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );
};

export default Forbidden;
