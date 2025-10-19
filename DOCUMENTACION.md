# Documentación del Proyecto: Detector de Signos de Fatiga

... (secciones previas sin cambios) ...

## 3. API REST (Backend)

Base URL: `http://localhost:8080`

La especificación completa de la API está disponible en Swagger/OpenAPI (ver sección "Documentación de API (Swagger)").

### 3.5. Ejemplos de Paginación (Eventos)

#### GET `/api/v1/events/search`

- Parámetros de consulta (query):
  - `filter.startDate` (YYYY-MM-DD)
  - `filter.endDate` (YYYY-MM-DD)
  - `filter.driverId` (UUID)
  - `filter.vehicleId` (UUID)
  - `filter.fatigueLevel` (NINGUNO|BAJO|MEDIO|ALTO)
  - `pageable.page` (0..N), `pageable.size` (1..100), `pageable.sort` (ej: `timestamp,desc`)

- Ejemplo de respuesta paginada (200 OK):

```json
{
  "content": [
    {
      "id": "fa79e284-13b0-4753-b12e-037e44880b9c",
      "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae",
      "vehicleId": "b736f732-b7ca-4515-b2c4-d1ad9ee01084",
      "timestamp": "2025-10-13T22:11:10.834101Z",
      "fatigueLevel": "ALTO",
      "fatigueType": "MICROSUEÑO",
      "eyeClosureDuration": 1.5,
      "yawnCount": 0,
      "blinkRate": 0.2,
      "driverName": "Carlos Vargas",
      "vehicleIdentifier": "RTX-3090"
    },
    {
      "id": "2a45fc68-488f-4d7b-963b-79b0d6f575d8",
      "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae",
      "vehicleId": "b736f732-b7ca-4515-b2c4-d1ad9ee01084",
      "timestamp": "2025-10-13T23:11:10.834212Z",
      "fatigueLevel": "MEDIO",
      "fatigueType": "BOSTEZO",
      "eyeClosureDuration": 0.0,
      "yawnCount": 3,
      "blinkRate": 0.5,
      "driverName": "Carlos Vargas",
      "vehicleIdentifier": "RTX-3090"
    }
    
    /* ...items omitidos por brevedad... */
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": false,
      "unsorted": false,
      "sorted": true
    },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "totalPages": 4,
  "totalElements": 68,
  "last": false,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": false,
    "unsorted": false,
    "sorted": true
  },
  "numberOfElements": 20,
  "first": true,
  "empty": false
}
```

- Ejemplos de uso (query strings):
  - `GET /api/v1/events/search?filter.startDate=2025-10-01&filter.endDate=2025-10-31&pageable.page=0&pageable.size=20&pageable.sort=timestamp,desc`
  - `GET /api/v1/events/search?filter.driverId=ac666564-57a9-435b-a0b4-d6c753be74ae&pageable.page=1&pageable.size=10`

### 3.6. Ejemplos adicionales

#### GET `/api/v1/analytics/top-drivers`
- `?startDate=2025-01-01&endDate=2025-01-31`
- Respuesta (200 OK):
```json
[
  { "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae", "driverName": "Carlos Vargas", "alertCount": 42 },
  { "driverId": "7866307e-a910-4b90-8421-f1a60777ea29", "driverName": "Sofía Rodríguez", "alertCount": 31 }
]
```

#### GET `/api/v1/vehicles?filter.placa=RTX-3090&pageable.page=0&pageable.size=5`
- Respuesta (200 OK):
```json
[
  { "id": "b736f732-b7ca-4515-b2c4-d1ad9ee01084", "placa": "RTX-3090", "marca": "MarcaX", "modelo": "ModeloY", "anio": 2024, "activo": true }
]
```

---

Última actualización: 19 de octubre de 2025
