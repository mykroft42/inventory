# Quick Start Guide

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- npm or yarn

## Backend Setup

1. Navigate to `backend/` directory
2. Run `dotnet restore`
3. Run `dotnet ef database update` (creates SQLite database)
4. Run `dotnet run` (starts API on https://localhost:5001)

## Frontend Setup

1. Navigate to `frontend/` directory
2. Run `npm install`
3. Run `npm start` (starts React app on http://localhost:3000)

## Testing

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd frontend
npm test
```

## Development Workflow

1. Backend API runs on HTTPS with self-signed certificate
2. Frontend proxies API calls to backend
3. Database file `inventory.db` is created in backend directory
4. Hot reload enabled for both frontend and backend development