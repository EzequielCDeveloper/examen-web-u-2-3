import { combineReducers } from "redux";
import {
  animeReducer,
  trendingReducer,
  popularReducer,
  top100Reducer,
  searchReducer,
  exploreReducer,
  animeDetailsReducer,
  myListReducer,
  authReducer,
  reviewsReducer,
} from "./anime";

export default combineReducers({
  anime: animeReducer,
  trending: trendingReducer,
  popular: popularReducer,
  top100: top100Reducer,
  search: searchReducer,
  explore: exploreReducer,
  animeDetails: animeDetailsReducer,
  myList: myListReducer,
  auth: authReducer,
  reviews: reviewsReducer,
});
