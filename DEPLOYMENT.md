# PixelForge API - Deployment Guide

This guide covers deploying PixelForge API with your Docker PostgreSQL database to various cloud platforms.

## Table of Contents

1. [Local Docker Deployment](#local-docker-deployment)
2. [Railway.app Deployment](#railwayapp-deployment)
3. [Render.com Deployment](#rendercom-deployment)
4. [Fly.io Deployment](#flyio-deployment)
5. [VPS Deployment (DigitalOcean, AWS, etc.)](#vps-deployment)

---

## Local Docker Deployment

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to run both the API and PostgreSQL together.

```bash
# 1. Set your environment variables
cp .env.example .env
# Edit .env and set JWT_SECRET and DB_PASSWORD

# 2. Start everything
docker-compose up -d

# 3. Check logs
docker-compose logs -f api

# 4. Stop everything
docker-compose down
```

### Option 2: Separate Containers

If you already have PostgreSQL running in Docker:

```bash
# 1. Build the API image
docker build -t pixelforge-api .

# 2. Run the API container
docker run -d \
  --name pixelforge-api \
  -p 5000:5000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=pixelforge \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret_key \
  -v $(pwd)/uploads:/app/uploads \
  pixelforge-api
```

**Note:** On Windows, use `host.docker.internal` to connect to PostgreSQL running on your host machine.

---

## Railway.app Deployment

Railway is great for Node.js apps and provides PostgreSQL out of the box.

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your PixelForge repository

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create the database

4. **Configure Environment Variables**
   
   Railway auto-injects database variables, but you need to add:
   
   ```
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   PORT=5000
   ```

5. **Connect Database to API**
   
   Railway provides these variables automatically:
   - `DATABASE_URL` (full connection string)
   - Or individual: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

   Update your `src/db/database.js` to support `DATABASE_URL`:

   ```javascript
   const pool = new Pool(
     process.env.DATABASE_URL
       ? {
           connectionString: process.env.DATABASE_URL,
           ssl: { rejectUnauthorized: false }
         }
       : {
           host: process.env.DB_HOST || 'localhost',
           port: process.env.DB_PORT || 5432,
           database: process.env.DB_NAME || 'pixelforge',
           user: process.env.DB_USER || 'postgres',
           password: process.env.DB_PASSWORD || 'password',
         }
   );
   ```

6. **Deploy**
   - Railway automatically deploys on git push
   - Your API will be available at `https://your-app.up.railway.app`

### Cost:
- Free tier: $5 credit/month
- Paid: Pay as you go

---

## Render.com Deployment

Render provides free PostgreSQL and web services.

### Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Choose free tier
   - Note the connection details

3. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** pixelforge-api
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Set Environment Variables**
   
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key
   DB_HOST=<from-render-postgres>
   DB_PORT=5432
   DB_NAME=<from-render-postgres>
   DB_USER=<from-render-postgres>
   DB_PASSWORD=<from-render-postgres>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Cost:
- Free tier available (with limitations)
- Services spin down after inactivity

---

## Fly.io Deployment

Fly.io is great for Docker-based deployments and offers PostgreSQL.

### Steps:

1. **Install Fly CLI**
   
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   
   ```bash
   fly auth login
   ```

3. **Launch App**
   
   ```bash
   cd PixelForge
   fly launch
   ```
   
   - Choose app name
   - Choose region
   - Don't deploy yet

4. **Create PostgreSQL Database**
   
   ```bash
   fly postgres create
   ```
   
   - Choose name: `pixelforge-db`
   - Choose region (same as app)
   - Choose configuration

5. **Attach Database to App**
   
   ```bash
   fly postgres attach pixelforge-db
   ```

6. **Set Secrets**
   
   ```bash
   fly secrets set JWT_SECRET=your-super-secret-key
   ```

7. **Deploy**
   
   ```bash
   fly deploy
   ```

8. **Open App**
   
   ```bash
   fly open
   ```

### Cost:
- Free tier: 3 shared VMs
- PostgreSQL: ~$2/month minimum

---

## VPS Deployment

Deploy to any VPS (DigitalOcean, AWS EC2, Linode, etc.)

### Prerequisites:
- Ubuntu 20.04+ server
- SSH access
- Domain name (optional)

### Steps:

1. **SSH into Server**
   
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker & Docker Compose**
   
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository**
   
   ```bash
   git clone https://github.com/yourusername/PixelForge.git
   cd PixelForge
   ```

4. **Configure Environment**
   
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Set your production values:
   ```
   DB_PASSWORD=strong_password_here
   JWT_SECRET=long_random_string_here
   NODE_ENV=production
   ```

5. **Start with Docker Compose**
   
   ```bash
   docker-compose up -d
   ```

6. **Set Up Nginx Reverse Proxy** (Optional but recommended)
   
   ```bash
   sudo apt install nginx -y
   ```
   
   Create Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/pixelforge
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pixelforge /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set Up SSL with Let's Encrypt** (Optional)
   
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

8. **Set Up Auto-Restart**
   
   ```bash
   # Add to crontab
   crontab -e
   ```
   
   Add line:
   ```
   @reboot cd /home/user/PixelForge && docker-compose up -d
   ```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | 5000 |
| `NODE_ENV` | Yes | Environment | production |
| `DB_HOST` | Yes | PostgreSQL host | localhost |
| `DB_PORT` | No | PostgreSQL port | 5432 |
| `DB_NAME` | Yes | Database name | pixelforge |
| `DB_USER` | Yes | Database user | postgres |
| `DB_PASSWORD` | Yes | Database password | - |
| `JWT_SECRET` | Yes | JWT signing secret | - |
| `UPLOAD_DIR` | No | Upload directory | ./uploads |
| `MAX_FILE_SIZE` | No | Max file size (bytes) | 10485760 |

---

## Connecting to Your Docker PostgreSQL

If you're deploying to a cloud platform but want to keep using your local Docker PostgreSQL:

### Option 1: Expose PostgreSQL Publicly (Not Recommended for Production)

```bash
# Run PostgreSQL with public port
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pixelforge \
  -p 0.0.0.0:5432:5432 \
  postgres:14
```

Then configure your cloud app to connect to `your-public-ip:5432`

⚠️ **Security Warning:** This exposes your database to the internet. Use strong passwords and firewall rules.

### Option 2: Use Cloud PostgreSQL (Recommended)

Most platforms provide managed PostgreSQL:
- **Railway:** Built-in PostgreSQL
- **Render:** Free PostgreSQL tier
- **Fly.io:** Fly Postgres
- **AWS:** RDS
- **DigitalOcean:** Managed Databases

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs pixelforge-db

# Test connection
docker exec -it pixelforge-db psql -U postgres -d pixelforge
```

### API Not Starting

```bash
# Check API logs
docker logs pixelforge-api

# Restart API
docker restart pixelforge-api
```

### Port Already in Use

```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Kill process or change PORT in .env
```

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set strong `DB_PASSWORD`
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your frontend domain
- [ ] Set up SSL/HTTPS
- [ ] Configure backups for PostgreSQL
- [ ] Set up monitoring (e.g., UptimeRobot)
- [ ] Configure log aggregation
- [ ] Test all endpoints
- [ ] Set up CI/CD (optional)

---

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues](https://github.com/yourusername/PixelForge/issues)
- Documentation: [README.md](./README.md)
