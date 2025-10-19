# Documentación del Proyecto: Detector de Signos de Fatiga

... (secciones previas sin cambios) ...

## 3. API REST (Backend)

Base URL: `http://localhost:8080`

La especificación completa de la API está disponible en Swagger/OpenAPI (ver sección "Documentación de API (Swagger)").

### 3.6. Ejemplos adicionales

#### GET `/api/v1/analytics/fleet-summary`
- Parámetros (query):
  - `startDate` (YYYY-MM-DD, opcional)
  - `endDate` (YYYY-MM-DD, opcional)
  - `pageable.page` (0..N)
  - `pageable.size` (1..100)
  - `pageable.sort` (campo,orden) — ej: `fatigueCount,desc`

- Ejemplo de petición:
```
GET /api/v1/analytics/fleet-summary?startDate=2025-10-01&endDate=2025-10-31&pageable.page=0&pageable.size=10&pageable.sort=fatigueCount,desc
```

- Ejemplo de respuesta (200 OK):
```json
{
  "content": [
    {
      "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae",
      "driverName": "Carlos Vargas",
      "vehicleIdentifier": "RTX-3090",
      "fatigueCount": 42,
      "distractionCount": 7,
      "criticalEventsCount": 5,
      "riskScore": "ALTO"
    },
    {
      "driverId": "7866307e-a910-4b90-8421-f1a60777ea29",
      "driverName": "Sofía Rodríguez",
      "vehicleIdentifier": "RX-7900",
      "fatigueCount": 31,
      "distractionCount": 4,
      "criticalEventsCount": 2,
      "riskScore": "MEDIO"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "empty": false, "unsorted": false, "sorted": true },
    "offset": 0, "unpaged": false, "paged": true
  },
  "totalPages": 3,
  "totalElements": 25,
  "last": false,
  "size": 10,
  "number": 0,
  "sort": { "empty": false, "unsorted": false, "sorted": true },
  "numberOfElements": 10,
  "first": true,
  "empty": false
}
```

- Variantes de consulta:
  - `GET /api/v1/analytics/fleet-summary?pageable.page=1&pageable.size=20`
  - `GET /api/v1/analytics/fleet-summary?startDate=2025-10-10&endDate=2025-10-20&pageable.sort=criticalEventsCount,desc`

#### GET `/api/v1/analytics/critical-events-timeline`
- Parámetros (query):
  - `startDate` (YYYY-MM-DD, opcional)
  - `endDate` (YYYY-MM-DD, opcional)

- Ejemplo de petición:
```
GET /api/v1/analytics/critical-events-timeline?startDate=2025-10-01&endDate=2025-10-07
```

- Ejemplo de respuesta (200 OK):
```json
[
  { "date": "2025-10-01", "count": 3 },
  { "date": "2025-10-02", "count": 5 },
  { "date": "2025-10-03", "count": 2 },
  { "date": "2025-10-04", "count": 6 },
  { "date": "2025-10-05", "count": 4 },
  { "date": "2025-10-06", "count": 7 },
  { "date": "2025-10-07", "count": 3 }
]
```

---

Última actualización: 19 de octubre de 2025
