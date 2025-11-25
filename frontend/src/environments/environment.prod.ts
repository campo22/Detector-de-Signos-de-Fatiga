// Este archivo es para configuración del entorno de PRODUCCIÓN.
// Los valores sensibles o específicos del despliegue deben ser inyectados
// de forma segura por el pipeline de CI/CD.

export const environment = {
  production: true,
  // URL base de la API para producción. Ajustar según el despliegue.
  // Si el frontend y backend están en el mismo dominio detrás de un proxy (como Nginx en Docker),
  // la ruta relativa /api/v1 es adecuada. De lo contrario, usar el dominio completo.
  apiUrl: '/api/v1',
  // URL de WebSocket para producción. Ajustar según el despliegue.
  // ws://localhost:8080/ws es un placeholder. Usar wss:// o ws:// con el dominio de producción.
  websocketUrl: 'ws://localhost:8080/ws',
  // Clave API de Gemini. DEBE ser inyectada de forma segura por CI/CD
  // o configurada como variable de entorno en el despliegue.
  // NO LA COMIETEES CON LA CLAVE REAL.
  geminiApiKey: 'AIzaSyAdZAEYG5Cpm49HCjw95gzXdmZ2UdXMn6U'
};
