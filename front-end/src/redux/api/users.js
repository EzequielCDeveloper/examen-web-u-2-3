import apiClient from "./client";

export const fetchUsersApi = async (token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.get("/users/", config);
  return response.data;
};

export const updateUserApi = async (userId, data, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.patch(`/users/${userId}/`, data, config);
  return response.data;
};

export const deleteUserApi = async (userId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.delete(`/users/${userId}/`, config);
  return response.data;
};
