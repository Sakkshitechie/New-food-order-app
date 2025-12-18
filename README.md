# Food Ordering Application - Three-Tier Architecture Setup

This application is a full-stack food ordering system built using a three-tier architecture:
- **Frontend (Angular)**: Port 4200
- **Backend (Node.js/Express)**: Port 3000  
- **Database (MongoDB)**: Port 27017

Additionally, the application integrates with **AWS services** for deployment and logging.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Angular CLI** (v17 or higher)
4. **AWS CLI** (configured with appropriate credentials)

## Quick Setup

### 1. Install MongoDB
```bash
choco install mongodb
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 3. Start Services

#### Option A: Manual Start (Recommended for Development)

**Terminal 1 - Start MongoDB:**
```bash
mongod --dbpath="C:\data\db"
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm start
# Backend will run on http://localhost:3000
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend
npm start
# Frontend will run on http://localhost:4200
```

#### Option B: Using Startup Scripts

Run the batch file:
```bash
start-all.bat
start-mongo.bat
start-backend.bat
start-frontend.bat
```

### 4. AWS Deployment

#### Backend Deployment
1. Package the backend code:
   ```bash
   zip -r backend.zip .
   ```
2. Upload the package to an S3 bucket or deploy directly to an EC2 instance.
3. Configure the EC2 instance with the required environment variables.

#### Frontend Deployment
1. Build the Angular application:
   ```bash
   ng build --prod
   ```
2. Upload the contents of the `dist/` folder to an S3 bucket configured for static website hosting.

#### Logging with AWS CloudWatch
1. Ensure the `cloudwatch-logs.json` file is configured with the correct log group and stream names.
2. Use the AWS CLI or SDK to push logs to CloudWatch:
   ```bash
   aws logs put-log-events --log-group-name <log-group> --log-stream-name <log-stream> --log-events file://cloudwatch-logs.json
   ```

## Port Configuration

| Service  | Port | URL                          |
|----------|------|------------------------------|
| Frontend | 4200 | http://localhost:4200        |
| Backend  | 3000 | http://localhost:3000        |
| MongoDB  | 27017| mongodb://localhost:27017    |

## Environment Variables

Backend uses these environment variables (in `.env` file):

```plaintext
MONGODB_URI=mongodb://localhost:27017/foodorderingapp
PORT=3000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
AWS_REGION=us-east-1
AWS_LOG_GROUP=food-ordering-app-logs
AWS_LOG_STREAM=backend-logs
```

## Database Setup

The application will automatically:
1. Connect to MongoDB on startup
2. Create the `foodorderingapp` database
3. Create collections as needed (users, orders, items, cartitems)

## API Endpoints

- **Users**: `http://localhost:3000/api/users`
- **Foods**: `http://localhost:3000/api/foods`  
- **Orders**: `http://localhost:3000/api/orders`
- **Cart**: `http://localhost:3000/api/cartitems`

## Health Checks

- **Backend**: `http://localhost:3000/health`
- **Frontend**: `http://localhost:4200` (should load the app)
- **MongoDB**: Check connection in backend console logs

## Troubleshooting

### MongoDB Issues:
```bash
tasklist /fi "imagename eq mongod.exe"
```

Create data directory if missing:
```bash
mkdir C:\data\db
```

Start MongoDB manually:
```bash
mongod --dbpath="C:\data\db"
```


### Backend Issues:
```bash
netstat -an | findstr :3000
```

Install missing dependencies:
```bash
cd backend && npm install
```

### Frontend Issues:
```bash
ng cache clean
cd frontend && npm ci
```

### AWS Logging Issues:
- Verify the `cloudwatch-logs.json` file is correctly formatted.
- Check AWS IAM permissions for CloudWatch logging.

## Development Workflow

1. Start MongoDB first.
2. Start backend in development mode (`npm start`).
3. Start frontend in development mode (`npm start`).
4. Access the application at `http://localhost:4200`.

The backend will auto-restart on file changes (using `nodemon`).
The frontend will auto-reload on file changes (using Angular CLI).

## Additional Notes

- Ensure `cloudwatch-logs.json` is excluded from version control (already handled in `.gitignore`).
- Follow the `.gitignore` rules to avoid committing unnecessary files.
- Use AWS CloudWatch for centralized logging and monitoring.