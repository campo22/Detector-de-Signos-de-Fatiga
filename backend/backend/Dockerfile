# Etapa de construcción
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
# Copia los archivos de configuración de Maven (pom.xml)
COPY pom.xml .
# Descarga las dependencias para que no se reconstruyan en cada cambio de código
RUN mvn dependency:go-offline
# Copia el resto del código fuente
COPY src ./src
# Construye la aplicación y genera el JAR
RUN mvn clean install -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copia el JAR generado de la etapa de construcción
COPY --from=build /app/target/*.jar app.jar
# Expone el puerto por defecto de Spring Boot
EXPOSE 8080
# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]