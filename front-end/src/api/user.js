const API_URL =
  import.meta.env.VITE_BASE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function loginApi(formData) {
  try {
    const url = `${API_URL}/api/v1/auth/token/`;
    console.log("Conectando con endpoint JWT en Django:", url);
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Usuario o contraseña incorrecta");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getMeApi(token) {
  try {
    const url = `${API_URL}/api/v1/auth/me/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, params);
    if (!response.ok) {
      throw new Error("Error al obtener los datos del usuario logueado");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function registerApi(formData) {
  try {
    const url = `${API_URL}/api/v1/auth/register/`;
    console.log("Conectando con endpoint de registro en Django:", url);
    const params = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    if (response.status !== 201) {
      const err = await response.json().catch(() => ({}));
      const message =
        typeof err === "object"
          ? Object.entries(err)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
              .join(" | ")
          : "No se puede crear el usuario";
      throw new Error(message || "No se puede crear el usuario");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}
