import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnimeList } from "../redux/actions/anime";
import { Row, Col } from "react-bootstrap";

import Anime from "../components/Anime";

const HomeScreen = () => {
  const animeList = useSelector((state) => state.anime);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAnimeList());
  }, [dispatch]);

  return (
    <div>
      <Row>
        {Array.isArray(animeList) &&
          animeList.map((anime) => (
            <Col key={anime.id} sm={12} md={6} xl={3}>
              <Anime anime={anime} attributes={anime.attributes} />
            </Col>
          ))}
      </Row>
    </div>
  );
};

export default HomeScreen;
