import { useState, useEffect } from "react";
import { Card, Button, Spinner, Badge, Form } from "react-bootstrap";

const API_BASE_URL =
  import.meta.env.VITE_BASE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const REGION_OPTIONS = [
  {
    code: "JP",
    label: "Japón (JP) - Catálogo Primario",
    note: "Emisiones en simultáneo (Simulcast) sin restricciones de censura",
  },
  {
    code: "MX",
    label: "México (MX) - Región LATAM",
    note: "Doblajes oficiales al español latino y subtítulos regionalizados",
  },
  {
    code: "US",
    label: "Estados Unidos (US) - Región Norteamérica",
    note: "Catálogo completo con subtítulos en inglés y doblaje en inglés",
  },
  {
    code: "ES",
    label: "España (ES) - Región Europa",
    note: "Catálogo europeo adaptado a normativa comunitaria",
  },
  {
    code: "FR",
    label: "Francia (FR) - Región Europa",
    note: "Catálogo adaptado a licencias y doblajes franceses",
  },
];

export const SoapViewerWidget = () => {
  const [code, setCode] = useState("JP");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSoapData = async (selectedCode = code) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/v1/soap/country/?code=${selectedCode}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(
        err.message || "Error al consultar el servicio SOAP desde Django."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoapData("JP");
  }, []);

  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    fetchSoapData(newCode);
  };

  const selectedRegion = REGION_OPTIONS.find((r) => r.code === code);

  return (
    <Card className="soap-widget bg-dark border-secondary border-opacity-50 text-light shadow-lg my-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-60 border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">📡</span>
          <h5 className="mb-0 text-white font-weight-bold">
            Gateway de Licenciamiento Regional y Divisas{" "}
            <span className="text-warning">(SOAP Zeep en Django)</span>
          </h5>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <Badge bg="primary" className="px-2 py-1">
            Zeep Python
          </Badge>
          <Badge bg="secondary" className="px-2 py-1 font-monospace">
            /api/v1/soap/country/
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
          <div>
            <p className="text-muted small mb-1">
              Las licencias de transmisión y membresías dependen estrictamente del país del usuario.
            </p>
            <p className="text-muted small mb-0">
              Django valida la región y moneda oficial comunicándose con el WSDL corporativo de <code>CountryInfoService</code> mediante la librería <code>zeep</code>.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Select
              size="sm"
              value={code}
              onChange={handleCountryChange}
              className="bg-black text-light border-secondary"
              style={{ minWidth: "220px" }}
            >
              {REGION_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fetchSoapData(code)}
              disabled={loading}
              title="Revalidar región con SOAP"
            >
              {loading ? <Spinner animation="border" size="sm" /> : "↻"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted small mt-2">
              Consultando metadatos regionales vía SOAP Zeep en Django...
            </p>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 px-3 small">{error}</div>
        ) : data ? (
          <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
            <div className="row g-3 align-items-center">
              {/* Bandera y Región */}
              <div className="col-12 col-md-3 text-center border-end-md border-secondary border-opacity-25">
                {data.flag_url && (
                  <img
                    src={data.flag_url}
                    alt={`Bandera de ${data.country_name}`}
                    className="rounded border border-secondary shadow-sm mb-2"
                    style={{ maxHeight: "65px", objectFit: "contain" }}
                  />
                )}
                <div className="h5 text-warning mb-0">{data.country_name}</div>
                <span className="badge bg-secondary font-monospace mt-1">
                  ISO: {data.country_code}
                </span>
              </div>

              {/* Parámetros de Licencia y Moneda */}
              <div className="col-12 col-md-9">
                <div className="row g-2 mb-2">
                  <div className="col-6 col-sm-4">
                    <div className="p-2 rounded bg-black bg-opacity-50 border border-secondary border-opacity-25">
                      <span className="text-muted small d-block">Capital</span>
                      <strong className="text-light">{data.capital || "—"}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-sm-4">
                    <div className="p-2 rounded bg-black bg-opacity-50 border border-secondary border-opacity-25">
                      <span className="text-muted small d-block">Moneda de Pago</span>
                      <strong className="text-warning">
                        {data.currency?.sName || "—"} ({data.currency?.sISOCode || "—"})
                      </strong>
                    </div>
                  </div>
                  <div className="col-12 col-sm-4">
                    <div className="p-2 rounded bg-black bg-opacity-50 border border-secondary border-opacity-25">
                      <span className="text-muted small d-block">Prefijo 2FA</span>
                      <strong className="text-light">+{data.phone_code || "—"}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span className="text-success">✔</span>
                  <span>
                    <strong>Licencias Disponibles:</strong> {selectedRegion?.note}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
};

export default SoapViewerWidget;
