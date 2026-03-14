# CodeME.md

## Project: Proactive AI Logistics Guardian

### 1. Context & Business Goal

**Problem Statement:** Logistics operations are plagued by invoice and route manipulation, where drivers intentionally choose longer routes, inflate fuel claims, and log incorrect delivery timestamps. This directly leads to increased logistics costs, excessive fuel consumption, and significant accounting errors, eroding profitability and operational efficiency.

**Business Goal:** To build an "Autonomous Logistics Integrity Platform" – a "Proactive AI Logistics Guardian" – that not only detects but *predicts* and *prevents* such manipulation. The platform will leverage real-time telemetry, advanced geospatial intelligence, and machine learning to ensure logistics integrity, optimize routes, and provide predictive interventions. The ultimate aim is to reduce operational costs, improve driver behavior, and enhance overall supply chain efficiency by fostering trust and accountability.

**Key Features:**

* **Real-time Telemetry & Geospatial Intelligence:** Ingest and process real-time GPS data and integrate with geospatial services for optimal route calculation, geofencing, and delivery verification.
* **Predictive Fraud & Anomaly Detection:** Intelligent analytics to detect suspicious patterns in routes, fuel consumption, and timestamps.
* **Actionable Insights & Intervention:** An administrative dashboard providing real-time alerts, analysis, and dispatcher tools.
* **Driver Behavior Scoring:** Score drivers based on route adherence, timely deliveries, and accurate reporting.

## 2. Exact Tech Stack

This version uses a **pure MERN architecture running locally**.

* **Frontend (Admin Dashboard + Driver Interface):** React (with Vite)
* **Backend API:** Node.js with Express
* **Database:** MongoDB
* **Real-time Communication:** Socket.io
* **Maps & Geospatial Visualization:** Leaflet
* **Authentication:** JWT
* **HTTP Client:** Axios

## 3. Database Schemas to Implement

### MongoDB Collections

### 3.1 drivers

* `_id`: ObjectId
* `userId`: String
* `passwordHash`: String
* `firstName`: String
* `lastName`: String
* `email`: String
* `phone`: String
* `driverLicenseNumber`: String
* `vehicleId`: ObjectId
* `status`: String (`active`, `inactive`, `on-duty`, `off-duty`)
* `currentLocation`

  * `lat`: Number
  * `lon`: Number
  * `timestamp`: Date
* `behaviorScore`: Number
* `assignedRoutes`: Array<ObjectId>
* `createdAt`: Date
* `updatedAt`: Date

### 3.2 vehicles

* `_id`: ObjectId
* `plateNumber`: String
* `make`: String
* `model`: String
* `year`: Number
* `fuelType`: String (`diesel`, `petrol`, `electric`)
* `fuelEfficiencyLitersPerKm`: Number
* `capacityKg`: Number
* `driverId`: ObjectId
* `status`: String (`available`, `in-use`, `maintenance`)
* `currentOdometerKm`: Number
* `createdAt`: Date
* `updatedAt`: Date

### 3.3 telemetry_logs

* `_id`: ObjectId
* `driverId`: ObjectId
* `vehicleId`: ObjectId
* `latitude`: Number
* `longitude`: Number
* `speedKmh`: Number
* `headingDeg`: Number
* `fuelLevelPercent`: Number
* `engineStatus`: String
* `timestamp`: Date
* `routeId`: ObjectId

### 3.4 invoices

* `_id`: ObjectId
* `invoiceNumber`: String
* `driverId`: ObjectId
* `vehicleId`: ObjectId
* `type`: String (`fuel_claim`, `delivery_summary`)
* `amount`: Number
* `currency`: String
* `fuelLitersClaimed`: Number
* `deliveryIds`: Array<ObjectId>
* `status`: String (`pending`, `approved`, `rejected`, `flagged`)
* `anomalyFlag`: Boolean
* `anomalyDetails`

  * `type`: String
  * `score`: Number
  * `reason`: String
* `createdAt`: Date
* `submittedAt`: Date
* `processedAt`: Date

### 3.5 alerts

* `_id`: ObjectId
* `type`: String (`route_deviation`, `fuel_anomaly`, `timestamp_mismatch`, `geofence_breach`)
* `severity`: String (`low`, `medium`, `high`, `critical`)
* `message`: String
* `driverId`: ObjectId
* `vehicleId`: ObjectId
* `routeId`: ObjectId
* `location`

  * `lat`: Number
  * `lon`: Number
* `timestamp`: Date
* `status`: String (`new`, `acknowledged`, `resolved`, `false_positive`)
* `details`: Object
* `triggeredBy`: String

