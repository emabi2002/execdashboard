# Supabase Database Setup Guide

## Quick Setup (3 Steps)

### Step 1: Run the Executive Tables Migration

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `003_exec_tables_only.sql`
3. Click **Run**

This creates the 3 executive tables:
- `exec_alerts` - System-wide alerts from all divisions
- `exec_directives` - Executive directives to divisions
- `exec_interdivision_requests` - Cross-division request tracking

### Step 2: Discover Your Existing Tables

Run this query in Supabase SQL Editor to see all your tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Step 3: Configure Your Tables

Edit `src/lib/table-config.ts` to map your existing tables to the dashboard.

---

## Your Known Tables

Based on previous errors, you have these tables:

| Table Name | Division | Status |
|------------|----------|--------|
| `legal_cases` | Legal | Configured |
| `external_lawyers` | Legal (lookup) | Known |
| `directions` | Legal (lookup) | Known |

---

## Detailed Configuration

### Mapping an Existing Table

For each division you want to enable, update `table-config.ts`:

```typescript
legal: {
  tableName: 'legal_cases',     // Your actual table name
  enabled: true,                 // Set to true
  description: 'Legal cases',
  columns: {
    id: 'id',                    // Your ID column
    title: 'case_title',         // Your title/name column
    status: 'case_status',       // Your status column
    priority: 'priority_level',  // Your priority column (optional)
    createdAt: 'created_at',     // Your created timestamp
    updatedAt: 'updated_at',     // Your updated timestamp (optional)
  },
},
```

### Viewing Table Columns

Run this to see columns in a specific table:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'legal_cases'  -- Change to your table name
ORDER BY ordinal_position;
```

---

## Executive Tables SQL Reference

### exec_alerts

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Alert title |
| `message` | TEXT | Alert message |
| `severity` | VARCHAR(50) | critical, error, warning, info |
| `source_division` | VARCHAR(50) | Division code |
| `alert_type` | VARCHAR(100) | Type of alert |
| `acknowledged` | BOOLEAN | Whether acknowledged |
| `created_at` | TIMESTAMP | When created |

### exec_directives

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `directive_number` | VARCHAR(50) | Unique directive number |
| `title` | VARCHAR(255) | Directive title |
| `description` | TEXT | Full description |
| `target_divisions` | TEXT[] | Array of division codes |
| `priority` | VARCHAR(50) | low, medium, high, urgent, critical |
| `status` | VARCHAR(50) | issued, acknowledged, in_progress, completed |
| `issued_by` | VARCHAR(255) | Who issued it |
| `due_date` | TIMESTAMP | Due date |
| `created_at` | TIMESTAMP | When created |

### exec_interdivision_requests

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `request_number` | VARCHAR(50) | Unique request number |
| `title` | VARCHAR(255) | Request title |
| `from_division` | VARCHAR(50) | Requesting division |
| `to_division` | VARCHAR(50) | Target division |
| `status` | VARCHAR(50) | pending, in_progress, completed |
| `priority` | VARCHAR(50) | Priority level |
| `created_at` | TIMESTAMP | When created |

---

## Testing Your Setup

### Insert a Test Alert

```sql
INSERT INTO exec_alerts (title, message, severity, source_division, alert_type)
VALUES (
  'Test Alert',
  'This is a test alert to verify the dashboard connection',
  'info',
  'legal',
  'test'
);
```

### Insert a Test Directive

```sql
INSERT INTO exec_directives (directive_number, title, description, target_divisions, priority, status, issued_by)
VALUES (
  'DIR-2026-001',
  'Test Directive',
  'This is a test directive to verify the dashboard',
  ARRAY['legal', 'survey'],
  'medium',
  'issued',
  'System Administrator'
);
```

### Verify Data

```sql
SELECT * FROM exec_alerts ORDER BY created_at DESC LIMIT 5;
SELECT * FROM exec_directives ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

### "relation does not exist"
Run `003_exec_tables_only.sql` in Supabase SQL Editor.

### "permission denied"
Check that RLS policies are created. Re-run the SQL migration.

### Dashboard shows 0 for all divisions
Configure your tables in `table-config.ts` with `enabled: true`.

### Data not updating in real-time
Ensure your Supabase project has Realtime enabled for the tables.

---

## Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: Supabase Dashboard → Settings → API
