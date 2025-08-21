# IoT Data Management System

A NestJS application that processes x-ray data from IoT devices using RabbitMQ, stores processed information in MongoDB, and provides RESTful API endpoints for data retrieval and analysis.

## Features

- **RabbitMQ Integration**: Message queue system for processing x-ray data from IoT devices
- **MongoDB Storage**: Efficient storage of processed signals with Mongoose ODM
- **RESTful API**: Complete CRUD operations for signals management
- **Data Processing**: Automatic extraction and calculation of data parameters
- **Producer Simulation**: Built-in IoT device simulator for testing
- **Swagger Documentation**: Interactive API documentation
- **Unit Testing**: Comprehensive test coverage
- **Error Handling**: Robust error handling throughout the application

## Architecture

### Components

1. **RabbitMQ Module**: Handles message queue connections and x-ray data consumption
2. **Signals Module**: Manages signal data with MongoDB storage and API endpoints
3. **Producer Module**: Simulates IoT devices sending x-ray data
4. **Data Processing**: Processes incoming x-ray data and extracts relevant parameters

### Data Flow

1. IoT devices (or simulator) send x-ray data to RabbitMQ queue
2. Consumer processes messages and extracts device information
3. Processed data is stored in MongoDB signals collection
4. REST API provides access to stored data with filtering and pagination

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- RabbitMQ (v3.8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iot-data-management
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB instance
mongod
```

4. Start RabbitMQ:
```bash
# Using Docker
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management

# Or start your local RabbitMQ instance
rabbitmq-server
```

## Configuration

The application uses the following default configurations:

- **MongoDB**: `mongodb://localhost:27017/iot-data-management`
- **RabbitMQ**: `amqp://localhost:5672`
- **Application Port**: `3000`

You can modify these in the respective service files if needed.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at:
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## API Endpoints

### Signals Management

- `GET /signals` - Get all signals with optional filtering
- `GET /signals/:id` - Get signal by ID
- `GET /signals/device/:deviceId` - Get signals for specific device
- `GET /signals/statistics` - Get signals statistics
- `POST /signals` - Create new signal
- `PATCH /signals/:id` - Update signal
- `DELETE /signals/:id` - Delete signal

### Producer Endpoints (Testing)

- `POST /producer/sample` - Send sample x-ray data
- `POST /producer/custom?deviceId=xxx&dataPoints=5` - Send custom data
- `POST /producer/multi-device?deviceCount=3&dataPointsPerDevice=5` - Send multi-device data
- `POST /producer/start-continuous?intervalMs=5000` - Start continuous data generation

## Data Structure

### X-Ray Data Format (Input)
```json
{
  "66bb584d4ae73e488c30a072": {
    "data": [
      [
        762,
        [51.339764, 12.339223833333334, 1.2038000000000002]
      ]
    ],
    "time": 1735683480000
  }
}
```

### Signal Document (Stored)
```json
{
  "_id": "ObjectId",
  "deviceId": "66bb584d4ae73e488c30a072",
  "timestamp": "2023-12-31T12:58:00.000Z",
  "dataLength": 3,
  "dataVolume": 156,
  "rawData": [[762, [51.339764, 12.339223833333334, 1.2038000000000002]]],
  "createdAt": "2023-12-31T12:58:00.000Z",
  "updatedAt": "2023-12-31T12:58:00.000Z"
}
```

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Usage Examples

### 1. Send Sample Data
```bash
curl -X POST http://localhost:3000/producer/sample
```

### 2. Get All Signals
```bash
curl http://localhost:3000/signals
```

### 3. Filter Signals by Device
```bash
curl "http://localhost:3000/signals?deviceId=66bb584d4ae73e488c30a072"
```

### 4. Get Signals with Date Range
```bash
curl "http://localhost:3000/signals?startDate=2023-01-01&endDate=2023-12-31"
```

### 5. Get Statistics
```bash
curl http://localhost:3000/signals/statistics
```

## Development

### Project Structure
```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── rabbitmq/               # RabbitMQ integration
│   ├── rabbitmq.module.ts
│   ├── rabbitmq.service.ts
│   └── xray.consumer.ts
├── signals/                # Signals management
│   ├── signals.module.ts
│   ├── signals.service.ts
│   ├── signals.controller.ts
│   ├── signal.schema.ts
│   └── dto/
└── producer/               # IoT device simulator
    ├── producer.module.ts
    ├── producer.service.ts
    └── producer.controller.ts
```

### Adding New Features

1. Create new modules using NestJS CLI:
```bash
nest generate module feature-name
nest generate service feature-name
nest generate controller feature-name
```

2. Add tests for new components
3. Update API documentation
4. Update this README

## Error Handling

The application includes comprehensive error handling:

- **Validation**: Input validation using class-validator
- **Database Errors**: Proper handling of MongoDB connection and query errors
- **RabbitMQ Errors**: Connection and message processing error handling
- **HTTP Errors**: Appropriate HTTP status codes and error messages

## Performance Considerations

- **Indexing**: MongoDB indexes on frequently queried fields (deviceId, timestamp)
- **Pagination**: Built-in pagination for large datasets
- **Connection Pooling**: Efficient database connection management
- **Message Acknowledgment**: Proper RabbitMQ message acknowledgment

## Monitoring

- Application logs provide detailed information about:
  - RabbitMQ connections and message processing
  - Database operations
  - API requests and responses
  - Error conditions

## Docker Support (Optional)

Create a `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
  
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - rabbitmq
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the ISC License.