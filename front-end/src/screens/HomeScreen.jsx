import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrendingAnime,
  fetchPopularAnime,
} from "../redux/actions/anime";
import { Container } from "react-bootstrap";
import HeroBanner from "../components/HeroBanner";
import AnimeRail from "../components/AnimeRail";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const trending = useSelector((state) => state.trending);
  const popular = useSelector((state) => state.popular);

  useEffect(() => {
    dispatch(fetchTrendingAnime(15));
    dispatch(fetchPopularAnime(15));
  }, [dispatch]);

  // Anime #1 en Tendencia actual para el Hero Banner de apertura
  const top1Hero =
    (Array.isArray(trending) && trending[0]) ||
    (Array.isArray(popular) && popular[0]);

  return (
    <div className="home-screen-layout">
      {/* 1. Hero Banner 100% Horizontal con desvanecimiento oscuro en orillas inferior y laterales */}
      {top1Hero && <HeroBanner anime={top1Hero} />}

      {/* 2. Rails temáticos independientes con contenido real y diferenciado */}
      <Container fluid="xl" className="home-rails-container pb-5">
        {/* Rail 1: Series en emisión y tendencias actuales (2024 / 2025) */}
        {Array.isArray(trending) && trending.length > 0 && (
          <AnimeRail
            title="En Tendencia Esta Semana"
            animes={trending}
            seeMoreLink="/explorar"
          />
        )}

        {/* Rail 2: Clásicos y gigantes históricos con mayor base de fans global */}
        {Array.isArray(popular) && popular.length > 0 && (
          <AnimeRail
            title="Los Animes Más Populares de la Historia"
            animes={popular}
            seeMoreLink="/populares"
          />
        )}
      </Container>
    </div>
  );
};

export default HomeScreen;
