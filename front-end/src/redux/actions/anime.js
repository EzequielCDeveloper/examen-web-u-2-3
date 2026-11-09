import * as api from "../api/anime";
import * as authApi from "../api/auth";
import * as reviewsApi from "../api/reviews";
import {
  FETCH_ANIME_LIST_SUCCESS,
  FETCH_TRENDING_SUCCESS,
  FETCH_POPULAR_SUCCESS,
  SEARCH_ANIME_SUCCESS,
  FETCH_TOP100_REQUEST,
  FETCH_TOP100_SUCCESS,
  FETCH_TOP100_FAIL,
  EXPLORE_ANIME_REQUEST,
  EXPLORE_ANIME_SUCCESS,
  EXPLORE_ANIME_APPEND,
  EXPLORE_ANIME_FAIL,
  GET_ANIME_REQUEST,
  GET_ANIME_SUCCESS,
  GET_ANIME_FAIL,
  GET_EPISODES_SUCCESS,
  GET_GENRES_SUCCESS,
  MY_LIST_ADD,
  MY_LIST_REMOVE,
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_REGISTER_REQUEST,
  AUTH_REGISTER_SUCCESS,
  AUTH_REGISTER_FAIL,
  AUTH_LOGOUT,
  AUTH_CLEAR_ERROR,
  FETCH_REVIEWS_REQUEST,
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEWS_FAIL,
  SAVE_REVIEW_REQUEST,
  SAVE_REVIEW_SUCCESS,
  SAVE_REVIEW_FAIL,
  DELETE_REVIEW_SUCCESS,
  FETCH_ANIME_LIST,
  GET_ANIME,
} from "../constants/actionTypes";

export const fetchAnimeList = (limit = 20) => async (dispatch) => {
  try {
    const { data } = await api.fetchAnimeList(limit);
    dispatch({ type: FETCH_ANIME_LIST_SUCCESS, payload: data.data });
    dispatch({ type: FETCH_ANIME_LIST, payload: data.data });
  } catch (error) {
    console.error("Error al cargar la lista de animes:", error);
  }
};

export const fetchTrendingAnime = (limit = 10) => async (dispatch) => {
  try {
    const { data } = await api.fetchTrendingAnime(limit);
    dispatch({ type: FETCH_TRENDING_SUCCESS, payload: data.data });
  } catch (error) {
    console.error("Error al cargar animes en tendencia:", error);
  }
};

export const fetchPopularAnime = (limit = 20, sort = "-user_count") => async (dispatch) => {
  try {
    const { data } = await api.fetchPopularAnime(limit, sort);
    dispatch({ type: FETCH_POPULAR_SUCCESS, payload: data.data });
  } catch (error) {
    console.error("Error al cargar animes populares:", error);
  }
};

// Carga completa del TOP 100 de animes populares o mejor puntuados
export const fetchTop100 = (sort = "-user_count") => async (dispatch) => {
  dispatch({ type: FETCH_TOP100_REQUEST });
  try {
    const all100 = await api.fetchTop100PopularAnime(sort);
    dispatch({ type: FETCH_TOP100_SUCCESS, payload: all100 });
    // También actualiza popular para compatibilidad
    dispatch({ type: FETCH_POPULAR_SUCCESS, payload: all100 });
  } catch (error) {
    console.error("Error al cargar Top 100:", error);
    dispatch({ type: FETCH_TOP100_FAIL, payload: error.message });
  }
};

export const searchAnime = (query) => async (dispatch) => {
  try {
    if (!query || query.trim() === "") {
      const { data } = await api.fetchAnimeList(20);
      dispatch({ type: SEARCH_ANIME_SUCCESS, payload: data.data });
      return;
    }
    const { data } = await api.searchAnime(query, 20);
    dispatch({ type: SEARCH_ANIME_SUCCESS, payload: data.data });
  } catch (error) {
    console.error("Error al buscar anime:", error);
  }
};

export const fetchExplore = ({
  query = "",
  category = "",
  sort = "-user_count",
  limit = 20,
  offset = 0,
  append = false,
}) => async (dispatch) => {
  dispatch({ type: EXPLORE_ANIME_REQUEST });
  try {
    const { data } = await api.fetchExploreAnime({
      query,
      category,
      sort,
      limit,
      offset,
    });
    if (append) {
      dispatch({ type: EXPLORE_ANIME_APPEND, payload: data.data });
    } else {
      dispatch({ type: EXPLORE_ANIME_SUCCESS, payload: data.data });
    }
  } catch (error) {
    console.error("Error en explorar animes:", error);
    dispatch({ type: EXPLORE_ANIME_FAIL, payload: error.message });
  }
};

