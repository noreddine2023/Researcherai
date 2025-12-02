# ResearchFlow

AI-Powered Research Paper Management Platform

## Overview

ResearchFlow is an intelligent platform that transforms how researchers work with academic papers. Instead of spending weeks manually searching databases, reading papers, and synthesizing findings, ResearchFlow combines AI, automation, and collaboration tools to accelerate the entire research lifecycle.

## Features

- 🔍 **Smart Search** - Search across 200M+ papers using natural language from Semantic Scholar, OpenAlex, and Crossref
- 🧠 **AI Analysis** - Automatic summarization and data extraction powered by OpenAI
- 📁 **Organization** - Smart collections and literature matrices for organizing research
- 💡 **Insights** - Kanban board for managing research insights
- 📝 **Citations** - 50+ citation styles with BibTeX and RIS export
- ✍️ **Writing** - AI-assisted academic writing with citation integration

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **AI**: OpenAI GPT-3.5 for summarization and writing assistance
- **APIs**: Semantic Scholar, OpenAlex, Crossref for paper search

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/noreddine2023/Researcherai.git
cd Researcherai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENALEX_EMAIL` - Your email for OpenAlex API (required for polite pool)

4. Initialize the database:
```bash
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. **Register an account** at `/register`
2. **Log in** at `/login`
3. **Search for papers** from the dashboard
4. **Create collections** to organize your research
5. **Capture insights** from papers you read
6. **Write** with AI assistance

## Project Structure

```
/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── search/          # Paper search
│   │   ├── collections/     # Collections management
│   │   ├── insights/        # Research insights
│   │   ├── write/           # Writing assistant
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── search/         # Paper search
│   │   ├── papers/         # Paper CRUD
│   │   ├── collections/    # Collections CRUD
│   │   ├── insights/       # Insights CRUD
│   │   └── ai/             # AI services
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
│   ├── api/               # External API integrations
│   ├── ai/                # AI utilities
│   ├── citations/         # Citation formatting
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth config
│   └── utils.ts           # Helper functions
├── prisma/
│   └── schema.prisma      # Database schema
├── types/                 # TypeScript types
└── package.json
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User** - User accounts with authentication
- **Paper** - Research papers with metadata
- **Collection** - Hierarchical paper collections
- **CollectionPaper** - Many-to-many relationship
- **Annotation** - Paper annotations and highlights
- **InsightCard** - Research insights with Kanban status
- **Citation** - Generated citations
- **Document** - Writing documents

## API Integrations

### Semantic Scholar
- Free tier: 100 requests/5 minutes
- With API key: 5000 requests/5 minutes
- Search 200M+ papers

### OpenAlex
- Free and open
- Requires email in User-Agent for polite pool
- 250M+ works indexed

### Crossref
- Free and open
- 150M+ metadata records
- No API key required

### OpenAI
- Paid service
- Used for summarization and writing assistance
- Configurable model (default: GPT-3.5-turbo)

## Development

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Lint code:
```bash
npm run lint
```

### Database migrations:
```bash
npx prisma migrate dev
```

### View database:
```bash
npx prisma studio
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_URL | Application URL | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth | Yes |
| OPENAI_API_KEY | OpenAI API key | For AI features |
| SEMANTIC_SCHOLAR_API_KEY | Semantic Scholar API key | Optional |
| OPENALEX_EMAIL | Email for OpenAlex | Recommended |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.