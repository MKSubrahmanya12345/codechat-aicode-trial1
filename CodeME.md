# CodeME.md

## Project: Proactive AI Logistics Guardian

### 1. Context & Business Goal

**Problem Statement:** Logistics operations are plagued by invoice and route manipulation, where drivers intentionally choose longer routes, inflate fuel claims, and log incorrect delivery timestamps. This directly leads to increased logistics costs, excessive fuel consumption, and significant accounting errors, eroding profitability and operational efficiency.

**Business Goal:** To build an "Autonomous Logistics Integrity Platform" – a "Proactive AI Logistics Guardian" – that not only detects but *predicts* and *prevents* such manipulation. The platform will leverage real-time telemetry, advanced geospatial intelligence, and machine learning to ensure logistics integrity, optimize routes, and provide predictive interventions. The ultimate aim is to reduce operational costs, improve driver behavior, and enhance overall supply chain efficiency by fostering trust and accountability.

**Key Features:**
*   **Real-time Telemetry & Geospatial Intelligence:** Ingest and process real-time GPS and vehicle sensor data, integrating with external geospatial APIs for optimal route calculation, geofencing, and delivery verification.
*   **Predictive Fraud & Anomaly Detection:** AI-driven models to predict and flag suspicious patterns in routes, fuel consumption, and timestamps *before* they lead to significant issues.
*   **Actionable Insights & Intervention:** A dynamic administrative dashboard providing real-time alerts, root cause analysis, and tools for dispatchers to intervene and optimize.
*   **Driver Behavior Scoring:** Implement a system to score driver behavior based on adherence to optimal routes, timely deliveries, and accurate reporting, enabling incentivization or corrective actions.

### 2. Exact Tech Stack

The architecture is designed for scalability, real-time performance, and advanced analytics.

*   **Client (Admin Dashboard PWA):** `React`
*   **Client (Driver Mobile App):** `React Native`
*   **Backend API (Core Logic & Orchestration):** `Node.js` (with `Express` or `NestJS` for robust API development)
*   **Real-time Gateway (WebSockets):** `Socket.io`
*   **NoSQL Database (Telemetry, Drivers, Vehicles, Logs):** `MongoDB`
*   **Geospatial Database (Routes, Geofences, Spatial Queries):** `PostgreSQL` with `PostGIS` extension
*   **Cache / Pub/Sub (Real-time data distribution, Session Management):** `Redis`
*   **ML/AI Service (Anomaly Detection, Prediction):** `Python` (with `FastAPI` for API, `TensorFlow`/`PyTorch`/`Scikit-learn` for models)
*   **External Geospatial APIs:** Integration with services like `Google Maps Platform`, `HERE Maps`, `Mapbox`, or `OpenStreetMap` for routing, geocoding, and traffic data.

### 3. Database Schemas to Implement

#### 3.1. MongoDB (NoSQL Database)

**Purpose:** Store flexible, high-volume data like telemetry logs, driver profiles, vehicle details, and general application settings.

1.  **`drivers` Collection**
    *   `_id`: `ObjectId` (auto-generated)
    *   `userId`: `String` (Unique ID, e.g., email or employee ID)
    *   `passwordHash`: `String`
    *   `firstName`: `String`
    *   `lastName`: `String`
    *   `email`: `String` (Unique)
    *   `phone`: `String`
    *   `driverLicenseNumber`: `String` (Unique)
    *   `vehicleId`: `ObjectId` (Reference to `vehicles` collection)
    *   `status`: `String` (`active`, `inactive`, `on-duty`, `off-duty`)
    *   `currentLocation`: `{ lat: Number, lon: Number, timestamp: Date }` (Last reported location)
    *   `behaviorScore`: `Number` (0-100, calculated by ML)
    *   `assignedRoutes`: `Array<ObjectId>` (References to `routes` collection)
    *   `createdAt`: `Date`
    *   `updatedAt`: `Date`

2.  **`vehicles` Collection**
    *   `_id`: `ObjectId` (auto-generated)
    *   `plateNumber`: `String` (Unique)
    *   `make`: `String`
    *   `model`: `String`
    *   `year`: `Number`
    *   `fuelType`: `String` (`diesel`, `petrol`, `electric`)
    *   `fuelEfficiencyLitersPerKm`: `Number` (Avg. efficiency)
    *   `capacityKg`: `Number`
    *   `driverId`: `ObjectId` (Reference to `drivers` collection, current driver)
    *   `status`: `String` (`available`, `in-use`, `maintenance`)
    *   `currentOdometerKm`: `Number`
    *   `createdAt`: `Date`
    *   `updatedAt`: `Date`

