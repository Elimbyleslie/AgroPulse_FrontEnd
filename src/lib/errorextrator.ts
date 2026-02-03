import { ApiError } from "../models/store";

/**
 * Normalise TOUTES les erreurs fetch / backend / JS
 * vers un format unique :
 * {
 *   meta: { status, message },
 *   error?: any
 * }
 */
export default function extractApiError(err: unknown): ApiError {
  // 🧱 Fallback absolu
  const fallback: ApiError = {
    meta: {
      status: 500,
      message: "Erreur serveur",
    },
  };

  if (!err) return fallback;

  /**
   * ✅ CAS 1 — Erreur déjà normalisée (rejectWithValue(result))
   */
  if (
    typeof err === "object" &&
    err !== null &&
    "meta" in err &&
    typeof (err as ApiError).meta?.status === "number"
  ) {
    return err as ApiError;
  }

  /**
   * ✅ CAS 2 — fetchApi a déjà retourné le body backend
   * ex:
   * {
   *   meta: { status, message },
   *   error: {...}
   * }
   */
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  ) {
    return {
      meta: {
        status: (err as unknown as ApiError).meta.status,
        message: (err as unknown as ApiError).meta.message,
      },
      error: (err as unknown as ApiError).error,
    };
  }

  /**
   * ✅ CAS 3 — Erreur réseau fetch (offline, CORS, timeout)
   */
  if (err instanceof TypeError) {
    return {
      meta: {
        status: 0,
        message: "Erreur réseau. Vérifiez votre connexion internet.",
      },
    };
  }

  /**
   * ✅ CAS 4 — Erreur JS standard
   */
  if (err instanceof Error) {
    return {
      meta: {
        status: 500,
        message: err.message || "Erreur interne",
      },
    };
  }

  /**
   * 🧱 Dernier rempart
   */
  return fallback;
}
