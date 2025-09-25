// Este archivo contiene variables de configuración para el entorno de DESARROLLO.
// Cuando construyas la app para producción, Angular usará 'environment.prod.ts' en su lugar.

export const environment = {
  production: false,
  // La URL base de nuestra API de backend.
  // Nuestro AuthService la usará para saber a dónde hacer las peticiones.
  apiUrl: 'http://localhost:8080/api/v1'
};
