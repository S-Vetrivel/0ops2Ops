# 0ops2Ops 🚀

**0ops2Ops** (Oops2Ops) is a developer-friendly DevSecOps pipeline designed to transform everyday "oops" moments into secure, production-ready deployments. Built for self-hosted infrastructure, it provides automated security checks throughout the CI/CD lifecycle while preserving developer velocity.

## ✨ Key Features

- 🔐 Secure Authentication: Multi-provider support (Google, GitHub, Email/Password)
- 👤 Profile Management: User profiles with secure image uploads
- 📂 Repository Integration: List and manage repositories
- 🚀 Automated Deployment: Trigger deployments to environments
- 🛡️ Built-in Security: SAST/DAST, dependency & container scanning, IaC validation

## 🛠️ Tech Stack

- Backend: Go (Gin)
- Frontend: React + Vite
- Database: MongoDB
- Containerization: Docker & Docker Compose

## 🚦 Getting Started

### Prerequisites

- Go >= 1.20
- Node.js >= 18
- Docker (optional but recommended)
- MongoDB (if not using Docker)

### Local Development

1) Backend

```bash
cd backend
# create and configure backend/.env
go run main.go
```

2) Frontend

```bash
cd frontend
npm install
# create and configure frontend/.env
npm run dev
```

### 🐳 Running with Docker

```bash
docker-compose up --build
```

This will start backend, frontend, and MongoDB services.

## ⚙️ Configuration

Create `.env` files in `backend/` and `frontend/`.

Backend (`backend/.env`) variables:

- PORT - backend port (default: 3000)
- MONGO_DB - MongoDB URI
- JWT_SECRET - JWT secret
- CLIENT_URL - frontend URL (e.g., http://localhost:5173)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET

Frontend (`frontend/.env`):

- VITE_API_URL - backend API URL
- VITE_GOOGLE_CLIENT_ID - Google OAuth client id

## Project Structure

```
backend/
├── cmd/
├── internal/
└── configs/

frontend/
├── src/
└── public/

k8s/
docker-compose.yml
```

## Contributing

Contributions welcome — please open issues or pull requests. Include tests and update docs when relevant.

## License

MIT

---

*Built with ❤️ for secure, fast development.*
