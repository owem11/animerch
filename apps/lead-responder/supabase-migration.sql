-- Migration: Create tables for Lead Response System

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    full_body TEXT,
    status TEXT CHECK (status IN ('automated', 'drafted', 'pending_approval', 'error')) DEFAULT 'automated',
    guardrail_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_thread_id ON support_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Table for system configuration and state tracking
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize last_history_id
INSERT INTO system_config (key, value) VALUES ('last_history_id', '0') ON CONFLICT (key) DO NOTHING;
