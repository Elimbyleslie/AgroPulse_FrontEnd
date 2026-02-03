import { env } from'../constants/env';

export const fetchApi = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
;
  const res = await fetch(`${env.apiUrl}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },

    credentials: "include", // cookies JWT
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
};
