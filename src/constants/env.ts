export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  noreact: import.meta.env.NOREACT_APP_API_URL || 'http://localhost:5000'
};
