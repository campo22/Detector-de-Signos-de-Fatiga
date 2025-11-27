// Este archivo contiene variables de configuración para el entorno de DESARROLLO.
// Cuando construyas la app para producción, Angular usará 'environment.prod.ts' en su lugar.

export const environment = {
  production: false,
  // URL base de la API
  apiUrl: '/api/v1',
  websocketUrl: 'ws://localhost/ws',
  geminiApiKey: ''
};
