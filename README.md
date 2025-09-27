#Food Ordering Application - Three-Tier Architecture Setup

This application runs on a three-tier architecture:
- **Frontend (Angular)**: Port 4200
- **Backend (Node.js/Express)**: Port 3000  
- **Database (MongoDB)**: Port 27017

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Angular CLI** (v17 or higher)

## Quick Setup

### 1. Install MongoDB
choco install mongodb

### 2. Install Dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

### 3. Start Services

#### Option A: Manual Start (Recommended for Development)

**Terminal 1 - Start MongoDB:**
mongod --dbpath="C:\data\db"

**Terminal 2 - Start Backend:**
cd backend-api
npm run dev
# Backend will run on http://localhost:3000

**Terminal 3 - Start Frontend:**
cd frontend
npm run start:dev
# Frontend will run on http://localhost:4200

#### Option B: Using Startup Scripts

Run the batch file:
start-all.bat
start-mongo.bat
start-backend.bat
start-frontend.bat


## Port Configuration

| Service  | Port | URL                    |
|----------|------|------------------------|
| Frontend | 4200 | http://localhost:4200  |
| Backend  | 3000 | http://localhost:3000  |
| MongoDB  | 27017| mongodb://localhost:27017 |

## Environment Variables

Backend uses these environment variables (in `.env` file):

MONGODB_URI=mongodb://localhost:27017/food_order
PORT=3000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development

## Database Setup

The application will automatically:
1. Connect to MongoDB on startup
2. Create the `food_order` database
3. Create collections as needed (users, orders, items, cartitems)

## API Endpoints

- Users: `http://localhost:3000/api/users`
- Foods: `http://localhost:3000/api/foods`  
- Orders: `http://localhost:3000/api/orders`
- Cart: `http://localhost:3000/api/cart`

## Health Checks

- Backend: `http://localhost:3000/health`
- Frontend: `http://localhost:4200` (should load the app)
- MongoDB: Check connection in backend console logs

## Troubleshooting

### MongoDB Issues:
tasklist /fi "imagename eq mongod.exe"

# Create data directory if missing
mkdir C:\data\db

# Start MongoDB manually
mongod --dbpath="C:\data\db"


### Backend Issues:
netstat -an | findstr :3000

# Install missing dependencies
cd backend-api && npm install

### Frontend Issues:
ng cache clean
cd frontend && npm ci


## Development Workflow

1. Start MongoDB first
2. Start backend in development mode (`npm run dev`)  
3. Start frontend in development mode (`npm run start:dev`)
4. Access the application at `http://localhost:4200`

The backend will auto-restart on file changes (nodemon)
The frontend will auto-reload on file changes (Angular CLI)