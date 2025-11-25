# Usa la imagen oficial de PostgreSQL
FROM postgres:16-alpine

# Establece variables de entorno para la base de datos
# Estos son valores por defecto que Docker usará si no se sobrescriben en docker-compose.yml
ENV POSTGRES_DB=safetrack_db
ENV POSTGRES_USER=safetrack_user
ENV POSTGRES_PASSWORD=safetrack_password

# Exponer el puerto por defecto de PostgreSQL
EXPOSE 5432

# El comando por defecto de la imagen de PostgreSQL ya es iniciar el servidor.
# No necesitamos CMD aquí a menos que quieras hacer algo especial.
