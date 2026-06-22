-- ============================================================
-- 010 · Lock down the provisioning functions
--
-- Supabase applies default privileges that GRANT EXECUTE on every new function
-- in `public` to the `anon` and `authenticated` roles. `revoke ... from public`
-- (in 009) does NOT remove those role-specific grants, so `provision_user` and
-- friends were directly callable over the REST RPC endpoint.
--
-- These helpers run INSIDE the signup trigger / ensure_user_provisioned as the
-- function owner (SECURITY DEFINER), so revoking the CALLER's EXECUTE does not
-- break them — internal calls are checked against the owner, not the client.
--
-- After this: only `authenticated` may call ensure_user_provisioned (self-heal
-- at /auth/callback). provision_user and handle_new_user are not client-callable.
-- ============================================================

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.provision_user(uuid, jsonb) from anon, authenticated;

revoke execute on function public.ensure_user_provisioned() from anon;
grant execute on function public.ensure_user_provisioned() to authenticated;
