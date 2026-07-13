/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from "../models/store";

/**
 * Normalise TOUTES les erreurs vers un format clair et exploitable
 */
export default function extractApiError(err: unknown): ApiError {
  const fallback: ApiError = {
    meta: {
      status: 500,
      message: "Une erreur inattendue est survenue",
    },
  };

  if (!err) return fallback;

  // CAS 1 : Erreur déjà bien formatée (la plus courante avec rejectWithValue)
  if (typeof err === "object" && err !== null) {
    const errorObj = err as any;

    // Extraction du message depuis différents chemins possibles
    const message =
      errorObj.meta?.message ||
      errorObj.message ||
      errorObj.error?.message ||
      errorObj.payload?.message ||
      errorObj.payload?.meta?.message ||
      errorObj.data?.message ||
      "Erreur inconnue";

    const status =
      errorObj.meta?.status ||
      errorObj.status ||
      errorObj.payload?.status ||
      errorObj.code ||
      500;

    return {
      meta: {
        status,
        message: typeof message === "string" ? message : "Erreur serveur",
      },
      error: errorObj.error || errorObj.payload || null,
    };
  }

  // CAS 2 : Erreur réseau / TypeError
  if (err instanceof TypeError) {
    return {
      meta: {
        status: 0,
        message: "Erreur réseau. Vérifiez votre connexion internet.",
      },
    };
  }

  // CAS 3 : Erreur JS standard
  if (err instanceof Error) {
    return {
      meta: {
        status: 500,
        message: err.message,
      },
    };
  }

  return fallback;
}