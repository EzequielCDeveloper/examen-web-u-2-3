import { FETCH_ANIME_LIST, GET_ANIME } from "../constants/actionTypes";

const animeReducer = (anime = [], action) => {
  switch (action.type) {
    case FETCH_ANIME_LIST:
      return action.payload;
    case GET_ANIME:
      return action.payload;
    default:
      return anime;
  }
};

export default animeReducer;
