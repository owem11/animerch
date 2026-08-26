# Project Roadmap: Lead Response System (Animerch Extension)

This document serves as the "Source of Truth" for the AI-assisted intelligent monitoring and response system for `animerch.help@gmail.com`.

## 1. Project Objective
Build an autonomous system that monitors the support inbox, processes incoming queries using Gemini AI, responds intelligently based on database context, and summarizes interactions for efficient storage in Supabase.

## 2. Technical Stack
- **Runtime**: Node.js (TypeScript) — Located in `apps/lead-responder`.
- **LLM**: Google Gemini 2.0 Flash.
- **Database**: Supabase (PostgreSQL) — Shared with existing `apps/web`.
- **Google Integration**: 
  - Gmail API for reading/sending.
  - Google Cloud Pub/Sub for realtime Webhooks.
  - OAuth 2.0 for secure access.
- **Deployment**: VPS (Linux) with a self-hosted GitHub Runner for CI/CD.

## 3. Database Architecture (Proposed)
We will add the following tables to the existing Supabase instance:

### `leads`
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `full_name`: String
- `last_interaction`: Timestamp

### `support_emails`
- `id`: UUID (Primary Key)
- `message_id`: String (Gmail ID)
- `thread_id`: String (Gmail Thread ID)
- `direction`: Enum ('incoming', 'outgoing')
- `sender`: String
- `recipient`: String
- `subject`: String
- `summarized_body`: Text (AI generated summary to save space)
- `status`: Enum ('automated', 'drafted', 'pending_approval', 'error')
- `guardrail_triggered`: Boolean
- `timestamp`: Timestamp

## 4. Guardrail Keywords
The AI will be instructed to **Draft only** and notify admin if the email contains:
- **Legal/Serious**: `lawsuit`, `legal`, `lawyer`, `police`, `court`, `sue`, `threat`.
- **Financial/Critical**: `refund`, `chargeback`, `fraud`, `scam`, `bank`, `payment failure`.
- **Sensitive Account**: `hack`, `password`, `breach`, `login issue`.
- **High Emotion**: `angry`, `horrible`, `worst service`, `scammer`.

## 5. SQL Migration (Supabase)
```sql
-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_emails table
CREATE TABLE IF NOT EXISTS support_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id TEXT UNIQUE NOT NULL,
    thread_id TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('incoming', 'outgoing')) NOT NULL,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    summarized_body TEXT,
    status TEXT CHECK (status IN ('automated', 'drafted', 'pending_approval', 'error')) DEFAULT 'automated',
    guardrail_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_thread_id ON support_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
```

## 6. Logical Workflow
1. **Trigger**: An email is received at `animerch.help@gmail.com`. Google Pub/Sub sends a POST notification to our VPS endpoint.
2. **Fetch**: The system fetches the full content using Gmail API.
3. **Guardrail Check**: AI scans the body for "Critical Keywords" (e.g., *refund, legal, fraud, urgent, escalation*).
4. **Processing**:
   - **Case A (Guardrail Parent)**: If a critical keyword is found, the AI creates a **Draft** in Gmail instead of sending, flags it in the DB, and **sends a notification email to `abhishek29112003@gmail.com`**.
   - **Case B (Standard Inquiry)**: AI pulls context from the `products` and `orders` tables. It generates a helpful, professional response and **Sends** it immediately.
5. **Storage**: AI summarizes both the incoming and outgoing text. The system saves these summaries to the `support_emails` table.

## 5. Integration Hooks
- **Dashboard**: A new section in the existing Admin Panel (`apps/web/app/admin/emails`) to track AI activity and manually handle "Drafted" emails.
- **Shared Code**: Re-use Supabase client and environment configurations from the main project.

## 6. Deployment Strategy (CI/CD)
1. Setup a **GitHub Self-hosted Runner** on the VPS.
2. Create a workflow in `.github/workflows/deploy-responder.yml`.
3. On `push` to `master`, the runner pulls, installs, and restarts the Node.js service using `pm2`.