### 3.6 routes

* `_id`: ObjectId
* `name`: String
* `origin`

  * `lat`: Number
  * `lon`: Number
* `destination`

  * `lat`: Number
  * `lon`: Number
* `waypoints`: Array<{lat:Number,lon:Number}>
* `distanceKm`: Number
* `durationMinutes`: Number
* `estimatedFuelLiters`: Number
* `createdAt`: Date
* `updatedAt`: Date

### 3.7 route_assignments

* `_id`: ObjectId
* `driverId`: ObjectId
* `vehicleId`: ObjectId
* `routeId`: ObjectId
* `plannedStartTime`: Date
* `plannedEndTime`: Date
* `actualStartTime`: Date
* `actualEndTime`: Date
* `status`: String (`assigned`, `started`, `in_progress`, `completed`)
* `createdAt`: Date
* `updatedAt`: Date

## 4. API Endpoint Definitions

### Base URL

/api

### Authentication

**POST /auth/register**

Request

```
{
firstName,
lastName,
email,
password
}
```

Response

```
{
token,
userId
}
```

**POST /auth/login**

Request

```
{
email,
password
}
```

Response

```
{
token
}
```

### Drivers

**GET /drivers**

Get all drivers

**GET /drivers/:id**

Get driver details

**PUT /drivers/:id**

Update driver

**DELETE /drivers/:id**

Delete driver

### Vehicles

**POST /vehicles**

Create vehicle

**GET /vehicles**

Get vehicles

**PUT /vehicles/:id**

Update vehicle

**DELETE /vehicles/:id**

Delete vehicle

### Routes

**POST /routes**

Create route

**GET /routes**

Get routes

**GET /routes/:id**

Get route

**POST /routes/assign**

Assign route to driver

### Telemetry

**POST /telemetry**

Submit GPS telemetry

Request

```
{
driverId,
vehicleId,
latitude,
longitude,
speedKmh,
timestamp
}
```

### Invoices

**POST /invoices**

Submit invoice

**GET /invoices**

Get all invoices

**GET /invoices/:id**

Get invoice details

**PUT /invoices/:id/status**

Update invoice status

### Alerts

**GET /alerts**

Get alerts

**PUT /alerts/:id/status**

Update alert status

## 5. WebSocket Events (Socket.io)

### Driver → Server

**driverLocationUpdate**

```
{
lat,
lon,
speedKmh,
timestamp,
routeAssignmentId
}
```

**driverStatusUpdate**

```
{
status
}
```

### Server → Admin Dashboard

**driverLocationStream**

```
{
driverId,
lat,
lon,
speedKmh,
timestamp
}
```

**anomalyDetected**

```
{
alertId,
type,
message,
driverId,
severity,
timestamp
}
```

## 6. Folder Structure

```
project-root
│
├── backend
│ ├── package.json
│ ├── .env
│ └── src
│ ├── index.js
│ │
│ ├── config
│ │ └── db.js
│ │
│ ├── models
│ │ ├── Driver.js
│ │ ├── Vehicle.js
│ │ ├── Route.js
│ │ ├── Invoice.js
│ │ ├── TelemetryLog.js
│ │ └── Alert.js
│ │
│ ├── controllers
│ │ ├── authController.js
│ │ ├── driverController.js
│ │ ├── vehicleController.js
│ │ ├── routeController.js
│ │ ├── invoiceController.js
│ │ └── telemetryController.js
│ │
│ ├── routes
│ │ ├── authRoutes.js
│ │ ├── driverRoutes.js
│ │ ├── vehicleRoutes.js
│ │ ├── routeRoutes.js
│ │ ├── invoiceRoutes.js
│ │ └── telemetryRoutes.js
│ │
│ ├── middlewares
│ │ ├── authMiddleware.js
│ │ └── errorMiddleware.js
│ │
│ └── utils
│ ├── jwt.js
│ └── helpers.js
│
└── frontend
├── package.json
├── vite.config.js
├── index.html
└── src
├── main.jsx
├── App.jsx
│
├── pages
│ ├── Dashboard.jsx
│ ├── Drivers.jsx
│ ├── Routes.jsx
│ ├── Vehicles.jsx
│ └── Alerts.jsx
│
├── components
│ ├── MapView.jsx
│ ├── DriverCard.jsx
│ ├── RouteMap.jsx
│ └── AlertPanel.jsx
│
├── api
│ └── http.js
│
├── socket
│ └── socket.js
│
├── hooks
│ └── useSocket.js
│
└── styles
└── global.css
```
