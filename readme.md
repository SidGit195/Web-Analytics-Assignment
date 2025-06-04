# Web Analytics Event Service

A Node.js-based web analytics service that captures and analyzes user events (views, clicks, location) with real-time dashboard capabilities.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/SidGit195/Web-Analytics-Assignment.git
    cd Web-Analytics-Assignment
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Environment Configuration**
    Create a `.env` file in the root directory:
    ```
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/web_analytics
    ```

4. **Database Setup**
    - Start MongoDB service on your local machine
    - The application will automatically create the database and collections

5. **Generate Sample Data**
    ```bash
    npm run generate-data
    ```
    This creates 3000 sample events across different types and users.

6. **Start the Backend Service**
    ```bash
    # Development mode with auto-reload
    npm run dev
    
    # Production mode
    npm start
    ```

7. **Access the Application**
    - Backend API: `http://localhost:3000/api`
    - Frontend Demo: `http://localhost:3000`
    - Health Check: `http://localhost:3000/health`

## API Documentation

### POST /api/events
**Purpose**: Create a new analytics event

**Request Body Example**:
```json
{
  "user_id": "user_123456789",
  "event_type": "view",
  "payload": {
     "url": "https://example.com/products",
     "title": "Products Page"
  }
}
```

**Success Response** (202):
```json
{
  "message": "Event received successfully",
  "event_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response** (400):
```json
{
  "error": "Validation failed",
  "details": ["user_id is required"]
}
```

### GET /api/analytics/event-counts
**Purpose**: Get total event counts with optional date filtering

**Query Parameters**:
- `start_date` (optional): ISO date string (e.g., "2025-05-01")
- `end_date` (optional): ISO date string (e.g., "2025-05-31")

**Success Response** (200):
```json
{
  "total_events": 1250,
  "date_range": {
     "start": "2025-05-01T00:00:00.000Z",
     "end": "2025-05-31T23:59:59.999Z"
  }
}
```

### GET /api/analytics/event-counts-by-type
**Purpose**: Get event counts grouped by event type

**Query Parameters**:
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string

**Success Response** (200):
```json
{
  "event_counts": [
     { "event_type": "view", "count": 800 },
     { "event_type": "click", "count": 350 },
     { "event_type": "location", "count": 100 }
  ],
  "total_events": 1250
}
```

## Chosen Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Joi**
- **Service Worker**
- **Helmet**
- **Morgan**
- **Moment.js**

## Database Schema Explanation

### Events Collection Schema
```bash
{
  event_id: String (UUID, unique, indexed),
  user_id: String (required, indexed),
  event_type: String (enum: ['view', 'click', 'location'], indexed),
  timestamp: Date (default: now, indexed),
  payload: Mixed (flexible JSON structure)
}
```

**Design Decisions**:
- **UUID for event_id**: Ensures uniqueness across distributed systems
- **Indexed fields**: user_id, event_type, and timestamp for query performance
- **Compound indexes**: (event_type, timestamp) and (user_id, timestamp) for analytics queries
- **Mixed payload type**: Accommodates different event structures (view URLs, click elements, location coordinates)
- **Enum validation**: Restricts event_type to valid values

## Challenges Faced & Solutions

### 1. Service Worker Event Reliability
**Challenge**: Ensuring events are captured even when the main thread is busy
**Solution**: Implemented Service Worker with message passing for background event processing

### 2. Flexible Payload Validation
**Challenge**: Validating different payload structures for each event type
**Solution**: Created dynamic Joi schemas that validate based on event_type

### 3. Location Permission Handling
**Challenge**: Graceful handling of geolocation permission denial
**Solution**: Implemented fallback UI states with clear user feedback

### 4. MongoDB Connection Management
**Challenge**: Handling connection failures and graceful shutdown
**Solution**: Added connection retry logic and SIGINT handlers for clean closure

## Future Improvements

### Performance & Scalability
- **Caching Layer**: Redis for frequently accessed analytics data
- **Database Sharding**: Horizontal partitioning by user_id or date ranges
- **Message Queue**: RabbitMQ or Apache Kafka for async event processing
- **CDN Integration**: CloudFront for static asset delivery

### Features
- **User Authentication**: JWT-based user sessions and personalized analytics
- **Real-time Dashboard**: WebSocket connections for live event streaming
- **Advanced Analytics**: Funnel analysis, cohort analysis, and user journey mapping
- **Data Export**: CSV/JSON export capabilities for external analysis
- **Event Aggregation**: Pre-computed daily/hourly summaries for faster queries

### Technical Enhancements
- **Spatial Indexing**: MongoDB 2dsphere indexes for location-based queries
- **Event Deduplication**: Hash-based duplicate detection for reliable analytics
- **Rate Limiting**: Request throttling to prevent abuse
- **Monitoring**: Application performance monitoring with Prometheus/Grafana
- **Testing**: Comprehensive unit and integration test suite
