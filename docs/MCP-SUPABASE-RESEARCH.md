# Supabase MCP Server Research

**Date Created:** 2026-02-17
**Last Updated:** 2026-02-17
**Status:** MCP Not Yet Available in OpenClaw

---

## Executive Summary

**MCP (Model Context Protocol)** is Anthropic's open standard for connecting AI assistants to external systems. Supabase has an official MCP server that would let me execute SQL, manage tables, and query data directly. **However, OpenClaw doesn't support MCP yet**. Until then, stick with direct Supabase API calls or SQL copy/paste.

---

## What is MCP?

MCP is like **"USB-C for AI applications"** — a standardized way for LLMs to connect to databases, files, and tools.

### Key Benefits
- **Standardized:** Works across Cursor, Claude, Windsurf, etc.
- **Powerful:** Can execute SQL, manage schemas, deploy functions
- **Secure:** OAuth-based authentication, read-only modes available

---

## Supabase MCP Features

| Tool | What It Does | Risk Level |
|------|--------------|------------|
| `list_tables` | Shows all tables | Low |
| `execute_sql` | Run any SQL query | Medium |
| `apply_migration` | Create/alter tables | High |
| `create_branch` | Duplicate database | High |
| `deploy_edge_function` | Deploy serverless code | High |
| `search_docs` | Query Supabase docs | None |

**Full list:** https://mcp.supabase.com

---

## Security Analysis

### ⚠️ Major Risks

**1. Prompt Injection**
- Attacker puts SQL commands in chat messages
- MCP might execute them if permissions allow
- **Mitigation:** Use read-only mode, always review tool calls

**2. Data Exfiltration**
- MCP has access to ALL project data
- **Mitigation:** Scope to specific project with `project_ref` parameter

**3. Accidental Modifications**
- "Delete all users" could happen via natural language
- **Mitigation:** Enable read-only mode for production

### Security Best Practices

```
✅ DO:
- Use read_only=true for production databases
- Scope to specific project with project_ref
- Review every tool call before approving
- Create dev branches for testing

❌ DON'T:
- Connect MCP to production data
- Give MCP access to customers/end users
- Enable storage/admin features without caution
```

---

## OpenClaw Integration Requirements

**Current State:** OpenClaw doesn't support MCP yet.

**What Would Be Needed:**
1. MCP client implementation in Gateway
2. OAuth flow handling for Supabase login
3. Tool calling framework (like my existing tools)
4. Configuration in `openclaw.json`:

```json
{
  "mcp": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=tazrriepmnpqoutdxubt&read_only=true"
    }
  }
}
```

**Estimated Timeline:** Unknown — MCP is brand new (Feb 2025)

---

## Current Limitations

| Feature | Available? | Notes |
|---------|------------|-------|
| OpenClaw MCP support | ❌ No | Not implemented yet |
| Direct SQL queries | ⚠️ Partial | Via `exec` tool only |
| Table management | ❌ No | Manual Supabase dashboard |
| Data insertion | ⚠️ Partial | Via subagent fetch/POST |

---

## Dos and Don'ts

### ✅ DO
- **Use Supabase dashboard** for schema changes
- **Copy/paste SQL** for me to execute when needed
- **Use REST API** for simple queries (`supabase.from()`)
- **Enable RLS** policies on all tables
- **Test in development** before production changes

### ❌ DON'T
- **Wait for MCP** — it may be months away
- **Give me direct DB access** without your review
- **Run unknown SQL** without checking what it does
- **Connect production data** to any automation

---

## Alternatives (Use These Now)

### Option 1: Supabase REST API (Recommended)
```typescript
// In your frontend
const { data } = await supabase
  .from('characters')
  .select('*')
  .eq('is_enabled', true);
```

### Option 2: SQL + Manual Review
- You paste SQL into Supabase SQL Editor
- I guide you through what to run
- You review before executing

### Option 3: Subagents (Current)
- I spawn subagents with explicit tasks
- They execute one-off SQL operations
- Results reported back to you

---

## When to Revisit MCP

**Check back when:**
- OpenClaw announces MCP support
- You see `mcpServers` in `openclaw.json` docs
- Supabase MCP reaches 1.0 stable

**Until then:** Direct API calls + manual SQL work fine.

---

## Resources

- **MCP Docs:** https://modelcontextprotocol.io
- **Supabase MCP:** https://github.com/supabase-community/supabase-mcp
- **Setup Guide:** https://supabase.com/docs/guides/getting-started/mcp

---

**Conclusion:** MCP is exciting but not ready for OpenClaw yet. Current workflow (REST API + manual SQL) is secure and functional. Revisit when OpenClaw ships MCP support.