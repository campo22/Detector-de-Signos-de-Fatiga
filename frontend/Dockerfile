# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build -- --output-path=./dist/browser --configuration=production

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine AS production-stage

# Copia los archivos de construcción de Angular desde la etapa 'builder'
COPY --from=builder /app/dist/browser/browser/ /usr/share/nginx/html

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]