## Description

This application is designed to manage reservations asynchronously, leveraging the power of MongoDB and BullMQ for efficient task handling. It allows users to listen to task status changes in real-time via WebSocket using Socket.IO, ensuring a seamless and interactive experience.

## Prerequisities

Latest Node.js, Docker, npm installed globally

## Project setup

```bash
$ npm install
$ docker-compose up -d
```

Copy content from .env.example to .env file

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test
```

## Usage

# Authorization

Add api key under x-api-key header

# Upload task file

Uploading task file can be done via POST /tasks/upload
Application expects form-data with xlsx under "file" key
Response: task id

# Check status

1. Http

- Endpoint: `GET /tasks/status/:taskId`
- Description: Check the status of a task using its task ID.
- Response: Status and possible error report

1. Websocket

- Port: `8080`
- Description: Using Socket.io.
- Steps: Connect, then listen to event with taskId
- Response message: Status and possible error report

## License

[MIT licensed]
