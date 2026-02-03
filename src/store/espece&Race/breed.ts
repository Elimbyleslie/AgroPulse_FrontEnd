import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth.ts";
import { ROUTES } from "../../constants/apiRoutes.ts";
import { handleApiResult } from "../../lib/handleApiResult.tsx";
import extractApiError from "../../lib/errorextrator.ts";
import { ApiError } from '../../models/store.ts';
import { Breed } from '../../models/breed.ts';

// ✅ On définit la structure qui correspond au JSON réel
interface BreedsApiResponse {
  meta: {
    status: number;
    message: string;
  };
  data: {
    breeds: Breed[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

export const getBreedsList = createAsyncThunk<
  BreedsApiResponse, 
  void,
  { rejectValue: ApiError }
>(
  "breeds/list",
  async (_, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.BREED_LIST}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!result) {
        return apiThunk.rejectWithValue({
          meta: { message: "Aucune réponse du serveur", status: 500 }
        });
      }

      const error = handleApiResult(result, "Races introuvables");
      if (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
      }

      return result as BreedsApiResponse;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  }
);