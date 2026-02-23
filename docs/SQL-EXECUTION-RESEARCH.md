# Direct SQL Execution Research for OpenClaw

**Date:** 2026-02-17  
**Goal:** Enable agents to execute SQL directly on Supabase without manual user intervention

---

## What I Can Do Today

### Option A: Supabase REST API (RECOMMENDED)

**How:** Use Supabase's REST API with service_role_key for privileged operations

**Endpoint:** `https://<project>.supabase.co/rest/v1/rpc/exec_sql`

**What works:**
- ✅ POST requests to Supabase REST API
- ✅ Call PostgreSQL functions via RPC
- ✅ Execute raw SQL (with service_role_key)
- ✅ DDL operations (CREATE, ALTER, DROP)
- ✅ DML operations (SELECT, INSERT, UPDATE)

**Example:**
```javascript
// In code or via exec curl
fetch('https://app.ai.therapy.free/rest/v1/rpc/exec_sql', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <service_role_key>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    sql: 'SELECT * FROM characters WHERE is_enabled = true;' 
  })
})
```

**Pros:**
- No manual SQL editor needed
- Works with existing OpenClaw tools (`exec`, `fetch`)
- Can be automated
- Fast (direct HTTP)

**Cons:**
- Requires service_role_key (not anon_key)
- Bypasses RLS (bypasses all security!)
- Risk of accidental data deletion

**Security Mitigation:**
- Store service_role_key in safe location (not frontend!)
- Always use read-only mode when possible
- Add confirmation prompts for destructive operations
- Log all SQL execution

---

### Option B: User Copies SQL, I Guide Execution

**Current workflow:**
- I write SQL in chat
- User copies to Supabase SQL Editor
- User executes and reports back

**Why it's safe:**
- Human review before execution
- No automated surprises
- User maintains control

**Cons:**
- Manual work required
- Slower iteration
- Can't automate routine tasks

---

### Option C: Server-Side Script

**Setup required:**
- Create Node.js/Python script on server
- Script connects to Supabase using pg or supabase-js
- Script accepts SQL via secure endpoint
- I call endpoint with `exec` or `web_fetch`

**Example architecture:**
```
Me (OpenClaw) → exec curl → Your Server (76.76.21.21) 
  → Script → Supabase Postgres
  → Returns results → Me
```

**Pros:**
- Full control over SQL execution
- Can add logging, validation, rate limiting
- Safely isolated from frontend

**Cons:**
- Requires server setup (SSH, install, config)
- Adds complexity
- Maintenance overhead

---

## What You Need to Enable Me

### For Option A (Supabase REST API)

1. **Get service_role_key:**
   - Supabase Dashboard → Project Settings → API
   - Copy `service_role_key` (keep secret!)

2. **Create exec_sql function** (one-time setup):
   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(sql text)
   RETURNS json AS $$
   DECLARE
     result json;
   BEGIN
     EXECUTE sql;
     result := json_build_object('success', true);
     RETURN result;
   EXCEPTION WHEN OTHERS THEN
     result := json_build_object(
       'success', false,
       'error', SQLERRM
     );
     RETURN result;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Grant access
   GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
   ```

3. **Test:**
   ```bash
   curl -X POST https://app.ai.therapy.free/rest/v1/rpc/exec_sql \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"sql": "SELECT count(*) FROM characters;"}'
   ```

4. **Give me access:**
   - Add key to OpenClaw env (if possible)
   - Or: Store in safe location, reference in tasks

---

## Comparison

| Method | Speed | Safety | Setup | Maintenance |
|--------|-------|--------|-------|-------------|
| A: Supabase REST | Fast | Medium* | Easy | Low |
| B: Copy/paste | Slow | High | None | None |
| C: Server Script | Fast | High | Hard | Medium |

* Medium = requires service_role_key, bypasses RLS

---

## Recommendation

**For ai.therapy:**

Use **Option A (Supabase REST)** with strict constraints:

1. Create `exec_sql_readonly()` function for safe operations
2. Reserve `exec_sql()` for admin-level tasks
3. Always prompt user before destructive operations
4. Log all SQL (to audit table)

**Example safe setup:**
```sql
-- Read-only version
CREATE FUNCTION exec_sql_readonly(sql text)
RETURNS json AS $$
BEGIN
  -- Prevent write operations
  IF sql ~* '^(insert|update|delete|drop)' THEN
    RAISE EXCEPTION 'Write operations not allowed';
  END IF;
  RETURN query_to_json(sql);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## What I Need From You

1. **service_role_key** (for your Supabase project)
2. **exec_sql function** created in database
3. **Test** that I can call it

Then I can say: "Running SQL to check table status..." and actually execute it!

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data deletion | Read-only mode by default |
| Exposed credentials | Never put service_role_key in frontend |
| SQL injection | Validate SQL, use prepared statements |
| Accidental DROP | Confirm destructive operations |
| Audit trail | Log all SQL (user, query, time) |

---

## Next Steps

1. Decide: Which option (A, B, or C)?
2. If A: Give me service_role_key (securely)
3. If B: Continue current workflow (I write, you execute)
4. If C: Set up server script, give me endpoint URL

**Want to proceed with Option A?** I can guide you through setup.