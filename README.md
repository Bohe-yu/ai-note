# AI Note

A mobile-first web app for capturing and managing AI-related knowledge snippets for social media content creation.

## Tech Stack

- Next.js 14 (App Router) + Tailwind CSS
- Supabase (database + auth + file storage)
- Claude API (claude-3-haiku-20240307 for cost efficiency)

## Features

- **Quick Capture**: Text input, image upload (max 3), URL input with auto-fetch title
- **AI Processing**: Auto-generate Chinese tags and summary using Claude haiku
- **Notes List**: Masonry card layout with tag filters and search
- **Note Detail**: Full content display, edit capability, status toggle (draft/ready/published)
- **Expand to Post**: Convert notes to Little Red Book (小红书) style posts
- **Stats**: Total notes count, tag cloud, weekly chart

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Create a storage bucket named `note-images` and make it public
4. Get your project URL and anon key from Settings > API

### 2. Anthropic API Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Ensure you have access to claude-3-haiku-20240307

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deploy on Vercel

1. Push your code to GitHub
2. Import your project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

## Database Schema

The `notes` table includes:
- `id`: UUID primary key
- `title`: Optional title
- `content`: Note content (required)
- `image_urls`: Array of image URLs
- `tags`: Array of Chinese tags (AI-generated)
- `summary`: One-sentence summary (AI-generated, under 30 chars)
- `source_url`: Optional source URL
- `status`: draft/ready/published
- `created_at`, `updated_at`: Timestamps
