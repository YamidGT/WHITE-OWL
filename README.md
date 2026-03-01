# White OWL - Mapa Interactivo UNAL

Sistema distribuido para la navegación y visualización de puntos de interés en el campus de la Universidad Nacional de Colombia (Bogotá).

## 🏗 Arquitectura

El sistema está compuesto por los siguientes microservicios:

- **Frontend** (React PWA): Aplicación web progresiva para la visualización del mapa e interacción del usuario.
- **Backend** (Node.js/Express): API Gateway que maneja autenticación, eventos y comunicación entre servicios.
- **Routing Service** (Python/FastAPI): Microservicio independiente para el cálculo de rutas utilizando algoritmos Dijkstra y A*.

## 📋 Requisitos Previos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Python 3.11+ (para desarrollo local)
- Token de Mapbox (obtener en [mapbox.com](https://mapbox.com))

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
cd white-owl
```

### 2. Configurar variables de entorno

Crear archivo `.env` en el directorio raíz:

```env
# Seguridad
JWT_SECRET=your-secret-key-change-in-production
MYSQL_PASSWORD=your-mysql-password

# Mapbox
MAPBOX_TOKEN=your-mapbox-public-token
```

### 3. Iniciar con Docker Compose

```bash
docker-compose up -d
```

### 4. Acceder a los servicios

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- GraphQL: http://localhost:5000/graphql
- Routing Service: http://localhost:8000

## 📁 Estructura del Proyecto

```
white-owl/
├── frontend/                 # Aplicación React PWA
│   ├── src/
│   │   ├── features/        # Módulos por dominio
│   │   │   ├── map/        # Funcionalidad del mapa
│   │   │   ├── routing/    # Enrutamiento
│   │   │   ├── auth/       # Autenticación
│   │   │   └── events/     # Gestión de eventos
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── services/       # Clientes HTTP
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── package.json
│
├── backend-node/            # API Gateway Node.js
│   ├── src/
│   │   ├── routes/         # Endpoints REST
│   │   ├── controllers/    # Lógica de controladores
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── graphql/        # Esquema GraphQL
│   │   ├── middlewares/    # Middlewares Express
│   │   ├── config/         # Configuración
│   │   └── utils/          # Utilidades
│   └── package.json
│
├── routing-service-python/  # Microservicio de rutas
│   ├── app/
│   │   ├── api/            # Endpoints FastAPI
│   │   ├── algorithms/     # Dijkstra y A*
│   │   ├── models/         # Modelos de respuesta
│   │   └── data/           # Datos del grafo
│   └── requirements.txt
│
├── docker-compose.yml       # Orquestación de contenedores
└── README.md               # Este archivo
```

## 🔧 Desarrollo Local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend-node
npm install
npm run dev
```

### Routing Service

```bash
cd routing-service-python
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🗺 Puntos de Interés

La aplicación incluye soporte para los siguientes tipos de POIs:

- 💧 Dispensadores de agua
- 🍔 Plazas de comida
- 📚 Bibliotecas
- 🅿️ Parqueaderos
- 🏫 Aulas
- 🔬 Laboratorios
- 🏢 Oficinas

## 🛠 Tecnologías

- **Frontend**: React, TypeScript, Redux, Mapbox GL JS, Apollo Client
- **Backend**: Node.js, Express, GraphQL, MySQL, MongoDB
- **Routing**: Python, FastAPI, Algoritmos Dijkstra y A*
- **Contenedores**: Docker, Docker Compose

## 📄 Licencia

MIT License - Universidad Nacional de Colombia
