import apiClient from "./client";

export const loginApi = async ({ email, password }) => {
  const response = await apiClient.post("/auth/token/", { email, password });
  return response.data;
};

export const registerApi = async ({
  email,
  password,
  password_confirm,
  username,
  telefono,
}) => {
  const payload = { email, password };
  if (password_confirm) payload.password_confirm = password_confirm;
  if (username && username.trim()) payload.username = username.trim();
  if (telefono && telefono.trim()) payload.telefono = telefono.trim();

  const response = await apiClient.post("/auth/register/", payload);
  return response.data;
};

export const getMeApi = async (token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.get("/auth/me/", config);
  return response.data;
};

export const refreshTokenApi = async (refresh) => {
  const response = await apiClient.post("/auth/token/refresh/", { refresh });
  return response.data;
};