export const getAnime = (id) => async (dispatch) => {
  dispatch({ type: GET_ANIME_REQUEST });
  try {
    const { data } = await api.getAnime(id);
    dispatch({ type: GET_ANIME_SUCCESS, payload: data.data });
    dispatch({ type: GET_ANIME, payload: data });

    try {
      const episodesRes = await api.getAnimeEpisodes(id);
      dispatch({ type: GET_EPISODES_SUCCESS, payload: episodesRes.data.data });
    } catch (e) {
      console.warn("No se pudieron cargar episodios:", e);
      dispatch({ type: GET_EPISODES_SUCCESS, payload: [] });
    }

    try {
      const genresRes = await api.getAnimeGenres(id);
      dispatch({ type: GET_GENRES_SUCCESS, payload: genresRes.data.data });
    } catch (e) {
      console.warn("No se pudieron cargar géneros:", e);
      dispatch({ type: GET_GENRES_SUCCESS, payload: [] });
    }
  } catch (error) {
    console.error("Error al obtener detalle del anime:", error);
    dispatch({ type: GET_ANIME_FAIL, payload: error.message });
  }
};

export const toggleMyList = (anime) => (dispatch, getState) => {
  const { myList } = getState();
  const exists = myList.some((item) => item.id === anime.id);

  if (exists) {
    dispatch({ type: MY_LIST_REMOVE, payload: anime.id });
  } else {
    dispatch({ type: MY_LIST_ADD, payload: anime });
  }
};

export const loginUser = ({ email, password }) => async (dispatch) => {
  dispatch({ type: AUTH_LOGIN_REQUEST });
  try {
    const tokens = await authApi.loginApi({ email, password });
    const { access, refresh } = tokens;

    localStorage.setItem("anime_token", access);
    if (refresh) localStorage.setItem("anime_refresh", refresh);

    const profile = await authApi.getMeApi(access);

    const user = {
      id: profile.id,
      name: profile.username || profile.email.split("@")[0],
      username: profile.username,
      email: profile.email,
      telefono: profile.telefono,
      is_staff: profile.is_staff,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    };

    localStorage.setItem("anime_user", JSON.stringify(user));
    dispatch({ type: AUTH_LOGIN_SUCCESS, payload: { user, token: access } });
    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Error al autenticar con el servidor. Verifica tus credenciales.";
    dispatch({ type: AUTH_LOGIN_FAIL, payload: message });
    return { success: false, error: message };
  }
};

export const registerUser =
  ({ email, password, password_confirm, username, telefono }) =>
  async (dispatch) => {
    dispatch({ type: AUTH_REGISTER_REQUEST });
    try {
      await authApi.registerApi({
        email,
        password,
        password_confirm,
        username,
        telefono,
      });
      dispatch({ type: AUTH_REGISTER_SUCCESS });

      // Inicia sesión automáticamente tras el registro exitoso
      return await dispatch(loginUser({ email, password }));
    } catch (error) {
      let message = "Error al registrar la cuenta.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          message = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
        } else {
          message = String(data);
        }
      }
      dispatch({ type: AUTH_REGISTER_FAIL, payload: message });
      return { success: false, error: message };
    }
  };

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("anime_user");
  localStorage.removeItem("anime_token");
  localStorage.removeItem("anime_refresh");
  dispatch({ type: AUTH_LOGOUT });
};

export const clearAuthError = () => (dispatch) => {
  dispatch({ type: AUTH_CLEAR_ERROR });
};

// Acciones de Valoraciones y Reseñas sincronizadas con Django
export const fetchAnimeReviews = (animeId) => async (dispatch, getState) => {
  dispatch({ type: FETCH_REVIEWS_REQUEST });
  try {
    const token = getState().auth?.token || localStorage.getItem("anime_token");
    const data = await reviewsApi.fetchAnimeReviews(animeId, token);
    dispatch({ type: FETCH_REVIEWS_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error("Error al obtener reseñas del anime:", error);
    dispatch({
      type: FETCH_REVIEWS_FAIL,
      payload:
        error.response?.data?.detail || "No se pudieron cargar las reseñas.",
    });
  }
};

export const saveAnimeReview =
  ({ animeId, rating, comment = "" }) =>
  async (dispatch, getState) => {
    dispatch({ type: SAVE_REVIEW_REQUEST });
    try {
      const token =
        getState().auth?.token || localStorage.getItem("anime_token");
      if (!token) {
        throw new Error("Debes iniciar sesión para calificar o dejar una reseña.");
      }
      const saved = await reviewsApi.saveAnimeReview(
        { animeId, rating, comment },
        token
      );
      dispatch({ type: SAVE_REVIEW_SUCCESS, payload: saved });
      // Refresca la lista y el promedio comunitario del backend
      dispatch(fetchAnimeReviews(animeId));
      return { success: true, data: saved };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Error al guardar la reseña.";
      dispatch({ type: SAVE_REVIEW_FAIL, payload: message });
      return { success: false, error: message };
    }
  };

export const deleteAnimeReview =
  (reviewId, animeId) => async (dispatch, getState) => {
    try {
      const token =
        getState().auth?.token || localStorage.getItem("anime_token");
      await reviewsApi.deleteAnimeReview(reviewId, token);
      dispatch({ type: DELETE_REVIEW_SUCCESS, payload: reviewId });
      if (animeId) {
        dispatch(fetchAnimeReviews(animeId));
      }
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      return { success: false, error: error.message };
    }
  };
