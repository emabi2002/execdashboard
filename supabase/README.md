# ILMS Supabase Database Setup

## Overview
This folder contains SQL migrations for the Executive Dashboard.

**IMPORTANT:** This system connects to REAL data only - no sample/placeholder data.

## Migration Files

### 001_create_ilms_tables.sql
Full schema with all division tables. Use if starting fresh.

### 003_exec_tables_only.sql (RECOMMENDED)
Creates ONLY the 3 executive tables needed for the dashboard:
- `exec_alerts` - System-wide alerts
- `exec_directives` - Executive directives to divisions
- `exec_interdivision_requests` - Inter-department request tracking

**Use this if you already have your division tables.**

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `003_exec_tables_only.sql`
4. Click **Run**

## Configuring Your Existing Tables

After running the SQL, configure which of your existing tables to use:

1. Open `src/lib/table-config.ts`
2. For each division, set:
   - `tableName`: Your actual table name
   - `enabled`: `true` if the table exists
   - `columns`: Map your column names

Example:
```typescript
legal: {
  tableName: 'legal_cases', // Your existing table
  enabled: true,            // Enable this division
  columns: {
    id: 'id',
    title: 'title',
    status: 'status',
    priority: 'priority',
    createdAt: 'created_at',
  },
},
```

## Your Existing Tables

Based on the error messages, you have:
- `legal_cases` - Already exists ✓
- `external_lawyers` - Already exists
- `directions` - Already exists

Update `table-config.ts` to map these to the dashboard.

## No Sample Data

This system is designed to work with your REAL production data.
No sample or placeholder data is included or used.
