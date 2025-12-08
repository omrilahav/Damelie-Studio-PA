# Damelie Studio PA

A personal assistant web application for construction project management in Mallorca. Built for [Damelie Studio](https://www.dameliestudio.com/).

![Damelie PA Dashboard](./docs/dashboard-preview.png)

## Features

### 🏠 Project & Client Hub
- Complete project lifecycle management (Lead → Active → Closed)
- Client profiles with contact information
- Google Drive folder integration
- Project status tracking and portfolio overview

### 📋 Task Management
- Priority-based task organization
- Smart priority logic: Payments → BoQs → Reports → Opportunities
- Status workflows: Open, Pending, Awaiting Client, In Progress, Complete
- Overdue task detection and alerts

### 🤖 AI-Powered Features
- **Daily Briefings**: Personalized morning summaries of urgent tasks, meetings, and deadlines
- **Meeting Summaries**: Paste raw notes and let AI extract decisions and action items
- **Reminder Drafting**: Auto-generated follow-up messages for pending tasks
- **BoQ Helper**: Price history lookup from previous projects (3-year window)

### 💰 Financial Visibility
- Budget vs. invoiced tracking per project
- Margin indicators with risk alerts
- Outstanding payment monitoring
- Portfolio-wide financial overview

### ⏰ Reminders & Follow-ups
- Automatic detection of overdue items
- AI-drafted reminder messages
- Approval workflow before sending
- Copy-to-clipboard for manual sending

### 📊 Advisor Alerts
- Workload overload warnings
- Margin risk detection
- Stalled project notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM
- **AI**: Anthropic Claude (via Vercel AI SDK)
- **UI**: Tailwind CSS + Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/damelie-studio-pa.git
cd damelie-studio-pa/damelie-pa
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your_api_key_here"
```

4. Initialize the database:
```bash
npm run db:push
npm run db:seed  # Optional: adds sample data
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset and reseed database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/       # Dashboard pages
│   │   ├── page.tsx       # Home/Daily briefing
│   │   ├── projects/      # Project management
│   │   ├── clients/       # Client management
│   │   ├── tasks/         # Task management
│   │   ├── meetings/      # Meeting notes
│   │   ├── reminders/     # Reminder queue
│   │   ├── finance/       # Financial overview
│   │   ├── boq/           # BoQ helper
│   │   └── settings/      # App settings
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── dashboard/         # Dashboard widgets
│   ├── projects/          # Project components
│   └── ...
├── lib/
│   ├── db.ts              # Prisma client
│   ├── utils.ts           # Utility functions
│   └── ai/                # AI client & prompts
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Seed data
```

## Design Principles

1. **Approval Required**: The system never sends emails or messages automatically. All communications require explicit user approval.

2. **Missing > Incorrect**: The system prefers showing "unknown" or "needs clarification" over making up information.

3. **Source Attribution**: All AI suggestions and price lookups show their source clearly.

4. **Gradual Onboarding**: No full history reconstruction required. Start with active projects only.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private - Damelie Studio © 2024

---

Built with ❤️ for construction project management in Mallorca
