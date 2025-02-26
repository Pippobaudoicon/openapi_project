# Docker Setup Instructions

1. Build and start the containers:
```bash
docker compose up --build
```

2. To run in detached mode (background):
```bash
docker compose up -d
```

3. To view logs:
```bash
docker compose logs -f
```

4. To stop the containers:
```bash
docker compose down
```

5. To remove volumes when stopping:
```bash
docker compose down -v
```

## Access Services

- MongoDB: localhost:27017
- Elasticsearch: localhost:9200
- API Server: localhost:3000
- Client App: localhost:5173

## Troubleshooting

If you need to rebuild a specific service:
```bash
docker compose up --build nodejs
```

To check container status:
```bash
docker compose ps
```
