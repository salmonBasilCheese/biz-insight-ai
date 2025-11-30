# Deployment Guide - Biz Insight AI

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key (for AI report generation)
- Domain name (optional, for production)

## Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# Database (SQLite is used by default, stored in biz-insight.sqlite)
```

## Local Deployment

### 1. Build and Start

```bash
docker compose up -d
```

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Create Your First Account

1. Go to the login page
2. Click "Sign Up"
3. Enter your email and password
4. Start using the application!

## Production Deployment Options

### Option 1: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add environment variables:
```bash
railway variables set OPENAI_API_KEY=your_key_here
railway variables set JWT_SECRET=your_secret_here
railway variables set NODE_ENV=production
```

4. Deploy:
```bash
railway up
```

### Option 2: Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `docker build -t biz-insight-ai .`
   - **Start Command**: `docker run -p 3000:3000 biz-insight-ai`
4. Add environment variables in the Render dashboard
5. Deploy!

### Option 3: DigitalOcean App Platform

1. Create a new App on [DigitalOcean](https://cloud.digitalocean.com/apps)
2. Connect your repository
3. Configure as a Docker app
4. Add environment variables
5. Deploy!

### Option 4: VPS (Ubuntu/Debian)

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone your repository
4. Create `.env` file with your configuration
5. Run:
```bash
docker compose -f docker-compose.prod.yml up -d
```

## Database Backup

The SQLite database is stored in `biz-insight.sqlite`. To backup:

```bash
# Copy the database file
docker compose exec app cp /app/biz-insight.sqlite /app/backup/biz-insight-backup-$(date +%Y%m%d).sqlite

# Or use docker cp
docker cp biz-insight-ai-app-1:/app/biz-insight.sqlite ./backup/
```

## Monitoring

Check application logs:
```bash
docker compose logs -f
```

Check application health:
```bash
curl http://localhost:3000/api/health
```

## Scaling Considerations

For production use, consider:

1. **Database**: Migrate from SQLite to PostgreSQL for better concurrency
2. **File Storage**: Use cloud storage (S3, etc.) for uploaded files
3. **Caching**: Add Redis for session management
4. **Load Balancing**: Use nginx or cloud load balancers
5. **SSL/TLS**: Use Let's Encrypt or cloud provider SSL

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or docker-compose.yml
PORT=3001
```

### Database Locked
```bash
# Restart the container
docker compose restart
```

### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has credits
- Review rate limits

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor API usage and costs

## Support

For issues or questions, please open an issue on GitHub.
