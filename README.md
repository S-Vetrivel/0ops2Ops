# 0ops2Ops 🚀

**0ops2Ops** (Oops2Ops) is a developer-friendly DevSecOps pipeline designed to transform everyday "oops" moments into secure, production-ready deployments. Built for self-hosted infrastructure, it integrates security checks throughout the CI/CD lifecycle without compromising developer velocity.

## ✨ Key Features

- 🔐 **Secure Authentication**: Multi-provider support including Google, GitHub, and traditional Email/Password.
- 👤 **Profile Management**: Complete user profile handling with personal info updates and secure image uploads.
- 📂 **Repository Integration**: Seamlessly list and manage your repositories.
- 🚀 **Automated Deployment**: Streamlined trigger for deploying your code directly to production.
- 🛡️ **Built-in Security**: Automated security checks from code commit to final deployment.

## 🛠️ Tech Stack

- **Backend**: [Go](https://go.dev/) with [Gin Web Framework](https://gin-gonic.com/)
- **Frontend**: [React](https://reactjs.org/) powered by [Vite](https://vitejs.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## 🚦 Getting Started

### Prerequisites

- **Go**: >= 1.20
- **Node.js**: >= 18
- **Docker**: For containerized deployment
- **MongoDB**: Required for local backend execution (if not using Docker)

### Local Development

#### 1. Backend Setup
```bash
cd backend
# Create and configure your .env file
go run main.go
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
# Create and configure your .env file
npm run dev
```

### 🐳 Running with Docker

The easiest way to get 0ops2Ops up and running is using Docker Compose:

```bash
docker-compose up --build
```

This will spin up the backend, frontend, and MongoDB services automatically.

## ⚙️ Configuration

The project uses environment variables for configuration. Create `.env` files in both `backend/` and `frontend/` directories.

### Backend (`backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `MONGO_DB` | MongoDB connection URI | - |
| `JWT_SECRET` | Secret key for JWT signatures | - |
| `CLIENT_URL` | Frontend application URL | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | - |
| `GITHUB_CLIENT_SECRET`| GitHub OAuth Client Secret | - |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:3000`) |
| `VITE_GOOGLE_CLIENT_ID`| Google OAuth Client ID |

---
*Built with ❤️ for secure, fast development.*
