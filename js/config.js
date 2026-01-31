// frontend/js/config.js
// Configuración centralizada del frontend

/**
 * URL base del API Backend
 *
 * IMPORTANTE: Usar 127.0.0.1 en lugar de localhost por las siguientes razones:
 * 1. Evita problemas de resolución DNS
 * 2. Más rápido (no requiere lookup)
 * 3. Consistente con el frontend en 127.0.0.1:5500
 * 4. Evita problemas de CORS entre localhost y 127.0.0.1
 *
 * NO CAMBIAR A localhost sin documentar la razón
 */
const API_BASE_URL = "http://127.0.0.1:3000";

/**
 * Configuración de endpoints comunes
 */
const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  API: `${API_BASE_URL}/api`,
  VENTAS: `${API_BASE_URL}/api/ventas`,
  CLIENTES: `${API_BASE_URL}/api/clientes`,
  CATALOGO: `${API_BASE_URL}/api/catalogo`,
  CUENTAS: `${API_BASE_URL}/api/cuentas`,
  RENOVACIONES: `${API_BASE_URL}/api/renovaciones`,
  RECORDATORIOS: `${API_BASE_URL}/api/recordatorios`,
  DESARROLLO_PERSONAL: `${API_BASE_URL}/api/desarrollo-personal`,
  COTIZACIONES: `${API_BASE_URL}/api/cotizaciones`,
};

/**
 * Configuración de la aplicación
 */
const APP_CONFIG = {
  // Versión del frontend
  VERSION: "1.0.0",

  // Nombre de la aplicación
  APP_NAME: "Sistema de Gestión",

  // Configuración regional
  LOCALE: "es-CL",
  CURRENCY: "CLP",
  TIMEZONE: "America/Santiago",

  // Configuración de UI
  ITEMS_PER_PAGE: 20,
  DATE_FORMAT: "DD/MM/YYYY",

  // Timeouts (en milisegundos)
  REQUEST_TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
};

// Exportar para uso en módulos ES6 (si se usa)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { API_BASE_URL, API_ENDPOINTS, APP_CONFIG };
}

