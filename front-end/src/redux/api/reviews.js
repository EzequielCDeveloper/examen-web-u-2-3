import apiClient from "./client";

export const fetchAnimeReviews = async (animeId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.get(`/reviews/?anime_id=${animeId}`, config);
  return response.data;
};

export const saveAnimeReview = async (
  { animeId, rating, comment = "" },
  token
) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.post(
    "/reviews/",
    {
      anime_id: String(animeId),
      rating: Number(rating),
      comment: comment || "",
    },
    config
  );
  return response.data;
};

export const deleteAnimeReview = async (reviewId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.delete(`/reviews/${reviewId}/`, config);
  return response.data;
};