3.  **`telemetry_logs` Collection**
    *   `_id`: `ObjectId` (auto-generated)
    *   `driverId`: `ObjectId` (Reference to `drivers` collection)
    *   `vehicleId`: `ObjectId` (Reference to `vehicles` collection)
    *   `latitude`: `Number`
    *   `longitude`: `Number`
    *   `speedKmh`: `Number`
    *   `headingDeg`: `Number`
    *   `fuelLevelPercent`: `Number` (Optional, if sensor data available)
    *   `engineStatus`: `String` (Optional, `on`, `off`, `idle`)
    *   `timestamp`: `Date` (Index this for time-series queries)
    *   `routeId`: `ObjectId` (Reference to `routes` collection, if part of an active route)

4.  **`invoices` Collection**
    *   `_id`: `ObjectId` (auto-generated)
    *   `invoiceNumber`: `String` (Unique)
    *   `driverId`: `ObjectId` (Reference to `drivers` collection)
    *   `vehicleId`: `ObjectId` (Reference to `vehicles` collection)
    *   `type`: `String` (`fuel_claim`, `delivery_summary`)
    *   `amount`: `Number` (Total claim amount)
    *   `currency`: `String`
    *   `fuelLitersClaimed`: `Number` (For `fuel_claim` type)
    *   `fuelReceiptHash`: `String` (Optional, for immutable audit trail)
    *   `deliveryIds`: `Array<ObjectId>` (References to `deliveries` in PostgreSQL)
    *   `status`: `String` (`pending`, `approved`, `rejected`, `flagged`)
    *   `anomalyFlag`: `Boolean` (Set by ML service)
    *   `anomalyDetails`: `{ type: String, score: Number, reason: String }`
    *   `createdAt`: `Date`
    *   `submittedAt`: `Date`
    *   `processedAt`: `Date`

5.  **`alerts` Collection**
    *   `_id`: `ObjectId` (auto-generated)
    *   `type`: `String` (`route_deviation`, `fuel_anomaly`, `timestamp_mismatch`, `geofence_breach`, `low_behavior_score`)
    *   `severity`: `String` (`low`, `medium`, `high`, `critical`)
    *   `message`: `String` (Descriptive alert message)
    *   `driverId`: `ObjectId` (Reference to `drivers` collection, if applicable)
    *   `vehicleId`: `ObjectId` (Reference to `vehicles` collection, if applicable)
    *   `routeId`: `ObjectId` (Reference to `routes` collection, if applicable)
    *   `location`: `{ lat: Number, lon: Number }` (Location of the anomaly)
    *   `timestamp`: `Date` (When the alert was generated)
    *   `status`: `String` (`new`, `acknowledged`, `resolved`, `false_positive`)
    *   `details`: `Object` (JSON object for specific anomaly data)
    *   `triggeredBy`: `String` (`ML_SERVICE`, `GEO_SERVICE`, `MANUAL`)

#### 3.2. PostgreSQL + PostGIS (Geospatial Database)

**Purpose:** Store structured logistics data, optimal routes, actual driver paths, delivery points, and geofences, leveraging PostGIS for spatial queries and analysis.

1.  **`optimal_routes` Table**
    *   `id`: `UUID` (Primary Key)
    *   `name`: `VARCHAR(255)`
    *   `origin_address`: `TEXT`
    *   `destination_address`: `TEXT`
    *   `route_geometry`: `GEOMETRY(LineString, 4326)` (Optimal path)
    *   `distance_km`: `NUMERIC`
    *   `duration_minutes`: `NUMERIC`
    *   `estimated_fuel_liters`: `NUMERIC`
    *   `waypoints`: `JSONB` (Array of `{lat, lon, address_hint}`)
    *   `generated_by_ml`: `BOOLEAN`
    *   `createdAt`: `TIMESTAMP WITH TIME ZONE`
    *   `updatedAt`: `TIMESTAMP WITH TIME ZONE`

