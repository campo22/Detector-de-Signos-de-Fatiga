# Sistema de Detección de Signos de Fatiga

Sistema integral para la detección y monitoreo de signos de fatiga en conductores utilizando visión por computadora.

## Estructura del Proyecto

```
.
├── sanchez_polo_drowsy/    # Componente Edge (Python)
│   ├── src/               # Código fuente del detector
│   ├── models/           # Modelos pre-entrenados
│   └── requirements.txt  # Dependencias Python
├── backend/             # API y Servidor (Spring Boot)
│   ├── src/            # Código fuente del backend
│   └── pom.xml        # Configuración Maven
└── frontend/          # Panel de Control (React)
    ├── src/          # Código fuente del frontend
    └── package.json  # Dependencias Node.js
```

## Componentes

### Edge (Python - sanchez_polo_drowsy)
- Detección de fatiga en tiempo real usando visión por computadora
- Características:
  - Detección de microsueños
  - Detección de cabeceo
  - Monitoreo de parpadeo
  - Detección de bostezos
  - Transmisión de eventos en tiempo real

### Backend (Spring Boot)
- API REST y WebSocket para gestión de datos
- Características:
  - Recepción de eventos en tiempo real
  - Persistencia en base de datos
  - API REST para consultas y administración
  - Autenticación y autorización
  - Análisis y estadísticas

### Frontend (React)
- Interfaz web para monitoreo y administración
- Características:
  - Dashboard en tiempo real
  - Visualización de estadísticas
  - Gestión de conductores y vehículos
  - Configuración del sistema
  - Reportes y análisis

## Configuración del Proyecto

### Requisitos Previos
- Python 3.8+
- Java 17+
- Node.js 18+
- PostgreSQL 13+

### Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Detector-de-Signos-de-Fatiga
```

2. Configurar el Edge (Python):
```bash
cd sanchez_polo_drowsy
python -m venv venv
source venv/bin/activate  # En Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configurar el Backend:
```bash
cd backend
./mvnw install
```

4. Configurar el Frontend:
```bash
cd frontend
npm install
```

## Ejecución

1. Iniciar el Edge:
```bash
cd sanchez_polo_drowsy
source venv/bin/activate  # En Windows: .\venv\Scripts\activate
python main.py
```

2. Iniciar el Backend:
```bash
cd backend
./mvnw spring-boot:run
```

3. Iniciar el Frontend:
```bash
cd frontend
npm run dev
```

## Documentación Adicional

- [Documentación del Edge](./sanchez_polo_drowsy/README.md)
- [Documentación del Backend](./backend/README.md)
- [Documentación del Frontend](./frontend/README.md)

## Contribución

1. Crear un branch para la feature: `git checkout -b feature/nombre-feature`
2. Hacer commit de los cambios: `git commit -am 'Agregar nueva feature'`
3. Push al branch: `git push origin feature/nombre-feature`
4. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
