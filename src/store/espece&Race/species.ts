/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth.ts";
import { ROUTES } from "../../constants/apiRoutes.ts";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { handleApiResult } from "../../lib/handleApiResult.tsx";
import extractApiError from "../../lib/errorextrator.ts";
import { ApiError  } from '../../models/store.ts';
import { Species } from '../../models/species.ts';



// On définit la structure exacte du JSON backend
interface SpeciesApiResponse {
  meta: {
    status: number;
    message: string;
  };
  data: {
    species: Species[];
    pagination?: any;
  };
  error: any;
}

export const getSpeciesList = createAsyncThunk<
  SpeciesApiResponse, // Le type de retour attendu
  void,
  { rejectValue: ApiError }
>(
  "species/list",
  async (_, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.SPECIES_LIST}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!result) {
        return apiThunk.rejectWithValue({
          meta: { message: "Aucune réponse du serveur", status: 500 }
        });
      }

      // 💡 handleApiResult doit être capable de gérer la structure { meta, data, error }
      const error = handleApiResult(result, "Espèces introuvables");
      if (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
      }

      // On retourne tout le JSON (meta + data + error)
      return result as SpeciesApiResponse;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  }
);