2.  **`actual_routes` Table**
    *   `id`: `UUID` (Primary Key)
    *   `driver_id`: `VARCHAR(255)` (Reference to MongoDB `drivers.userId`)
    *   `vehicle_id`: `VARCHAR(255)` (Reference to MongoDB `vehicles.plateNumber`)
    *   `planned_route_id`: `UUID` (Foreign Key to `optimal_routes.id`, nullable if impromptu)
    *   `start_time`: `TIMESTAMP WITH TIME ZONE`
    *   `end_time`: `TIMESTAMP WITH TIME ZONE`
    *   `actual_geometry`: `GEOMETRY(LineString, 4326)` (Actual path taken by driver)
    *   `actual_distance_km`: `NUMERIC`
    *   `actual_duration_minutes`: `NUMERIC`
    *   `fuel_consumed_liters`: `NUMERIC`
    *   `route_deviation_score`: `NUMERIC` (Calculated by ML)
    *   `anomaly_flag`: `BOOLEAN`
    *   `anomaly_details`: `JSONB`
    *   `createdAt`: `TIMESTAMP WITH TIME ZONE`

3.  **`delivery_points` Table**
    *   `id`: `UUID` (Primary Key)
    *   `name`: `VARCHAR(255)`
    *   `address`: `TEXT`
    *   `location`: `GEOMETRY(Point, 4326)`
    *   `geofence_radius_m`: `NUMERIC` (Radius for delivery confirmation)
    *   `expected_arrival_time`: `TIMESTAMP WITH TIME ZONE`
    *   `actual_arrival_time`: `TIMESTAMP WITH TIME ZONE`
    *   `actual_departure_time`: `TIMESTAMP WITH TIME ZONE`
    *   `status`: `VARCHAR(50)` (`pending`, `arrived`, `delivered`, `missed`)
    *   `route_assignment_id`: `UUID` (Foreign Key to `route_assignments.id`)
    *   `createdAt`: `TIMESTAMP WITH TIME ZONE`
    *   `updatedAt`: `TIMESTAMP WITH TIME ZONE`

4.  **`geofences` Table**
    *   `id`: `UUID` (Primary Key)
    *   `name`: `VARCHAR(255)` (e.g., "Depot A", "Client X Warehouse")
    *   `type`: `VARCHAR(50)` (`depot`, `delivery_zone`, `restricted_area`)
    *   `geometry`: `GEOMETRY(Polygon, 4326)`
    *   `alert_on_entry`: `BOOLEAN`
    *   `alert_on_exit`: `BOOLEAN`
    *   `createdAt`: `TIMESTAMP WITH TIME ZONE`
    *   `updatedAt`: `TIMESTAMP WITH TIME ZONE`

5.  **`route_assignments` Table**
    *   `id`: `UUID` (Primary Key)
    *   `driver_id`: `VARCHAR(255)` (Reference to MongoDB `drivers.userId`)
    *   `vehicle_id`: `VARCHAR(255)` (Reference to MongoDB `vehicles.plateNumber`)
    *   `optimal_route_id`: `UUID` (Foreign Key to `optimal_routes.id`)
    *   `start_time_planned`: `TIMESTAMP WITH TIME ZONE`
    *   `end_time_planned`: `TIMESTAMP WITH TIME ZONE`
    *   `start_time_actual`: `TIMESTAMP WITH TIME ZONE`
    *   `end_time_actual`: `TIMESTAMP WITH TIME ZONE`
    *   `status`: `VARCHAR(50)` (`assigned`, `started`, `in_progress`, `completed`, `cancelled`)
    *   `current_delivery_point_id`: `UUID` (Foreign Key to `delivery_points.id`, current active stop)
    *   `createdAt`: `TIMESTAMP WITH TIME ZONE`
    *   `updatedAt`: `TIMESTAMP WITH TIME ZONE`

### 4. API Endpoint Definitions

#### 4.1. Backend API (Node.js - RESTful HTTP)

**Base URL:** `/api/v1`

**Authentication & Authorization:** JWT-based authentication for both drivers and admins.

*   **Auth Endpoints:**
    *   `POST /auth/register/driver`: Register a new driver.
        *   Request: `{ firstName, lastName, email, phone, password, driverLicenseNumber, vehiclePlateNumber }`
        *   Response: `{ token, driverId }`
    *   `POST /auth/register/admin`: Register a new admin.
        *   Request: `{ username, email, password }`
        *   Response: `{ token, adminId }`
    *   `POST /auth/login`: Authenticate user (driver/admin).
        *   Request: `{ email/username, password }`
        *   Response: `{ token, userType: 'driver'/'admin' }`
    *   `GET /auth/me`: Get current user profile (requires token).
        *   Response: `{ driver/admin object }`

