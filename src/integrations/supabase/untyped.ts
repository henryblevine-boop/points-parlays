import type { SupabaseClient } from "@supabase/supabase-js";

// types.ts (auto-generated) won't know about columns added by a migration
// until that migration runs against the live database and Lovable
// regenerates it. This strips the generic for the handful of call sites
// touching those new columns, so the app compiles now; the real column
// names/shapes are still enforced at the database level via the migration.
// Safe to delete each call site once types.ts reflects the new columns.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function untyped(client: SupabaseClient): any {
  return client;
}
