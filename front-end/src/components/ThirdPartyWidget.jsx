import { useState, useEffect } from "react";
import { Card, Button, Spinner, Badge } from "react-bootstrap";

export const ThirdPartyWidget = () => {
  const [quote, setQuote] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [errorQuote, setErrorQuote] = useState(null);
  const [errorWeather, setErrorWeather] = useState(null);

  // Consumo 1: API de Frases Motivadoras Gratuitas usando fetch()
  const fetchRandomQuote = async () => {
    setLoadingQuote(true);
    setErrorQuote(null);
    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      setQuote(data);
    } catch (err) {
      setErrorQuote("No se pudo cargar la frase externa.");
    } finally {
      setLoadingQuote(false);
    }
  };

  // Consumo 2: API de Clima en tiempo real (Open-Meteo) usando fetch()
  const fetchLiveWeather = async () => {
    setLoadingWeather(true);
    setErrorWeather(null);
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=19.4326&longitude=-99.1332&current_weather=true"
      );
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (err) {
      setErrorWeather("No se pudo cargar el clima.");
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    fetchLiveWeather();
  }, []);

  return (
    <Card className="third-party-widget bg-dark border-secondary border-opacity-50 text-light shadow-lg my-4">
      <Card.Header className="bg-black bg-opacity-50 border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🌐</span>
          <h5 className="mb-0 text-white font-weight-bold">
            Integración de API de Terceros <span className="text-warning">(Unidad 3)</span>
          </h5>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <Badge bg="info" className="px-2 py-1 text-dark fw-bold">
            fetch() API
          </Badge>
          <Badge bg="success" className="px-2 py-1">
            En vivo
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        <div className="row g-4">
          {/* Frase Motivacional */}
          <div className="col-12 col-lg-8">
            <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small text-uppercase font-monospace">
                    💡 Frase Inspiradora del Día (dummyjson.com)
                  </span>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={fetchRandomQuote}
                    disabled={loadingQuote}
                    className="py-0 px-2"
                  >
                    {loadingQuote ? <Spinner animation="border" size="sm" /> : "↻ Nueva frase"}
                  </Button>
                </div>

                {loadingQuote ? (
                  <div className="py-4 text-center">
                    <Spinner animation="border" variant="warning" size="sm" />
                    <span className="ms-2 text-muted small">Consumiendo API externa vía fetch...</span>
                  </div>
                ) : errorQuote ? (
                  <p className="text-danger small my-2">{errorQuote}</p>
                ) : (
                  <blockquote className="blockquote my-2">
                    <p className="fs-6 fst-italic text-light mb-2">
                      "{quote?.quote}"
                    </p>
                    <footer className="blockquote-footer text-warning small">
                      {quote?.author || "Anónimo"}
                    </footer>
                  </blockquote>
                )}
              </div>

              <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 text-muted small font-monospace">
                <code>fetch("https://dummyjson.com/quotes/random")</code>
              </div>
            </div>
          </div>

          {/* Clima Actual */}
          <div className="col-12 col-lg-4">
            <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase font-monospace d-block mb-2">
                  ⛅ Clima en Tiempo Real (Open-Meteo)
                </span>

                {loadingWeather ? (
                  <div className="py-4 text-center">
                    <Spinner animation="border" variant="info" size="sm" />
                  </div>
                ) : errorWeather ? (
                  <p className="text-danger small my-2">{errorWeather}</p>
                ) : (
                  <div className="d-flex align-items-center justify-content-around py-2">
                    <div className="text-center">
                      <div className="display-6 font-weight-bold text-info">
                        {weather?.temperature}°C
                      </div>
                      <span className="text-muted small">Temperatura</span>
                    </div>
                    <div className="text-center">
                      <div className="h4 text-light mb-0">
                        {weather?.windspeed} <span className="small text-muted">km/h</span>
                      </div>
                      <span className="text-muted small">Viento</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 text-muted small font-monospace">
                <code>fetch("https://api.open-meteo.com/...")</code>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ThirdPartyWidget;
