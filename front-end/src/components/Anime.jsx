import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const Anime = ({ anime, attributes }) => {
  return (
    <Card className="my-3 p-3 rounded">
      <Link to={`/anime/${anime.id}`}>
        <Card.Img src={attributes.posterImage.medium} />
      </Link>
      <Card.Body>
        <Card.Title as="h5">
          <strong>{attributes.titles.en_jp}</strong>
        </Card.Title>
        <Card.Text as="p" className="font-weight-bold">
          <strong className="font-weight-bold">Episode count: </strong>
          {attributes.episodeCount} <br />
          {attributes.ageRatingGruide}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Anime;
