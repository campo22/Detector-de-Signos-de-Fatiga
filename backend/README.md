# Backend (Spring Boot)

API central para la gestión de eventos de fatiga, conductores y vehículos, con notificaciones en tiempo real vía WebSocket.

## Requisitos
- Java 17+
- Maven Wrapper (`./mvnw` incluido)
- PostgreSQL 13+

## Configuración

### Variables de entorno
- `SPRING_DATASOURCE_URL` (ej: `jdbc:postgresql://localhost:5432/fatigue_db`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` (secreto para firmar tokens)
- `SPRING_PROFILES_ACTIVE` (`dev`|`prod`)

> Alternativa: configurar `application.yml` con perfiles por entorno.

## Ejecutar en desarrollo
```bash
./mvnw spring-boot:run
```

## Compilar
```bash
./mvnw clean package
```

## Endpoints principales
- Auth
  - POST `/api/auth/login`
  - POST `/api/auth/register`
- Eventos
  - POST `/api/events`
  - GET `/api/analytics/events`
- Gestión
  - CRUD `/api/drivers`
  - CRUD `/api/vehicles`
  - CRUD `/api/rules`

## WebSocket
- Endpoint: `ws://localhost:8080/ws`
- Topic: `/topic/fatigue-events`

## Salud y métricas
- Actuator (si está habilitado): `/actuator/health`, `/actuator/metrics`

## Docker (ejemplo)
```dockerfile
# Etapa build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Etapa runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
```

## Notas
- Habilitar CORS y seguridad por perfiles.
- Ajustar `proxy.conf.json` del frontend para URLs del backend en dev.
