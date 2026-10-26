import axios from "axios";

const url = "https://kitsu.io/api/edge/anime";

export const fetchAnimeList = () => axios.get(`${url}?page[limit]=20`);
export const getAnime = (id) => axios.get(`${url}/${id}`);
