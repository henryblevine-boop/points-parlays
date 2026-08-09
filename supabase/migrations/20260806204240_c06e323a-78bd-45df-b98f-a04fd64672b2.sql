DELETE FROM public.player_props WHERE game_id IN (SELECT id FROM public.games WHERE league_label <> 'MLB');
DELETE FROM public.games WHERE league_label <> 'MLB';