# Surbee Lyra - Survey Builder

A modern survey and questionnaire builder with AI-powered chat assistance.

## Features

- **AI-Powered Chat**: Intelligent chat assistant to help build surveys
- **Survey Builder**: Drag-and-drop survey creation interface
- **Real-time Collaboration**: Live chat and project management
- **Modern UI**: Clean, dark-themed interface with smooth animations
- **Database Integration**: Supabase backend with real-time data sync

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd surbee-lyra
pnpm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Copy your project URL and anon key

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create the database schema

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
surbee-lyra/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   └── project/[id]/page.tsx # Project page with chat and builder
│   ├── components/ui/             # Reusable UI components
│   └── lib/                      # Database and utility functions
├── supabase-schema.sql           # Database schema
└── README.md
```

## Database Schema

### Tables

1. **projects**: Store survey projects
2. **chat_messages**: Store chat history for each project
3. **survey_questions**: Store survey questions and configurations

### Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Real-time subscriptions**: Live updates for collaborative features
- **Automatic timestamps**: Created/updated timestamps for all records

## Usage

### Creating a New Project

1. Visit the main dashboard
2. Type your first message in the chat
3. You'll be automatically redirected to a new project page
4. The project ID is unique and generated automatically

### Project Page Features

- **Left Sidebar**: Chat interface with AI assistant
- **Right Panel**: Survey builder interface
- **Collapsible Chat**: Toggle chat sidebar width
- **Real-time Updates**: All changes sync across tabs

### Chat Features

- **Thinking Animation**: Visual feedback during AI processing
- **Streaming Text**: Smooth text generation animation
- **Action Buttons**: Hover to reveal survey actions
- **Input Disabled**: Prevents multiple messages during AI response

## Development

### Adding New Components

1. Create components in `src/components/ui/`
2. Follow the existing naming conventions
3. Use TypeScript for type safety

### Database Operations

Use the utility functions in `src/lib/database.ts`:

```typescript
import { createProject, saveChatMessage, getSurveyQuestions } from '@/lib/database'

// Create a new project
const project = await createProject(userId, 'My Survey', 'Description')

// Save a chat message
await saveChatMessage(projectId, userId, 'Hello', true)

// Get survey questions
const questions = await getSurveyQuestions(projectId)
```

### Authentication

The app uses Supabase Auth with anonymous authentication:

```typescript
import { signInAnonymously, getCurrentUser } from '@/lib/auth'

// Sign in anonymously
const user = await signInAnonymously()

// Get current user
const currentUser = await getCurrentUser()
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
