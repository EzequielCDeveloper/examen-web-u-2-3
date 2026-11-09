import { useState, useEffect } from "react";
import { Card, Button, Spinner, Badge, Form } from "react-bootstrap";

const API_BASE_URL =
  import.meta.env.VITE_BASE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

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
      setError(err.message || "Error al consultar el servicio SOAP desde Django.");
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

  return (
    <Card className="soap-widget bg-dark border-secondary border-opacity-50 text-light shadow-lg my-4">
      <Card.Header className="bg-black bg-opacity-50 border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">📡</span>
          <h5 className="mb-0 text-white font-weight-bold">
            Consumo de Servicio SOAP con Zeep en Django{" "}
            <span className="text-warning">(Unidad 3)</span>
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
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <p className="text-muted small mb-0">
            Django consume el WSDL público de <code>CountryInfoService</code> mediante la librería <code>zeep</code> y expone los datos al cliente.
          </p>
          <div className="d-flex align-items-center gap-2">
            <Form.Label className="small text-muted mb-0">País:</Form.Label>
            <Form.Select
              size="sm"
              value={code}
              onChange={handleCountryChange}
              className="bg-black text-light border-secondary"
              style={{ width: "160px" }}
            >
              <option value="JP">Japón (JP)</option>
              <option value="MX">México (MX)</option>
              <option value="US">Estados Unidos (US)</option>
              <option value="ES">España (ES)</option>
              <option value="FR">Francia (FR)</option>
            </Form.Select>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fetchSoapData(code)}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "↻"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted small mt-2">Consultando servicio SOAP externo vía Django...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 px-3 small">{error}</div>
        ) : data ? (
          <div className="row g-3">
            <div className="col-12 col-md-3 text-center">
              {data.flag_url && (
                <img
                  src={data.flag_url}
                  alt={`Bandera de ${data.country_name}`}
                  className="rounded border border-secondary shadow-sm mb-2"
                  style={{ maxHeight: "70px", objectFit: "contain" }}
                />
              )}
              <div className="h5 text-warning mb-0">{data.country_name}</div>
              <span className="badge bg-secondary font-monospace">{data.country_code}</span>
            </div>

            <div className="col-12 col-md-9">
              <div className="row g-2">
                <div className="col-6 col-sm-4">
                  <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <span className="text-muted small d-block">Capital (SOAP)</span>
                    <strong className="text-light">{data.capital || "—"}</strong>
                  </div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <span className="text-muted small d-block">Código Telefónico</span>
                    <strong className="text-light">+{data.phone_code || "—"}</strong>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <span className="text-muted small d-block">Moneda Oficial</span>
                    <strong className="text-light">
                      {data.currency?.sName || "—"} ({data.currency?.sISOCode || "—"})
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-muted small font-monospace">
                <code>WSDL: {data.wsdl}</code>
              </div>
            </div>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
};

export default SoapViewerWidget;
