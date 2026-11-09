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
  AUTH_LOGIN,
  FETCH_ANIME_LIST,
  GET_ANIME,
} from "../constants/actionTypes";

// Reducer de lista general (compatibilidad retroactiva)
export const animeReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_ANIME_LIST_SUCCESS:
    case FETCH_ANIME_LIST:
      return action.payload;
    case GET_ANIME:
      return action.payload;
    default:
      return state;
  }
};

// Reducer de animes en tendencia
export const trendingReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_TRENDING_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// Reducer de animes populares
export const popularReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_POPULAR_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// Reducer del Top 100 con estado de carga
const initialTop100State = {
  items: [],
  loading: false,
  error: null,
};

export const top100Reducer = (state = initialTop100State, action) => {
  switch (action.type) {
    case FETCH_TOP100_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_TOP100_SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case FETCH_TOP100_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Reducer de búsqueda
export const searchReducer = (state = [], action) => {
  switch (action.type) {
    case SEARCH_ANIME_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// Reducer de Explorar conectado a la API de Kitsu
const initialExploreState = {
  items: [],
  loading: false,
  error: null,
};

export const exploreReducer = (state = initialExploreState, action) => {
  switch (action.type) {
    case EXPLORE_ANIME_REQUEST:
      return { ...state, loading: true, error: null };
    case EXPLORE_ANIME_SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case EXPLORE_ANIME_APPEND:
      return {
        ...state,
        loading: false,
        items: [...state.items, ...action.payload],
      };
    case EXPLORE_ANIME_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Reducer de detalle de anime
const initialDetailsState = {
  data: null,
  episodes: [],
  genres: [],
  loading: false,
  error: null,
};

export const animeDetailsReducer = (state = initialDetailsState, action) => {
  switch (action.type) {
    case GET_ANIME_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ANIME_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case GET_ANIME_FAIL:
      return { ...state, loading: false, error: action.payload };
    case GET_EPISODES_SUCCESS:
      return { ...state, episodes: action.payload };
    case GET_GENRES_SUCCESS:
      return { ...state, genres: action.payload };
    default:
      return state;
  }
};

// Reducer de Mi Lista (con persistencia en localStorage)
const savedList = (() => {
  try {
    const raw = localStorage.getItem("anime_my_list");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
})();

export const myListReducer = (state = savedList, action) => {
  let updatedState;
  switch (action.type) {
    case MY_LIST_ADD:
      if (state.some((item) => item.id === action.payload.id)) return state;
      updatedState = [action.payload, ...state];
      try {
        localStorage.setItem("anime_my_list", JSON.stringify(updatedState));
      } catch (e) {
        console.warn("Error guardando en localStorage:", e);
      }
      return updatedState;
    case MY_LIST_REMOVE:
      updatedState = state.filter((item) => item.id !== action.payload);
      try {
        localStorage.setItem("anime_my_list", JSON.stringify(updatedState));
      } catch (e) {
        console.warn("Error guardando en localStorage:", e);
      }
      return updatedState;
    default:
      return state;
  }
};

// Reducer de Autenticación con JWT real desde Django
const savedUser = (() => {
  try {
    const raw = localStorage.getItem("anime_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const savedToken = localStorage.getItem("anime_token") || null;

const initialAuthState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!(savedUser && savedToken),
  loading: false,
  error: null,
};

export const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
    case AUTH_REGISTER_REQUEST:
      return { ...state, loading: true, error: null };
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_LOGIN:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_REGISTER_SUCCESS:
      return { ...state, loading: false, error: null };
    case AUTH_LOGIN_FAIL:
    case AUTH_REGISTER_FAIL:
      return { ...state, loading: false, error: action.payload };
    case AUTH_CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Reducer de Valoraciones y Reseñas comunitarias sincronizado con Django
const initialReviewsState = {
  animeId: null,
  count: 0,
  averageRating: null,
  userReview: null,
  reviews: [],
  loading: false,
  saving: false,
  error: null,
};

export const reviewsReducer = (state = initialReviewsState, action) => {
  switch (action.type) {
    case FETCH_REVIEWS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_REVIEWS_SUCCESS:
      return {
        ...state,
        loading: false,
        animeId: action.payload.anime_id,
        count: action.payload.count,
        averageRating: action.payload.average_rating,
        userReview: action.payload.user_review,
        reviews: action.payload.reviews,
        error: null,
      };
    case FETCH_REVIEWS_FAIL:
      return { ...state, loading: false, error: action.payload };
    case SAVE_REVIEW_REQUEST:
      return { ...state, saving: true, error: null };
    case SAVE_REVIEW_SUCCESS: {
      const saved = action.payload;
      const updatedList = state.reviews.some((r) => r.id === saved.id)
        ? state.reviews.map((r) => (r.id === saved.id ? saved : r))
        : [saved, ...state.reviews];
      return {
        ...state,
        saving: false,
        userReview: saved,
        reviews: updatedList,
        count: updatedList.length,
        error: null,
      };
    }
    case SAVE_REVIEW_FAIL:
      return { ...state, saving: false, error: action.payload };
    case DELETE_REVIEW_SUCCESS: {
      const remaining = state.reviews.filter((r) => r.id !== action.payload);
      return {
        ...state,
        reviews: remaining,
        count: remaining.length,
        userReview: null,
      };
    }
    default:
      return state;
  }
};

export default animeReducer;
