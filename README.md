# DevOps API Gateway

A production-style DevOps project demonstrating:

- Scalable API Gateway
- Redis Caching
- Circuit Breaker Pattern
- Kill Switch Mechanism
- Prometheus Metrics
- Grafana Dashboards
- NGINX Load Balancing
- Dockerized Microservices
- CI/CD with Jenkins

---

## Project Overview

This project simulates a production-ready DevOps environment built around a resilient API Gateway.

The system:

- Fetches cryptocurrency prices from the CoinGecko public API
- Caches responses in Redis
- Implements a Circuit Breaker for external API protection
- Provides an Admin Kill Switch
- Exposes Prometheus metrics
- Visualizes metrics in Grafana
- Supports horizontal scaling via NGINX
- Is fully containerized using Docker Compose
- Includes CI/CD automation using Jenkins

This project demonstrates real-world DevOps practices including scalability, resilience, observability, and automation.

---

## Architecture

```
                ┌────────────┐
                │   Client   │
                └──────┬─────┘
                       │
                ┌──────▼──────┐
                │   NGINX     │
                │ LoadBalancer│
                └──────┬──────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       API-1        API-2        API-N
          │
          ▼
       Redis (Cache)
          │
          ▼
   External API (CoinGecko)

Metrics → Prometheus → Grafana
CI/CD → Jenkins
```

---

## ⚙️ Tech Stack

| Category | Technology |
|---|---|
| Backend | Node.js (TypeScript), Express |
| Caching | Redis |
| Resilience | Opossum (Circuit Breaker) |
| Observability | Prometheus, Grafana |
| Load Balancing | NGINX |
| Containerization | Docker, Docker Compose |
| CI/CD | Jenkins |

---

##  Features

### Redis Caching

- Caches cryptocurrency prices
- Default TTL: **30 seconds**
- Reduces external API calls
- Improves response latency
- Metrics tracked: cache hits & cache misses

---

### Circuit Breaker Pattern

Implemented using **opossum**.

**Purpose:** Prevent cascading failures and protect the system from external API instability.

**Behavior:**
- Opens after repeated failures
- Returns fallback response
- Automatically attempts recovery

---

### Kill Switch (Admin Control)


When enabled:
- All business endpoints return `503`
- Health endpoints remain available
- Metrics remain available

Simulates emergency production shutdown capability.

---



### Prometheus Metrics

**Tracked Metrics:**
- `http_requests_total`
- `http_request_duration_seconds`
- `cache_hits_total`
- `cache_misses_total`

Prometheus scrapes metrics automatically.

---

### Grafana Dashboard

Visualizes:
- Request rate
- Latency
- Cache performance
- System health

Access: [http://localhost:3001](http://localhost:3001)

---

### NGINX Load Balancing

Distributes traffic across multiple API instances.
Demonstrates stateless design, horizontal scalability, and production-style architecture.

---

### Dockerized Services

Services included: API, Redis, NGINX, Prometheus, Grafana, Jenkins.

---

### CI/CD Pipeline (Jenkins)

Pipeline stages:

1. Checkout code from GitHub
2. Install dependencies
3. Build TypeScript
4. Build Docker image
5. Stop old container
6. Deploy new container
7. Run health check
8. Mark success or failure

Ensures automated deployment on every code push.

---