*   **Driver Management (Admin Only):**
    *   `GET /drivers`: Get all drivers. (Admin)
    *   `GET /drivers/:driverId`: Get driver details. (Admin)
    *   `PUT /drivers/:driverId`: Update driver details. (Admin)
    *   `DELETE /drivers/:driverId`: Delete a driver. (Admin)
    *   `GET /drivers/:driverId/location`: Get last known location for a driver. (Admin)
    *   `GET /drivers/:driverId/performance`: Get performance metrics for a driver. (Admin)

*   **Vehicle Management (Admin Only):**
    *   `POST /vehicles`: Add a new vehicle. (Admin)
        *   Request: `{ plateNumber, make, model, year, fuelType, fuelEfficiencyLitersPerKm, capacityKg, driverId? }`
    *   `GET /vehicles`: Get all vehicles. (Admin)
    *   `GET /vehicles/:vehicleId`: Get vehicle details. (Admin)
    *   `PUT /vehicles/:vehicleId`: Update vehicle details. (Admin)
    *   `DELETE /vehicles/:vehicleId`: Delete a vehicle. (Admin)
    *   `PUT /vehicles/:vehicleId/assign`: Assign vehicle to a driver. (Admin)
        *   Request: `{ driverId: 'ObjectId' | null }`

*   **Route Management:**
    *   `POST /routes/plan`: Generate an optimal route between points. (Admin)
        *   Request: `{ origin: {lat, lon}, destination: {lat, lon}, waypoints: [{lat, lon}], vehicleId: 'ObjectId' }`
        *   Response: `{ optimalRouteId: 'UUID', distanceKm, durationMinutes, estimatedFuelLiters, routeGeometry: 'GeoJSON' }`
    *   `GET /routes/optimal/:routeId`: Get details of an optimal planned route. (Admin)
    *   `GET /routes/actual/:actualRouteId`: Get details of an actual route taken by a driver. (Admin/Driver)
    *   `GET /routes/assignments`: Get all route assignments. (Admin)
    *   `GET /routes/assignments/driver/:driverId`: Get route assignments for a specific driver. (Admin/Driver)
    *   `POST /routes/assignments`: Create a new route assignment. (Admin)
        *   Request: `{ driverId: 'ObjectId', vehicleId: 'ObjectId', optimalRouteId: 'UUID', plannedStartTime, plannedEndTime, deliveryPoints: [{ deliveryPointId: 'UUID', expectedArrivalTime }] }`
        *   Response: `{ routeAssignmentId: 'UUID' }`
    *   `PUT /routes/assignments/:assignmentId/status`: Update status of a route assignment. (Admin/Driver)
        *   Request: `{ status: 'started'/'in_progress'/'completed'/'cancelled' }`
    *   `GET /geofences`: Get all defined geofences. (Admin)
    *   `POST /geofences`: Create a new geofence. (Admin)
        *   Request: `{ name, type, geometry: 'GeoJSON Polygon', alertOnEntry, alertOnExit }`

*   **Delivery Management:**
    *   `GET /deliveries`: Get all delivery points. (Admin)
    *   `GET /deliveries/:deliveryPointId`: Get delivery point details. (Admin/Driver)
    *   `PUT /deliveries/:deliveryPointId/status`: Update delivery status. (Admin/Driver)
        *   Request: `{ status: 'arrived'/'delivered'/'missed', actualArrivalTime?, actualDepartureTime? }`

*   **Invoice & Claim Management:**
    *   `POST /invoices`: Submit a new invoice/claim. (Driver)
        *   Request: `{ type: 'fuel_claim'/'delivery_summary', driverId, vehicleId, amount, currency, fuelLitersClaimed?, fuelReceiptHash?, deliveryIds? }`
    *   `GET /invoices`: Get all invoices. (Admin)
    *   `GET /invoices/:invoiceId`: Get invoice details. (Admin/Driver)
    *   `PUT /invoices/:invoiceId/status`: Update invoice status. (Admin)
        *   Request: `{ status: 'approved'/'rejected'/'flagged', reason? }`
    *   `GET /invoices/flagged`: Get all flagged invoices. (Admin)

