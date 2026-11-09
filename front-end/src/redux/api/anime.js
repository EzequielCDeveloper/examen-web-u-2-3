import axios from "axios";

const BASE_URL = "https://kitsu.io/api/edge";

const kitsuClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  },
});

// Cache en memoria para mitigar peticiones repetitivas y proteger los límites de Kitsu
const memoryCache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos de validez

const getCached = (key) => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  memoryCache.set(key, { data, timestamp: Date.now() });
};

// Cliente resiliente con reintento y retroceso exponencial para 429 (Rate Limit) y fallos transitorios
export const fetchWithRetry = async (url, config = {}, retries = 2, delay = 500) => {
  try {
    return await kitsuClient.get(url, config);
  } catch (error) {
    const status = error.response?.status;
    const isRateLimitOrServerError = !status || status === 429 || status >= 500;
    if (retries > 0 && isRateLimitOrServerError) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, config, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const fetchAnimeList = async (limit = 20) => {
  const cacheKey = `anime_list_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached };

  const res = await fetchWithRetry(`/anime?page[limit]=${Math.min(limit, 20)}`);
  setCached(cacheKey, res.data);
  return res;
};

// Animes en Tendencia: cálculo dinámico del año para evitar fallas por obsolescencia temporal
export const fetchTrendingAnime = async (limit = 15) => {
  const currentYear = new Date().getFullYear();
  const seasonYears = `${currentYear - 1},${currentYear}`;
  const cacheKey = `trending_${seasonYears}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached };

  const res = await fetchWithRetry(
    `/anime?filter[seasonYear]=${seasonYears}&sort=-user_count&page[limit]=${Math.min(limit, 20)}`
  );
  setCached(cacheKey, res.data);
  return res;
};

// Animes Más Populares con cache y protección de tasa
export const fetchPopularAnime = async (limit = 15, sort = "-user_count") => {
  const cacheKey = `popular_${sort}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached };

  const res = await fetchWithRetry(
    `/anime?sort=${sort}&page[limit]=${Math.min(limit, 20)}`
  );
  setCached(cacheKey, res.data);
  return res;
};

// Carga resiliente del Top 100 con escalonamiento, Promise.allSettled y degradación elegante
export const fetchTop100PopularAnime = async (sort = "-user_count") => {
  const cacheKey = `top100_${sort}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const offsets = [0, 20, 40, 60, 80];

  // Escalonamos las peticiones 60ms para no disparar ráfagas simultáneas al edge de Kitsu
  const promises = offsets.map((offset, index) =>
    new Promise((resolve) => setTimeout(resolve, index * 60)).then(() =>
      fetchWithRetry(`/anime?sort=${sort}&page[limit]=20&page[offset]=${offset}`)
    )
  );

  const results = await Promise.allSettled(promises);

  const successfulItems = results
    .filter((res) => res.status === "fulfilled" && res.value?.data?.data)
    .flatMap((res) => res.value.data.data);

  if (successfulItems.length === 0) {
    throw new Error(
      "No se pudo cargar el Top 100. La API externa no respondió a ninguna solicitud."
    );
  }

  setCached(cacheKey, successfulItems);
  return successfulItems;
};

export const searchAnime = (query, limit = 20) =>
  fetchWithRetry(
    `/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${Math.min(limit, 20)}`
  );

export const fetchExploreAnime = ({
  query = "",
  category = "",
  sort = "-user_count",
  limit = 20,
  offset = 0,
}) => {
  const params = new URLSearchParams();
  if (query && query.trim() !== "") {
    params.append("filter[text]", query.trim());
  }
  if (category && category !== "all" && category !== "todos") {
    params.append("filter[categories]", category.toLowerCase());
  }
  if (sort) {
    params.append("sort", sort);
  }
  // Kitsu rechaza con HTTP 400 si page[limit] > 20
  params.append("page[limit]", Math.min(limit, 20));
  params.append("page[offset]", offset);

  return fetchWithRetry(`/anime?${params.toString()}`);
};

export const getAnime = (id) => fetchWithRetry(`/anime/${id}`);

export const getAnimeEpisodes = (id, limit = 20) =>
  fetchWithRetry(`/anime/${id}/episodes?page[limit]=${Math.min(limit, 20)}`);

export const getAnimeGenres = (id) => fetchWithRetry(`/anime/${id}/genres`);
