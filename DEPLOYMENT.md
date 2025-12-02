# ResearchFlow Deployment Guide

This guide will help you deploy ResearchFlow to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- OpenAI API key (for AI features)
- Git installed

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/noreddine2023/Researcherai.git
cd Researcherai
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database - Use your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/researchflow?schema=public"

# NextAuth - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# OpenAI - Required for AI features
OPENAI_API_KEY="sk-your-openai-api-key"

# Optional - For better API rate limits
SEMANTIC_SCHOLAR_API_KEY=""
OPENALEX_EMAIL="your-email@example.com"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Optional: View database
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel is optimized for Next.js applications.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - DATABASE_URL
   - NEXTAUTH_URL (your production URL)
   - NEXTAUTH_SECRET
   - OPENAI_API_KEY
   - SEMANTIC_SCHOLAR_API_KEY (optional)
   - OPENALEX_EMAIL (optional)

5. **Set up PostgreSQL Database**:
   - Use Vercel Postgres
   - Or external provider like Supabase, Railway, Neon

### Option 2: Deploy to Railway

Railway provides easy deployment with automatic PostgreSQL setup.

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Initialize**:
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set NEXTAUTH_SECRET=<your-secret>
   railway variables set OPENAI_API_KEY=<your-key>
   railway variables set NEXTAUTH_URL=<your-railway-url>
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   RUN npx prisma generate
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/researchflow
         - NEXTAUTH_URL=http://localhost:3000
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
       depends_on:
         - db
     
     db:
       image: postgres:15-alpine
       environment:
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=researchflow
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Option 4: Traditional VPS (DigitalOcean, AWS, etc.)

1. **Install Node.js 18+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PostgreSQL**:
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

3. **Clone and Setup**:
   ```bash
   git clone https://github.com/noreddine2023/Researcherai.git
   cd Researcherai
   npm ci
   cp .env.example .env
   # Edit .env with your values
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

4. **Use PM2 for Process Management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "researchflow" -- start
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx as Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Database Hosting Options

### Vercel Postgres
- Integrated with Vercel
- Easy setup
- Pay-as-you-go pricing

### Supabase
- Free tier available
- Built on PostgreSQL
- Includes database GUI
- Connection string: `postgresql://user:pass@db.xxx.supabase.co:5432/postgres`

### Railway
- Free tier available
- Automatic backups
- Easy setup

### Neon
- Serverless PostgreSQL
- Free tier available
- Automatic scaling

### AWS RDS
- Production-grade
- More configuration required
- Higher cost

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_URL | Yes | Your application URL |
| NEXTAUTH_SECRET | Yes | Random secret for NextAuth (min 32 chars) |
| OPENAI_API_KEY | For AI | OpenAI API key for summarization |
| SEMANTIC_SCHOLAR_API_KEY | No | Increases rate limits for Semantic Scholar |
| OPENALEX_EMAIL | Recommended | Required for OpenAlex polite pool |
| NODE_ENV | No | Set to "production" |

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test user login
- [ ] Test paper search
- [ ] Test saving papers
- [ ] Verify AI summarization works
- [ ] Test citation generation
- [ ] Check all API endpoints
- [ ] Monitor error logs
- [ ] Set up database backups
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring (optional)

## Monitoring & Logging

### Vercel
- Built-in analytics and logs
- Access via Vercel Dashboard

### Railway
- Built-in logs
- Access via Railway Dashboard

### Self-Hosted
- Use PM2 logs: `pm2 logs researchflow`
- Set up log rotation
- Consider using services like:
  - Sentry (error tracking)
  - LogRocket (user session replay)
  - Datadog (infrastructure monitoring)

## Scaling Considerations

1. **Database Connection Pooling**:
   - Use Prisma's connection pooling
   - Consider PgBouncer for large deployments

2. **Caching**:
   - Add Redis for session storage
   - Cache API responses

3. **CDN**:
   - Use Vercel's CDN automatically
   - Or configure CloudFlare

4. **Rate Limiting**:
   - Implement rate limiting for API routes
   - Protect against abuse

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check environment variables

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure SSL settings match database requirement
- Test connection: `npx prisma db pull`

### Authentication Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### AI Features Not Working
- Verify OPENAI_API_KEY is set
- Check API key has credits
- Review OpenAI rate limits

## Backup & Restore

### Database Backup
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Use your database provider's backup feature
- Or set up a cron job for regular backups

## Security Best Practices

1. Use strong NEXTAUTH_SECRET (32+ characters)
2. Keep dependencies updated: `npm audit fix`
3. Enable HTTPS in production
4. Use environment variables for secrets
5. Implement rate limiting
6. Regular security audits
7. Monitor for vulnerabilities

## Support

For issues or questions:
- GitHub Issues: https://github.com/noreddine2023/Researcherai/issues
- Check logs for error messages
- Review documentation

## License

MIT License - See LICENSE file for details
