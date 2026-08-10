-- Removes leftover MLB player props from before the app narrowed to an
-- NFL-only MVP. Ingestion already stopped touching MLB going forward
-- (see ACTIVE_LEAGUES in odds-ingest.functions.ts); this cleans up what
-- was already sitting in the table from before that change.
delete from public.player_props
where game_id in (select id from public.games where league_label = 'MLB');
