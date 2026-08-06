/* eslint-disable @typescript-eslint/no-unused-vars */
// src/api/fetchWithAuth.ts
import { env } from "../constants/env";
import { authStore } from "./utils";
import { refreshToken } from "../store/auth/action";
import { PATH_AUTH } from "../constants/paths";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = authStore.getToken();

  const headers = new Headers(options.headers || {});
  
 if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  
  let response = await fetch(`${env.apiUrl}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // 1️⃣ GESTION REFRESH (401)
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      authStore.clear();
      if (!window.location.pathname.includes(PATH_AUTH.LOGIN)) {
        window.location.href = PATH_AUTH.LOGIN;
      }
      throw { meta: { message: "Session expirée", status: 401 } };
    }
    const newToken = authStore.getToken();
    headers.set("Authorization", `Bearer ${newToken}`);
    response = await fetch(`${env.apiUrl}${url}`, { ...options, headers, credentials: "include" });
  }

  // 2️⃣ LECTURE DU CONTENU (SÉCURISÉE)
  const text = await response.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text }; 
    }
  }

  // 3️⃣ GESTION DES ERREURS (4xx, 5xx)
  if (!response.ok) {
    // On force un objet d'erreur standard pour éviter le "undefined"
    throw {
      meta: {
        message: data?.meta?.message || data?.message || "Une erreur est survenue",
        status: response.status
      },
      ...data // On garde le reste des données au cas où
    };
  }

// 4️⃣ SUCCÈS
if (!data) return { meta: { status: response.status, message: "OK" } };
if (!data.meta) data.meta = { status: response.status, message: "OK" };
return data;
  return data || {};
};