*   **Telemetry & Alerts:**
    *   `POST /telemetry/ingest`: Ingest telemetry data (fallback for non-websocket, or batch processing). (Driver App)
        *   Request: `{ driverId, vehicleId, latitude, longitude, speedKmh, headingDeg, fuelLevelPercent?, engineStatus?, timestamp, routeId? }`
    *   `GET /alerts`: Get all active alerts. (Admin)
    *   `PUT /alerts/:alertId/status`: Update alert status. (Admin)
        *   Request: `{ status: 'acknowledged'/'resolved'/'false_positive' }`

*   **ML Integration (Internal API calls, secured):**
    *   `POST /ml/predict-route-anomaly`: Trigger route anomaly prediction. (Internal from Backend API)
        *   Request: `{ actualRouteId: 'UUID', plannedRouteId: 'UUID' }`
        *   Response: `{ anomalyFlag: Boolean, anomalyScore: Number, reason: String }`
    *   `POST /ml/predict-fuel-claim`: Trigger fuel claim anomaly prediction. (Internal from Backend API)
        *   Request: `{ invoiceId: 'ObjectId', vehicleId: 'ObjectId', actualFuelUsed: Number, routeDistanceKm: Number, vehicleFuelEfficiency: Number }`
        *   Response: `{ anomalyFlag: Boolean, predictedFuel: Number, deviation: Number, reason: String }`

#### 4.2. Real-time Gateway (Socket.io - WebSockets)

**Purpose:** Enable real-time communication for driver location updates, admin monitoring, and instant alerts.

**Events from Driver Mobile App (`client_driver_app`):**

*   `authenticate`:
    *   Payload: `{ token: 'JWT_TOKEN' }`
    *   Description: Authenticate the WebSocket connection.
*   `driverLocationUpdate`:
    *   Payload: `{ lat: Number, lon: Number, speedKmh: Number, headingDeg: Number, fuelLevelPercent?: Number, engineStatus?: String, timestamp: Date, routeAssignmentId?: 'UUID' }`
    *   Description: Driver's real-time GPS and vehicle sensor data.
*   `driverStatusUpdate`:
    *   Payload: `{ status: 'on-duty'/'off-duty'/'break' }`
    *   Description: Update driver's operational status.
*   `deliveryEvent`:
    *   Payload: `{ deliveryPointId: 'UUID', eventType: 'arrived'/'departed'/'delivered', timestamp: Date, location: {lat, lon} }`
    *   Description: Real-time confirmation of delivery milestones.

**Events from Admin Dashboard PWA (`client_pwa`):**

*   `authenticate`:
    *   Payload: `{ token: 'JWT_TOKEN' }`
    *   Description: Authenticate the WebSocket connection.
*   `subscribeToDriverLocation`:
    *   Payload: `{ driverId: 'ObjectId' }`
    *   Description: Admin subscribes to real-time location updates for a specific driver.
*   `unsubscribeFromDriverLocation`:
    *   Payload: `{ driverId: 'ObjectId' }`
    *   Description: Admin unsubscribes from driver location updates.
*   `sendDispatchMessage`:
    *   Payload: `{ driverId: 'ObjectId', message: String }`
    *   Description: Admin sends a real-time message to a driver.
*   `assignRouteRealtime`:
    *   Payload: `{ driverId: 'ObjectId', routeAssignmentId: 'UUID' }`
    *   Description: Admin assigns a route in real-time, pushing to driver app.

**Events to Driver Mobile App (`client_driver_app`):**

*   `routeUpdate`:
    *   Payload: `{ routeAssignmentId: 'UUID', optimalRoute: { ... }, deliveryPoints: [...] }`
    *   Description: New route assignment or modification.
*   `alertNotification`:
    *   Payload: `{ type: String, message: String, location: {lat, lon}, severity: String }`
    *   Description: Real-time alerts (e.g., geofence breach, route deviation warning).
*   `dispatchMessage`:
    *   Payload: `{ message: String, from: 'Admin' }`
    *   Description: Message from admin.

**Events to Admin Dashboard PWA (`client_pwa`):**

*   `driverLocationStream`:
    *   Payload: `{ driverId: 'ObjectId', lat: Number, lon: Number, speedKmh: Number, timestamp: Date }`
    *   Description: Real-time location updates for subscribed drivers.
