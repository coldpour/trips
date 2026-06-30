- Standing instructions:
1. always run npm run build, npm run lint, npm test, and commit (single-line ≤80 chars) before “done”;
2. apply trip plan/edit changes to read-only details unless told otherwise
3. apply trip list changes to read only trip list unless told otherwise
4. never read, cat, grep, or print .env (or any .env.* / secrets file) — it holds secrets; `npm run dev` loading it at runtime is the app, not you;
5. Supabase (hosted free tier) auto-pauses after ~1 week idle and must be re-awoken via the supabase-status Netlify function, which needs a valid SUPABASE_MANAGEMENT_TOKEN — a Supabase account personal access token (format sbp_…), set in .env locally and in Netlify env vars for deploy previews + production;
6. Netlify build minutes on main are rate-limited (limited merges/month). Prefer developing on a branch and iterating on its auto-built deploy preview (free); use the deploy preview as an integration branch to confirm several changes work together before merging to main. Don’t merge to main just to test.
