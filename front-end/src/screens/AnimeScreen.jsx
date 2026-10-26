import { useEffect } from "react";
import { Row, Col, Image } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAnime } from "../redux/actions/anime";

const AnimeScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const anime = useSelector((state) => state.anime);

  useEffect(() => {
    dispatch(getAnime(id));
  }, [dispatch, id]);

  return (
    <div>
      <Link to="/" className="btn btn-light">
        Go back
      </Link>
      <Row>
        <Col md={6}>
          {anime?.data?.attributes && (
            <Image src={anime.data.attributes.posterImage.large} />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AnimeScreen;
