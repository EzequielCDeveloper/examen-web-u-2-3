import * as anime from "../api/anime";
import { FETCH_ANIME_LIST, GET_ANIME } from "../constants/actionTypes";

export const fetchAnimeList = () => async (dispatch) => {
  try {
    const { data } = await anime.fetchAnimeList();
    dispatch({
      type: FETCH_ANIME_LIST,
      payload: data.data,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAnime = (id) => async (dispatch) => {
  try {
    const { data } = await anime.getAnime(id);
    const action = {
      type: GET_ANIME,
      payload: data,
    };
    dispatch(action);
  } catch (error) {
    console.error(error);
  }
};
