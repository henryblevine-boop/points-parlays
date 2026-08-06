CREATE OR REPLACE FUNCTION public.week_start(_ts timestamptz DEFAULT now())
RETURNS date LANGUAGE sql IMMUTABLE SET search_path = public AS $$ SELECT (date_trunc('week', _ts))::date $$;

REVOKE ALL ON FUNCTION public.is_league_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.week_start(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.week_start(timestamptz) TO authenticated, service_role;