import { ApiResponse } from "../models/store";

export function handleApiResult<T>(
  result: ApiResponse<T> | null,
  fallbackMessage = "Erreur serveur"
) {
  if (!result || !result.meta) {
    return {
      meta: { status: 500, message: fallbackMessage },
    };
  }

  if (result.meta.status !== 200 && result.meta.status !== 201) {
    return result;
  }

  return null;
}
