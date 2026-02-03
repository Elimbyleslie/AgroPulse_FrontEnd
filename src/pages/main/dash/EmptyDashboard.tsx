import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { X, Building2, Home, PawPrint } from "lucide-react";
import { fetchWithAuthOrganizations } from "../../../store/organization/action";
import { getAllFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";
import OrganizationForm from "../../../components/Modal/organization";
import FarmForm from "../../../components/Modal/Farm";
import AnimalForm from "../../../components/Modal/AnimalForm";
import { toast } from "react-toastify";
import { selectgetAllAnimals } from "../../../store/animal/slice";
import { useNavigate } from "react-router-dom";
type ModalType = "organization" | "farm" | "animal" | null;

interface StepConfig {
  id: "organization" | "farm" | "animal";
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
}

export default function EmptyDashboard() {
  const dispatch = useAppDispatch();

  const organizations =
    useAppSelector((state) => state.organizations.organizationList.entities) ??
    [];
  const farms = useAppSelector((state) => state.farms.farmList.entities) ?? [];
  const animalState = useAppSelector(selectgetAllAnimals);
  const animals = animalState.entities ?? [];
  const [modal, setModal] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firstFarmId = farms[0]?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Étape A: Charger les structures de base
        await Promise.all([
          dispatch(fetchWithAuthOrganizations({ limit: 1 })),
          dispatch(getAllFarms({ limit: 10 })),
        ]);
      } catch (error) {
        console.error("Erreur chargement initial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  useEffect(() => {
    // On ne déclenche QUE si firstFarmId est un nombre valide
    if (firstFarmId && typeof firstFarmId === "number") {
      dispatch(
        getAllAnimals({
          limit: 10,
          farmId: firstFarmId,
        }),
      );
    }
  }, [dispatch, firstFarmId]);

  const completedSteps = {
    organization: organizations.length > 0,
    farm: farms.length > 0,
    animal: animals.length > 0,
  };

  const allStepsCompleted =
    completedSteps.organization && completedSteps.farm && completedSteps.animal;

  const closeModal = () => setModal(null);

  const handleStepComplete = async (
    step: "organization" | "farm" | "animal",
  ) => {
    closeModal();

    switch (step) {
      case "organization":
        await dispatch(fetchWithAuthOrganizations({ limit: 1 }));
        break;
      case "farm":
        await dispatch(getAllFarms({ limit: 10 }));
        break;
      case "animal":
        if (farms.length > 0) {
          await dispatch(
            getAllAnimals({
              limit: 10,
              page: 1,
              farmId: farms[0].id,
            }),
          );
        }
        break;
    }
  };

  // ✅ Fonction pour ouvrir le modal avec vérification
  const handleOpenModal = (stepId: "organization" | "farm" | "animal") => {
    // Si on essaie d'ouvrir "farm" mais qu'il n'y a pas d'organisation
    if (stepId === "farm" && organizations.length === 0) {
      toast.error(
        "Veuillez d'abord créer une organisation avant d'ajouter une ferme.",
      );
      return;
    }

    // Si on essaie d'ouvrir "animal" mais qu'il n'y a pas de ferme
    if (stepId === "animal" && farms.length === 0) {
      toast.error(
        "Veuillez d'abord créer une ferme avant d'ajouter un animal.",
      );
      return;
    }

    setModal(stepId);
  };

  useEffect(() => {

  
  if (!isLoading && allStepsCompleted) {
    console.log("✅ Données détectées : Redirection vers le Dashboard");
      const timer = setTimeout(() => {
      navigate('/main/dashboard', { replace: true });
    }, 1000); // 2 secondes de battement

    return () => clearTimeout(timer);
  }
}, [isLoading, allStepsCompleted, navigate]);


  const steps: StepConfig[] = [
    {
      id: "organization",
      title: "Créer une Organisation",
      description: "Commencez par créer votre organisation",
      icon: <Building2 className="w-8 h-8" />,
      buttonText: "Créer une organisation",
    },
    {
      id: "farm",
      title: "Ajouter une Ferme",
      description: "Ajoutez votre première ferme",
      icon: <Home className="w-8 h-8" />,
      buttonText: "Ajouter une ferme",
    },
    {
      id: "animal",
      title: "Enregistrer un Animal",
      description: "Enregistrez votre premier animal",
      icon: <PawPrint className="w-8 h-8" />,
      buttonText: "Ajouter un animal",
    },
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Completion State
  if (allStepsCompleted) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-4 pt-20">
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Félicitations !
          </h1>

          <p className="text-gray-600 mb-6">Votre profil AgroPulse est prêt.</p>

          <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>{organizations.length} organisation(s)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>{farms.length} ferme(s)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>{animals.length} animal(aux)</span>
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/main/dashboard")}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Accéder au tableau de bord
          </button>
        </motion.div> */}
      </div>
    );
  }

  // Setup Steps State
  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue sur AgroPulse
          </h1>
          <p className="text-gray-600">
            Suivez ces étapes pour configurer votre Ferme
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[step.id];
            const isDisabled =
              index > 0 && !completedSteps[steps[index - 1].id];

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative bg-white rounded-xl shadow-md p-6 border-2 transition-all
                  ${
                    isCompleted
                      ? "border-green-500 bg-green-50"
                      : isDisabled
                        ? "border-gray-200 opacity-60"
                        : "border-gray-200 hover:border-green-300 hover:shadow-lg"
                  }
                `}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    ✓
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                  w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                  ${
                    isCompleted
                      ? "bg-green-200 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {step.description}
                </p>

                {/* Button */}
                <button
                  onClick={() => !isDisabled && handleOpenModal(step.id)}
                  disabled={isDisabled}
                  className={`
                    w-full py-2 px-4 rounded-lg font-medium transition-colors
                    ${
                      isCompleted
                        ? "bg-green-100 text-green-700 cursor-default"
                        : isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                    }
                  `}
                >
                  {isCompleted ? "Complété" : step.buttonText}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm text-gray-600">Progression:</span>
            <span className="font-semibold text-green-600">
              {Object.values(completedSteps).filter(Boolean).length} / 3
            </span>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {modal === "organization" && (
              <OrganizationForm
                onSuccess={() => handleStepComplete("organization")}
              />
            )}

            {/* ✅ Passer l'ID de la première organisation au FarmForm */}
            {modal === "farm" && (
              <FarmForm
                organizationId={organizations[0]?.id}
                onSuccess={() => handleStepComplete("farm")}
              />
            )}

            {/* ✅ Passer l'ID de la première ferme au AnimalForm */}
            {modal === "animal" && (
              <AnimalForm
                farmId={farms[0]?.id}
                onSuccess={() => handleStepComplete("animal")}
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