*   `anomalyDetected`:
    *   Payload: `{ alertId: 'ObjectId', type: String, message: String, driverId?: 'ObjectId', routeId?: 'UUID', location?: {lat, lon}, severity: String, timestamp: Date }`
    *   Description: Real-time notification of detected anomalies.
*   `deliveryStatusUpdate`:
    *   Payload: `{ deliveryPointId: 'UUID', status: 'arrived'/'delivered', driverId: 'ObjectId', timestamp: Date }`
    *   Description: Real-time delivery progress updates.
*   `driverStatusChange`:
    *   Payload: `{ driverId: 'ObjectId', status: 'on-duty'/'off-duty'/'break' }`
    *   Description: Real-time driver status changes.

### 5. Folder Scaffolding Structure

```
.
├── README.md                                 # Project overview, setup instructions
├── .env.example                              # Example environment variables
├── docker-compose.yml                        # Orchestrates all services
├── backend/                                  # Node.js (Express/NestJS) API
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts                            # Main application entry point
│   │   ├── config/                           # Environment variables, constants
│   │   ├── controllers/                      # API endpoint handlers
│   │   ├── services/                         # Business logic, data transformations
│   │   ├── models/                           # MongoDB schemas (Mongoose models)
│   │   ├── routes/                           # API route definitions
│   │   ├── middlewares/                      # Authentication, error handling
│   │   ├── utils/                            # Helper functions
│   │   ├── db/                               # PostgreSQL connection, PostGIS setup, migrations
│   │   │   ├── index.ts
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   └── types/                            # TypeScript interfaces
│   ├── Dockerfile
│   └── .dockerignore
├── socket-gateway/                           # Node.js (Socket.io) Real-time Gateway
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts                            # Socket.io server entry point
│   │   ├── services/                         # Redis pub/sub logic, API integration
│   │   ├── utils/                            # Helper functions
│   │   └── types/                            # TypeScript interfaces
│   ├── Dockerfile
│   └── .dockerignore
├── ml-service/                               # Python (FastAPI) ML/AI Service
│   ├── requirements.txt                      # Python dependencies
│   ├── src/
│   │   ├── main.py                           # FastAPI application entry point
│   │   ├── models/                           # Saved ML models (.pkl, .h5, etc.)
│   │   │   ├── route_anomaly_model.pkl
│   │   │   └── fuel_prediction_model.h5
│   │   ├── data_processing/                  # Scripts for data cleaning, feature engineering
│   │   ├── training/                         # Scripts for model training
│   │   ├── inference/                        # Logic for making predictions
│   │   └── utils/                            # ML-specific utilities
│   ├── Dockerfile
│   └── .dockerignore
├── client-admin-pwa/                         # React Admin Dashboard PWA
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── index.js                          # Main entry point
│   │   ├── App.js                            # Root component
│   │   ├── components/                       # Reusable UI components
│   │   ├── pages/                            # Page-level components (Dashboard, Drivers, Routes, Alerts)
│   │   ├── api/                              # HTTP (Axios) and WebSocket (Socket.io) client instances
│   │   │   ├── http.js
│   │   │   └── socket.js
│   │   ├── contexts/                         # React Contexts for global state
│   │   ├── hooks/                            # Custom React hooks
│   │   ├── assets/                           # Images, fonts, icons
│   │   ├── styles/                           # Global styles, CSS modules
│   │   └── config/                           # Frontend configurations
│   ├── .env                                  # Frontend environment variables
│   └── Dockerfile
├── client-driver-app/                        # React Native Driver Mobile App
│   ├── package.json
│   ├── App.js                                # Root component
│   ├── src/
│   │   ├── index.js                          # Entry point for React Native app
│   │   ├── components/                       # Reusable UI components
│   │   ├── screens/                          # Screen-level components (Login, Dashboard, RouteView, Settings)
│   │   ├── api/                              # HTTP (Axios) and WebSocket (Socket.io) client instances
│   │   │   ├── http.js
│   │   │   └── socket.js
│   │   ├── contexts/                         # React Contexts for global state
│   │   ├── hooks/                            # Custom React hooks
│   │   ├── assets/                           # Images, fonts, icons
│   │   ├── navigation/                       # React Navigation setup
│   │   ├── styles/                           # Global styles
│   │   └── services/                         # Background GPS tracking, local storage
│   ├── .env                                  # Frontend environment variables
│   ├── babel.config.js
│   ├── metro.config.js
│   └── Dockerfile
```