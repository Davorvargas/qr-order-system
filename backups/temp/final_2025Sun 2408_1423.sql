--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER pgrst_drop_watch;
DROP EVENT TRIGGER pgrst_ddl_watch;
DROP EVENT TRIGGER issue_pg_net_access;
DROP EVENT TRIGGER issue_pg_graphql_access;
DROP EVENT TRIGGER issue_pg_cron_access;
DROP EVENT TRIGGER issue_graphql_placeholder;
DROP PUBLICATION supabase_realtime_messages_publication;
DROP PUBLICATION supabase_realtime;
DROP POLICY "Public read access for restaurant assets" ON storage.objects;
DROP POLICY "Authenticated users can upload restaurant assets" ON storage.objects;
DROP POLICY "Authenticated users can update restaurant assets" ON storage.objects;
DROP POLICY "Authenticated users can delete restaurant assets" ON storage.objects;
DROP POLICY "Allow anyone to view menu images 1xs2w12_0" ON storage.objects;
DROP POLICY "Allow admins to upload menu images 1xs2w12_0" ON storage.objects;
DROP POLICY tables_public_select ON public.tables;
DROP POLICY tables_authenticated_manage ON public.tables;
DROP POLICY restaurants_select_policy ON public.restaurants;
DROP POLICY restaurants_admin_policy ON public.restaurants;
DROP POLICY profiles_update_policy ON public.profiles;
DROP POLICY profiles_own_policy ON public.profiles;
DROP POLICY printers_restaurant_policy ON public.printers;
DROP POLICY printers_public_select ON public.printers;
DROP POLICY orders_update_policy ON public.orders;
DROP POLICY orders_select_policy ON public.orders;
DROP POLICY orders_public_select ON public.orders;
DROP POLICY orders_public_insert ON public.orders;
DROP POLICY orders_insert_policy ON public.orders;
DROP POLICY orders_delete_policy ON public.orders;
DROP POLICY order_payments_restaurant_policy ON public.order_payments;
DROP POLICY order_items_select_policy ON public.order_items;
DROP POLICY order_items_public_select ON public.order_items;
DROP POLICY order_items_public_insert ON public.order_items;
DROP POLICY order_items_insert_policy ON public.order_items;
DROP POLICY modifiers_public_select ON public.modifiers;
DROP POLICY modifiers_authenticated_manage ON public.modifiers;
DROP POLICY modifier_groups_public_select ON public.modifier_groups;
DROP POLICY modifier_groups_authenticated_manage ON public.modifier_groups;
DROP POLICY menu_items_public_select ON public.menu_items;
DROP POLICY menu_items_authenticated_manage ON public.menu_items;
DROP POLICY menu_items_admin_or_staff_update_cost ON public.menu_items;
DROP POLICY menu_categories_public_select ON public.menu_categories;
DROP POLICY menu_categories_authenticated_manage ON public.menu_categories;
DROP POLICY cash_registers_restaurant_policy ON public.cash_registers;
DROP POLICY "Users can view own restaurant printers" ON public.printers;
DROP POLICY "Users can view own restaurant order items" ON public.order_items;
DROP POLICY "Users can view own restaurant" ON public.restaurants;
DROP POLICY "Users can view own profile" ON public.profiles;
DROP POLICY "Users can view order payments for their restaurant" ON public.order_payments;
DROP POLICY "Users can view order item modifiers from their restaurant" ON public.order_item_modifiers;
DROP POLICY "Users can view cash registers for their restaurant" ON public.cash_registers;
DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Users can update order payments for their restaurant" ON public.order_payments;
DROP POLICY "Users can update cash registers for their restaurant" ON public.cash_registers;
DROP POLICY "Users can insert order payments for their restaurant" ON public.order_payments;
DROP POLICY "Users can insert order item modifiers to their restaurant" ON public.order_item_modifiers;
DROP POLICY "Users can insert cash registers for their restaurant" ON public.cash_registers;
DROP POLICY "Allow all to create order items" ON public.order_items;
DROP POLICY "Allow admins to update menu items" ON public.menu_items;
DROP POLICY "Allow admins to insert menu items" ON public.menu_items;
DROP POLICY "Allow admins to delete menu items" ON public.menu_items;
DROP POLICY "Allow admin to manage tables" ON public.tables;
DROP POLICY "Allow admin full access to restaurants" ON public.restaurants;
DROP POLICY "Allow admin full access for menu items" ON public.menu_items;
DROP POLICY "Allow admin full access" ON public.menu_categories;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE ONLY storage.objects DROP CONSTRAINT "objects_bucketId_fkey";
ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_restaurant_id_fkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_restaurant_id_fkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE ONLY public.printers DROP CONSTRAINT printers_restaurant_id_fkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_table_id_fkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_restaurant_id_fkey;
ALTER TABLE ONLY public.order_payments DROP CONSTRAINT order_payments_processed_by_fkey;
ALTER TABLE ONLY public.order_payments DROP CONSTRAINT order_payments_order_id_fkey;
ALTER TABLE ONLY public.order_payments DROP CONSTRAINT order_payments_cash_register_id_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_order_id_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_menu_item_id_fkey;
ALTER TABLE ONLY public.order_item_modifiers DROP CONSTRAINT order_item_modifiers_order_item_id_fkey;
ALTER TABLE ONLY public.order_item_modifiers DROP CONSTRAINT order_item_modifiers_modifier_id_fkey;
ALTER TABLE ONLY public.order_item_modifiers DROP CONSTRAINT order_item_modifiers_modifier_group_id_fkey;
ALTER TABLE ONLY public.modifiers DROP CONSTRAINT modifiers_modifier_group_id_fkey;
ALTER TABLE ONLY public.modifier_groups DROP CONSTRAINT modifier_groups_restaurant_id_fkey;
ALTER TABLE ONLY public.modifier_groups DROP CONSTRAINT modifier_groups_menu_item_id_fkey;
ALTER TABLE ONLY public.menu_items DROP CONSTRAINT menu_items_restaurant_id_fkey;
ALTER TABLE ONLY public.menu_items DROP CONSTRAINT menu_items_category_id_fkey;
ALTER TABLE ONLY public.menu_categories DROP CONSTRAINT menu_categories_restaurant_id_fkey;
ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_restaurant_id_fkey;
ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_opened_by_fkey;
ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_closed_by_fkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_sso_provider_id_fkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_user_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_sso_provider_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_flow_state_id_fkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_sso_provider_id_fkey;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_session_id_fkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_user_id_fkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_user_id_fkey;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_auth_factor_id_fkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_fkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_user_id_fkey;
DROP TRIGGER update_objects_updated_at ON storage.objects;
DROP TRIGGER tr_check_filters ON realtime.subscription;
DROP TRIGGER update_modifiers_updated_at ON public.modifiers;
DROP TRIGGER update_modifier_groups_updated_at ON public.modifier_groups;
DROP TRIGGER on_auth_user_created ON auth.users;
DROP INDEX storage.name_prefix_search;
DROP INDEX storage.idx_objects_bucket_id_name;
DROP INDEX storage.idx_multipart_uploads_list;
DROP INDEX storage.bucketid_objname;
DROP INDEX storage.bname;
DROP INDEX realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX realtime.ix_realtime_subscription_entity;
DROP INDEX public.idx_profiles_restaurant_id;
DROP INDEX public.idx_printers_type;
DROP INDEX public.idx_printers_restaurant_id;
DROP INDEX public.idx_printers_active;
DROP INDEX public.idx_orders_drink_printed;
DROP INDEX public.idx_orders_dashboard;
DROP INDEX public.idx_orders_archived;
DROP INDEX public.idx_order_payments_order_id;
DROP INDEX public.idx_order_payments_cash_register_id;
DROP INDEX public.idx_order_item_modifiers_order_item;
DROP INDEX public.idx_modifiers_group;
DROP INDEX public.idx_modifier_groups_restaurant;
DROP INDEX public.idx_modifier_groups_menu_item;
DROP INDEX public.idx_menu_items_archived;
DROP INDEX public.idx_cash_registers_status;
DROP INDEX public.idx_cash_registers_restaurant_date;
DROP INDEX auth.users_is_anonymous_idx;
DROP INDEX auth.users_instance_id_idx;
DROP INDEX auth.users_instance_id_email_idx;
DROP INDEX auth.users_email_partial_key;
DROP INDEX auth.user_id_created_at_idx;
DROP INDEX auth.unique_phone_factor_per_user;
DROP INDEX auth.sso_providers_resource_id_idx;
DROP INDEX auth.sso_domains_sso_provider_id_idx;
DROP INDEX auth.sso_domains_domain_idx;
DROP INDEX auth.sessions_user_id_idx;
DROP INDEX auth.sessions_not_after_idx;
DROP INDEX auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX auth.saml_relay_states_for_email_idx;
DROP INDEX auth.saml_relay_states_created_at_idx;
DROP INDEX auth.saml_providers_sso_provider_id_idx;
DROP INDEX auth.refresh_tokens_updated_at_idx;
DROP INDEX auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX auth.refresh_tokens_parent_idx;
DROP INDEX auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX auth.refresh_tokens_instance_id_idx;
DROP INDEX auth.recovery_token_idx;
DROP INDEX auth.reauthentication_token_idx;
DROP INDEX auth.one_time_tokens_user_id_token_type_key;
DROP INDEX auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX auth.mfa_factors_user_id_idx;
DROP INDEX auth.mfa_factors_user_friendly_name_unique;
DROP INDEX auth.mfa_challenge_created_at_idx;
DROP INDEX auth.idx_user_id_auth_method;
DROP INDEX auth.idx_auth_code;
DROP INDEX auth.identities_user_id_idx;
DROP INDEX auth.identities_email_idx;
DROP INDEX auth.flow_state_created_at_idx;
DROP INDEX auth.factor_id_created_at_idx;
DROP INDEX auth.email_change_token_new_idx;
DROP INDEX auth.email_change_token_current_idx;
DROP INDEX auth.confirmation_token_idx;
DROP INDEX auth.audit_logs_instance_id_idx;
ALTER TABLE ONLY supabase_migrations.seed_files DROP CONSTRAINT seed_files_pkey;
ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_idempotency_key_key;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_pkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_pkey;
ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_name_key;
ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_pkey;
ALTER TABLE ONLY realtime.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY realtime.subscription DROP CONSTRAINT pk_subscription;
ALTER TABLE ONLY realtime.messages_2025_08_27 DROP CONSTRAINT messages_2025_08_27_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_26 DROP CONSTRAINT messages_2025_08_26_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_25 DROP CONSTRAINT messages_2025_08_25_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_24 DROP CONSTRAINT messages_2025_08_24_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_23 DROP CONSTRAINT messages_2025_08_23_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_22 DROP CONSTRAINT messages_2025_08_22_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_21 DROP CONSTRAINT messages_2025_08_21_pkey;
ALTER TABLE ONLY realtime.messages DROP CONSTRAINT messages_pkey;
ALTER TABLE ONLY public.tables DROP CONSTRAINT unique_table_per_restaurant;
ALTER TABLE ONLY public.tables DROP CONSTRAINT tables_pkey;
ALTER TABLE ONLY public.restaurants DROP CONSTRAINT restaurants_pkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE ONLY public.printers DROP CONSTRAINT printers_pkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
ALTER TABLE ONLY public.order_payments DROP CONSTRAINT order_payments_pkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
ALTER TABLE ONLY public.order_item_modifiers DROP CONSTRAINT order_item_modifiers_pkey;
ALTER TABLE ONLY public.modifiers DROP CONSTRAINT modifiers_pkey;
ALTER TABLE ONLY public.modifier_groups DROP CONSTRAINT modifier_groups_pkey;
ALTER TABLE ONLY public.menu_items DROP CONSTRAINT menu_items_pkey;
ALTER TABLE ONLY public.menu_categories DROP CONSTRAINT menu_categories_pkey;
ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_phone_key;
ALTER TABLE ONLY auth.sso_providers DROP CONSTRAINT sso_providers_pkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_pkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_pkey;
ALTER TABLE ONLY auth.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_entity_id_key;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_token_unique;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_pkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_pkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_last_challenged_at_key;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE ONLY auth.instances DROP CONSTRAINT instances_pkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_provider_id_provider_unique;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_pkey;
ALTER TABLE ONLY auth.flow_state DROP CONSTRAINT flow_state_pkey;
ALTER TABLE ONLY auth.audit_log_entries DROP CONSTRAINT audit_log_entries_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT amr_id_pk;
ALTER TABLE auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE supabase_migrations.seed_files;
DROP TABLE supabase_migrations.schema_migrations;
DROP TABLE storage.s3_multipart_uploads_parts;
DROP TABLE storage.s3_multipart_uploads;
DROP TABLE storage.objects;
DROP TABLE storage.migrations;
DROP TABLE storage.buckets;
DROP TABLE realtime.subscription;
DROP TABLE realtime.schema_migrations;
DROP TABLE realtime.messages_2025_08_27;
DROP TABLE realtime.messages_2025_08_26;
DROP TABLE realtime.messages_2025_08_25;
DROP TABLE realtime.messages_2025_08_24;
DROP TABLE realtime.messages_2025_08_23;
DROP TABLE realtime.messages_2025_08_22;
DROP TABLE realtime.messages_2025_08_21;
DROP TABLE realtime.messages;
DROP TABLE public.tables;
DROP TABLE public.staging_menu_costs;
DROP TABLE public.restaurants;
DROP TABLE public.profiles;
DROP TABLE public.printers;
DROP TABLE public.orders;
DROP TABLE public.order_payments;
DROP TABLE public.order_items;
DROP TABLE public.order_item_modifiers;
DROP TABLE public.modifiers;
DROP TABLE public.modifier_groups;
DROP TABLE public.menu_items;
DROP TABLE public.menu_categories;
DROP TABLE public.cash_registers;
DROP TABLE auth.users;
DROP TABLE auth.sso_providers;
DROP TABLE auth.sso_domains;
DROP TABLE auth.sessions;
DROP TABLE auth.schema_migrations;
DROP TABLE auth.saml_relay_states;
DROP TABLE auth.saml_providers;
DROP SEQUENCE auth.refresh_tokens_id_seq;
DROP TABLE auth.refresh_tokens;
DROP TABLE auth.one_time_tokens;
DROP TABLE auth.mfa_factors;
DROP TABLE auth.mfa_challenges;
DROP TABLE auth.mfa_amr_claims;
DROP TABLE auth.instances;
DROP TABLE auth.identities;
DROP TABLE auth.flow_state;
DROP TABLE auth.audit_log_entries;
DROP FUNCTION storage.update_updated_at_column();
DROP FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.operation();
DROP FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION storage.get_size_by_bucket();
DROP FUNCTION storage.foldername(name text);
DROP FUNCTION storage.filename(name text);
DROP FUNCTION storage.extension(name text);
DROP FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION realtime.topic();
DROP FUNCTION realtime.to_regrole(role_name text);
DROP FUNCTION realtime.subscription_check_filters();
DROP FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION realtime.quote_wal2json(entity regclass);
DROP FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION realtime."cast"(val text, type_ regtype);
DROP FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION public.update_updated_at_column();
DROP FUNCTION public.merge_orders(source_order_ids integer[], target_order_id integer, new_total numeric);
DROP FUNCTION public.is_admin();
DROP FUNCTION public.handle_new_user();
DROP FUNCTION public.get_user_restaurant_id();
DROP FUNCTION public.get_my_role();
DROP FUNCTION public.get_dashboard_analytics_weekly(p_restaurant_id uuid);
DROP FUNCTION public.get_dashboard_analytics(start_date timestamp with time zone, end_date timestamp with time zone);
DROP FUNCTION public.get_dashboard_analytics(p_restaurant_id uuid);
DROP FUNCTION public.create_new_restaurant(restaurant_name text, admin_email text, admin_password text, admin_full_name text);
DROP FUNCTION public.create_new_order(payload jsonb);
DROP FUNCTION public.calculate_item_total_price(menu_item_id integer, selected_modifier_ids uuid[]);
DROP FUNCTION public.assign_user_to_restaurant(user_email text, restaurant_id uuid, role text);
DROP FUNCTION pgbouncer.get_auth(p_usename text);
DROP FUNCTION extensions.set_graphql_placeholder();
DROP FUNCTION extensions.pgrst_drop_watch();
DROP FUNCTION extensions.pgrst_ddl_watch();
DROP FUNCTION extensions.grant_pg_net_access();
DROP FUNCTION extensions.grant_pg_graphql_access();
DROP FUNCTION extensions.grant_pg_cron_access();
DROP FUNCTION auth.uid();
DROP FUNCTION auth.role();
DROP FUNCTION auth.jwt();
DROP FUNCTION auth.email();
DROP TYPE realtime.wal_rls;
DROP TYPE realtime.wal_column;
DROP TYPE realtime.user_defined_filter;
DROP TYPE realtime.equality_op;
DROP TYPE realtime.action;
DROP TYPE public.order_status_enum;
DROP TYPE auth.one_time_token_type;
DROP TYPE auth.factor_type;
DROP TYPE auth.factor_status;
DROP TYPE auth.code_challenge_method;
DROP TYPE auth.aal_level;
DROP EXTENSION "uuid-ossp";
DROP EXTENSION supabase_vault;
DROP EXTENSION pgcrypto;
DROP EXTENSION pg_trgm;
DROP EXTENSION pg_stat_statements;
DROP EXTENSION pg_graphql;
DROP SCHEMA vault;
DROP SCHEMA supabase_migrations;
DROP SCHEMA storage;
DROP SCHEMA realtime;
DROP SCHEMA pgbouncer;
DROP SCHEMA graphql_public;
DROP SCHEMA graphql;
DROP SCHEMA extensions;
DROP SCHEMA auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status_enum AS ENUM (
    'order_placed',
    'receipt_printed',
    'completed',
    'cancelled',
    'kitchen_printed',
    'pending',
    'in_progress',
    'served',
    'merged'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: assign_user_to_restaurant(text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_user_to_restaurant(user_email text, restaurant_id uuid, role text DEFAULT 'staff'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden asignar usuarios';
  END IF;
  
  -- Buscar el usuario por email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Usuario no encontrado'
    );
    RETURN result;
  END IF;
  
  -- Verificar que el restaurante existe
  IF NOT EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id) THEN
    result := json_build_object(
      'success', false,
      'error', 'Restaurante no encontrado'
    );
    RETURN result;
  END IF;
  
  -- Actualizar o crear el perfil del usuario
  INSERT INTO profiles (id, role, restaurant_id)
  VALUES (user_id, role, restaurant_id)
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    restaurant_id = EXCLUDED.restaurant_id;
  
  result := json_build_object(
    'success', true,
    'user_id', user_id,
    'restaurant_id', restaurant_id,
    'role', role,
    'message', 'Usuario asignado exitosamente'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    
    RETURN result;
END;
$$;


--
-- Name: calculate_item_total_price(integer, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_item_total_price(menu_item_id integer, selected_modifier_ids uuid[]) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
  base_price DECIMAL(10,2);
  modifier_total DECIMAL(10,2) := 0;
  modifier_price DECIMAL(10,2);
BEGIN
  -- Obtener precio base del producto
  SELECT price INTO base_price
  FROM menu_items
  WHERE id = menu_item_id;
  
  -- Sumar modificadores
  IF selected_modifier_ids IS NOT NULL THEN
    FOR i IN 1..array_length(selected_modifier_ids, 1) LOOP
      SELECT price_modifier INTO modifier_price
      FROM modifiers
      WHERE id = selected_modifier_ids[i];
      
      modifier_total := modifier_total + COALESCE(modifier_price, 0);
    END LOOP;
  END IF;
  
  RETURN COALESCE(base_price, 0) + modifier_total;
END;
$$;


--
-- Name: create_new_order(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_new_order(payload jsonb) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_order_id INT;
    order_item RECORD;
BEGIN
    -- Insert the new order and get its ID
    INSERT INTO public.orders (table_id, customer_name, total_price, notes, source)
    VALUES (
        payload->>'table_id',
        payload->>'customer_name',
        (payload->>'total_price')::numeric,
        payload->>'notes', -- This is for the main order note, which seems correct
        COALESCE(payload->>'source', 'customer_qr')
    ) RETURNING id INTO new_order_id;

    -- Loop through the order items in the payload and insert them
    -- CORRECTED: Now includes the 'notes' field for each item
    FOR order_item IN SELECT * FROM jsonb_to_recordset(payload->'order_items') AS x(menu_item_id INT, quantity INT, price_at_order NUMERIC, notes TEXT)
    LOOP
        INSERT INTO public.order_items (order_id, menu_item_id, quantity, price_at_order, notes)
        VALUES (new_order_id, order_item.menu_item_id, order_item.quantity, order_item.price_at_order, order_item.notes);
    END LOOP;

    -- Return the new order's ID
    RETURN json_build_object('order_id', new_order_id);
END;
$$;


--
-- Name: create_new_restaurant(text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_new_restaurant(restaurant_name text, admin_email text, admin_password text, admin_full_name text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_restaurant_id uuid;
  new_user_id uuid;
  result json;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear nuevos restaurantes';
  END IF;
  
  -- Crear el restaurante
  INSERT INTO restaurants (name)
  VALUES (restaurant_name)
  RETURNING id INTO new_restaurant_id;
  
  -- Crear el usuario admin
  new_user_id := (
    SELECT id FROM auth.users 
    WHERE email = admin_email
  );
  
  -- Si el usuario no existe, crearlo
  IF new_user_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (admin_email, crypt(admin_password, gen_salt('bf')), now(), now(), now())
    RETURNING id INTO new_user_id;
  END IF;
  
  -- Crear el perfil del usuario
  INSERT INTO profiles (id, full_name, role, restaurant_id)
  VALUES (new_user_id, admin_full_name, 'admin', new_restaurant_id);
  
  -- Crear tablas por defecto (mesas 1-10)
  INSERT INTO tables (restaurant_id, table_number)
  SELECT new_restaurant_id, generate_series::text
  FROM generate_series(1, 10);
  
  -- Crear categorías por defecto
  INSERT INTO menu_categories (restaurant_id, name, display_order, is_available)
  VALUES 
    (new_restaurant_id, 'Entradas', 1, true),
    (new_restaurant_id, 'Platos Principales', 2, true),
    (new_restaurant_id, 'Postres', 3, true),
    (new_restaurant_id, 'Bebidas', 4, true);
  
  -- Crear impresoras por defecto
  INSERT INTO printers (restaurant_id, name, type, is_active, description)
  VALUES 
    (new_restaurant_id, 'Impresora Cocina', 'kitchen', true, 'Impresora principal de cocina'),
    (new_restaurant_id, 'Impresora Bebidas', 'drink', true, 'Impresora de bebidas'),
    (new_restaurant_id, 'Impresora Recibos', 'receipt', true, 'Impresora de recibos');
  
  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'restaurant_id', new_restaurant_id,
    'user_id', new_user_id,
    'message', 'Restaurante creado exitosamente'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback en caso de error
    IF new_restaurant_id IS NOT NULL THEN
      DELETE FROM restaurants WHERE id = new_restaurant_id;
    END IF;
    
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    
    RETURN result;
END;
$$;


--
-- Name: get_dashboard_analytics(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_analytics(p_restaurant_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  revenue_today DECIMAL(10,2) := 0;
  revenue_yesterday DECIMAL(10,2) := 0;
  orders_today INTEGER := 0;
  orders_yesterday INTEGER := 0;
  top_items JSON;
  low_items JSON;
  payment_methods JSON;
  profit_matrix JSON;
  result JSON;
BEGIN
  -- Revenue y órdenes de hoy
  SELECT 
    COALESCE(SUM(total_price), 0),
    COUNT(*)
  INTO revenue_today, orders_today
  FROM orders 
  WHERE restaurant_id = p_restaurant_id 
    AND DATE(created_at) = CURRENT_DATE
    AND status NOT IN ('cancelled');

  -- Revenue y órdenes de ayer
  SELECT 
    COALESCE(SUM(total_price), 0),
    COUNT(*)
  INTO revenue_yesterday, orders_yesterday
  FROM orders 
  WHERE restaurant_id = p_restaurant_id 
    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND status NOT IN ('cancelled');

  -- Top 5 productos más vendidos (hoy)
  WITH today_items AS (
    SELECT 
      COALESCE(mi.name, 
        CASE 
          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN
            COALESCE(
              (oi.notes::json->>'name'),
              'Producto Especial'
            )
          ELSE 'Producto Especial'
        END
      ) as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.price_at_order * oi.quantity) as revenue
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) = CURRENT_DATE
      AND o.status NOT IN ('cancelled')
    GROUP BY 1
    ORDER BY quantity DESC
    LIMIT 5
  )
  SELECT json_agg(
    json_build_object(
      'name', name,
      'quantity', quantity,
      'revenue', revenue
    )
  ) INTO top_items
  FROM today_items;

  -- Bottom 5 productos menos vendidos (últimos 7 días)
  WITH week_items AS (
    SELECT 
      COALESCE(mi.name, 
        CASE 
          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN
            COALESCE(
              (oi.notes::json->>'name'),
              'Producto Especial'
            )
          ELSE 'Producto Especial'
        END
      ) as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.price_at_order * oi.quantity) as revenue
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'
      AND o.status NOT IN ('cancelled')
    GROUP BY 1
    HAVING SUM(oi.quantity) > 0
    ORDER BY quantity ASC
    LIMIT 5
  )
  SELECT json_agg(
    json_build_object(
      'name', name,
      'quantity', quantity,
      'revenue', revenue
    )
  ) INTO low_items
  FROM week_items;

  -- Métodos de pago (hoy)
  WITH payment_stats AS (
    SELECT 
      CASE 
        WHEN op.payment_method IS NOT NULL THEN op.payment_method
        WHEN o.source = 'customer_qr' THEN 'qr'
        ELSE 'No especificado'
      END as method,
      SUM(COALESCE(op.amount, o.total_price)) as total,
      COUNT(*) as count
    FROM orders o
    LEFT JOIN order_payments op ON o.id = op.order_id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) = CURRENT_DATE
      AND o.status NOT IN ('cancelled')
    GROUP BY 1
  )
  SELECT json_agg(
    json_build_object(
      'method', method,
      'total', total,
      'count', count
    )
  ) INTO payment_methods
  FROM payment_stats;

  -- PROFIT MATRIX (últimos 7 días para tener más datos)
  WITH profit_analysis AS (
    SELECT 
      COALESCE(mi.name, 'Producto Especial') as name,
      SUM(oi.quantity) as total_sold,
      SUM(oi.price_at_order * oi.quantity) as revenue,
      SUM(oi.cost_at_order * oi.quantity) as total_cost,
      SUM((oi.price_at_order - oi.cost_at_order) * oi.quantity) as profit,
      AVG(oi.price_at_order - oi.cost_at_order) as avg_profit_per_unit,
      CASE 
        WHEN SUM(oi.price_at_order * oi.quantity) > 0 THEN
          ((SUM((oi.price_at_order - oi.cost_at_order) * oi.quantity) / SUM(oi.price_at_order * oi.quantity)) * 100)
        ELSE 0
      END as profit_margin
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'
      AND o.status NOT IN ('cancelled')
      AND oi.cost_at_order > 0  -- Solo productos con costo definido
    GROUP BY 1
    HAVING SUM(oi.quantity) > 0
  ),
  profit_matrix_data AS (
    SELECT 
      name,
      total_sold,
      revenue,
      profit,
      profit_margin,
      CASE 
        WHEN total_sold >= 10 AND profit_margin >= 50 THEN 'stars'     -- 🏆 ESTRELLAS
        WHEN total_sold < 10 AND profit_margin >= 50 THEN 'gems'       -- ⭐ JOYAS  
        WHEN total_sold >= 10 AND profit_margin < 50 THEN 'popular'    -- 🔄 POPULARES
        ELSE 'problems'                                                 -- ⚠️ PROBLEMAS
      END as category
    FROM profit_analysis
  )
  SELECT json_build_object(
    'stars', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'stars'),
    'gems', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'gems'),
    'popular', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'popular'),
    'problems', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'problems')
  ) INTO profit_matrix
  FROM profit_matrix_data
  LIMIT 1;

  -- Construir resultado final
  result := json_build_object(
    'revenue_today', revenue_today,
    'revenue_yesterday', revenue_yesterday,
    'orders_today', orders_today,
    'orders_yesterday', orders_yesterday,
    'top_items', COALESCE(top_items, '[]'::json),
    'low_items', COALESCE(low_items, '[]'::json),
    'payment_methods', COALESCE(payment_methods, '[]'::json),
    'profit_matrix', COALESCE(profit_matrix, '{"stars":[],"gems":[],"popular":[],"problems":[]}'::json)
  );

  RETURN result;
END;
$$;


--
-- Name: get_dashboard_analytics(timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_analytics(start_date timestamp with time zone, end_date timestamp with time zone) RETURNS json
    LANGUAGE sql
    AS $$
  SELECT json_build_object(
    'kpis', (
      SELECT json_build_object(
        'total_revenue', COALESCE(SUM(oi.quantity * oi.price_at_order), 0),
        'total_cost',    COALESCE(SUM(oi.quantity * oi.cost_at_order), 0),
        'total_profit',  COALESCE(SUM(oi.quantity * oi.price_at_order), 0) - COALESCE(SUM(oi.quantity * oi.cost_at_order), 0)
      )
      FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.created_at BETWEEN start_date AND end_date
        AND o.status = 'completed'
        AND o.restaurant_id = get_user_restaurant_id()
    ),
    'item_performance', (
      SELECT COALESCE(json_agg(item_stats), '[]'::json)
      FROM (
        SELECT
          mi.id,
          mi.name,
          SUM(oi.quantity)                           AS units_sold,
          SUM(oi.quantity * oi.price_at_order)       AS revenue,
          SUM(oi.quantity * oi.cost_at_order)        AS cost,
          SUM(oi.quantity * oi.price_at_order) -
          SUM(oi.quantity * oi.cost_at_order)        AS profit
        FROM public.menu_items mi
        JOIN public.order_items oi ON mi.id = oi.menu_item_id
        JOIN public.orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN start_date AND end_date
          AND o.status = 'completed'
          AND o.restaurant_id = get_user_restaurant_id()
        GROUP BY mi.id, mi.name
        ORDER BY profit DESC
      ) AS item_stats
    )
  );
$$;


--
-- Name: get_dashboard_analytics_weekly(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_analytics_weekly(p_restaurant_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    weekly_revenue JSON[];
    current_date DATE := CURRENT_DATE;
    i INTEGER;
BEGIN
    -- Generate weekly revenue data (last 7 days)
    FOR i IN 0..6 LOOP
        weekly_revenue := array_append(weekly_revenue, 
            json_build_object(
                'day', TO_CHAR(current_date - i, 'Day'),
                'date', current_date - i,
                'revenue', COALESCE((
                    SELECT SUM(total_price)
                    FROM orders 
                    WHERE restaurant_id = p_restaurant_id 
                    AND DATE(created_at) = current_date - i
                    AND status NOT IN ('cancelled')
                ), 0),
                'orders', COALESCE((
                    SELECT COUNT(*)
                    FROM orders 
                    WHERE restaurant_id = p_restaurant_id 
                    AND DATE(created_at) = current_date - i
                    AND status NOT IN ('cancelled')
                ), 0)
            )
        );
    END LOOP;

    -- Build the result
    SELECT json_build_object(
        'revenue_today', COALESCE((
            SELECT SUM(total_price)
            FROM orders 
            WHERE restaurant_id = p_restaurant_id 
            AND DATE(created_at) = CURRENT_DATE
            AND status NOT IN ('cancelled')
        ), 0),
        
        'revenue_yesterday', COALESCE((
            SELECT SUM(total_price)
            FROM orders 
            WHERE restaurant_id = p_restaurant_id 
            AND DATE(created_at) = CURRENT_DATE - 1
            AND status NOT IN ('cancelled')
        ), 0),
        
        'orders_today', COALESCE((
            SELECT COUNT(*)
            FROM orders 
            WHERE restaurant_id = p_restaurant_id 
            AND DATE(created_at) = CURRENT_DATE
            AND status NOT IN ('cancelled')
        ), 0),
        
        'orders_yesterday', COALESCE((
            SELECT COUNT(*)
            FROM orders 
            WHERE restaurant_id = p_restaurant_id 
            AND DATE(created_at) = CURRENT_DATE - 1
            AND status NOT IN ('cancelled')
        ), 0),
        
        'weekly_data', array_to_json(weekly_revenue),
        
        'total_customers', COALESCE((
            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))
            FROM orders 
            WHERE restaurant_id = p_restaurant_id 
            AND DATE(created_at) >= CURRENT_DATE - 7
            AND status NOT IN ('cancelled')
        ), 0),
        
        'top_items', (
            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)
            FROM (
                SELECT 
                    mi.name,
                    SUM(oi.quantity) as quantity,
                    SUM(oi.quantity * oi.price_at_order) as revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE o.restaurant_id = p_restaurant_id
                AND DATE(o.created_at) >= CURRENT_DATE - 7
                AND o.status NOT IN ('cancelled')
                GROUP BY mi.name
                LIMIT 10
            ) item_data
        ),
        
        'payment_methods', '[]'::json,
        
        'profit_matrix', (
            SELECT json_build_object(
                'stars', COALESCE((
                    SELECT json_agg(star_data)
                    FROM (
                        SELECT 
                            mi.name,
                            SUM(oi.quantity) as quantity,
                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        JOIN menu_items mi ON oi.menu_item_id = mi.id
                        WHERE o.restaurant_id = p_restaurant_id
                        AND DATE(o.created_at) >= CURRENT_DATE - 7
                        AND o.status NOT IN ('cancelled')
                        AND oi.cost_at_order > 0
                        GROUP BY mi.name
                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50
                        ORDER BY profit_margin DESC, quantity DESC
                        LIMIT 5
                    ) star_data
                ), '[]'::json),
                'gems', COALESCE((
                    SELECT json_agg(gem_data)
                    FROM (
                        SELECT 
                            mi.name,
                            SUM(oi.quantity) as quantity,
                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        JOIN menu_items mi ON oi.menu_item_id = mi.id
                        WHERE o.restaurant_id = p_restaurant_id
                        AND DATE(o.created_at) >= CURRENT_DATE - 7
                        AND o.status NOT IN ('cancelled')
                        AND oi.cost_at_order > 0
                        GROUP BY mi.name
                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50
                        ORDER BY profit_margin DESC
                        LIMIT 5
                    ) gem_data
                ), '[]'::json),
                'popular', COALESCE((
                    SELECT json_agg(popular_data)
                    FROM (
                        SELECT 
                            mi.name,
                            SUM(oi.quantity) as quantity,
                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        JOIN menu_items mi ON oi.menu_item_id = mi.id
                        WHERE o.restaurant_id = p_restaurant_id
                        AND DATE(o.created_at) >= CURRENT_DATE - 7
                        AND o.status NOT IN ('cancelled')
                        AND oi.cost_at_order > 0
                        GROUP BY mi.name
                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50
                        ORDER BY quantity DESC
                        LIMIT 5
                    ) popular_data
                ), '[]'::json),
                'problems', COALESCE((
                    SELECT json_agg(problem_data)
                    FROM (
                        SELECT 
                            mi.name,
                            SUM(oi.quantity) as quantity,
                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        JOIN menu_items mi ON oi.menu_item_id = mi.id
                        WHERE o.restaurant_id = p_restaurant_id
                        AND DATE(o.created_at) >= CURRENT_DATE - 7
                        AND o.status NOT IN ('cancelled')
                        AND oi.cost_at_order > 0
                        GROUP BY mi.name
                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50
                        ORDER BY profit_margin ASC, quantity ASC
                        LIMIT 5
                    ) problem_data
                ), '[]'::json)
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$;


--
-- Name: get_my_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select role
  from public.profiles
  where id = auth.uid()
$$;


--
-- Name: get_user_restaurant_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_restaurant_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Si no hay usuario autenticado, retornar NULL
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Obtener el restaurant_id del perfil del usuario
  RETURN (
    SELECT restaurant_id
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, role, restaurant_id)
  VALUES (new.id, 'staff', NULL);
  RETURN new;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;


--
-- Name: merge_orders(integer[], integer, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.merge_orders(source_order_ids integer[], target_order_id integer, new_total numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  source_order_id INTEGER;
  merged_notes TEXT;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- Mover todos los items de las órdenes fuente a la orden objetivo
    UPDATE order_items 
    SET order_id = target_order_id
    WHERE order_id = ANY(source_order_ids);
    
    -- Actualizar el total de la orden objetivo
    UPDATE orders 
    SET total_price = new_total,
        notes = CASE 
          WHEN notes IS NOT NULL AND notes != '' THEN 
            notes || ' | Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')
          ELSE 
            'Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')
        END
    WHERE id = target_order_id;
    
    -- Marcar las órdenes fuente como fusionadas (cambiar status a 'merged')
    UPDATE orders 
    SET status = 'merged',
        notes = CASE 
          WHEN notes IS NOT NULL AND notes != '' THEN 
            notes || ' | Fusionada en orden: ' || target_order_id
          ELSE 
            'Fusionada en orden: ' || target_order_id
        END
    WHERE id = ANY(source_order_ids);
    
    -- Commit implícito
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback implícito
      RAISE EXCEPTION 'Error al fusionar órdenes: %', SQLERRM;
  END;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_registers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    opened_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    opening_amount numeric(10,2) DEFAULT 0 NOT NULL,
    closing_amount numeric(10,2),
    total_sales numeric(10,2) DEFAULT 0,
    total_qr numeric(10,2) DEFAULT 0,
    total_card numeric(10,2) DEFAULT 0,
    total_cash numeric(10,2) DEFAULT 0,
    difference numeric(10,2),
    status text DEFAULT 'open'::text NOT NULL,
    opened_by uuid,
    closed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cash_registers_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


--
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_categories (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    display_order integer,
    is_available boolean DEFAULT true,
    restaurant_id uuid
);


--
-- Name: menu_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.menu_categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.menu_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric,
    image_url text,
    category_id bigint,
    is_available boolean DEFAULT true NOT NULL,
    display_order integer,
    restaurant_id uuid,
    archived boolean DEFAULT false,
    cost numeric DEFAULT 0 NOT NULL
);


--
-- Name: COLUMN menu_items.archived; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.archived IS 'Indica si el ítem del menú ha sido archivado (soft delete)';


--
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.menu_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modifier_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modifier_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_item_id integer NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    is_required boolean DEFAULT false,
    min_selections integer DEFAULT 0,
    max_selections integer DEFAULT 1,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE modifier_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.modifier_groups IS 'Grupos de modificadores para productos del menú (ej: Temperatura, Tipo de Leche)';


--
-- Name: COLUMN modifier_groups.is_required; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modifier_groups.is_required IS 'Si true, el cliente debe seleccionar al menos una opción';


--
-- Name: COLUMN modifier_groups.max_selections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modifier_groups.max_selections IS '1 = radio button, >1 = checkboxes múltiples';


--
-- Name: modifiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modifiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modifier_group_id uuid NOT NULL,
    name text NOT NULL,
    price_modifier numeric(10,2) DEFAULT 0,
    is_default boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE modifiers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.modifiers IS 'Opciones específicas dentro de cada grupo de modificadores';


--
-- Name: COLUMN modifiers.price_modifier; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modifiers.price_modifier IS 'Cantidad a sumar/restar del precio base del producto';


--
-- Name: COLUMN modifiers.is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modifiers.is_default IS 'Opción seleccionada por defecto en el frontend';


--
-- Name: order_item_modifiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item_modifiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id integer NOT NULL,
    modifier_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    price_at_order numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE order_item_modifiers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_item_modifiers IS 'Modificadores seleccionados en cada item de pedido';


--
-- Name: COLUMN order_item_modifiers.price_at_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_item_modifiers.price_at_order IS 'Precio del modificador congelado al momento del pedido';


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    order_id bigint NOT NULL,
    menu_item_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    price_at_order numeric,
    cost_at_order numeric DEFAULT 0 NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: order_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id integer NOT NULL,
    cash_register_id uuid,
    payment_method text NOT NULL,
    amount numeric(10,2) NOT NULL,
    processed_at timestamp with time zone DEFAULT now(),
    processed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_payments_payment_method_check CHECK ((payment_method = ANY (ARRAY['qr'::text, 'card'::text, 'cash'::text])))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    table_id uuid NOT NULL,
    customer_name text NOT NULL,
    status public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    total_price numeric,
    notes text,
    source text DEFAULT 'customer_qr'::text NOT NULL,
    drink_printed boolean DEFAULT false,
    kitchen_printed boolean DEFAULT false,
    restaurant_id uuid,
    archived boolean DEFAULT false,
    is_new_order boolean DEFAULT true,
    is_preparing boolean DEFAULT false,
    is_ready boolean DEFAULT false
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    vendor_id integer,
    product_id integer,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    location text,
    last_status_check timestamp with time zone,
    status text DEFAULT 'unknown'::text,
    error_message text,
    CONSTRAINT printers_status_check CHECK ((status = ANY (ARRAY['online'::text, 'offline'::text, 'error'::text, 'unknown'::text]))),
    CONSTRAINT printers_type_check CHECK ((type = ANY (ARRAY['kitchen'::text, 'drink'::text, 'receipt'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name text,
    role text DEFAULT 'staff'::text NOT NULL,
    restaurant_id uuid
);


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text,
    background_images text[],
    primary_color text DEFAULT '#1f2937'::text,
    secondary_color text DEFAULT '#fbbf24'::text
);


--
-- Name: COLUMN restaurants.logo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.restaurants.logo_url IS 'URL del logo del restaurante';


--
-- Name: COLUMN restaurants.background_images; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.restaurants.background_images IS 'Array de URLs de imágenes de fondo para el header';


--
-- Name: COLUMN restaurants.primary_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.restaurants.primary_color IS 'Color primario del restaurante (hex)';


--
-- Name: COLUMN restaurants.secondary_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.restaurants.secondary_color IS 'Color secundario del restaurante (hex)';


--
-- Name: staging_menu_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_menu_costs (
    name text,
    cost_text text
);


--
-- Name: tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    table_number text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_08_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_23; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_24; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_25; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_26; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_27; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2025_08_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_21 FOR VALUES FROM ('2025-08-21 00:00:00') TO ('2025-08-22 00:00:00');


--
-- Name: messages_2025_08_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_22 FOR VALUES FROM ('2025-08-22 00:00:00') TO ('2025-08-23 00:00:00');


--
-- Name: messages_2025_08_23; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_23 FOR VALUES FROM ('2025-08-23 00:00:00') TO ('2025-08-24 00:00:00');


--
-- Name: messages_2025_08_24; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_24 FOR VALUES FROM ('2025-08-24 00:00:00') TO ('2025-08-25 00:00:00');


--
-- Name: messages_2025_08_25; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_25 FOR VALUES FROM ('2025-08-25 00:00:00') TO ('2025-08-26 00:00:00');


--
-- Name: messages_2025_08_26; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_26 FOR VALUES FROM ('2025-08-26 00:00:00') TO ('2025-08-27 00:00:00');


--
-- Name: messages_2025_08_27; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_27 FOR VALUES FROM ('2025-08-27 00:00:00') TO ('2025-08-28 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	17f02123-cb48-479c-bb87-27f80ba73866	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"staff@test.com","user_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","user_phone":""}}	2025-06-24 22:22:43.16378+00	
00000000-0000-0000-0000-000000000000	ed9c6c5e-d621-4bfc-a681-917820f9ee85	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-24 22:26:10.201597+00	
00000000-0000-0000-0000-000000000000	16fac2f6-6b14-461f-a8a0-af8a920ae1c7	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-06-24 22:28:14.322911+00	
00000000-0000-0000-0000-000000000000	b1897303-43b3-4c5d-9f4e-8215359adcd3	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-24 22:30:18.759138+00	
00000000-0000-0000-0000-000000000000	b9c4a8c7-d1b6-420e-a539-e16445cb1748	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-06-24 22:31:20.583371+00	
00000000-0000-0000-0000-000000000000	f06decaf-c8c7-4ea8-baa8-b2b2cba11dc3	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-24 23:20:53.719887+00	
00000000-0000-0000-0000-000000000000	6823a46f-cc79-4574-9cfd-cf9f59f6e571	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-06-24 23:25:47.516648+00	
00000000-0000-0000-0000-000000000000	1e55613c-d50f-4fbb-8bc0-26ad95e18164	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-25 00:39:58.259155+00	
00000000-0000-0000-0000-000000000000	8c1d9556-bf44-49d3-9e49-e04eb2973b2d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 15:30:17.865658+00	
00000000-0000-0000-0000-000000000000	441418af-3fd3-41e5-8861-655c0ea9d03d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 15:30:17.870144+00	
00000000-0000-0000-0000-000000000000	d0972154-e7e1-496b-a9b3-60317c82ce0e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 16:28:43.311216+00	
00000000-0000-0000-0000-000000000000	be66e077-9746-4ee4-9045-02d3a97520ce	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 16:28:43.311999+00	
00000000-0000-0000-0000-000000000000	ea4bbc8d-0c45-44f9-b16f-3e05a43e92b2	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 17:26:50.268932+00	
00000000-0000-0000-0000-000000000000	8408353e-8626-4e62-a960-977985067bf7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 17:26:50.26971+00	
00000000-0000-0000-0000-000000000000	9f8b1e0e-65cc-4672-ac67-b8c1763f3ec8	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 19:02:32.062616+00	
00000000-0000-0000-0000-000000000000	6f4efa43-a6ad-49ce-b620-875ecdf2966c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 19:02:32.063424+00	
00000000-0000-0000-0000-000000000000	21768ab7-0166-45c8-87ac-ecba089c3c91	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 14:16:29.49311+00	
00000000-0000-0000-0000-000000000000	66264e2b-0b4c-47e6-a657-a85a299f5482	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 14:16:29.502017+00	
00000000-0000-0000-0000-000000000000	78854b48-6e21-4282-8fb0-e2cc3631f2df	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 16:22:50.156759+00	
00000000-0000-0000-0000-000000000000	6651a89e-bbdf-4dc1-824e-af9fba72b316	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 16:22:50.158877+00	
00000000-0000-0000-0000-000000000000	1416e8ee-566f-44e1-bf75-7f68b026ccb6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 18:47:44.889053+00	
00000000-0000-0000-0000-000000000000	f3343600-c023-4b25-aba3-de9ad4e532c9	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 18:47:44.891278+00	
00000000-0000-0000-0000-000000000000	2fd718c0-7b84-42cb-8eb7-923ff543547f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 19:46:28.392595+00	
00000000-0000-0000-0000-000000000000	3a51391c-c7e3-4ee2-9160-fcb38805e40a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 19:46:28.394797+00	
00000000-0000-0000-0000-000000000000	2e31c2ff-0618-4188-8409-a95747e87e9c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 20:44:32.155783+00	
00000000-0000-0000-0000-000000000000	1d04314c-a561-490d-8d31-0317290c392a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 20:44:32.157422+00	
00000000-0000-0000-0000-000000000000	2610e2fa-1ae9-45d4-bdce-334c12d85ef1	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 21:42:39.023078+00	
00000000-0000-0000-0000-000000000000	529f69ef-2f10-41e7-8f09-b212f896bc9b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 21:42:39.025316+00	
00000000-0000-0000-0000-000000000000	2c3c49c6-5f94-47f8-9f50-e05226615190	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 09:24:29.066441+00	
00000000-0000-0000-0000-000000000000	0b785170-fd44-4709-bc29-2193207ea3fd	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 09:24:29.069249+00	
00000000-0000-0000-0000-000000000000	64bf44bc-aff8-414e-8f57-d602872abaaf	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 10:26:40.892004+00	
00000000-0000-0000-0000-000000000000	e3811dfd-59cf-4ee1-89ba-a217236f9406	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 10:26:40.892788+00	
00000000-0000-0000-0000-000000000000	0291008d-cc43-4ee3-beca-9fb178163769	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 15:56:32.929227+00	
00000000-0000-0000-0000-000000000000	8036cdb9-6cd1-4a8f-a3dd-0cec9634ad5c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 15:56:32.931378+00	
00000000-0000-0000-0000-000000000000	f1cef7f6-37ad-4dd7-b959-858941caa6a7	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 16:54:55.270812+00	
00000000-0000-0000-0000-000000000000	3d8a22e1-dc50-4884-af0a-2d713f38e805	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 16:54:55.272418+00	
00000000-0000-0000-0000-000000000000	34af2a32-bcb0-4d5e-981e-99285a3bd17d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 17:59:29.980655+00	
00000000-0000-0000-0000-000000000000	bbf236d0-35de-40e1-aa72-9aa2ca67141e	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 17:59:29.982098+00	
00000000-0000-0000-0000-000000000000	6083c93f-868c-479b-8c96-52c3c0253b8a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 17:01:26.191282+00	
00000000-0000-0000-0000-000000000000	38d0a97d-1a27-4bf1-9907-f926598e84e1	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 17:01:26.201363+00	
00000000-0000-0000-0000-000000000000	0ede4c7f-5755-49c1-bc97-f2d81cd6fdea	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 06:53:00.897119+00	
00000000-0000-0000-0000-000000000000	10a19c89-cb20-478c-a1f5-242b5978dafc	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 06:53:00.899957+00	
00000000-0000-0000-0000-000000000000	83a60261-b760-4e73-b7e6-4cbc254d6ea4	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 11:52:29.698185+00	
00000000-0000-0000-0000-000000000000	2fd84ed2-f12a-40b7-a55f-e14a27b0febf	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 11:52:29.700286+00	
00000000-0000-0000-0000-000000000000	92287b30-479a-493d-a2ba-34cfc4bf6ccc	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 15:52:29.726812+00	
00000000-0000-0000-0000-000000000000	7c0251a7-66ae-4d28-82bd-2ceff5014356	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 15:52:29.728229+00	
00000000-0000-0000-0000-000000000000	f8447557-b7ee-4506-846c-f4fd5e11eb73	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 19:49:34.757233+00	
00000000-0000-0000-0000-000000000000	bd00a125-77b3-4b1f-9184-d16278293444	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 19:49:34.759289+00	
00000000-0000-0000-0000-000000000000	9bad9cc0-7fa0-47f8-ae9f-55e62a9cd21c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 20:50:25.937316+00	
00000000-0000-0000-0000-000000000000	4f8455b4-0ede-480b-8ac1-f374f3f4c7ff	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 20:50:25.938828+00	
00000000-0000-0000-0000-000000000000	e32819c0-3cd4-4a56-90ce-eedaca1ea04d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 21:49:04.73295+00	
00000000-0000-0000-0000-000000000000	3658906d-a8ee-43bf-a753-8f2de8065aa7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 21:49:04.733821+00	
00000000-0000-0000-0000-000000000000	8a584b9e-e13e-42f1-8ce3-197d97244f73	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 22:48:28.954626+00	
00000000-0000-0000-0000-000000000000	9579e2b5-82f3-4b22-b02b-2cecd40f5328	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 22:48:28.956058+00	
00000000-0000-0000-0000-000000000000	98db9bdd-eae1-49e1-b0d1-f4b71f51735a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 15:30:13.820387+00	
00000000-0000-0000-0000-000000000000	7fa7cd6a-e814-456b-bc38-7b25d4fc3dd4	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 15:30:13.8272+00	
00000000-0000-0000-0000-000000000000	8288beeb-3837-4b39-b997-bdb53be2b7e1	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 16:28:56.761684+00	
00000000-0000-0000-0000-000000000000	f20d9b12-6ffd-4336-a586-a55ddcc5fdab	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 16:28:56.763774+00	
00000000-0000-0000-0000-000000000000	84042f7b-38ca-4822-9701-9cec6a04ee93	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 17:29:26.614706+00	
00000000-0000-0000-0000-000000000000	bf08d478-d429-4360-b24d-a845abd3a462	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 17:29:26.617216+00	
00000000-0000-0000-0000-000000000000	6283d1de-83cd-40c5-b430-9c7f07081c11	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 23:53:11.703495+00	
00000000-0000-0000-0000-000000000000	9626de18-4572-49f5-aa86-414bf079c66b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 23:53:11.715295+00	
00000000-0000-0000-0000-000000000000	e389bd0e-9130-4e8f-8407-c2298720b3cc	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 00:52:07.410633+00	
00000000-0000-0000-0000-000000000000	d12b863d-b2c0-4f6e-be8d-3441f46bbdcd	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 00:52:07.415413+00	
00000000-0000-0000-0000-000000000000	c203a2b3-7491-4ea1-acd5-5c8d5120722a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 01:50:59.751207+00	
00000000-0000-0000-0000-000000000000	b58b3959-281d-42b8-895e-7e0734592287	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 01:50:59.752008+00	
00000000-0000-0000-0000-000000000000	236464f1-e804-4b4b-87d0-f756bd3c9b1d	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 02:24:53.487021+00	
00000000-0000-0000-0000-000000000000	d9c67a54-5fd7-4e76-9125-0989e7798092	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 02:50:07.263363+00	
00000000-0000-0000-0000-000000000000	bd5b876c-2394-4d1b-ab22-948788b864ad	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 02:50:07.266895+00	
00000000-0000-0000-0000-000000000000	68c9d0fb-8a91-4ebb-9565-bdeb6d7bc363	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-07 21:30:14.86616+00	
00000000-0000-0000-0000-000000000000	94c9f9bb-7bb8-423d-be4b-264d60aa3326	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 22:28:59.50283+00	
00000000-0000-0000-0000-000000000000	b8ba3c4b-b596-46f8-b2c9-d34e56f703f3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 22:28:59.506336+00	
00000000-0000-0000-0000-000000000000	ab298c32-b94f-432c-b991-09d7f6ad2c10	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-07-07 22:36:21.572254+00	
00000000-0000-0000-0000-000000000000	5a301518-5cc3-42ea-8d87-104e82141955	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 01:56:58.15628+00	
00000000-0000-0000-0000-000000000000	f630b4e3-7547-4e3c-8fad-caccf05c2685	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 01:57:45.658158+00	
00000000-0000-0000-0000-000000000000	928fa7b2-faed-4aa1-8894-d8b3b26ebc1b	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 18:12:37.665551+00	
00000000-0000-0000-0000-000000000000	842460a1-8ad7-475b-87c5-e032dc6182f2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 18:12:37.678941+00	
00000000-0000-0000-0000-000000000000	c4054c5c-ea35-4270-abdb-271a469fe034	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:11:58.93269+00	
00000000-0000-0000-0000-000000000000	1904a77d-72db-4d03-bcb8-dc4796e94390	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:11:58.935472+00	
00000000-0000-0000-0000-000000000000	90d9b261-57f3-407d-9691-7f9e5e8f8493	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 20:09:58.849715+00	
00000000-0000-0000-0000-000000000000	a914a013-95c2-48f6-a9e6-65ebc2198f00	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 20:09:58.851204+00	
00000000-0000-0000-0000-000000000000	1fbc36bf-b929-4e64-bdf3-1aaf68755a3f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 21:08:14.390228+00	
00000000-0000-0000-0000-000000000000	43cb1a73-ee5c-4b65-8a5f-327ea4743cc7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 21:08:14.392317+00	
00000000-0000-0000-0000-000000000000	76d682bb-0ff4-455d-92a2-d28287776399	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 22:06:40.204692+00	
00000000-0000-0000-0000-000000000000	1bbc0c64-00b4-4fc1-83d8-c360e5e2f31b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 22:06:40.207081+00	
00000000-0000-0000-0000-000000000000	2c5508d2-33f8-4ea9-bbc6-0b34ad7a726c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 23:05:44.321236+00	
00000000-0000-0000-0000-000000000000	7594a491-5676-4e5c-837c-c999aecd59c5	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 23:05:44.323374+00	
00000000-0000-0000-0000-000000000000	c6a41106-d017-402e-a66b-3d2cc12c3680	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 00:04:07.990349+00	
00000000-0000-0000-0000-000000000000	f5904c1f-2034-461f-bd8e-43c0113f6b9f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 00:04:07.993061+00	
00000000-0000-0000-0000-000000000000	c4c22e1e-ba69-4a5f-8af0-5c0c1a8178bc	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:24:38.15581+00	
00000000-0000-0000-0000-000000000000	f34aa649-b027-452b-8197-a8a087984b24	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:24:38.165463+00	
00000000-0000-0000-0000-000000000000	9499de53-5bd3-4cb5-b404-8e3f5ae6ab68	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:42:52.103914+00	
00000000-0000-0000-0000-000000000000	99f52bc8-a63f-4ed3-bcd4-b24c94f83a5e	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:42:52.106078+00	
00000000-0000-0000-0000-000000000000	7d705dd2-b37b-459d-847e-3b9fc2fa92f4	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 14:41:17.721303+00	
00000000-0000-0000-0000-000000000000	5415fcfc-691f-4971-9ab6-f2603f1aa293	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 14:41:17.722163+00	
00000000-0000-0000-0000-000000000000	9fb6d851-fc7e-48e3-8d22-a417f64cf03a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 15:39:45.78987+00	
00000000-0000-0000-0000-000000000000	a105b2c4-fad3-414c-b4dd-dd06c57fe95a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 15:39:45.791586+00	
00000000-0000-0000-0000-000000000000	1caf1211-f6eb-4ae1-906d-3df93d00c138	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 16:37:45.800506+00	
00000000-0000-0000-0000-000000000000	eb33b2ae-a652-449d-a75b-751be99986fa	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 16:37:45.803141+00	
00000000-0000-0000-0000-000000000000	9e8219d9-1f81-4922-a791-8cd0d3d98d36	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 05:45:42.159314+00	
00000000-0000-0000-0000-000000000000	6d0c31d0-8532-4f87-91ff-fdff8ef942c2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 05:45:42.163464+00	
00000000-0000-0000-0000-000000000000	dc627add-81c3-4a48-97da-bc6144ade9a0	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 08:31:45.242345+00	
00000000-0000-0000-0000-000000000000	80ed8cf7-4dbb-49c6-9361-1d822cde60a1	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 08:31:45.256805+00	
00000000-0000-0000-0000-000000000000	f85d8f56-be9e-415f-a331-28c8fa4f4b57	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 15:17:48.837849+00	
00000000-0000-0000-0000-000000000000	ad682f50-f475-4c20-8211-b8f2c7d858bd	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 15:17:48.847987+00	
00000000-0000-0000-0000-000000000000	1ea8715a-11ff-4f5e-808b-29e40a96df7f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:34:48.360756+00	
00000000-0000-0000-0000-000000000000	384ecada-6d14-4a60-b0a7-1eedc0fc8c57	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:34:48.364204+00	
00000000-0000-0000-0000-000000000000	de140a8f-318c-4aba-90af-68b1b9781832	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 22:33:33.51198+00	
00000000-0000-0000-0000-000000000000	ecfe4c22-906f-4539-a1af-de9c82e3940f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 22:33:33.513341+00	
00000000-0000-0000-0000-000000000000	f719c728-0ba2-46c1-b57e-1f3eb784d525	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 23:32:57.512078+00	
00000000-0000-0000-0000-000000000000	886f3934-7222-4c50-86af-e56daffe7420	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 23:32:57.512943+00	
00000000-0000-0000-0000-000000000000	ce8209a4-e33f-4796-aa3d-30258f489e6c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 05:47:20.924337+00	
00000000-0000-0000-0000-000000000000	7cd66089-ea59-4f40-84f3-df8e85110a03	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 05:47:20.927754+00	
00000000-0000-0000-0000-000000000000	8900b27b-5234-4a38-a5a1-f7167f9067de	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:45:30.481794+00	
00000000-0000-0000-0000-000000000000	ade4dc6e-dcb5-41c5-9e08-005eb95d1c5b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:45:30.488536+00	
00000000-0000-0000-0000-000000000000	5394ed81-0c11-4d2e-9052-db4cf2e906bb	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:44:40.212277+00	
00000000-0000-0000-0000-000000000000	d6db7e5d-a5af-4161-96a6-9d05b48e1674	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:44:40.22328+00	
00000000-0000-0000-0000-000000000000	66441966-a313-46c2-887e-416fa32b3161	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 08:11:45.063963+00	
00000000-0000-0000-0000-000000000000	50c61b18-3ada-47e7-8002-b261d055b779	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:21:01.070135+00	
00000000-0000-0000-0000-000000000000	3992a1c9-2b36-4f4c-b531-b88bc4e200ed	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:21:01.074002+00	
00000000-0000-0000-0000-000000000000	4b2afa00-1023-43b0-8502-0d37bfba15e3	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:21:01.285115+00	
00000000-0000-0000-0000-000000000000	94679f1d-8a44-46f3-a0b8-8b5acae8785d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:21:01.287831+00	
00000000-0000-0000-0000-000000000000	34402282-0661-4e89-977d-56b822232a25	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 22:21:07.618127+00	
00000000-0000-0000-0000-000000000000	eb04085d-870b-472e-92b6-fd14e1bbf59c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 22:21:07.625015+00	
00000000-0000-0000-0000-000000000000	624c8ef7-8707-40e4-a728-6c7f539b0961	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 22:21:08.988977+00	
00000000-0000-0000-0000-000000000000	dca4448a-da27-467f-98be-7e1808868f78	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 22:21:14.056555+00	
00000000-0000-0000-0000-000000000000	87159bd4-eb54-4bdb-875c-744bbda22d55	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 19:13:26.606898+00	
00000000-0000-0000-0000-000000000000	82815f2d-2372-4a56-a190-125ebc7b1662	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 19:13:26.617989+00	
00000000-0000-0000-0000-000000000000	93e80ac7-9916-4e5e-8376-7edd26ab8e2e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:12:31.931954+00	
00000000-0000-0000-0000-000000000000	b05b2d3e-4f3f-44da-a180-bb3b123a6f4c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:12:31.939521+00	
00000000-0000-0000-0000-000000000000	9b9f60d7-50ef-4553-95af-d9aae33052ac	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 21:11:39.830415+00	
00000000-0000-0000-0000-000000000000	329ea2fa-f801-4170-a999-00996b9a7353	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 21:11:39.834405+00	
00000000-0000-0000-0000-000000000000	8a29ed41-baee-4822-ab7c-13cc774eaac8	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 00:20:30.473226+00	
00000000-0000-0000-0000-000000000000	31f19dd5-4954-4d5e-93e4-007aa4087eb3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 00:20:30.479811+00	
00000000-0000-0000-0000-000000000000	a133e9ad-4e16-4ed2-a1a3-e6bfaf30a68c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 07:52:06.243445+00	
00000000-0000-0000-0000-000000000000	427c6019-8e75-45c0-b768-0410fc4e4f95	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 07:52:06.249849+00	
00000000-0000-0000-0000-000000000000	499a4038-a678-4aa4-8ca6-5b636fc3c449	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 15:32:57.747866+00	
00000000-0000-0000-0000-000000000000	d8c873ff-5069-45df-bb60-45ebf4955299	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 15:32:57.757556+00	
00000000-0000-0000-0000-000000000000	f346c3bb-406f-410a-a3ec-2f029f87dd15	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 04:10:11.753551+00	
00000000-0000-0000-0000-000000000000	eef6408a-7884-4273-a0e8-dedb99ee6cea	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 04:10:11.764531+00	
00000000-0000-0000-0000-000000000000	e3b3f084-0b50-446f-ae5e-6a8c240efda0	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 05:08:59.897607+00	
00000000-0000-0000-0000-000000000000	f80fb27a-954e-4e04-90f8-ace9e1c60a72	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 05:08:59.899093+00	
00000000-0000-0000-0000-000000000000	fe289434-583b-453d-b8f1-d16c396f34fc	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 06:08:23.912656+00	
00000000-0000-0000-0000-000000000000	bbc05d75-b485-4f96-9c1f-d7e60ca0db84	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 06:08:23.914485+00	
00000000-0000-0000-0000-000000000000	38fc094d-2421-4407-95b8-7fefdf5858b8	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 07:18:00.566737+00	
00000000-0000-0000-0000-000000000000	0758e09e-196e-4143-8496-11aa0b5c3787	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:17:49.37646+00	
00000000-0000-0000-0000-000000000000	c2d09f88-e0af-4a4e-a2aa-855f346abc84	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:17:49.390335+00	
00000000-0000-0000-0000-000000000000	19db93b8-506d-4e28-a427-3274c9098b5c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:54:41.305527+00	
00000000-0000-0000-0000-000000000000	d94145ce-7b36-43bf-ba99-f3bb84900e69	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:54:41.311127+00	
00000000-0000-0000-0000-000000000000	3fc25092-a2db-4b44-97ad-2fdf214c2956	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:16:46.397839+00	
00000000-0000-0000-0000-000000000000	9a936c54-b6b8-43a6-b80e-aa795bdc46c9	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:16:46.399998+00	
00000000-0000-0000-0000-000000000000	4e2b25b5-802d-48fd-b945-7204a8a26c44	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:53:18.492572+00	
00000000-0000-0000-0000-000000000000	73596027-bd54-4240-a5e4-6c68c9a08090	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:53:18.496757+00	
00000000-0000-0000-0000-000000000000	00f36697-f631-40e0-9958-dc8ee1856267	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 00:15:40.539291+00	
00000000-0000-0000-0000-000000000000	930cd6b4-b7af-4e55-b11e-ff5d47bdf6cf	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 00:15:40.541374+00	
00000000-0000-0000-0000-000000000000	2ad10b17-d5d6-456c-a0bd-2ac57dc54cef	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 00:51:48.445569+00	
00000000-0000-0000-0000-000000000000	c772f289-193e-438c-afbc-560f5b886451	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 00:51:48.447641+00	
00000000-0000-0000-0000-000000000000	e2dbc362-22c9-4d09-ac77-e95561505d76	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 01:31:59.396099+00	
00000000-0000-0000-0000-000000000000	8a109060-7592-4d9e-b41c-ca64d3875a6f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 01:31:59.399254+00	
00000000-0000-0000-0000-000000000000	b7825209-937e-4fc2-8e5f-c7df19e6d7be	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 01:50:28.383019+00	
00000000-0000-0000-0000-000000000000	ae9121ea-5c1c-4723-a06f-78be7fa37710	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 01:50:28.38557+00	
00000000-0000-0000-0000-000000000000	ca241f9c-90b4-4ba1-b13f-8a8372266115	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 02:31:34.304774+00	
00000000-0000-0000-0000-000000000000	8d39fa6c-abcc-479a-9c75-075b5a195222	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 02:31:34.306993+00	
00000000-0000-0000-0000-000000000000	2cd83334-95ef-4099-a9b0-48c3edd81522	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 02:49:23.32333+00	
00000000-0000-0000-0000-000000000000	7491e317-cba4-4678-ba8d-52fac16e13b2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 02:49:23.326423+00	
00000000-0000-0000-0000-000000000000	eba77718-1225-4c47-bcf5-fc9c21bb7775	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 03:30:04.350839+00	
00000000-0000-0000-0000-000000000000	6c9f9eb5-51eb-4720-97a6-96dfd4ad111d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 03:30:04.352871+00	
00000000-0000-0000-0000-000000000000	9b6941fb-f60b-4cc2-820a-65ba69dce9ac	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 04:06:34.504285+00	
00000000-0000-0000-0000-000000000000	d03d1d73-6fd7-431d-85bc-92b24ca02a89	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 04:06:34.50697+00	
00000000-0000-0000-0000-000000000000	6983e7d9-4d47-4469-8caa-2337f21098b7	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 04:29:28.316396+00	
00000000-0000-0000-0000-000000000000	8eb92923-c812-49cc-8994-c6137683487d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 04:29:28.320245+00	
00000000-0000-0000-0000-000000000000	06566ad1-0961-41fe-b271-ea2b1e6f46fe	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 05:05:28.697373+00	
00000000-0000-0000-0000-000000000000	f62f7198-0278-4984-b927-bf110c34672c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 05:05:28.698229+00	
00000000-0000-0000-0000-000000000000	9a6191c8-bc04-4060-8a49-2f1111040cea	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 05:28:04.70478+00	
00000000-0000-0000-0000-000000000000	4b6b3f0f-ac88-48f3-80bd-43234867fc08	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 05:28:04.706206+00	
00000000-0000-0000-0000-000000000000	553ef9e0-e06a-4f9c-bbb6-98ec08084039	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:04:08.917932+00	
00000000-0000-0000-0000-000000000000	7d4d6284-7bf5-4a17-a80e-be0d6a758a1a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:04:08.926538+00	
00000000-0000-0000-0000-000000000000	4b5a52b1-9154-4c38-91ba-4e6219273a05	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 18:17:12.271232+00	
00000000-0000-0000-0000-000000000000	934f7b79-17c8-4575-b224-c86baa2e57dc	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 18:17:12.296162+00	
00000000-0000-0000-0000-000000000000	03d92497-3694-4c70-8b5a-5054b1e7ff19	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 18:17:12.675149+00	
00000000-0000-0000-0000-000000000000	79900b06-8c39-49b0-a286-a6f6e06d986f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 19:15:43.618623+00	
00000000-0000-0000-0000-000000000000	b7b63125-05d6-46a2-8493-550f02d604b3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 19:15:43.624718+00	
00000000-0000-0000-0000-000000000000	e8cef788-78b3-4b41-9bf1-358b91a4b4da	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:16:05.662665+00	
00000000-0000-0000-0000-000000000000	e1a73a8a-e3d4-4aa9-a21e-4d0b79194043	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:16:05.665085+00	
00000000-0000-0000-0000-000000000000	e54c5953-05f4-472b-b8d0-263f1a25e22d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:16:05.839372+00	
00000000-0000-0000-0000-000000000000	9cdcc542-f00d-4c2f-9af7-89dacb02ff32	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:41:05.525583+00	
00000000-0000-0000-0000-000000000000	b7ac56af-5ffe-4967-bac5-b09f0e231d37	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:41:05.528833+00	
00000000-0000-0000-0000-000000000000	12d2e593-60f6-4e62-a112-0f454cf6ee85	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 21:42:23.00415+00	
00000000-0000-0000-0000-000000000000	51706465-b656-4247-a5d7-a7130dffd375	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:45:23.552725+00	
00000000-0000-0000-0000-000000000000	49fb4eb8-970d-488c-b791-3f9efd7750c2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:45:23.553627+00	
00000000-0000-0000-0000-000000000000	fd6b3bbe-4fca-47f7-b35e-1e1104c8a966	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:45:23.572454+00	
00000000-0000-0000-0000-000000000000	59985d2f-12a7-40c4-aedb-659328d21a8c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 22:40:47.546675+00	
00000000-0000-0000-0000-000000000000	3c8b4a9a-b660-4ccd-a649-5aa2df2091f4	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 22:40:47.54945+00	
00000000-0000-0000-0000-000000000000	acc18552-a989-47ee-9e8f-2c8e9835e929	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 02:12:36.54712+00	
00000000-0000-0000-0000-000000000000	b869ba90-2626-4742-85a2-5b891fda527b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 02:12:36.565015+00	
00000000-0000-0000-0000-000000000000	cb0ea69a-7fe9-4553-abb3-c9b7af928d2c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 03:11:10.888565+00	
00000000-0000-0000-0000-000000000000	8b0d5260-bdab-4e9a-b000-b6fcfc51fcf3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 03:11:10.89509+00	
00000000-0000-0000-0000-000000000000	81f97b6e-073b-4f1f-ae2a-dd974e684eef	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 04:09:55.883175+00	
00000000-0000-0000-0000-000000000000	e5e0b0e5-a63d-4e56-9b4f-7137653dff57	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 04:09:55.887193+00	
00000000-0000-0000-0000-000000000000	2db12650-051c-4ff7-990d-94cff40e22a9	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 05:08:40.740546+00	
00000000-0000-0000-0000-000000000000	4162949b-12f0-449d-b068-b53515e842cc	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 05:08:40.744556+00	
00000000-0000-0000-0000-000000000000	262262d3-7a73-4c3b-9418-9a16ffdbd0be	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 06:07:20.716494+00	
00000000-0000-0000-0000-000000000000	aa78623b-160d-4f9b-856c-0f1362979905	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 06:07:20.718421+00	
00000000-0000-0000-0000-000000000000	1e8a42a1-4f2c-4ffd-b07c-8cbe83d2e030	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 07:06:09.864823+00	
00000000-0000-0000-0000-000000000000	af9ba375-861a-4f26-a00d-9fe2fa72ea1f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 07:06:09.874522+00	
00000000-0000-0000-0000-000000000000	7f414bfd-e398-45dc-b3f5-95d84faf5693	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 08:04:49.716874+00	
00000000-0000-0000-0000-000000000000	1f549b4d-9960-4dbc-b594-e44bd3c57b26	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 08:04:49.719+00	
00000000-0000-0000-0000-000000000000	443e2b86-99fd-4cd3-9912-aeb0c1231a52	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 09:03:34.700749+00	
00000000-0000-0000-0000-000000000000	604b6aab-c306-414f-b5ba-d20d44377bd1	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 09:03:34.703118+00	
00000000-0000-0000-0000-000000000000	c1aae99a-6305-488c-861f-654ab21ca630	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 10:02:19.726723+00	
00000000-0000-0000-0000-000000000000	247cf5e5-683e-428b-a409-7b010a0ea5f5	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 10:02:19.729808+00	
00000000-0000-0000-0000-000000000000	96bb79bc-30c1-4194-9f00-ef584d0d8f56	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:01:04.745883+00	
00000000-0000-0000-0000-000000000000	fb0afba7-5b0e-429b-b270-76b040b14def	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:01:04.749375+00	
00000000-0000-0000-0000-000000000000	8aee1aa2-9bed-4920-b2a1-c9cf5f51e7c7	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:59:50.696331+00	
00000000-0000-0000-0000-000000000000	551292bc-720c-41b5-813e-363cda185246	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:59:50.697836+00	
00000000-0000-0000-0000-000000000000	35a92c60-da14-49ed-8329-3945e6b754d9	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 12:58:34.732751+00	
00000000-0000-0000-0000-000000000000	e2e479cf-60e8-4c98-9373-d3430c050943	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 12:58:34.735435+00	
00000000-0000-0000-0000-000000000000	f0df1f56-c229-460d-a08a-2df5b133adb6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:57:22.74224+00	
00000000-0000-0000-0000-000000000000	70ac1697-647f-4d81-99cb-fd51eb4d8ea3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:57:22.743846+00	
00000000-0000-0000-0000-000000000000	3c40517b-0cfa-4d57-8725-65b2ef5bbf57	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:56:28.908184+00	
00000000-0000-0000-0000-000000000000	d187774a-cec6-45e9-b82f-8995aa6e6308	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:56:28.911455+00	
00000000-0000-0000-0000-000000000000	7520417f-98b9-4853-8a23-7dcc0cb09f0b	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 15:55:18.266972+00	
00000000-0000-0000-0000-000000000000	e9c5e1a3-ccfc-4e9d-a66e-a053ffc2b5f4	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 15:55:18.271695+00	
00000000-0000-0000-0000-000000000000	5ae2ac29-0bc6-4fd6-ac5b-48d878e5a075	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:53:34.079078+00	
00000000-0000-0000-0000-000000000000	abd14ebb-0b57-4160-96ef-a9d127d81821	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:53:34.080575+00	
00000000-0000-0000-0000-000000000000	3e87229d-86c7-41de-83d8-b9194a130999	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:20:38.076914+00	
00000000-0000-0000-0000-000000000000	5cb7c83a-0a1b-4fdd-8949-6e04180f3a93	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:20:38.079405+00	
00000000-0000-0000-0000-000000000000	00492c02-e1d2-4ba0-aad3-f484a3a446b2	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 19:18:59.189606+00	
00000000-0000-0000-0000-000000000000	25efa71a-690c-4d92-a1fa-34aa2b1b1759	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 19:18:59.193618+00	
00000000-0000-0000-0000-000000000000	02378798-b8d7-4a97-8d2e-717906c5a356	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 04:01:08.314553+00	
00000000-0000-0000-0000-000000000000	64fb9ce2-1098-452c-838d-fcd196a20db4	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 04:01:08.334047+00	
00000000-0000-0000-0000-000000000000	81813997-d95e-495b-8af0-ac5de13f3510	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:34:11.222341+00	
00000000-0000-0000-0000-000000000000	dbd2aa2f-6362-4dad-aeb0-d6aa3a30fcc4	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:34:11.241366+00	
00000000-0000-0000-0000-000000000000	13e3f9b8-fc22-45d1-a913-f7c00cfeecbd	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:33:22.149084+00	
00000000-0000-0000-0000-000000000000	2a5fbb02-7c2e-456c-9be1-62eb33a79a80	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:33:22.152775+00	
00000000-0000-0000-0000-000000000000	8c13dcb1-fd13-41c4-b98b-fd568692bad2	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 17:31:53.335248+00	
00000000-0000-0000-0000-000000000000	d9b7287d-9d85-4da5-8a0c-31b375b57440	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 17:31:53.339506+00	
00000000-0000-0000-0000-000000000000	f4172c50-f794-47e4-9245-fda6dc9b746a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 19:05:37.62214+00	
00000000-0000-0000-0000-000000000000	2978c30a-891e-4a2e-bd50-8b0c8738525a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 19:05:37.627169+00	
00000000-0000-0000-0000-000000000000	d36f91e3-0e55-446e-bc0e-2ff5849c5e09	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:11:58.172521+00	
00000000-0000-0000-0000-000000000000	bc3832eb-af4f-481d-95f7-a27d7053dcf5	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:11:58.180214+00	
00000000-0000-0000-0000-000000000000	01b8d085-cf81-4ea0-bbc3-9e8993cd29bc	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:30:24.826804+00	
00000000-0000-0000-0000-000000000000	2676d25c-8ea0-4fee-b058-9eaa2583f2ac	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:30:24.828885+00	
00000000-0000-0000-0000-000000000000	52d81c05-00d0-48cc-94bf-74ed50500eb6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:10:50.183807+00	
00000000-0000-0000-0000-000000000000	e36cb643-cfdd-4211-a893-ad9c1b5b3cc5	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:10:50.189165+00	
00000000-0000-0000-0000-000000000000	87161838-1da8-4552-aebb-715e90e66a21	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:29:02.378555+00	
00000000-0000-0000-0000-000000000000	b4ddbaa7-f71b-42bc-962d-12e2618a2d67	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:29:02.380137+00	
00000000-0000-0000-0000-000000000000	bf1f176b-66bc-40b8-a7f9-c498c9a77e69	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 22:09:43.492368+00	
00000000-0000-0000-0000-000000000000	d67b1045-b9bd-4256-b410-71c081019798	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 22:09:43.495608+00	
00000000-0000-0000-0000-000000000000	53bb55ac-48da-4d55-8fa0-ea5d30793175	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 22:28:32.479667+00	
00000000-0000-0000-0000-000000000000	58102067-221e-46ba-8320-abeb558cdf91	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 22:28:32.482203+00	
00000000-0000-0000-0000-000000000000	525acc18-0075-48eb-b72c-65afb5641080	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 15:10:58.260039+00	
00000000-0000-0000-0000-000000000000	e1a056d6-16bf-4dbf-9d72-eadc76c705ea	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 15:10:58.275346+00	
00000000-0000-0000-0000-000000000000	ca0eeb2c-00a0-4b06-b395-ddb95c6ecb3e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 15:10:59.11847+00	
00000000-0000-0000-0000-000000000000	e485b640-c7a7-495e-aaff-fd17207b76ce	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 15:10:59.119034+00	
00000000-0000-0000-0000-000000000000	951ae65b-21b7-4792-825c-492fa272bbb5	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 16:09:47.846642+00	
00000000-0000-0000-0000-000000000000	e9582d53-eb67-4f1a-a695-55cd46d44dcc	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 16:09:47.85069+00	
00000000-0000-0000-0000-000000000000	1276c7a8-7358-40b3-8de9-9f6bc885f89c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 16:22:52.047019+00	
00000000-0000-0000-0000-000000000000	e1a34b69-2801-4906-bfbf-3cf09212eea9	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 16:22:52.050671+00	
00000000-0000-0000-0000-000000000000	b221755f-1f1e-495e-b337-e8383bfc44ca	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:57:59.484708+00	
00000000-0000-0000-0000-000000000000	4807d5ab-e21e-4813-839b-8506dfc8b0f8	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:57:59.501142+00	
00000000-0000-0000-0000-000000000000	36db896e-9226-4fd1-93a7-689ca7e69361	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:58:30.795778+00	
00000000-0000-0000-0000-000000000000	fe6071b1-a72e-4c22-8706-a20df257cd3b	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:58:30.796425+00	
00000000-0000-0000-0000-000000000000	0ae70025-3b19-4ff5-8a58-6cd6a1f68664	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:43:41.961561+00	
00000000-0000-0000-0000-000000000000	1643b708-0865-4c1e-96de-b290f8e20934	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:43:41.983231+00	
00000000-0000-0000-0000-000000000000	568c8c0a-66d2-49a1-a9ae-60f5ca96b65a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:43:42.678414+00	
00000000-0000-0000-0000-000000000000	24c25392-18ff-4108-9f7f-114619c37549	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:43:42.679039+00	
00000000-0000-0000-0000-000000000000	45440930-aa7f-4a2a-be19-c7553925beeb	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 16:42:15.306647+00	
00000000-0000-0000-0000-000000000000	06bb9441-629b-490f-878a-9d57c426d009	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 16:42:15.317787+00	
00000000-0000-0000-0000-000000000000	36bbba37-d5d8-479f-90ac-e63f97b51687	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 16:42:20.997447+00	
00000000-0000-0000-0000-000000000000	f3cbc235-ebc2-4ac0-b7e4-f09257133ca3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 16:42:20.998023+00	
00000000-0000-0000-0000-000000000000	df1d2f48-159a-4520-b62b-d12715430343	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 17:40:15.453701+00	
00000000-0000-0000-0000-000000000000	4c35ea00-6cd7-4535-982b-dcd95c54b08d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 17:40:15.461554+00	
00000000-0000-0000-0000-000000000000	790eaec0-9998-411e-a0c0-a43d34d095f5	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 18:39:27.41377+00	
00000000-0000-0000-0000-000000000000	d22d68d2-3c61-41e9-bbeb-3a25b0eeac3a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 18:39:27.4177+00	
00000000-0000-0000-0000-000000000000	b4a64048-88b3-40c1-ba8a-57b3f4e25fd8	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 19:37:37.169776+00	
00000000-0000-0000-0000-000000000000	ae72b5b7-2678-407e-a024-16a083ef8c35	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 19:37:37.175287+00	
00000000-0000-0000-0000-000000000000	bc35bc70-820a-4113-a638-d97409e00e10	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 20:35:42.373774+00	
00000000-0000-0000-0000-000000000000	8c817e19-8620-4ce4-a86c-6fdd98a7ac90	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 20:35:42.387323+00	
00000000-0000-0000-0000-000000000000	cea1b529-0ac8-4bb8-b71d-ac5b1773a818	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 21:34:27.534419+00	
00000000-0000-0000-0000-000000000000	0d850725-a546-4ef4-a991-95a89b248ab3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 21:34:27.543427+00	
00000000-0000-0000-0000-000000000000	04d5cddb-e617-46a0-853b-b273f4d0f137	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 22:47:31.415389+00	
00000000-0000-0000-0000-000000000000	7a130e77-60b1-49b3-aad7-a21d640bf559	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 22:47:31.420932+00	
00000000-0000-0000-0000-000000000000	ad36eaff-2e20-4f96-8cfb-0b8989f25026	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 23:46:05.302803+00	
00000000-0000-0000-0000-000000000000	64ac3ba9-41b9-4e9f-a27b-7473c1b40772	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 23:46:05.308787+00	
00000000-0000-0000-0000-000000000000	e2658ffc-b7a7-46a0-a878-4563ff3449a4	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 01:39:19.51841+00	
00000000-0000-0000-0000-000000000000	7d2b762c-4940-4744-9fab-c3b6feb884a7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 01:39:19.527307+00	
00000000-0000-0000-0000-000000000000	9185e26e-f51b-4545-87e8-05f791d673e9	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 18:24:20.431008+00	
00000000-0000-0000-0000-000000000000	0f039b9a-8f0f-445f-b37f-95b90ef2008a	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 18:24:20.443417+00	
00000000-0000-0000-0000-000000000000	0caf1622-84d2-49a4-bdf9-953eb12c1167	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 19:44:40.266323+00	
00000000-0000-0000-0000-000000000000	065ec35a-eb51-43a8-abfd-e6b764a12125	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 19:44:40.276136+00	
00000000-0000-0000-0000-000000000000	e53e5ce1-a004-4906-9269-7c9668333fc3	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:50:45.348073+00	
00000000-0000-0000-0000-000000000000	36edca11-38d7-4fa6-95bf-a8a399bb613c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:50:45.356902+00	
00000000-0000-0000-0000-000000000000	0d2b9244-fd13-4e72-812a-9dca3d8dc2aa	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:49:29.488586+00	
00000000-0000-0000-0000-000000000000	704258df-9056-461b-b7e9-1f51955fc863	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:49:29.491253+00	
00000000-0000-0000-0000-000000000000	cb88e3d2-d91c-421d-97af-de34e0ec5dca	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 22:48:01.186429+00	
00000000-0000-0000-0000-000000000000	0a3d0bfd-fac9-413d-ba0d-d1b9964bbf2c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 22:48:01.188892+00	
00000000-0000-0000-0000-000000000000	c5aca0f4-103d-4f04-87e9-afbba55910bd	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 01:19:12.204644+00	
00000000-0000-0000-0000-000000000000	51e885bb-eff7-4f13-a190-752b287a3138	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 01:19:12.207714+00	
00000000-0000-0000-0000-000000000000	95800d20-02cb-4cbe-90cc-c21f8ec2f169	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 01:19:14.247786+00	
00000000-0000-0000-0000-000000000000	ace7e3c8-c1f5-4e15-97ba-38a0adb79a45	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 02:17:55.632987+00	
00000000-0000-0000-0000-000000000000	a48ceba9-d90b-4eb4-ada7-f34a15f2ac52	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 02:17:55.641268+00	
00000000-0000-0000-0000-000000000000	0de9b645-3348-444e-a45b-1a04fed1f9ee	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 07:00:41.741535+00	
00000000-0000-0000-0000-000000000000	e4115f61-6a6c-43ac-bc9a-2a75016481d7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 07:00:41.755192+00	
00000000-0000-0000-0000-000000000000	cebf82e6-fa9a-4af6-97f2-02fb7a1b43fe	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:08:16.699052+00	
00000000-0000-0000-0000-000000000000	19f404c4-45d8-4288-afc9-cbf35301f3a7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:08:16.708931+00	
00000000-0000-0000-0000-000000000000	c035041d-ea3e-4045-b496-7d092e42ca2e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 16:07:25.895199+00	
00000000-0000-0000-0000-000000000000	1f972322-85af-4607-9864-3ff154b2f048	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 16:07:25.897565+00	
00000000-0000-0000-0000-000000000000	d686fe41-64ea-4694-ab7c-f76068287e0e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:06:09.052828+00	
00000000-0000-0000-0000-000000000000	210eaab5-4d06-4282-80bf-23837eb311d2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:06:09.057711+00	
00000000-0000-0000-0000-000000000000	2247db73-d9f3-4d26-abd2-2c6829c3be9f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 18:04:33.305685+00	
00000000-0000-0000-0000-000000000000	6a0e57fb-069c-4815-9aab-fc07b7018f54	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 18:04:33.312104+00	
00000000-0000-0000-0000-000000000000	897745c0-03af-4732-bd33-fa7226f0f96f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 19:03:55.652441+00	
00000000-0000-0000-0000-000000000000	d1bbd23a-23c4-40c5-9acc-dfcd8105f970	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 19:03:55.654018+00	
00000000-0000-0000-0000-000000000000	4d875ea8-4a36-4270-a379-964896bad84e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 20:08:50.06541+00	
00000000-0000-0000-0000-000000000000	e3a9afdd-cfca-40ef-8a43-378f2345ba8d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 20:08:50.070036+00	
00000000-0000-0000-0000-000000000000	0689d48c-1fef-49bc-8dd9-1286891a3c24	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 21:07:19.162827+00	
00000000-0000-0000-0000-000000000000	f0250fd4-3d99-43e9-8cac-2c743b8eb704	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 21:07:19.166096+00	
00000000-0000-0000-0000-000000000000	50c1be0b-2ae2-48bb-93ab-0a6370af4c03	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 22:06:10.62277+00	
00000000-0000-0000-0000-000000000000	bc65e717-efc2-43cd-8d9d-f6fc816b3b70	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 22:06:10.624768+00	
00000000-0000-0000-0000-000000000000	95389d28-536d-4df8-b585-1cd4e99348c6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 23:05:18.632061+00	
00000000-0000-0000-0000-000000000000	7f4b483a-5b18-490a-b405-69188745365f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 23:05:18.63465+00	
00000000-0000-0000-0000-000000000000	ab10bd84-24a8-46d1-97fb-eba1c2f2be2f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 00:03:54.59077+00	
00000000-0000-0000-0000-000000000000	ad5d76ea-f94a-4b21-878d-ce71fbb06ba7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 00:03:54.597669+00	
00000000-0000-0000-0000-000000000000	eb2ba3bd-a781-4954-98e0-3739c0d89f44	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 01:03:19.778729+00	
00000000-0000-0000-0000-000000000000	2196c89d-53cc-469b-a2f1-8d6f2ec3d295	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 01:03:19.781451+00	
00000000-0000-0000-0000-000000000000	a8c528ef-987e-47b5-b4f2-099986c9a6bd	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 02:01:24.996091+00	
00000000-0000-0000-0000-000000000000	5ee9dcef-fc2b-4105-9fea-3876dc5c4f1d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 02:01:25.000745+00	
00000000-0000-0000-0000-000000000000	a6a4f220-5bc4-431d-ade6-781cca68947e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 03:00:20.969088+00	
00000000-0000-0000-0000-000000000000	4ba5eb62-5493-4441-ad57-d7d9165e45ac	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 03:00:20.971906+00	
00000000-0000-0000-0000-000000000000	d7a7d338-7507-4dbe-ab97-1c6a81ae2658	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 03:59:19.02342+00	
00000000-0000-0000-0000-000000000000	d0d0cb1e-20a6-4852-86b4-787a227ea84e	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 03:59:19.036808+00	
00000000-0000-0000-0000-000000000000	9413bf3a-794f-41eb-a2bd-c643a5aa6c0f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 04:57:00.44228+00	
00000000-0000-0000-0000-000000000000	7f83d50b-a351-4e63-a41c-eeb10d9edf04	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 04:57:00.445812+00	
00000000-0000-0000-0000-000000000000	1e62ace7-7cfa-4757-b9c1-56b30c8cb7f4	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 04:58:18.576481+00	
00000000-0000-0000-0000-000000000000	9cc44696-67e0-405c-b2b9-b721f71d0e0f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 04:58:18.577892+00	
00000000-0000-0000-0000-000000000000	392d2498-2733-4cea-ac2f-8c71f575c017	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 05:38:05.588802+00	
00000000-0000-0000-0000-000000000000	56fd9d1f-7895-4e4c-9d08-d02a56d963d6	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 05:38:05.591415+00	
00000000-0000-0000-0000-000000000000	f735650c-0b52-4527-bbd8-76b89b670e3a	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 05:41:34.863337+00	
00000000-0000-0000-0000-000000000000	12aa0c95-621b-42d1-b25a-31d920845f6f	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 05:54:43.399073+00	
00000000-0000-0000-0000-000000000000	da763399-d116-43f2-9e50-f6da19f94328	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 21:31:03.913477+00	
00000000-0000-0000-0000-000000000000	e896f944-c4ff-498b-b86b-1f73444186c0	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 22:29:37.700079+00	
00000000-0000-0000-0000-000000000000	b1f54451-3f38-436f-9f83-88dea2c09922	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 22:29:37.704443+00	
00000000-0000-0000-0000-000000000000	bdd8b20f-f9bf-46de-8e8d-d91a543f23b2	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 23:08:48.444427+00	
00000000-0000-0000-0000-000000000000	144bf41b-7aee-439f-bae8-240a883d775d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 23:33:04.284064+00	
00000000-0000-0000-0000-000000000000	e312576d-f368-42aa-a466-846931de928f	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 23:33:04.28816+00	
00000000-0000-0000-0000-000000000000	bf032bb0-9937-48d3-9084-d300742bb48f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 02:02:40.930645+00	
00000000-0000-0000-0000-000000000000	7d52d94b-4c1d-491e-8730-cbbc66db4292	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 02:02:40.932731+00	
00000000-0000-0000-0000-000000000000	171431ec-0111-4db4-81db-33029c8cb9ae	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 03:47:20.584534+00	
00000000-0000-0000-0000-000000000000	c61e6fb1-b3a1-469a-b586-0c2157e2a654	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 03:47:20.587175+00	
00000000-0000-0000-0000-000000000000	94c3cda2-7b06-41d8-926d-ba37e208b374	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 07:23:31.720971+00	
00000000-0000-0000-0000-000000000000	df453da8-3d13-4b39-8f90-d0e55e5f30ab	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 08:52:21.217201+00	
00000000-0000-0000-0000-000000000000	8a641b76-f309-42d0-9adc-3b3a84b8d5f7	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 08:52:21.220063+00	
00000000-0000-0000-0000-000000000000	75835b54-7f5b-4203-b69d-e389a4d9ac6e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:10.341367+00	
00000000-0000-0000-0000-000000000000	6d34d220-d92e-4cf5-a3a8-69b81f4f56ff	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:10.359383+00	
00000000-0000-0000-0000-000000000000	ab355041-bfd7-49f7-b8f2-0bb39538f4fa	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:10.408878+00	
00000000-0000-0000-0000-000000000000	ce59c019-f12d-413c-a3ff-b7e7c1b54a61	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:11.815922+00	
00000000-0000-0000-0000-000000000000	f9b43652-9bf6-4932-b401-9e11f11e02fb	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:12.062984+00	
00000000-0000-0000-0000-000000000000	5410fecd-80f7-42c3-83ff-9354ebc5caa6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 18:48:12.185385+00	
00000000-0000-0000-0000-000000000000	3800ffc4-e682-4992-8062-fcb0071338cd	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 20:28:16.316631+00	
00000000-0000-0000-0000-000000000000	ff020858-2d63-48e4-9a4f-4e5c5d699ad9	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 20:28:16.325248+00	
00000000-0000-0000-0000-000000000000	b2ebbcae-1d4b-4d41-9572-81eb39305f82	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 21:26:16.741733+00	
00000000-0000-0000-0000-000000000000	5fc276ec-3145-411c-9114-6dfb8cffea55	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 21:26:16.746583+00	
00000000-0000-0000-0000-000000000000	080e8f44-b931-457a-80d0-42bebeef5f65	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 00:38:12.303646+00	
00000000-0000-0000-0000-000000000000	a47b42de-f89d-435c-9132-7414ea353ab2	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 00:38:12.311708+00	
00000000-0000-0000-0000-000000000000	795cec09-c34c-410f-a473-c68d5dc96aa6	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 01:36:54.762607+00	
00000000-0000-0000-0000-000000000000	d77a2c34-ef3b-450e-b293-d956b541e766	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 01:36:54.764604+00	
00000000-0000-0000-0000-000000000000	71dd0bb7-f8f0-4d0b-8d7e-f967c9ff242b	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 01:56:03.145244+00	
00000000-0000-0000-0000-000000000000	57deeee5-a353-4afa-a08c-834936ca322c	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 02:59:39.313998+00	
00000000-0000-0000-0000-000000000000	0087fc3e-3cd4-410a-998f-64524e581e94	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 02:59:39.317515+00	
00000000-0000-0000-0000-000000000000	3a42b2aa-5ee1-46df-a693-11d02c563a1e	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 03:28:49.454325+00	
00000000-0000-0000-0000-000000000000	571c45b2-a1ec-4487-9b9d-04121d2577fd	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 03:28:49.456138+00	
00000000-0000-0000-0000-000000000000	aa9d48b4-7a43-4c9b-89af-4fcd51f5f88f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 03:58:53.12512+00	
00000000-0000-0000-0000-000000000000	08d0781e-80ce-4417-95dc-84a518a68ddb	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 03:58:53.127781+00	
00000000-0000-0000-0000-000000000000	844db6d3-eab2-47d3-9604-3b99a878bc7f	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 04:11:05.843265+00	
00000000-0000-0000-0000-000000000000	c7009bb7-fbe3-4cb5-a261-fd7fa513d07a	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 04:11:10.372476+00	
00000000-0000-0000-0000-000000000000	e24026b9-6d80-46ef-9110-43f7cbd5ac5e	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 04:12:00.187228+00	
00000000-0000-0000-0000-000000000000	9fdae6dc-7b19-400f-a585-09afb123db2c	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 04:13:09.339603+00	
00000000-0000-0000-0000-000000000000	9b345b88-0b21-4f6b-872b-526703a2f974	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:19:15.58032+00	
00000000-0000-0000-0000-000000000000	7f767ef6-77bb-490a-aece-6285dde63b26	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:19:15.603652+00	
00000000-0000-0000-0000-000000000000	ada1a377-a3f5-4eaa-be54-63a9f942207b	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 16:17:36.900365+00	
00000000-0000-0000-0000-000000000000	8f8d1d82-eca7-4fac-a116-c8f8956858d1	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 16:17:36.905741+00	
00000000-0000-0000-0000-000000000000	3c4c4e5d-443b-49d7-bf13-7d11acc89131	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 18:33:45.039958+00	
00000000-0000-0000-0000-000000000000	557dc7da-b1cd-4da3-ad3b-eba39aa06694	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 18:33:45.045936+00	
00000000-0000-0000-0000-000000000000	648e522f-047a-4229-9d8f-ee36e5bca12d	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:43:40.155516+00	
00000000-0000-0000-0000-000000000000	68488e28-dbd0-4e9c-835f-cc18db715e7c	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:43:40.166132+00	
00000000-0000-0000-0000-000000000000	6e7a0421-8f2f-4fd8-b350-cf1f7ac4e729	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:43:40.208186+00	
00000000-0000-0000-0000-000000000000	b0470bb0-50cf-4d25-872b-25a3cf556ff8	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-07-30 00:58:28.956759+00	
00000000-0000-0000-0000-000000000000	e86204e4-9f12-4937-b01e-19902031e494	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:58:35.338993+00	
00000000-0000-0000-0000-000000000000	545696e8-fd2c-43a5-b0be-594474bb92ab	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:58:38.34914+00	
00000000-0000-0000-0000-000000000000	699e61ea-a441-4fcd-a6a7-1b758b1b96ad	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 01:56:57.569377+00	
00000000-0000-0000-0000-000000000000	c2e3fca6-5072-4757-91db-2a7270fab6c3	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 01:56:57.576186+00	
00000000-0000-0000-0000-000000000000	456cf685-1a65-44f5-8370-b887a462c2a3	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:55:00.674983+00	
00000000-0000-0000-0000-000000000000	000682e6-8ac3-44b1-a302-9dc636ddaf50	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:55:00.682071+00	
00000000-0000-0000-0000-000000000000	72bc53a7-7537-4359-b833-bc3500f42a09	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:35:48.530093+00	
00000000-0000-0000-0000-000000000000	870c8498-9973-4368-a671-7da008e4d9b8	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:35:48.543788+00	
00000000-0000-0000-0000-000000000000	2a691492-0b88-4615-853d-d61ee912384f	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:35:53.107467+00	
00000000-0000-0000-0000-000000000000	7bf20ef5-b5fc-4eb0-9240-3a040e5cdf36	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 16:33:55.979207+00	
00000000-0000-0000-0000-000000000000	8ff36e41-e04d-421e-970e-dffe3a2728ae	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 16:33:55.989157+00	
00000000-0000-0000-0000-000000000000	b931be02-10af-4485-bae0-8c5df6fc10b8	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 17:32:53.815289+00	
00000000-0000-0000-0000-000000000000	ac144a94-f348-4e19-b932-d1a2833d201d	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 17:32:53.82347+00	
00000000-0000-0000-0000-000000000000	1228885c-e3b2-4487-94f2-be847be3bb83	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 20:26:36.461158+00	
00000000-0000-0000-0000-000000000000	fb70a49d-47bb-41db-ba1d-0b93eed62dcc	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 20:26:36.475506+00	
00000000-0000-0000-0000-000000000000	28bf39f6-9a80-4263-b4b3-8000f8589fb2	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 21:25:50.421126+00	
00000000-0000-0000-0000-000000000000	1f94b617-7182-4e2d-b71e-f7ee400d0cb5	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 21:25:50.428698+00	
00000000-0000-0000-0000-000000000000	8953ea6c-4c74-4e8c-a47a-6e3a22ebeb5a	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 22:24:53.918141+00	
00000000-0000-0000-0000-000000000000	e8456fd1-47a8-4615-8cae-1ede463fc15e	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 22:24:53.924739+00	
00000000-0000-0000-0000-000000000000	1b86fcb5-54aa-4d59-8411-bf4b32a74119	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 23:33:00.345428+00	
00000000-0000-0000-0000-000000000000	fdce5d21-e9b6-46c8-be61-3110957f6fc0	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 23:33:00.35065+00	
00000000-0000-0000-0000-000000000000	c2ccf137-f2f7-4e11-89eb-f467e02236dd	{"action":"token_refreshed","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 00:31:01.927053+00	
00000000-0000-0000-0000-000000000000	609e3862-1324-4b04-ab32-41dd0f443597	{"action":"token_revoked","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 00:31:01.935455+00	
00000000-0000-0000-0000-000000000000	0c05ee47-b658-4eac-96d3-d44566c302ab	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@test.com","user_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","user_phone":""}}	2025-07-31 01:15:48.964219+00	
00000000-0000-0000-0000-000000000000	f269f077-24eb-4af2-9123-995ce6841029	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@restaurante.com","user_id":"c6189bde-b806-436c-a9ea-5c4691a88853","user_phone":""}}	2025-07-31 01:28:13.946791+00	
00000000-0000-0000-0000-000000000000	b2cb8e39-a30b-4513-918b-8bb8ec8d78d1	{"action":"login","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:28:13.942347+00	
00000000-0000-0000-0000-000000000000	ccd2bc7b-3768-445e-bb2b-80d457be019d	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:38:30.902815+00	
00000000-0000-0000-0000-000000000000	ae2b043c-eb9f-4997-a2cd-4161d3981f1a	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:50:57.666115+00	
00000000-0000-0000-0000-000000000000	6695d604-654f-4873-bf9e-69e07a76e1f5	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:53:24.942354+00	
00000000-0000-0000-0000-000000000000	0ba03fb4-bb52-4f20-ac27-83b4ab6b073c	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:53:28.479001+00	
00000000-0000-0000-0000-000000000000	14aad5da-321a-4b86-956f-c1e1087c4e57	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:53:33.022992+00	
00000000-0000-0000-0000-000000000000	4baac947-d5e0-44c8-9500-b2341950e66d	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:53:37.547467+00	
00000000-0000-0000-0000-000000000000	284a3945-3deb-4152-8942-93f3e4a795a1	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:57:05.041019+00	
00000000-0000-0000-0000-000000000000	ad150d18-b1e3-4ced-bb17-ad81d0cb470f	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:58:02.933014+00	
00000000-0000-0000-0000-000000000000	a29d952b-448c-4f66-a706-66fc6d1c4c89	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:58:09.161915+00	
00000000-0000-0000-0000-000000000000	efbe85f8-2e12-41fa-b5a4-7d5d8a805058	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:59:30.928378+00	
00000000-0000-0000-0000-000000000000	1a61ef88-0f71-4578-92d2-1203b1a4c065	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:59:36.87641+00	
00000000-0000-0000-0000-000000000000	881e7ac5-7ad1-4788-8877-1a8cf0094f56	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:07:48.928745+00	
00000000-0000-0000-0000-000000000000	81098640-d5a3-4106-8447-f92ee4efebb3	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:07:57.888346+00	
00000000-0000-0000-0000-000000000000	fc16a52f-a9a7-4791-bcf7-cf68aee6131a	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:08:34.904307+00	
00000000-0000-0000-0000-000000000000	1e46fda7-32c4-4df8-bcbb-07b0753153a3	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:08:35.465905+00	
00000000-0000-0000-0000-000000000000	b8fb3a0a-054d-43f0-919a-678a7257ec0f	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:09:31.889442+00	
00000000-0000-0000-0000-000000000000	38c6c21a-f05d-419a-8054-8d2db1c5a939	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:10:24.953948+00	
00000000-0000-0000-0000-000000000000	f87bbc64-3434-4ebc-bcfc-f24cd7e8f243	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:11:45.036762+00	
00000000-0000-0000-0000-000000000000	7acd60bd-1c91-455a-9b06-7a81f1a7c2b2	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:11:46.749684+00	
00000000-0000-0000-0000-000000000000	2d41ab52-3722-4199-9f06-6c6d2c6376c7	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:12:23.922745+00	
00000000-0000-0000-0000-000000000000	3ed0cd7e-a45d-4ea3-b577-4eaeec5145f6	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:12:33.060942+00	
00000000-0000-0000-0000-000000000000	1dadc3fb-13a5-4ed0-80ba-82b31609c4ea	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:14:18.896984+00	
00000000-0000-0000-0000-000000000000	66e7cfbb-eb9d-451e-b544-004807e70201	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:14:51.932256+00	
00000000-0000-0000-0000-000000000000	b99dc0b0-809c-4a23-aead-87f6ad6f204b	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:16:46.01818+00	
00000000-0000-0000-0000-000000000000	6348b32d-d147-424e-b888-4ac10b4ff47e	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:17:06.867732+00	
00000000-0000-0000-0000-000000000000	4c237ccf-b6f8-4531-b98b-f709bcd15164	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:18:02.916601+00	
00000000-0000-0000-0000-000000000000	94508776-2734-4fdd-ab39-3f6d0b7ddd28	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:20:50.89217+00	
00000000-0000-0000-0000-000000000000	9db0d376-f04e-465a-8b7a-e5291db8a5e6	{"action":"logout","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account"}	2025-07-31 02:23:45.902146+00	
00000000-0000-0000-0000-000000000000	dff6d2fb-36c7-4d9d-b435-1b7fcbe3c029	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:23:48.223084+00	
00000000-0000-0000-0000-000000000000	bb98449e-66f4-4041-b571-61705baf3159	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:23:50.458829+00	
00000000-0000-0000-0000-000000000000	7d3ba5b2-82cc-4d4e-98ce-6aa28b603da6	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:24:06.914684+00	
00000000-0000-0000-0000-000000000000	6e0056f5-45f8-4b70-8802-777b81304cf1	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:25:36.299116+00	
00000000-0000-0000-0000-000000000000	24bd3287-4bb8-4991-98d6-51452ca9f864	{"action":"logout","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account"}	2025-07-31 02:25:36.488713+00	
00000000-0000-0000-0000-000000000000	383cf302-eb91-4912-ab55-c35c6ea007f7	{"action":"login","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:25:37.030384+00	
00000000-0000-0000-0000-000000000000	2d49a4de-30fb-4781-ba1a-03af2f7bd968	{"action":"logout","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account"}	2025-07-31 02:25:37.201046+00	
00000000-0000-0000-0000-000000000000	0adb1666-ccb1-44f3-a9f7-d2e2330cb5e2	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"staff@test.com","user_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","user_phone":""}}	2025-07-31 02:25:52.000487+00	
00000000-0000-0000-0000-000000000000	89cbfe6d-1717-48bb-b52e-1d38096e9ddb	{"action":"login","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:25:52.284082+00	
00000000-0000-0000-0000-000000000000	f8bb45d9-2d0c-4b4b-b4a7-fb3fbf9298b8	{"action":"logout","actor_id":"42642c6c-e4ee-438e-98df-2c8e79581fd6","actor_username":"staff@test.com","actor_via_sso":false,"log_type":"account"}	2025-07-31 02:25:52.50461+00	
00000000-0000-0000-0000-000000000000	28e726ac-7f7b-4339-9430-d9c2baa5b924	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:27:25.910185+00	
00000000-0000-0000-0000-000000000000	ab9b5c86-a715-457b-a3d5-1e21eaed78b1	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:27:32.932403+00	
00000000-0000-0000-0000-000000000000	a9f9b4aa-2283-488b-8bda-9f6e1bf2337f	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:28:01.012264+00	
00000000-0000-0000-0000-000000000000	a479fe5d-555e-48e8-8311-4907ace545c0	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:30:05.03656+00	
00000000-0000-0000-0000-000000000000	a6ce51bf-7f95-4483-9653-471747390e5f	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:30:58.898241+00	
00000000-0000-0000-0000-000000000000	552a4323-1079-4cb9-ab33-da00a28c8ab6	{"action":"logout","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account"}	2025-07-31 02:31:00.076078+00	
00000000-0000-0000-0000-000000000000	55c1277f-84e8-414b-9dca-9c0c95251567	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:31:28.989795+00	
00000000-0000-0000-0000-000000000000	7732f3d3-a9eb-4a02-9c50-17db8af09339	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:33:52.988818+00	
00000000-0000-0000-0000-000000000000	8e1de0b6-c335-4032-bc77-dc5049a23a5f	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:34:56.971916+00	
00000000-0000-0000-0000-000000000000	967738fa-84d9-49c0-8cfd-3bca8f350d98	{"action":"login","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:35:22.904818+00	
00000000-0000-0000-0000-000000000000	8280a74e-7863-4377-9548-b721bf8cf8db	{"action":"login","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:35:28.909873+00	
00000000-0000-0000-0000-000000000000	ce726a12-250e-48f1-b3f6-71b68559a96e	{"action":"user_repeated_signup","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-31 02:35:31.971012+00	
00000000-0000-0000-0000-000000000000	4401ca59-c7f6-4527-86cd-9e0328d60281	{"action":"login","actor_id":"3b6d153f-5278-4f33-bd18-56057de0c6c9","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:35:51.897061+00	
00000000-0000-0000-0000-000000000000	91240e83-7337-41ac-8cca-9bbbe2019592	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:38:15.024027+00	
00000000-0000-0000-0000-000000000000	5c9704b5-f5ac-4490-b4c7-26232e72eae4	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:42:21.942158+00	
00000000-0000-0000-0000-000000000000	67381892-f750-4ed0-afca-45b4ae0256df	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:43:58.203467+00	
00000000-0000-0000-0000-000000000000	372ab6e3-3b70-4128-9cdb-dd725c0c25d2	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 02:48:02.893204+00	
00000000-0000-0000-0000-000000000000	bb1ab7a7-136b-4b69-b757-a7920cfa4a44	{"action":"token_refreshed","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 14:32:40.887665+00	
00000000-0000-0000-0000-000000000000	8b4fefa3-d44d-4ce4-9d29-2d16518558dd	{"action":"token_revoked","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 14:32:40.902732+00	
00000000-0000-0000-0000-000000000000	5deb384f-8e2c-4841-9273-118adfd81c23	{"action":"user_confirmation_requested","actor_id":"71c2b4d4-c5a2-4052-bd09-01ae342d27c6","actor_username":"admin@restaurant.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-31 14:36:57.848677+00	
00000000-0000-0000-0000-000000000000	420c0d71-e093-46b2-9d4e-820ef34602e7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@restaurant.local","user_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","user_phone":""}}	2025-07-31 14:37:38.839228+00	
00000000-0000-0000-0000-000000000000	0c133a6b-b08b-44b6-9cda-c3800e1101a7	{"action":"login","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 14:37:55.84281+00	
00000000-0000-0000-0000-000000000000	32d6e7c4-d4d5-438b-bce9-820c3dff3fc3	{"action":"login","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 14:37:57.8768+00	
00000000-0000-0000-0000-000000000000	c9dbb81b-afe4-40f8-803e-03bd25beb2ee	{"action":"login","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 14:38:08.643558+00	
00000000-0000-0000-0000-000000000000	861cafbd-47f7-43c5-a45a-f39d0a98d554	{"action":"login","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 14:38:20.300183+00	
00000000-0000-0000-0000-000000000000	b5de6050-b07a-458c-82be-99a5d500a663	{"action":"login","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 14:39:47.820555+00	
00000000-0000-0000-0000-000000000000	74f130a7-fc1d-4cee-a967-5b4e582f141a	{"action":"token_refreshed","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 15:37:47.586963+00	
00000000-0000-0000-0000-000000000000	5e7e8d69-1af5-4d5c-b422-324bed9a940a	{"action":"token_revoked","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 15:37:47.593256+00	
00000000-0000-0000-0000-000000000000	8982cf13-efb0-4346-ada9-c29b420d3f1a	{"action":"token_refreshed","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 17:17:01.824031+00	
00000000-0000-0000-0000-000000000000	bdaf62c6-2d61-41c7-9953-4c38f1713043	{"action":"token_revoked","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 17:17:01.832428+00	
00000000-0000-0000-0000-000000000000	35bf8e50-232a-41e7-b546-c06f56f6ae92	{"action":"token_refreshed","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 17:17:01.856494+00	
00000000-0000-0000-0000-000000000000	5beeecdd-f6bd-4746-aacb-d97c97eea09f	{"action":"token_refreshed","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 18:15:09.775548+00	
00000000-0000-0000-0000-000000000000	ca5f0f1a-8273-458d-9548-9947a44f50e4	{"action":"token_revoked","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 18:15:09.786196+00	
00000000-0000-0000-0000-000000000000	f227c160-aa86-4dfc-8536-d714c7f986d2	{"action":"token_refreshed","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 21:30:22.794497+00	
00000000-0000-0000-0000-000000000000	bc670bd3-3cef-401f-8d7d-d05ece1ada81	{"action":"token_revoked","actor_id":"e45f2d96-d209-494a-832c-c1b6aa82fe4c","actor_username":"admin@restaurant.local","actor_via_sso":false,"log_type":"token"}	2025-07-31 21:30:22.809115+00	
00000000-0000-0000-0000-000000000000	3137fa41-8885-441e-80e8-cf1a6c13b505	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 21:33:29.941968+00	
00000000-0000-0000-0000-000000000000	b886e3dd-ea41-4ccb-a24e-0caf4026aec0	{"action":"login","actor_id":"c6189bde-b806-436c-a9ea-5c4691a88853","actor_username":"admin@restaurante.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 21:33:31.326382+00	
00000000-0000-0000-0000-000000000000	d00e5dd2-951c-4c2b-a8e3-b7e8c5d9970c	{"action":"user_confirmation_requested","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-02 20:46:41.787153+00	
00000000-0000-0000-0000-000000000000	72fa8991-686c-406e-9bc7-3786a12c7d69	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:47:08.720146+00	
00000000-0000-0000-0000-000000000000	bd10c15b-69de-459f-9ee6-76b498fac915	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:48:26.911625+00	
00000000-0000-0000-0000-000000000000	bf302043-94a9-4e5c-8026-6bc3a5883fee	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:50:23.129884+00	
00000000-0000-0000-0000-000000000000	a314a5e8-5ddb-4356-8379-1ba9958dee02	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:51:06.775931+00	
00000000-0000-0000-0000-000000000000	d8b895b9-3d69-43da-afc0-519f52775d6b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:51:34.774291+00	
00000000-0000-0000-0000-000000000000	a15ef9c7-46ee-4bbc-998d-00c8de6af3d6	{"action":"user_confirmation_requested","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-02 20:52:13.917906+00	
00000000-0000-0000-0000-000000000000	763c0a42-7040-4cad-b8ad-e2df1122492e	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:52:36.98957+00	
00000000-0000-0000-0000-000000000000	d15f4865-5434-471a-bb90-dbec25e9dc89	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:52:37.493414+00	
00000000-0000-0000-0000-000000000000	5fda9291-892c-4c2d-b04f-1cb85f49bf34	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:53:09.353365+00	
00000000-0000-0000-0000-000000000000	fa8df953-ecff-4049-b1c3-d0bc9f368eb7	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-02 20:58:17.859605+00	
00000000-0000-0000-0000-000000000000	5e2e6903-735c-4aa2-8f42-e55f46cbf3ac	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:58:20.467306+00	
00000000-0000-0000-0000-000000000000	04cbc303-cb8c-43e8-94a8-9cba31317d94	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 20:58:27.069662+00	
00000000-0000-0000-0000-000000000000	4e749a93-b429-482b-a78b-36ce2ac34c03	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-02 21:18:21.918094+00	
00000000-0000-0000-0000-000000000000	2eb8eebb-3941-42cd-8e98-085166ec7369	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:18:26.76758+00	
00000000-0000-0000-0000-000000000000	5fe99b0d-4bc4-4925-8d3b-e9a432cd500f	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:19:15.224967+00	
00000000-0000-0000-0000-000000000000	70b4e6bc-1ed1-49d0-8faa-66f8db863915	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:33:10.479745+00	
00000000-0000-0000-0000-000000000000	8739a343-6aa1-455c-b80c-c6b9c4cf8c67	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:33:11.417933+00	
00000000-0000-0000-0000-000000000000	4e65e1c3-5067-4b3e-9580-512ed933dcc7	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:33:17.34809+00	
00000000-0000-0000-0000-000000000000	125020d4-90f5-478c-9b87-9f5f43899c97	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:33:22.909457+00	
00000000-0000-0000-0000-000000000000	665fb293-d7b5-4a50-8063-6f1af64b9df0	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:36:14.144655+00	
00000000-0000-0000-0000-000000000000	ca155179-489c-4d61-baa9-060147bbd230	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:36:21.763019+00	
00000000-0000-0000-0000-000000000000	dbc51917-6470-4528-b2e9-8cfd492e59db	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:42:30.907548+00	
00000000-0000-0000-0000-000000000000	686ef260-4c15-46fd-bbe1-4d09f4b63c0e	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 21:42:35.317818+00	
00000000-0000-0000-0000-000000000000	f2c397e2-0514-400f-abbb-7b3799fb3e6c	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 22:35:07.723528+00	
00000000-0000-0000-0000-000000000000	cf894896-7df1-4541-a8ba-8b6323def309	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 22:35:07.733609+00	
00000000-0000-0000-0000-000000000000	2d7f60ac-933a-4442-b1f6-2d3ada944abb	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 22:40:50.273851+00	
00000000-0000-0000-0000-000000000000	24bc5d44-2ff4-4b18-abe1-94f390d1e09d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 22:40:50.277233+00	
00000000-0000-0000-0000-000000000000	eb530a6d-cf25-430c-beb5-7988c3a598d4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 15:01:21.074484+00	
00000000-0000-0000-0000-000000000000	e674a797-1a5f-4b0a-8432-131d002bc1ed	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 15:01:21.091791+00	
00000000-0000-0000-0000-000000000000	13489fa7-b990-4769-b27b-1cad806db2bd	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:03:28.623616+00	
00000000-0000-0000-0000-000000000000	e6a8f77a-c8fa-4bc4-bc7e-fcf856ea51b3	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:03:44.751265+00	
00000000-0000-0000-0000-000000000000	76713ae5-6d0b-4f74-bd47-b12dfcffe3e2	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:03:45.085543+00	
00000000-0000-0000-0000-000000000000	ae9b90e1-1817-4969-9ac0-17eccd3d7a4e	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:03:57.50365+00	
00000000-0000-0000-0000-000000000000	fa9bae10-8ab6-41a4-8e3f-83c2fcb8db40	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:04:13.658679+00	
00000000-0000-0000-0000-000000000000	3da33380-b39f-4af8-a3d9-5e570310e806	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:04:23.508101+00	
00000000-0000-0000-0000-000000000000	18cc0a1e-7473-473a-b04e-3bf1609c8ed7	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:04:23.791163+00	
00000000-0000-0000-0000-000000000000	04e41011-5302-4c5d-b464-d41653c19e48	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:04:24.406963+00	
00000000-0000-0000-0000-000000000000	62cb6f81-0da0-4a74-b72c-c87b86a5ea6a	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:04:42.782606+00	
00000000-0000-0000-0000-000000000000	6765a7e4-8c7a-40e4-95e1-37eaefaad6ac	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:05:01.572868+00	
00000000-0000-0000-0000-000000000000	c8ff20c3-f408-4dde-9c72-2d02b3b1ff61	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:05:02.27989+00	
00000000-0000-0000-0000-000000000000	1b1a6519-df39-4477-8a0c-a8280374618e	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:05:16.544933+00	
00000000-0000-0000-0000-000000000000	aa0c7ef3-5754-4cad-981e-b8c23410906c	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:05:33.562725+00	
00000000-0000-0000-0000-000000000000	68288e03-03b1-416c-acbd-e0ae1c239639	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:05:43.66817+00	
00000000-0000-0000-0000-000000000000	5b601bd0-115f-4f18-9df4-8358f585dbc4	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:05:43.995033+00	
00000000-0000-0000-0000-000000000000	36129828-24bf-40f1-b7a1-29112367c055	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-03 15:05:44.852135+00	
00000000-0000-0000-0000-000000000000	68988e7b-1d92-4644-8483-b49c50206ff6	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-03 15:12:53.623305+00	
00000000-0000-0000-0000-000000000000	891fa02b-4005-47bd-a38b-3e864e040cb5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 16:15:47.910062+00	
00000000-0000-0000-0000-000000000000	cd20f616-40d6-4434-95fe-0d29077be8d2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 16:15:47.916228+00	
00000000-0000-0000-0000-000000000000	22cfe410-5780-4590-b766-96b6dc17e5e3	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 18:28:46.095435+00	
00000000-0000-0000-0000-000000000000	c129fa4e-a262-42b6-8033-2ca231e3fea8	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 18:28:46.105994+00	
00000000-0000-0000-0000-000000000000	0c3413ce-19fb-42da-be5c-09428df84df5	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"staff@senderos.com","user_id":"507de59b-bccf-4f10-9bf1-a7825385b05b","user_phone":""}}	2025-08-03 18:39:17.61071+00	
00000000-0000-0000-0000-000000000000	89e3e51a-3c3b-4ce1-b3e0-d59f3c4700ed	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 20:34:50.990622+00	
00000000-0000-0000-0000-000000000000	eaa4da5c-d483-4186-b994-e3362ff7805e	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 20:34:50.998897+00	
00000000-0000-0000-0000-000000000000	a754f3fb-a0fd-477c-a5a7-426ffd20f7ba	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 21:33:01.333888+00	
00000000-0000-0000-0000-000000000000	e0e9147a-3444-4321-ad96-dfdc789fa7fb	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 21:33:01.345018+00	
00000000-0000-0000-0000-000000000000	f7a0e686-50da-4293-94c3-d5d3f539bf7b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:59:18.894685+00	
00000000-0000-0000-0000-000000000000	ffb45c9b-58b5-40f4-886f-17c3f10ec942	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:59:18.898692+00	
00000000-0000-0000-0000-000000000000	02b10520-5588-4d64-9088-deeeaf6ec940	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 00:16:42.746311+00	
00000000-0000-0000-0000-000000000000	442f54be-e9d5-49c2-a136-f8c0eb4f99f1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 00:57:45.061944+00	
00000000-0000-0000-0000-000000000000	9d7fa052-ac45-4b5d-8eb6-72f533ab0dd4	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 00:57:45.067016+00	
00000000-0000-0000-0000-000000000000	5bbf8e0c-fa84-4a0d-ac2b-cb4c023e96b3	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:15:29.496094+00	
00000000-0000-0000-0000-000000000000	e51ac512-af52-4658-9de7-a10637f6708d	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:15:29.498014+00	
00000000-0000-0000-0000-000000000000	d2b79e35-84d2-447b-b4b0-b1a611e2c794	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 03:12:18.384885+00	
00000000-0000-0000-0000-000000000000	7fd53d4e-a85d-4fbe-83dc-833820f445a6	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 03:12:18.40431+00	
00000000-0000-0000-0000-000000000000	0889b267-0f7a-4a45-b880-46bd498fb334	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 04:10:20.698476+00	
00000000-0000-0000-0000-000000000000	cf34f079-0aac-4a9c-a993-b3a1a4c725d2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 04:10:20.706623+00	
00000000-0000-0000-0000-000000000000	32c560fc-2c50-4294-b0c7-84528ad1c5f6	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 04:25:27.494944+00	
00000000-0000-0000-0000-000000000000	5938c308-16dc-4d0f-836d-deed977de9cb	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 04:25:27.496368+00	
00000000-0000-0000-0000-000000000000	42627262-0adb-403a-ab9d-ac79187b7990	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 05:09:21.421153+00	
00000000-0000-0000-0000-000000000000	48631007-ff40-436b-9b10-0c94415cd2d5	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 05:09:21.421916+00	
00000000-0000-0000-0000-000000000000	74e25107-b844-43e2-a557-7acd8b312328	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 05:24:21.424376+00	
00000000-0000-0000-0000-000000000000	d10af13d-f380-48c6-8c99-5b3362e0d7aa	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 05:24:21.425158+00	
00000000-0000-0000-0000-000000000000	c47bc614-4129-4cb8-865c-429f6cf38280	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 15:57:42.567846+00	
00000000-0000-0000-0000-000000000000	2ba2e3a8-796f-427a-893e-463570e9984b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 15:57:42.589736+00	
00000000-0000-0000-0000-000000000000	3bebb04c-55fa-4dec-847e-574c34c3642a	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 16:56:37.363941+00	
00000000-0000-0000-0000-000000000000	6b793ded-a69e-4602-8cec-aec358118d38	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 16:56:37.373483+00	
00000000-0000-0000-0000-000000000000	1ce51fba-a3fc-4670-be19-fa0d01625261	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 17:18:02.453661+00	
00000000-0000-0000-0000-000000000000	5c608878-c140-47e3-8f6b-681361fe1beb	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 17:18:02.462938+00	
00000000-0000-0000-0000-000000000000	314904e2-8589-4d43-8977-2b92dc0e4896	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:16:49.31841+00	
00000000-0000-0000-0000-000000000000	e99e6c43-c6b4-4bf6-ae5b-47e64afca937	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:16:49.321554+00	
00000000-0000-0000-0000-000000000000	f68a3167-9fb0-4aa5-8c0d-72de725aa35f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:45:09.188593+00	
00000000-0000-0000-0000-000000000000	8ffe1f1b-086f-4381-8200-f596112d120d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:45:09.20975+00	
00000000-0000-0000-0000-000000000000	eecb73a7-199d-4816-80fa-691b75add980	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:48:49.386219+00	
00000000-0000-0000-0000-000000000000	e97a28d1-1bb3-4040-ac9c-6ea3e3fc3a9d	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:48:49.387791+00	
00000000-0000-0000-0000-000000000000	15926606-3ca9-4ffb-a419-3f9fd99fb374	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:48:52.121857+00	
00000000-0000-0000-0000-000000000000	7ace66d7-b058-4c10-b3dd-03e9fcc01594	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 20:48:52.152222+00	
00000000-0000-0000-0000-000000000000	32ecffef-cee0-4f14-b25f-8c420a6fb3b8	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:43:37.751477+00	
00000000-0000-0000-0000-000000000000	97c6607e-7a98-4109-973a-5bb33e4e1b40	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:43:37.758839+00	
00000000-0000-0000-0000-000000000000	000459f6-8d4d-4638-a606-b766639a205d	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:47:33.366581+00	
00000000-0000-0000-0000-000000000000	f832d0f3-4241-4390-b566-303bf3f066aa	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:47:33.370076+00	
00000000-0000-0000-0000-000000000000	dffd85d6-5619-4d78-a4d1-0d2e5e5bf1dc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 22:42:13.185315+00	
00000000-0000-0000-0000-000000000000	a3d883ee-6032-4b89-ab8d-186fde3d032f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 22:42:13.196096+00	
00000000-0000-0000-0000-000000000000	ab5a62a0-f88d-473a-a442-c30923fbea2c	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 23:38:14.620804+00	
00000000-0000-0000-0000-000000000000	8fa02277-df27-4d93-80c8-6044d98cb80f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:41:07.753719+00	
00000000-0000-0000-0000-000000000000	4e66d4a2-b8cd-49fa-a336-a89bc063d452	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:41:07.7565+00	
00000000-0000-0000-0000-000000000000	e4c54934-dfd4-4ca4-95e0-7c2934cecf6f	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:43:02.375323+00	
00000000-0000-0000-0000-000000000000	2e3466ab-0015-4ea2-8d06-7c541710966d	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:43:02.376142+00	
00000000-0000-0000-0000-000000000000	40ad94a6-06f0-4a7c-b3ce-f8d756945135	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-05 00:22:54.645481+00	
00000000-0000-0000-0000-000000000000	1cf9c96f-76a3-4e09-96ea-2ad4cd0844e9	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 00:36:39.542426+00	
00000000-0000-0000-0000-000000000000	c0c4aca1-c276-401c-b867-0e6293f82b32	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 00:36:39.545605+00	
00000000-0000-0000-0000-000000000000	2d31e50f-f885-4668-b293-221c8de49974	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-05 01:10:12.180248+00	
00000000-0000-0000-0000-000000000000	89e2a2d8-9160-4679-8ed4-899af393c93b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-05 01:10:15.055295+00	
00000000-0000-0000-0000-000000000000	859988b9-9944-4601-a600-ddc16a486196	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 02:08:35.512275+00	
00000000-0000-0000-0000-000000000000	19c59d68-9900-4fb2-9611-2f632af28149	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 02:08:35.517609+00	
00000000-0000-0000-0000-000000000000	a07b43ed-7286-49c7-bd8e-05d1004bfb41	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-05 02:14:31.82368+00	
00000000-0000-0000-0000-000000000000	e4b3d54d-9a70-48e7-bf1e-476835047281	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 03:12:45.620323+00	
00000000-0000-0000-0000-000000000000	be0369e0-4ddf-4bfc-8abd-f1a731adc31c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 03:12:45.624075+00	
00000000-0000-0000-0000-000000000000	55dcce15-1816-4c2a-932c-02b0ab52aa8a	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 03:17:03.249709+00	
00000000-0000-0000-0000-000000000000	e5954aa0-689a-4dc0-8cc3-b6fbb224351e	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 03:17:03.253295+00	
00000000-0000-0000-0000-000000000000	1a44ffe9-3bf2-4303-a906-53c7a9fc0804	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 04:12:44.010859+00	
00000000-0000-0000-0000-000000000000	c5867538-097d-43b5-98ed-eb4a833b0c65	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 04:12:44.016827+00	
00000000-0000-0000-0000-000000000000	1256d047-7665-4cfe-9872-a388ec5ca3b9	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 04:15:14.433287+00	
00000000-0000-0000-0000-000000000000	3e23c9b8-f305-4364-87a6-3ab5d3c6853d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 04:15:14.434746+00	
00000000-0000-0000-0000-000000000000	b2f915e7-efe4-445c-bc79-c0b1199d166d	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 05:11:22.430314+00	
00000000-0000-0000-0000-000000000000	ce996a69-2964-43a2-87d7-74a618fd24b2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 05:11:22.441125+00	
00000000-0000-0000-0000-000000000000	8cbfe2a8-1202-4a8b-a7ab-268d962a552c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 05:14:15.25559+00	
00000000-0000-0000-0000-000000000000	a120c196-5624-47c7-9b72-ad3c0f479ea8	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 05:14:15.258274+00	
00000000-0000-0000-0000-000000000000	9eeda948-e7e6-40a1-9048-beebb5218a8c	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-05 19:41:43.580174+00	
00000000-0000-0000-0000-000000000000	ff3f931b-30ff-417c-989d-8e9664a3c668	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-05 19:41:54.932863+00	
00000000-0000-0000-0000-000000000000	cb01dd82-160d-4cb3-b427-164ce45cb1bd	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-05 19:42:09.714975+00	
00000000-0000-0000-0000-000000000000	6cdd22c4-46d8-4aad-8a50-54490704d53f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 20:19:26.896729+00	
00000000-0000-0000-0000-000000000000	9bf30ca0-f290-4659-9e2c-2d6927c38e4c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 20:19:26.899317+00	
00000000-0000-0000-0000-000000000000	a2b9f860-0536-4e8d-8961-880f6b2b9baa	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 21:42:30.331486+00	
00000000-0000-0000-0000-000000000000	35884e3a-7058-4846-a308-50eb5f521ecd	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 21:42:30.33402+00	
00000000-0000-0000-0000-000000000000	3566ecc1-1f8b-43ee-a50a-10e46a136f57	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 21:51:26.111304+00	
00000000-0000-0000-0000-000000000000	a9df9e6f-fbd5-4762-bdb3-6a391ab86cfb	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 21:51:26.115215+00	
00000000-0000-0000-0000-000000000000	00febf90-dfb4-4239-93c0-dbcf569ba9c8	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 22:40:33.182676+00	
00000000-0000-0000-0000-000000000000	40ef990e-dc76-49c5-8c2e-b65a673e6eb2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 22:40:33.184912+00	
00000000-0000-0000-0000-000000000000	52bc538d-8c5c-4c70-8de4-891d87b14cf4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 23:39:23.449736+00	
00000000-0000-0000-0000-000000000000	cc20eaab-bd95-4337-97fe-c30b2feb7de3	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-05 23:39:23.451316+00	
00000000-0000-0000-0000-000000000000	64de0487-2287-41bd-a1fb-1e183917ed0c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 02:53:54.400367+00	
00000000-0000-0000-0000-000000000000	f889a12e-5501-4120-9787-5063bc59b0f4	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 02:53:54.4043+00	
00000000-0000-0000-0000-000000000000	b89ffa98-8c44-4feb-8f3b-b23b045ebd92	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 03:40:31.796107+00	
00000000-0000-0000-0000-000000000000	cdad5816-4c80-4a22-b527-291ab4cc8291	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 03:40:31.804619+00	
00000000-0000-0000-0000-000000000000	c49d9a07-70c0-4320-a35c-0f60044ca513	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 03:52:57.437038+00	
00000000-0000-0000-0000-000000000000	3250e802-56c4-4cca-acd3-8b2260a1353f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 03:52:57.439829+00	
00000000-0000-0000-0000-000000000000	38dc2c3a-6259-4b89-b7d2-3bc035191eb1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 04:38:36.444873+00	
00000000-0000-0000-0000-000000000000	f0178e1d-b796-47ef-840c-e8c60d672112	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 04:38:36.446414+00	
00000000-0000-0000-0000-000000000000	4a9b1620-2662-4daf-b930-d097410a2a40	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 04:51:42.043914+00	
00000000-0000-0000-0000-000000000000	3d447401-9c38-4908-8ff6-040e0ce0996c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 04:51:42.046476+00	
00000000-0000-0000-0000-000000000000	413fba0f-7f53-4c9b-b6dc-a04075aa27c1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 05:36:49.809307+00	
00000000-0000-0000-0000-000000000000	f5d91bee-2ca2-475d-8473-843132624ce5	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 05:36:49.810819+00	
00000000-0000-0000-0000-000000000000	20795bdc-7944-434a-881e-4fa1a0049e46	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 05:50:15.164861+00	
00000000-0000-0000-0000-000000000000	eb7cb4d6-bddb-4d05-84ea-4b0f0a242a30	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 05:50:15.169334+00	
00000000-0000-0000-0000-000000000000	c7476905-7c46-45bd-ba02-3ca5748955a0	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:09:11.294551+00	
00000000-0000-0000-0000-000000000000	17c69ac0-38c9-4144-a3db-6b6642c5d0b3	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:09:11.305859+00	
00000000-0000-0000-0000-000000000000	d505afd5-b1a1-4a61-ab47-5075303ddc4c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:09:41.0338+00	
00000000-0000-0000-0000-000000000000	c3661f47-a527-4bb9-bfdc-9e414a0d9b2c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:09:41.034599+00	
00000000-0000-0000-0000-000000000000	5826079a-7a2e-41c5-bbc5-c0df0471a704	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 08:07:14.738634+00	
00000000-0000-0000-0000-000000000000	375944ca-4fc4-4981-b4b7-c890dbb447ea	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 08:07:14.748466+00	
00000000-0000-0000-0000-000000000000	d8cdc021-54ed-4368-8b42-be2c2928eb22	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 08:08:15.217993+00	
00000000-0000-0000-0000-000000000000	15c79ba7-3be4-4fef-9820-f6211eee42e7	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 08:08:15.22753+00	
00000000-0000-0000-0000-000000000000	e380cae5-5dc5-43d2-91c5-de6392dc3b4b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 18:31:20.526224+00	
00000000-0000-0000-0000-000000000000	70636f74-311f-4306-ac5e-cc82d7f38f6c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:32:09.979231+00	
00000000-0000-0000-0000-000000000000	04577419-750d-4828-ac01-9f0c7ac85352	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:32:09.984135+00	
00000000-0000-0000-0000-000000000000	982e70b4-9aa2-408d-9a6b-12d99892dcf8	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 18:32:54.159194+00	
00000000-0000-0000-0000-000000000000	1470c1b4-bf96-4186-b2f0-f52f263e48c9	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:34:01.902843+00	
00000000-0000-0000-0000-000000000000	7ab71a2c-a177-4710-98d3-9dbe1ec5d3ba	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:34:01.903405+00	
00000000-0000-0000-0000-000000000000	fcd218f2-8ab7-4b64-93fd-f4b4f28c59a4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:34:36.945456+00	
00000000-0000-0000-0000-000000000000	482a30ef-5532-4f5e-afb6-480e27b040b5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:39:47.197364+00	
00000000-0000-0000-0000-000000000000	c191a7e4-d220-47a5-8c01-5bff100e5195	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 18:39:47.20096+00	
00000000-0000-0000-0000-000000000000	9f509534-8a98-411a-9d6a-f36deb71638e	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 19:13:03.674334+00	
00000000-0000-0000-0000-000000000000	5d059469-0826-416f-afd1-6c7ad345060f	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:13:10.119101+00	
00000000-0000-0000-0000-000000000000	8504d960-bac1-4aa3-8376-9829a67a220c	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:13:56.59003+00	
00000000-0000-0000-0000-000000000000	d6963542-2eb9-4f40-9d76-032477f860df	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:15:00.472054+00	
00000000-0000-0000-0000-000000000000	50274645-f5c2-45ee-986e-a63a2ab3e128	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 19:37:11.206787+00	
00000000-0000-0000-0000-000000000000	53aa0547-4098-47e9-9b27-42a0c761c93d	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:38:03.606875+00	
00000000-0000-0000-0000-000000000000	f034de5e-690a-4d50-8844-7798f09f14ad	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:40:49.691352+00	
00000000-0000-0000-0000-000000000000	71338466-f304-422a-954f-ee5bcca1333b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 19:47:34.885474+00	
00000000-0000-0000-0000-000000000000	9ce0ab42-9393-42a5-9445-87b4ddfc028e	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 20:28:49.240573+00	
00000000-0000-0000-0000-000000000000	383cacf5-713e-449f-b3ec-dc3b270e36f9	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 20:28:49.244686+00	
00000000-0000-0000-0000-000000000000	68a478ca-52a0-461f-b680-f8c2073efcfc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 20:40:03.939204+00	
00000000-0000-0000-0000-000000000000	61f59609-8a01-4722-ae1b-30f0a0ec4190	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 20:40:03.943894+00	
00000000-0000-0000-0000-000000000000	08ffe248-0878-4daa-90ac-3285aed839d3	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:35:45.327801+00	
00000000-0000-0000-0000-000000000000	02be5b1a-7a08-449e-9c4b-fa96d4533138	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:35:45.330196+00	
00000000-0000-0000-0000-000000000000	76bcd5aa-e353-4f9f-8fba-fbcd25de2f12	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:35:45.752004+00	
00000000-0000-0000-0000-000000000000	ae4b4453-483f-45e6-95da-f39a2e83c943	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:36:14.686898+00	
00000000-0000-0000-0000-000000000000	51011062-ccf7-4c32-b4c6-c8214507c65a	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:36:14.689836+00	
00000000-0000-0000-0000-000000000000	70f97f64-1503-42d2-a068-8cbe4562b07f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:39:24.707066+00	
00000000-0000-0000-0000-000000000000	0aa58628-6f83-45c2-b663-7612fc9c9b58	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 21:39:24.709637+00	
00000000-0000-0000-0000-000000000000	d8d1c1f6-d05c-4f4f-8d27-b9ca3916ad35	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 21:58:53.060446+00	
00000000-0000-0000-0000-000000000000	3c991845-d114-4b7f-88eb-349330a68838	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 21:58:54.175945+00	
00000000-0000-0000-0000-000000000000	c2e20cf7-f891-4a8f-9a26-a92f0797ef32	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 22:12:58.379152+00	
00000000-0000-0000-0000-000000000000	63547405-c668-4a71-8f49-6c519f839581	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 22:12:58.382458+00	
00000000-0000-0000-0000-000000000000	b243f5fb-a752-4b6c-b68a-3d20f2efa776	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 22:13:04.745961+00	
00000000-0000-0000-0000-000000000000	f89bd27d-ce86-40f2-9c16-6d3b548d52cd	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:14:49.243189+00	
00000000-0000-0000-0000-000000000000	0759972a-91dd-446f-92d0-f51b4404ec3b	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 22:16:22.221409+00	
00000000-0000-0000-0000-000000000000	53c88fa7-ebe2-4a2c-9fd5-6a01ea6d409d	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:16:46.771933+00	
00000000-0000-0000-0000-000000000000	78ebf83e-e9a4-40f3-aded-7b1d59b5b275	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 22:21:52.289122+00	
00000000-0000-0000-0000-000000000000	d3c76585-055d-4cb4-8981-1eef7ae5affd	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:21:56.445406+00	
00000000-0000-0000-0000-000000000000	74eb9bd2-d94a-460d-9d2c-8264247b6a0e	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:28:09.488988+00	
00000000-0000-0000-0000-000000000000	1f0b1444-cfbb-474f-81a5-e97bad9d5810	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:35:08.368642+00	
00000000-0000-0000-0000-000000000000	c98c6cb2-8152-4de7-89a9-82ae64cc0864	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 22:47:41.320967+00	
00000000-0000-0000-0000-000000000000	a844d66e-29dd-44e8-b9a0-4d2ce057f920	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 23:10:06.30998+00	
00000000-0000-0000-0000-000000000000	3a014370-1091-4a9c-bb5e-60bddddb9ebf	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 23:33:23.28956+00	
00000000-0000-0000-0000-000000000000	387224e2-1599-45f4-ba66-8c35555abf24	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 23:33:23.292325+00	
00000000-0000-0000-0000-000000000000	e0f79031-4a16-4475-b9fe-0dc93b71e82c	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 14:21:14.261191+00	
00000000-0000-0000-0000-000000000000	5a95a6b1-02d1-4303-8e75-acbedc5de7cd	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:07.148924+00	
00000000-0000-0000-0000-000000000000	0ab349b1-ebb6-4bab-ac25-bed360cf4048	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:07.154478+00	
00000000-0000-0000-0000-000000000000	93f06f25-9e64-4c12-8cd0-547cd058273b	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:35.904656+00	
00000000-0000-0000-0000-000000000000	8801c052-55b3-49d6-8747-f07183c002e7	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:35.907586+00	
00000000-0000-0000-0000-000000000000	f6dfe979-5cea-429a-a8fd-482283beeb4a	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:47.916407+00	
00000000-0000-0000-0000-000000000000	a61d015d-4d5e-47ca-b5e4-aeb2a3eff1df	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 16:28:47.918526+00	
00000000-0000-0000-0000-000000000000	cfb9b80c-3f2a-402e-a9a3-b37b020e8ed3	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 16:48:43.882718+00	
00000000-0000-0000-0000-000000000000	3b2eb5fb-43dd-4862-a95c-8fc171cd9415	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 17:17:03.119581+00	
00000000-0000-0000-0000-000000000000	1ecb06fb-0407-4ed9-b387-2489b5f6209d	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 17:17:20.347852+00	
00000000-0000-0000-0000-000000000000	0aa728e1-e4de-4f9f-b994-fccd46afbb94	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 17:37:47.935429+00	
00000000-0000-0000-0000-000000000000	f54075ad-1499-4e4c-9ac0-ef269109d650	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 19:07:57.051679+00	
00000000-0000-0000-0000-000000000000	f2d9b364-7f4a-4002-95a8-3eb000a1dd2a	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 19:51:23.968378+00	
00000000-0000-0000-0000-000000000000	8ea343a8-7d08-4a61-a3e6-2d48e4b043e4	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 19:51:23.970423+00	
00000000-0000-0000-0000-000000000000	bd7a24c0-ed73-49e5-b456-4550da560534	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 20:06:09.134381+00	
00000000-0000-0000-0000-000000000000	2b8a891e-5f51-4410-a277-eafbf7126267	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 20:06:09.136395+00	
00000000-0000-0000-0000-000000000000	32d78f4b-e1b9-4aaf-a98e-4c031d590abc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 21:04:38.732799+00	
00000000-0000-0000-0000-000000000000	debbb0c8-85fc-4446-8985-a15924d27f39	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 21:04:38.738335+00	
00000000-0000-0000-0000-000000000000	29d681aa-971b-41e4-843f-dad0949306f8	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 22:03:08.784841+00	
00000000-0000-0000-0000-000000000000	9d1d0552-e4c1-427d-bf3d-3eccf9adadc5	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 22:03:08.791071+00	
00000000-0000-0000-0000-000000000000	ad3c7666-5ee7-47ee-acd5-effaa158b8b7	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 23:01:38.747365+00	
00000000-0000-0000-0000-000000000000	ea15e51d-ee46-46b0-bd7a-17c095d2b721	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 23:01:38.748906+00	
00000000-0000-0000-0000-000000000000	dc44db25-666e-417b-a7a5-c7af260f232c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 00:00:21.773902+00	
00000000-0000-0000-0000-000000000000	d5bad5ca-7b3a-400e-9af2-9b6ae15ba986	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 00:00:21.775866+00	
00000000-0000-0000-0000-000000000000	e18cc8c7-b999-419f-938e-c284c8871ca9	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-08 12:18:13.508109+00	
00000000-0000-0000-0000-000000000000	1a71c7f2-5df1-4481-a5f9-849191eeedcf	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-08 12:18:14.79467+00	
00000000-0000-0000-0000-000000000000	50133540-0c4b-4729-9d24-c145e35ae498	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 19:58:46.786134+00	
00000000-0000-0000-0000-000000000000	3893f7d9-3374-4116-a972-f1c104d176dc	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 19:58:46.796402+00	
00000000-0000-0000-0000-000000000000	bb0a9383-b9ff-49a3-a023-af0ecfb0984d	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 20:56:56.175573+00	
00000000-0000-0000-0000-000000000000	a35b606f-780c-42a4-8230-c4931d8a7528	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 20:56:56.186157+00	
00000000-0000-0000-0000-000000000000	1b53d255-c17f-42ea-9f2c-608799a0e5bd	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-08 20:59:41.707744+00	
00000000-0000-0000-0000-000000000000	fcb8d074-0e9c-4509-989c-8baf1629bdf5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 21:55:26.054398+00	
00000000-0000-0000-0000-000000000000	c168ff03-b348-4419-bc7c-ad4eb163d274	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 21:55:26.062353+00	
00000000-0000-0000-0000-000000000000	cac06bf5-e7b7-477d-9654-41471c68070d	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 22:53:56.139708+00	
00000000-0000-0000-0000-000000000000	31c93d14-4df5-4ca7-98ab-2f71d83cf71d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 22:53:56.144067+00	
00000000-0000-0000-0000-000000000000	f9ee210f-2b4f-4ad9-8f79-6d1cd0e5fe31	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 22:56:16.186017+00	
00000000-0000-0000-0000-000000000000	9122e32b-0045-4a33-8e13-2cf4d118f22a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 22:56:16.189756+00	
00000000-0000-0000-0000-000000000000	a0ec2c29-7554-4160-9059-71e92d3010e4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 23:52:26.423895+00	
00000000-0000-0000-0000-000000000000	9d678c48-23df-4899-bbcb-1e036376a88d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 23:52:26.427793+00	
00000000-0000-0000-0000-000000000000	3c76ec56-a831-4041-8997-5f1c872dd2fc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 00:50:55.076049+00	
00000000-0000-0000-0000-000000000000	fada639b-5d63-4a6c-87b8-2787b6f9cac7	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 00:50:55.084966+00	
00000000-0000-0000-0000-000000000000	4d428fd9-14e5-49ea-80d3-f803e0555d9f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 19:10:21.054553+00	
00000000-0000-0000-0000-000000000000	45c62a1b-5f48-498a-9102-c92b6ddea2d6	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 19:10:21.068833+00	
00000000-0000-0000-0000-000000000000	ffea2e59-5c1b-474a-93bf-f9bd99d4ab2d	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 19:11:45.170105+00	
00000000-0000-0000-0000-000000000000	b8ed00d1-9f42-49dd-8a82-095d3a077755	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 19:12:41.821121+00	
00000000-0000-0000-0000-000000000000	8050abf7-d481-49e1-8176-17829ca8e237	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 20:04:43.742006+00	
00000000-0000-0000-0000-000000000000	9628145f-82c7-4b4c-a15d-54ee0c61f732	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 20:11:22.864256+00	
00000000-0000-0000-0000-000000000000	c55761b9-fc4d-4ce0-8cb4-7b16f5c33d88	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 20:11:22.867222+00	
00000000-0000-0000-0000-000000000000	f69973cc-f76a-43fc-8ee9-c017ac5603df	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 21:02:53.710721+00	
00000000-0000-0000-0000-000000000000	e27ab1bd-124b-4457-9971-d98a73aee601	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 21:02:53.718292+00	
00000000-0000-0000-0000-000000000000	4396710b-6ca5-4437-a17d-2527706c7ba8	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 21:06:14.008473+00	
00000000-0000-0000-0000-000000000000	8f08fa97-70ef-46e1-a6e9-738b4e42b410	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 21:06:14.012951+00	
00000000-0000-0000-0000-000000000000	257b25a5-74cb-461f-a2f4-b0c4884ec2a4	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 21:06:18.622378+00	
00000000-0000-0000-0000-000000000000	ffcf555f-a4b9-484f-9753-4ce7c99ea8ab	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:06:54.034079+00	
00000000-0000-0000-0000-000000000000	d9383c40-2959-4f9e-8006-fc19d036fffa	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:17:55.825656+00	
00000000-0000-0000-0000-000000000000	a8188698-6600-492d-89f2-977a6ea9a2c8	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 21:17:56.018018+00	
00000000-0000-0000-0000-000000000000	e50f05dc-40a8-45c2-8578-39f7e515bfc8	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:22:27.345504+00	
00000000-0000-0000-0000-000000000000	888429b7-aae2-4570-b44b-9a5701119dc3	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 21:22:28.14564+00	
00000000-0000-0000-0000-000000000000	cbc9510c-afe5-483f-b1ab-b80c771c12ad	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:23:36.383998+00	
00000000-0000-0000-0000-000000000000	1b696e34-32cd-4a2c-9be3-379c4c4be340	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 21:23:36.765763+00	
00000000-0000-0000-0000-000000000000	486977a6-4679-4a24-a960-ced387bbc1ff	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:28:38.496453+00	
00000000-0000-0000-0000-000000000000	8626213b-afa7-43b5-ae2e-6a99bb70bde3	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 21:31:03.71717+00	
00000000-0000-0000-0000-000000000000	c4266774-340b-42b6-88df-7190c252d976	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 22:18:54.658119+00	
00000000-0000-0000-0000-000000000000	08cfde27-9699-4f0f-a6a1-7019aafcc6b4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 22:29:21.548029+00	
00000000-0000-0000-0000-000000000000	c11cba61-d83d-47b9-83af-afe9d0cba8d8	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 22:29:21.551296+00	
00000000-0000-0000-0000-000000000000	0223b9ef-597d-468b-b672-11ff3ea32e83	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:17:23.864254+00	
00000000-0000-0000-0000-000000000000	0755c445-82ab-45cb-9d6a-911158362fa8	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:17:23.872054+00	
00000000-0000-0000-0000-000000000000	61e57dfd-900a-4c64-afae-b8cef6caefa8	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:27:21.568392+00	
00000000-0000-0000-0000-000000000000	20d9a74a-bdea-4ad0-8379-aa5cc85026d7	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:27:21.574218+00	
00000000-0000-0000-0000-000000000000	69f1d05e-9f46-4d26-952c-8a2a3c3681ec	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 23:49:24.138097+00	
00000000-0000-0000-0000-000000000000	cceb48cd-f90c-4877-97f9-50fd5bcfed2a	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 23:49:39.786616+00	
00000000-0000-0000-0000-000000000000	b7778371-5854-4be0-a29c-1a9bbbe77359	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 23:49:42.302693+00	
00000000-0000-0000-0000-000000000000	67d5c783-2ec5-410e-a308-7a5d60ecde2b	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-09 23:53:56.239073+00	
00000000-0000-0000-0000-000000000000	cb1f91b1-7e25-46c5-9b6e-670047418242	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 23:54:00.190141+00	
00000000-0000-0000-0000-000000000000	f731d9b6-0b73-48c1-8a5d-72d8cf469c10	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-09 23:56:03.284302+00	
00000000-0000-0000-0000-000000000000	aacb3aad-9f21-4308-8bfb-c53bfc59a03e	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 00:01:09.249285+00	
00000000-0000-0000-0000-000000000000	1f13df8e-5e88-418d-88ba-9d21bab18073	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 00:01:10.141122+00	
00000000-0000-0000-0000-000000000000	4447013b-c69e-4ef8-9674-6ae55978dd18	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 00:01:11.064036+00	
00000000-0000-0000-0000-000000000000	20fe76d4-f532-4da4-859d-a7ab8922cf0c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 00:54:21.63+00	
00000000-0000-0000-0000-000000000000	fb677e57-f434-4c3f-9be4-df646ed15ac0	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 00:54:21.638945+00	
00000000-0000-0000-0000-000000000000	b40cae00-08c5-4a58-a933-4fb23eb7da7b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 20:57:40.822649+00	
00000000-0000-0000-0000-000000000000	7f783a2e-bd3d-4c6d-b3fa-081f5ca1574f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 20:57:40.841374+00	
00000000-0000-0000-0000-000000000000	88a68c71-7035-467e-ba00-a211becd4c58	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 21:55:44.583993+00	
00000000-0000-0000-0000-000000000000	ffeb25ca-7c59-4add-9940-ac29912108b8	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 21:55:44.599041+00	
00000000-0000-0000-0000-000000000000	8a78fc3a-1075-4f92-8ffc-70c852b716ec	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 00:40:47.446678+00	
00000000-0000-0000-0000-000000000000	40329e8c-fd4c-4c3a-8be8-d873f77742e3	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 00:40:47.456391+00	
00000000-0000-0000-0000-000000000000	53437e8c-ec58-4d4e-9644-61a8c2444b7d	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 19:34:03.722239+00	
00000000-0000-0000-0000-000000000000	f8220823-1301-46d2-809d-dfa26a2878f7	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 19:34:03.736587+00	
00000000-0000-0000-0000-000000000000	899adbc9-96e7-4fc7-9777-8378f0feaaa1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 19:34:07.360408+00	
00000000-0000-0000-0000-000000000000	083b5e73-ef33-4e96-9489-8336e4beac71	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 20:32:07.790248+00	
00000000-0000-0000-0000-000000000000	068e17ac-d460-476d-80a2-67c8e6659ce5	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 20:32:07.803284+00	
00000000-0000-0000-0000-000000000000	96821758-3dd7-4b70-96e5-dc4dfefcf81a	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 21:30:07.84133+00	
00000000-0000-0000-0000-000000000000	4cade25a-ac48-4a52-b010-10cd79afc5ee	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 21:30:07.847921+00	
00000000-0000-0000-0000-000000000000	5f676aba-acb2-4a9d-b0a8-26e1daad8b60	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 22:28:07.773671+00	
00000000-0000-0000-0000-000000000000	60e734f0-70bc-4c00-90d0-bff40b88a8e6	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 22:28:07.785526+00	
00000000-0000-0000-0000-000000000000	1e434c50-22a8-44e4-a4f5-76423063761b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 23:26:07.999334+00	
00000000-0000-0000-0000-000000000000	ffc7fac0-f417-4561-aeaa-9c105a53eeff	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-12 23:26:08.004947+00	
00000000-0000-0000-0000-000000000000	65e8dd59-2438-459d-a9c4-0a197cc3cc09	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 00:24:37.964804+00	
00000000-0000-0000-0000-000000000000	77d38e3a-f893-46ae-a972-e2974c6f7892	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 00:24:37.977549+00	
00000000-0000-0000-0000-000000000000	585c3d69-2e98-438c-89ab-da72747b1cc7	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 01:23:18.358666+00	
00000000-0000-0000-0000-000000000000	bfc3a12b-d6d7-465b-94c9-0dfc01ce4961	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 01:23:18.363282+00	
00000000-0000-0000-0000-000000000000	bff7d8ac-d285-4ec2-88ec-765c51becdaf	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-13 03:40:33.983135+00	
00000000-0000-0000-0000-000000000000	d29652b0-6974-4673-9421-2b0abbc7e7d3	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-13 03:41:19.078555+00	
00000000-0000-0000-0000-000000000000	f83d1b20-4191-4e25-996a-4148e0a4faaa	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-13 03:43:08.172341+00	
00000000-0000-0000-0000-000000000000	41fd6fcd-949b-4708-b1e5-93aca356a3e7	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-13 03:43:13.044778+00	
00000000-0000-0000-0000-000000000000	2cd1920a-bd73-448a-82f8-cabeb9273953	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 06:33:44.089668+00	
00000000-0000-0000-0000-000000000000	1dca2779-3581-4241-9883-afbee263845b	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 06:33:44.107956+00	
00000000-0000-0000-0000-000000000000	20b8a8ca-a2c1-4220-882c-8e09e0b78786	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 07:32:30.051907+00	
00000000-0000-0000-0000-000000000000	2287b2c5-ad67-4753-a0e4-443b26368194	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 07:32:30.057839+00	
00000000-0000-0000-0000-000000000000	636cbd44-6c4d-432b-b14f-b3b270c83ed5	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 08:31:07.602207+00	
00000000-0000-0000-0000-000000000000	b3994a32-2b73-457c-b448-309282516993	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 08:31:07.608211+00	
00000000-0000-0000-0000-000000000000	e3082475-0dcb-46e3-ad4c-5e7fb22aacb7	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 09:29:58.542219+00	
00000000-0000-0000-0000-000000000000	a36c8302-3ff0-428e-ae87-f276b616495c	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 09:29:58.545604+00	
00000000-0000-0000-0000-000000000000	d5123a00-2621-415b-8b05-96f3ec288b1c	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-13 20:11:03.331319+00	
00000000-0000-0000-0000-000000000000	2a68d6fa-afdc-495e-b6ba-e5a6dac8427c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 21:09:25.653348+00	
00000000-0000-0000-0000-000000000000	0f4fe692-edcf-4237-9178-aa04cee0ffbe	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 21:09:25.666016+00	
00000000-0000-0000-0000-000000000000	8b15c42a-ebff-4f29-be9e-5d8db85604fc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 22:07:25.662801+00	
00000000-0000-0000-0000-000000000000	00f666f1-b7f2-4937-85c3-e64adba2782f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 22:07:25.671429+00	
00000000-0000-0000-0000-000000000000	f40e9d31-a882-4385-96ac-23f0a0ba24c6	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 23:05:25.688541+00	
00000000-0000-0000-0000-000000000000	d1d72138-0ab5-40fb-a97b-4e0553aeaf72	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 23:05:25.696291+00	
00000000-0000-0000-0000-000000000000	2daebd49-7755-4ca9-a313-d3469595cf1c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 00:03:25.734863+00	
00000000-0000-0000-0000-000000000000	71bd3f98-4400-4d7b-8160-939e40e3e875	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 00:03:25.75186+00	
00000000-0000-0000-0000-000000000000	76967481-952f-434f-b887-15b2ecc9141a	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 02:36:34.744473+00	
00000000-0000-0000-0000-000000000000	793b9401-02f1-4bce-80cf-10041422d0a3	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 02:36:34.758096+00	
00000000-0000-0000-0000-000000000000	97358f5e-676e-458c-b16d-07693f7daf47	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 03:36:04.930145+00	
00000000-0000-0000-0000-000000000000	86a457be-0585-47eb-87c9-ed1cb607904e	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 03:36:04.938225+00	
00000000-0000-0000-0000-000000000000	013740b9-d20d-4428-bd9a-f0a783444a53	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 08:30:41.125669+00	
00000000-0000-0000-0000-000000000000	69a309d6-127e-435b-8de9-f1a63b0781ab	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 08:30:41.151494+00	
00000000-0000-0000-0000-000000000000	3397a9e9-5455-47a6-bb33-fa890ec741d2	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 09:29:24.185262+00	
00000000-0000-0000-0000-000000000000	e0821aa9-d3aa-4d94-a34e-2ef4e51abc77	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 09:29:24.197878+00	
00000000-0000-0000-0000-000000000000	153ead39-1ad2-425d-9ab3-259db017217e	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 10:28:00.145603+00	
00000000-0000-0000-0000-000000000000	166620ff-ae4a-4093-b6a8-1a465a561093	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 10:28:00.150766+00	
00000000-0000-0000-0000-000000000000	050b6151-8aeb-4217-9153-b352884042f3	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 11:27:01.267171+00	
00000000-0000-0000-0000-000000000000	c30b68da-5b8b-4d66-91c7-1eddfc644e51	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 11:27:01.281757+00	
00000000-0000-0000-0000-000000000000	177d3ad4-44a3-4af1-a7a1-33558f748f4b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 18:39:28.300321+00	
00000000-0000-0000-0000-000000000000	0af9c51e-0de2-43e4-afcf-ca44e0295788	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 18:39:28.323048+00	
00000000-0000-0000-0000-000000000000	720846cd-4bf8-4294-a451-180ba52441c6	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 19:37:46.788587+00	
00000000-0000-0000-0000-000000000000	bd6ded54-ecd5-49a4-a058-85cfe4b25a39	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 19:37:46.804956+00	
00000000-0000-0000-0000-000000000000	724d7e0d-bc42-428b-b6a6-60220d9680f5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 20:35:46.77765+00	
00000000-0000-0000-0000-000000000000	eb5f0ae6-aa4b-4d79-a5b8-cf86668bdb67	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 20:35:46.795227+00	
00000000-0000-0000-0000-000000000000	2063c51b-1ea1-4047-ae75-1053bbb8ec4c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 21:33:46.870183+00	
00000000-0000-0000-0000-000000000000	0ca1958e-b37e-439b-8fb3-92c204ead2a6	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 21:33:46.878028+00	
00000000-0000-0000-0000-000000000000	e0dd42b3-82ea-425c-91ee-3ad238f86e35	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 22:31:46.858489+00	
00000000-0000-0000-0000-000000000000	54db7384-834c-4ff5-99bb-9e5a23ba6973	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 22:31:46.869456+00	
00000000-0000-0000-0000-000000000000	8d1c7989-3ef9-4cb7-8927-fa557999cdf3	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-14 23:19:27.740206+00	
00000000-0000-0000-0000-000000000000	89fb234b-fc1e-4f17-beee-23dc2ad28e73	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-14 23:19:29.233621+00	
00000000-0000-0000-0000-000000000000	eb30258f-117d-4eae-bbb0-544e86249119	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 23:29:46.794189+00	
00000000-0000-0000-0000-000000000000	522ce73c-20e7-4456-a4c5-5aee3e0efb09	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 23:29:46.802417+00	
00000000-0000-0000-0000-000000000000	ba4530ae-c3b0-4662-a935-2aab76c51b4b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 00:27:46.901073+00	
00000000-0000-0000-0000-000000000000	02d37fd8-98aa-4f2b-b954-f55195b7439f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 00:27:46.91654+00	
00000000-0000-0000-0000-000000000000	bb33ba6f-346f-4ba6-9748-3358f4f08cc4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 01:26:16.983698+00	
00000000-0000-0000-0000-000000000000	0b9d3810-21d0-46d7-afde-15671ac5174c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 01:26:16.986952+00	
00000000-0000-0000-0000-000000000000	455d6194-9bd2-4f2d-8703-b714cdc1ca2f	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-15 04:12:21.802402+00	
00000000-0000-0000-0000-000000000000	ee64a9fd-5fdc-40ac-8951-3f30fe186d18	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 04:19:04.711613+00	
00000000-0000-0000-0000-000000000000	708b1aed-4436-43af-bf1f-370ecd91746a	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 04:19:04.718396+00	
00000000-0000-0000-0000-000000000000	4b68f0a1-6789-496f-b12f-fc6c170683c2	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 05:10:46.847753+00	
00000000-0000-0000-0000-000000000000	f7def06c-ec05-40d9-b1b4-90a1f1fa840e	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 05:10:46.860774+00	
00000000-0000-0000-0000-000000000000	738826e4-e54f-489a-9f89-7e9f15a5d464	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 06:09:19.454064+00	
00000000-0000-0000-0000-000000000000	a66e7c1b-495e-4bab-871a-3791961e7692	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 06:09:19.459788+00	
00000000-0000-0000-0000-000000000000	01d41bfa-939b-4863-938e-30fbe34d38f3	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 10:24:20.921302+00	
00000000-0000-0000-0000-000000000000	ae129a16-4507-43ef-8179-26baa63f2de8	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 10:24:20.931827+00	
00000000-0000-0000-0000-000000000000	80649688-0ca1-49db-a76e-747bf9d6ecae	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 11:22:51.780897+00	
00000000-0000-0000-0000-000000000000	063d5587-0753-4af4-977f-df06068cec59	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 11:22:51.785268+00	
00000000-0000-0000-0000-000000000000	3c7418b7-2aab-40b2-b821-172409807c43	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 19:16:46.128925+00	
00000000-0000-0000-0000-000000000000	b56112b6-33bc-4135-9ab5-4b6a70cb6996	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 19:16:46.149941+00	
00000000-0000-0000-0000-000000000000	945dfdd9-5b7b-4eff-a963-97ee64a58b5c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 19:16:49.840257+00	
00000000-0000-0000-0000-000000000000	69c406f3-7147-4102-a643-31a2d087e4cb	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 20:15:05.595489+00	
00000000-0000-0000-0000-000000000000	1eebbf1d-03c4-4bbc-9ddc-00b0228d8341	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 20:15:05.605135+00	
00000000-0000-0000-0000-000000000000	b291b822-459d-46a4-8c16-e4a2cd02dd50	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 21:13:06.470995+00	
00000000-0000-0000-0000-000000000000	af3b633d-ba2c-4052-b2fd-a0cf23474368	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 21:13:06.488459+00	
00000000-0000-0000-0000-000000000000	180be031-119c-45c7-aafc-e90af570077c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 21:40:51.235722+00	
00000000-0000-0000-0000-000000000000	643cb12a-444e-4491-9113-38329c0ba159	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 21:40:51.243405+00	
00000000-0000-0000-0000-000000000000	c18d7819-03ac-4733-a5e3-71d061592c19	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 22:11:34.70675+00	
00000000-0000-0000-0000-000000000000	848f8723-081a-4794-b931-8c8df931f5ac	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 22:11:34.712448+00	
00000000-0000-0000-0000-000000000000	df4d8e43-bd29-4f53-8b26-7c60cd328046	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 23:09:34.738187+00	
00000000-0000-0000-0000-000000000000	095234ec-7d7d-45c5-a7c2-f16b1982dbe7	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-15 23:09:34.751994+00	
00000000-0000-0000-0000-000000000000	a6870714-2d4a-44db-a0da-419930ca2d5f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 00:07:34.867096+00	
00000000-0000-0000-0000-000000000000	483a19b9-163e-4c73-97f0-94c93c4c8599	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 00:07:34.887806+00	
00000000-0000-0000-0000-000000000000	08913908-337a-4055-ae09-0a2909200875	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 01:05:34.754449+00	
00000000-0000-0000-0000-000000000000	d6d65ecb-7209-433e-886a-a8c6b9ec1081	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 01:05:34.76159+00	
00000000-0000-0000-0000-000000000000	c5743e95-b883-4fd0-85af-7b2e802d28f4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 02:04:31.947214+00	
00000000-0000-0000-0000-000000000000	02c1da13-454f-4ac2-89a1-353293e5a0de	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 02:04:31.950956+00	
00000000-0000-0000-0000-000000000000	8ecdf237-104c-45a4-8248-a2536fbd66f1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 14:09:39.876247+00	
00000000-0000-0000-0000-000000000000	95c9e82e-998f-44ea-a7ef-b88f11e95152	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 14:09:39.900633+00	
00000000-0000-0000-0000-000000000000	39b72c8b-470a-4a07-bc6f-69f8dbf328c0	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 14:09:43.294003+00	
00000000-0000-0000-0000-000000000000	3f8af7fa-e546-476e-9ca1-81451b87cab0	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 15:08:09.370569+00	
00000000-0000-0000-0000-000000000000	34d27c41-93e5-40df-9552-02f41cf81213	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 15:08:09.386367+00	
00000000-0000-0000-0000-000000000000	9190eee7-7390-4769-a2a9-6f3b76bf960b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 16:06:39.569748+00	
00000000-0000-0000-0000-000000000000	cbf63fce-5589-49d2-a3fc-1986e63337a9	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 16:06:39.582003+00	
00000000-0000-0000-0000-000000000000	7022f75d-20fd-4fb8-a571-202267e67258	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 17:05:09.489938+00	
00000000-0000-0000-0000-000000000000	409a76dc-3b04-486e-ab18-7bdb3db35973	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 17:05:09.49727+00	
00000000-0000-0000-0000-000000000000	c652acb8-0774-4a97-b469-3c43e44796f9	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 18:03:09.675109+00	
00000000-0000-0000-0000-000000000000	c8954081-cddc-4a33-8ebe-2247c09a8c68	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 18:03:09.694175+00	
00000000-0000-0000-0000-000000000000	7bb93849-da0c-4650-bac3-102a4a0d3588	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 19:01:09.649073+00	
00000000-0000-0000-0000-000000000000	056e83b8-e5d6-4376-927c-07f040398c0b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 19:01:09.658854+00	
00000000-0000-0000-0000-000000000000	5e9055d8-bbeb-4761-955d-000587e2585c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 19:59:17.745409+00	
00000000-0000-0000-0000-000000000000	0b171fee-7caf-418b-b959-d642512195dd	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 19:59:17.754813+00	
00000000-0000-0000-0000-000000000000	628b633e-2f26-4cca-a3f4-4cd9817490b4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 20:57:17.736308+00	
00000000-0000-0000-0000-000000000000	e941362a-0a8c-49f6-af2c-7e1f4af4e53b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 20:57:17.747124+00	
00000000-0000-0000-0000-000000000000	4c7cc53a-b6b8-4dad-a29c-bb5306886f13	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 21:55:20.155311+00	
00000000-0000-0000-0000-000000000000	846025ff-c2b2-4207-b230-104341888542	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 21:55:20.165036+00	
00000000-0000-0000-0000-000000000000	ce5f359e-fb34-4a71-832c-235b3533a033	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:20:58.242032+00	
00000000-0000-0000-0000-000000000000	f10c90c8-8394-4de2-bcf3-6edbfc3768b0	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:20:58.258984+00	
00000000-0000-0000-0000-000000000000	c8bbd0a9-11e0-4fc7-ad85-67687d9e82d1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:53:22.249527+00	
00000000-0000-0000-0000-000000000000	99405326-5c07-440a-91df-1665708a92fe	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:53:22.259761+00	
00000000-0000-0000-0000-000000000000	cd8e3ce1-5c67-4eda-b473-2c67d1c53657	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 23:51:56.491846+00	
00000000-0000-0000-0000-000000000000	6b0435a6-192b-4ba9-8010-586e628ff016	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 23:51:56.507151+00	
00000000-0000-0000-0000-000000000000	8e824d15-fe93-472a-b8c2-781892c6e4c1	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 00:50:33.337833+00	
00000000-0000-0000-0000-000000000000	e4ccb900-687a-4438-821e-0cf094098779	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 00:50:33.350573+00	
00000000-0000-0000-0000-000000000000	828a610d-a6fb-41c1-8916-97f33a537c6f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 01:48:37.884573+00	
00000000-0000-0000-0000-000000000000	ed49e687-05da-4459-bff0-bf6d428f60a4	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 01:48:37.894682+00	
00000000-0000-0000-0000-000000000000	a7841411-3807-4c69-bcee-9ebc4fd7a4d5	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 06:35:19.985479+00	
00000000-0000-0000-0000-000000000000	0fd3e368-0263-4865-9465-16d15f731841	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 06:35:20.009322+00	
00000000-0000-0000-0000-000000000000	088bddf2-65de-475c-9700-9401899d220e	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-17 06:36:29.505185+00	
00000000-0000-0000-0000-000000000000	c982216b-be48-44c2-b47f-f1142cb450bd	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-17 06:38:10.458276+00	
00000000-0000-0000-0000-000000000000	5560f027-270f-41f7-b83f-1cddc309c240	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-17 06:42:37.796873+00	
00000000-0000-0000-0000-000000000000	f00dc7e6-c598-427d-a8dd-54002cf108fa	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-17 06:44:39.522589+00	
00000000-0000-0000-0000-000000000000	a652a265-1d20-4979-aea5-bc92b029c480	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:36:50.604249+00	
00000000-0000-0000-0000-000000000000	58066721-90e2-4dce-8216-8f54a1297cf5	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:36:50.610688+00	
00000000-0000-0000-0000-000000000000	db024b60-83fd-4dc4-8984-437452c758ad	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:43:15.259477+00	
00000000-0000-0000-0000-000000000000	3d2aecdd-5a24-47d8-9b50-7dcc0e0d10a2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:43:15.263402+00	
00000000-0000-0000-0000-000000000000	c81b67a8-77ec-49c3-979e-18829306d4ab	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:49:40.616978+00	
00000000-0000-0000-0000-000000000000	7fff8f03-dea2-4516-bbeb-5fb89226cc1d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 07:49:40.62033+00	
00000000-0000-0000-0000-000000000000	d460c7d2-e101-4139-add8-ef59016cc9ac	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 08:18:51.888543+00	
00000000-0000-0000-0000-000000000000	b445e1dc-d869-4b25-bd54-70cc5cc717fe	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 08:18:51.890082+00	
00000000-0000-0000-0000-000000000000	479d9797-3d86-4aab-b812-5ae4c62d81ca	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 07:59:46.631043+00	
00000000-0000-0000-0000-000000000000	57e3b408-1c1a-4ec6-8d9d-20edce3306c3	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 07:59:46.65988+00	
00000000-0000-0000-0000-000000000000	20953b3f-3e07-4fea-a225-537d43ec4346	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 08:42:03.816858+00	
00000000-0000-0000-0000-000000000000	deba1293-9f42-40f6-a3ad-28b8b8e1f7b4	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 08:42:03.830247+00	
00000000-0000-0000-0000-000000000000	d6940050-3820-44c4-b2fd-07672189e326	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 08:58:29.044801+00	
00000000-0000-0000-0000-000000000000	3648f7de-fff4-4db0-9310-11c3c741fa2e	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 08:58:29.049518+00	
00000000-0000-0000-0000-000000000000	4cd49378-25f9-4986-a9f3-a333c3d519fb	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 09:41:02.986055+00	
00000000-0000-0000-0000-000000000000	e29d2572-2750-4ce2-81ff-2c9e49b522c9	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 09:41:02.992587+00	
00000000-0000-0000-0000-000000000000	f0c6cc15-384e-450b-9492-e3fe9239a302	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 09:56:31.726759+00	
00000000-0000-0000-0000-000000000000	9127be6b-4747-4c8f-9371-33a713ad086f	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 09:56:31.735605+00	
00000000-0000-0000-0000-000000000000	bc58a99a-4f0b-4387-91bb-ea2b1041347f	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 10:40:00.392621+00	
00000000-0000-0000-0000-000000000000	73e0deea-20de-4298-a18a-b4343fe2a22a	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 10:40:00.397538+00	
00000000-0000-0000-0000-000000000000	52de63c1-3112-43e3-ba67-e4f9d5389db6	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 10:55:31.680049+00	
00000000-0000-0000-0000-000000000000	d22662e9-7e43-4ac3-af24-e80bbcccdced	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 10:55:31.680832+00	
00000000-0000-0000-0000-000000000000	b37acc7b-d2ab-4740-b520-b78c1a8e87a9	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 11:38:32.478929+00	
00000000-0000-0000-0000-000000000000	baa9422c-b4f1-4f6b-941e-620b6d762930	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 11:38:32.487713+00	
00000000-0000-0000-0000-000000000000	5f9854c8-8199-42db-8589-8e19d4d25ffe	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-18 11:39:37.311972+00	
00000000-0000-0000-0000-000000000000	94a1c3dc-183f-4a1c-82a5-c2d76eaeb75f	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 11:40:19.321087+00	
00000000-0000-0000-0000-000000000000	45f704b6-0c26-455f-8c0a-cef3c32b0fff	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 11:40:27.483505+00	
00000000-0000-0000-0000-000000000000	9dd2b880-16f5-4230-b54b-609791f14c8b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 12:38:48.400408+00	
00000000-0000-0000-0000-000000000000	68742451-6fd0-427c-b9af-85348ba8e4a6	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 12:38:48.403777+00	
00000000-0000-0000-0000-000000000000	7ceae715-37bf-45ce-96ee-e5e2e8d090a7	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 13:33:13.498262+00	
00000000-0000-0000-0000-000000000000	092d817d-26c7-423e-9e9f-58b7ff9591f5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 15:00:52.829603+00	
00000000-0000-0000-0000-000000000000	70d2da3c-ccea-43ea-9bfe-7203e7941295	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 15:00:52.845928+00	
00000000-0000-0000-0000-000000000000	6c69bed5-8f14-4650-94ca-6b7e043a356d	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 15:00:54.906899+00	
00000000-0000-0000-0000-000000000000	0a30b9bf-dca2-4864-a737-d6ee9f08e581	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:35:29.991001+00	
00000000-0000-0000-0000-000000000000	c92d646c-d134-4386-8ab4-39e466850e51	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:35:30.015995+00	
00000000-0000-0000-0000-000000000000	0e501b12-8f5a-45a6-ad01-39f0e841dcff	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 22:34:00.720656+00	
00000000-0000-0000-0000-000000000000	b44db744-a612-4881-840b-2b49cd13182f	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 22:34:00.73195+00	
00000000-0000-0000-0000-000000000000	6ca8e88d-505f-475c-afd4-84fc7bce7837	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 23:32:44.263443+00	
00000000-0000-0000-0000-000000000000	65797bf4-24ad-4425-8333-b44ccff8848a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 23:32:44.270377+00	
00000000-0000-0000-0000-000000000000	b98853f4-45d6-4ea5-9418-7f1957968c24	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 00:30:45.637017+00	
00000000-0000-0000-0000-000000000000	5a237877-86cc-4f40-9c2a-b8be8b3ef7f2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 00:30:45.641079+00	
00000000-0000-0000-0000-000000000000	76c2fbf3-33c3-4db5-ab8c-e1d27b3a3085	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 00:38:16.208646+00	
00000000-0000-0000-0000-000000000000	e89eddfd-d449-4269-8fb4-9aa7a6b51bc2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 00:38:16.212819+00	
00000000-0000-0000-0000-000000000000	685ac7ca-b771-4185-b379-6d309b625209	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 01:29:32.386926+00	
00000000-0000-0000-0000-000000000000	3e63e981-57f9-49c8-8e18-f75344ad4f48	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 01:29:32.390734+00	
00000000-0000-0000-0000-000000000000	d53190b1-4711-4584-a77b-2e8509f06859	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 01:39:46.487228+00	
00000000-0000-0000-0000-000000000000	57b0d3b7-efb1-4fd4-adb8-cb1a8cd8964b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 01:39:46.4906+00	
00000000-0000-0000-0000-000000000000	6a434930-45e1-4db7-81e8-e08ae93c25e7	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 01:39:59.899679+00	
00000000-0000-0000-0000-000000000000	a8817412-3c5a-4da1-b906-05e8f0c09036	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-19 01:43:15.511479+00	
00000000-0000-0000-0000-000000000000	17f92e96-47fd-4ef3-a0d5-9d1d764846c1	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 01:43:21.430438+00	
00000000-0000-0000-0000-000000000000	ee2885fe-ea5f-4422-b484-722c710eb05b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 01:48:26.150498+00	
00000000-0000-0000-0000-000000000000	1f0cc23f-9149-4da3-8e9f-eabf97fda713	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 02:24:25.154909+00	
00000000-0000-0000-0000-000000000000	35fb38be-48f9-4ceb-8aa6-fc8cff8a1024	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 02:42:06.202288+00	
00000000-0000-0000-0000-000000000000	3dddffaf-0553-4a3a-9d0a-6df8b7b7a58e	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 02:42:06.207036+00	
00000000-0000-0000-0000-000000000000	0a531051-59e8-4d8c-987f-9b018111946c	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 03:24:12.204137+00	
00000000-0000-0000-0000-000000000000	dfb5782f-18a0-45cb-9720-e0d06cc50447	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 03:24:12.206914+00	
00000000-0000-0000-0000-000000000000	3844ee11-f79f-4071-8dd0-e83b49724c97	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 03:40:31.832163+00	
00000000-0000-0000-0000-000000000000	7810ec1a-e29c-46de-8468-d4dd468c6f77	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 03:40:31.834257+00	
00000000-0000-0000-0000-000000000000	e25afd5a-de27-4df1-9826-3d62de7572f8	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 04:22:56.873139+00	
00000000-0000-0000-0000-000000000000	86e8eaf0-a245-4200-95d8-be52aa29426f	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 04:22:56.883057+00	
00000000-0000-0000-0000-000000000000	bb4210da-3411-4100-bd7f-b577afca14b7	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-19 04:35:34.699266+00	
00000000-0000-0000-0000-000000000000	40fb89cb-da7e-4917-a467-ede17bacc55a	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 04:35:44.876066+00	
00000000-0000-0000-0000-000000000000	dbf10938-2c4f-4120-aa27-123cf4df5539	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 09:47:55.57592+00	
00000000-0000-0000-0000-000000000000	06647734-df28-489d-821a-6830079c4ce5	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 09:47:55.591456+00	
00000000-0000-0000-0000-000000000000	4378fbf7-5056-4b83-b81c-fe20abfb268a	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:21:27.975552+00	
00000000-0000-0000-0000-000000000000	91eb3790-ca2f-4e9c-b5ae-cf5b904fc5c9	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:22:26.540052+00	
00000000-0000-0000-0000-000000000000	f6635cf5-05ce-418e-b30d-f5fbc60cf172	{"action":"logout","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-20 14:22:33.211666+00	
00000000-0000-0000-0000-000000000000	ce5c03d5-fff1-4c28-b8fb-8519c0643c10	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:22:38.193892+00	
00000000-0000-0000-0000-000000000000	f9a7ec46-5fd2-43b8-bc3a-bff02cdf44bd	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-20 14:23:51.032768+00	
00000000-0000-0000-0000-000000000000	9fe735fd-3f26-42da-a318-33d2cdac6d4e	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:23:53.005498+00	
00000000-0000-0000-0000-000000000000	3f281517-68d0-413f-92af-41220ea9b123	{"action":"logout","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account"}	2025-08-20 14:23:57.405556+00	
00000000-0000-0000-0000-000000000000	c3bbf220-9b30-4154-959e-4c017afda81c	{"action":"login","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:24:00.680143+00	
00000000-0000-0000-0000-000000000000	b26a2a24-3643-408a-986f-64f213cf131b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 18:42:37.479772+00	
00000000-0000-0000-0000-000000000000	428d6b18-5263-472d-9e28-ab297594c561	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 19:41:04.017814+00	
00000000-0000-0000-0000-000000000000	8a12482b-1cea-439c-bf2e-516a23a0bfcc	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 19:41:04.020191+00	
00000000-0000-0000-0000-000000000000	af1dbfcc-03da-45d8-b3e8-3e62a2142a90	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 20:39:33.782165+00	
00000000-0000-0000-0000-000000000000	5a45001b-3c44-4af6-88f9-675c27fe26c5	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 20:39:33.787302+00	
00000000-0000-0000-0000-000000000000	d55321a2-ac2b-4385-ad7a-c4e89d2cc55f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 21:37:33.89888+00	
00000000-0000-0000-0000-000000000000	8a3d765e-599a-4f03-bd37-56899ae57599	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 21:37:33.901659+00	
00000000-0000-0000-0000-000000000000	99bc2d6c-20f0-4dd3-a872-8b0ff9025cc6	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 22:35:33.836042+00	
00000000-0000-0000-0000-000000000000	e4ec2248-95f4-45ac-97c3-395329506a4d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 22:35:33.836913+00	
00000000-0000-0000-0000-000000000000	29491d78-5a32-494e-934d-ce8672b0d6ec	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:00:56.377063+00	
00000000-0000-0000-0000-000000000000	ccf33add-bcff-4f5f-9ead-954c73cc8a10	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:00:56.380764+00	
00000000-0000-0000-0000-000000000000	e4328a78-f20a-4158-af2f-03a3675679e2	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:33:33.983593+00	
00000000-0000-0000-0000-000000000000	dfe3cc55-9e3c-42a1-abab-1177da9297b3	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:33:33.986328+00	
00000000-0000-0000-0000-000000000000	4d64c114-a4ad-467f-b27b-e802ff73ce9b	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:59:38.244099+00	
00000000-0000-0000-0000-000000000000	ad8b68a6-5f43-474b-96f1-31395c94fbfd	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 23:59:38.247397+00	
00000000-0000-0000-0000-000000000000	3881a582-1bd9-4f49-9a9f-cea84cf51c45	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 00:30:53.295022+00	
00000000-0000-0000-0000-000000000000	8b02c912-f51b-427c-8946-63b0ef3fbf40	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 00:31:33.957004+00	
00000000-0000-0000-0000-000000000000	30350803-1b74-4ae0-bc10-97fe57634671	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 00:31:33.958053+00	
00000000-0000-0000-0000-000000000000	35b5f6b5-3e34-408f-b69e-6d618d0cdd4e	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 01:01:59.016186+00	
00000000-0000-0000-0000-000000000000	1febcd0d-f4e9-41df-a417-11e653b134e9	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 01:01:59.020237+00	
00000000-0000-0000-0000-000000000000	835390f1-badf-4a08-b174-9122017ee79b	{"action":"login","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 01:02:13.914655+00	
00000000-0000-0000-0000-000000000000	91f8348b-f780-4085-8ef2-7de69dc9f242	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 02:39:30.060204+00	
00000000-0000-0000-0000-000000000000	54f0c496-164b-4bfe-9567-f3fa3af2e140	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 02:39:30.061769+00	
00000000-0000-0000-0000-000000000000	9a50e9c6-ec47-4612-940e-5419f5fc7bf6	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 02:42:46.253248+00	
00000000-0000-0000-0000-000000000000	d0346dc7-6717-4bfd-92c5-3e6ecbb62c2b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 02:42:46.255908+00	
00000000-0000-0000-0000-000000000000	8348dc62-ba95-483b-9a0d-3eb127032c1b	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 04:13:11.620143+00	
00000000-0000-0000-0000-000000000000	49b6c193-2fab-4170-9913-c8600f14a206	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 04:13:11.621744+00	
00000000-0000-0000-0000-000000000000	1c771321-a410-48a6-a9c0-ad7864df24c8	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 04:13:17.695646+00	
00000000-0000-0000-0000-000000000000	8608aa4c-7052-445b-8239-0b1f6b2d5f57	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 04:13:17.69621+00	
00000000-0000-0000-0000-000000000000	b8b0a5d6-4c4d-4500-8407-a5f995ff4ca2	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 08:53:51.393422+00	
00000000-0000-0000-0000-000000000000	1af32677-300f-433f-afce-f72906a1879f	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 08:53:51.409998+00	
00000000-0000-0000-0000-000000000000	54c5c7c1-6b90-4ad3-a0dd-a56fcbe1b88c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 08:54:22.608396+00	
00000000-0000-0000-0000-000000000000	f83d7665-eb7b-44d7-9175-816152702c8a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 08:54:22.611234+00	
00000000-0000-0000-0000-000000000000	79f631f3-9847-4b05-8b9e-dfce71be9b41	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 09:52:49.608936+00	
00000000-0000-0000-0000-000000000000	e8c40f44-0682-4d8c-a211-d0b28ddcc94c	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 09:52:49.612237+00	
00000000-0000-0000-0000-000000000000	2b3fb178-68fd-4643-a173-22c9c5b348f5	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 13:46:11.995378+00	
00000000-0000-0000-0000-000000000000	c9dd62f4-bf96-4cd5-98ed-bce8161ab963	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 13:46:11.996291+00	
00000000-0000-0000-0000-000000000000	b6e14bcd-c43b-475e-915e-ca89e6f34556	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 13:46:12.33964+00	
00000000-0000-0000-0000-000000000000	8ffc66bf-e793-420c-87ae-f0fb612e00c4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 19:33:52.406795+00	
00000000-0000-0000-0000-000000000000	8c24ff5f-1976-4362-8012-12d79fdc356c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 19:33:52.422411+00	
00000000-0000-0000-0000-000000000000	95413f85-8058-4fc7-b4ec-3b83927f786d	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 20:16:13.247079+00	
00000000-0000-0000-0000-000000000000	583da606-a86f-46b5-9b0a-cf15219d6683	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 20:16:13.252726+00	
00000000-0000-0000-0000-000000000000	688fe209-d45c-45bc-b13c-3bb0477cf384	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 20:32:16.102724+00	
00000000-0000-0000-0000-000000000000	c51b8c0c-0da5-4def-9aa9-8fa681d819b2	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 20:32:16.109682+00	
00000000-0000-0000-0000-000000000000	3a50c64c-4624-47b6-ae07-ac72033231f4	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 21:30:46.101119+00	
00000000-0000-0000-0000-000000000000	cf8f1a04-7ee5-4250-902c-110bbe1cfd01	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 21:30:46.10749+00	
00000000-0000-0000-0000-000000000000	507150a8-648a-485c-8557-4524192483bc	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 22:29:16.16401+00	
00000000-0000-0000-0000-000000000000	795b0eb1-4eab-40e0-b5ac-d778002492f0	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 22:29:16.173245+00	
00000000-0000-0000-0000-000000000000	6418b8db-97bd-4729-8d9c-211748189518	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 23:27:46.151312+00	
00000000-0000-0000-0000-000000000000	14ea915c-9636-45eb-a4ae-e458871ab454	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 23:27:46.158369+00	
00000000-0000-0000-0000-000000000000	01c3693a-778f-42d7-8d87-2ac47723e4f6	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 00:25:53.730791+00	
00000000-0000-0000-0000-000000000000	866ba73d-5fb1-4012-851f-1c68e49b60bd	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 00:25:53.73667+00	
00000000-0000-0000-0000-000000000000	5af5940f-2eb0-463c-a95b-d933986af2ef	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 01:25:16.388282+00	
00000000-0000-0000-0000-000000000000	01fcdd78-7da5-49a4-a3f5-cd75ecee958d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 01:25:16.398509+00	
00000000-0000-0000-0000-000000000000	6d2b1f7f-6235-4526-a499-5800473bc14e	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 03:45:28.008992+00	
00000000-0000-0000-0000-000000000000	da050e55-128f-40a7-933c-18d79fa95c86	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 03:45:28.018516+00	
00000000-0000-0000-0000-000000000000	c0830252-cdb8-4416-93b0-61116686dbfe	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 04:44:42.298764+00	
00000000-0000-0000-0000-000000000000	dd7beb82-26f1-4a7e-a819-b3561bf710f7	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 04:44:42.305358+00	
00000000-0000-0000-0000-000000000000	eae15fb2-f43d-4b50-9562-0c09237fd072	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 05:43:35.544417+00	
00000000-0000-0000-0000-000000000000	9cb34752-b394-4907-b367-1ab3e1e43f31	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 05:43:35.551737+00	
00000000-0000-0000-0000-000000000000	b428fd56-1453-4dc0-87ee-d56a1f9856e3	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 08:12:59.664203+00	
00000000-0000-0000-0000-000000000000	3585f766-22af-4b08-adc1-d7bcb84924df	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 08:12:59.673648+00	
00000000-0000-0000-0000-000000000000	465fcc6b-6d63-4647-8d63-a09b93d75ae0	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 11:41:36.662206+00	
00000000-0000-0000-0000-000000000000	dc4981ce-d0cf-4616-97b0-533bbb49d54d	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 11:41:36.667418+00	
00000000-0000-0000-0000-000000000000	0c9f656d-860a-42c8-a1e9-7f7478048018	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 12:41:29.870886+00	
00000000-0000-0000-0000-000000000000	80e42892-b330-4269-93a4-6a714c3c0625	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 12:41:29.874495+00	
00000000-0000-0000-0000-000000000000	03d654eb-d49d-448e-9027-9bdfe37f6bc8	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 13:40:05.871041+00	
00000000-0000-0000-0000-000000000000	01bbb864-7386-48bb-812f-313a74b419ac	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 13:40:05.873763+00	
00000000-0000-0000-0000-000000000000	dfb8d5bc-502f-4e2d-9bec-e305711fe630	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 18:51:42.472473+00	
00000000-0000-0000-0000-000000000000	4e70e082-8656-4763-bf4e-6fad38b0a12a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 18:51:42.478375+00	
00000000-0000-0000-0000-000000000000	fbbd24d8-7659-4794-8af8-4267207ebb1a	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 18:51:42.524335+00	
00000000-0000-0000-0000-000000000000	cc9a3f62-aa40-4a4f-8f39-ada278ccbc95	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 19:50:12.99719+00	
00000000-0000-0000-0000-000000000000	8f2f9c94-9776-4d64-9f6e-ec06810a6840	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 19:50:13.006824+00	
00000000-0000-0000-0000-000000000000	b5af9ce6-c39f-4c11-84c7-9ad21ba4ef75	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 20:48:43.039324+00	
00000000-0000-0000-0000-000000000000	f295f83c-3476-43d3-807c-1a7e36a0656d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 20:48:43.042078+00	
00000000-0000-0000-0000-000000000000	18aaf64d-48e0-473e-ac75-bb35fe2500ef	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 21:47:13.092859+00	
00000000-0000-0000-0000-000000000000	f2094a61-d072-4f35-8421-2460d08035df	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 21:47:13.096467+00	
00000000-0000-0000-0000-000000000000	4dc1c753-2a8b-4248-b0d0-329077172d46	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 22:45:43.121634+00	
00000000-0000-0000-0000-000000000000	654115e7-6cc4-4708-8f3f-d3bc3fd30e20	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 22:45:43.1274+00	
00000000-0000-0000-0000-000000000000	a63ca73d-2b10-4f37-b83e-3b5605f89676	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 23:44:13.169822+00	
00000000-0000-0000-0000-000000000000	a669355f-e7ae-49e1-ba69-a3434a25ea71	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 23:44:13.175316+00	
00000000-0000-0000-0000-000000000000	ea9c6199-0808-43e2-b6d2-771dde505a00	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 02:19:52.704629+00	
00000000-0000-0000-0000-000000000000	1b530994-1875-40a2-a786-3e0f568f4e9b	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 02:19:52.716613+00	
00000000-0000-0000-0000-000000000000	14a5089f-6e3b-460f-96bb-fee91d71648c	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 03:18:04.814392+00	
00000000-0000-0000-0000-000000000000	6e713854-fdca-4264-beca-4ac0e8eb2de1	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 03:18:04.817927+00	
00000000-0000-0000-0000-000000000000	5e69ec55-410c-46d1-af12-f0cd8c482f03	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 05:33:08.739101+00	
00000000-0000-0000-0000-000000000000	e108f8aa-52fd-4ce4-a52d-db79316a412f	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 05:33:08.748069+00	
00000000-0000-0000-0000-000000000000	e1a62c19-0d16-4d45-91c6-d7dde2a3a40d	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 06:32:07.559255+00	
00000000-0000-0000-0000-000000000000	34ae0ad3-2885-403f-9e48-d93dbd8dd9c0	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 06:32:07.563161+00	
00000000-0000-0000-0000-000000000000	1f5849ff-42fc-4636-93b2-a25bfb8534d5	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 07:31:07.760089+00	
00000000-0000-0000-0000-000000000000	dfc7f0b1-b9b7-4032-96b7-3003195d4491	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 07:31:07.76302+00	
00000000-0000-0000-0000-000000000000	3e792743-7bbc-4df6-b233-9ad86a88f561	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 08:57:27.994363+00	
00000000-0000-0000-0000-000000000000	8b146a9e-4347-47cd-8b41-80064ef2fa1a	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 08:57:27.996451+00	
00000000-0000-0000-0000-000000000000	d14174fb-3b88-40a6-ae12-2d9cbb2b39b9	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 08:57:33.556794+00	
00000000-0000-0000-0000-000000000000	f86d8a46-bb78-4985-bf47-34db4522901a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 08:57:33.559337+00	
00000000-0000-0000-0000-000000000000	716c6b80-0e36-48aa-be37-ac2493509234	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 19:03:13.279078+00	
00000000-0000-0000-0000-000000000000	6bd5e693-a262-49f5-b951-df500b573508	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 19:03:13.291664+00	
00000000-0000-0000-0000-000000000000	c6559ce6-817f-459f-89ae-e07cc62be7fe	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 19:03:14.805459+00	
00000000-0000-0000-0000-000000000000	1b5538a8-6d04-46dd-8ecd-5c6ff556029f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 20:01:17.804668+00	
00000000-0000-0000-0000-000000000000	81890ae0-5ab8-47fa-b796-f6088251b62a	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 20:01:17.810452+00	
00000000-0000-0000-0000-000000000000	9ab17b80-84d8-458c-8fd5-fb4e71dde45f	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 20:59:47.763868+00	
00000000-0000-0000-0000-000000000000	873e6819-5335-42e6-8599-cf882d3d3132	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 20:59:47.767113+00	
00000000-0000-0000-0000-000000000000	58924d73-0ee3-4716-bd31-594a697edd8c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 21:57:50.546717+00	
00000000-0000-0000-0000-000000000000	f0d54af9-1f0e-4521-a49f-06743f9a423b	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 21:57:50.549409+00	
00000000-0000-0000-0000-000000000000	e6d89826-a7d0-4441-ae2f-42d583106eee	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 23:07:58.66388+00	
00000000-0000-0000-0000-000000000000	4d853c8d-9cd3-4c36-a10c-7adb748ab343	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-23 23:07:58.669298+00	
00000000-0000-0000-0000-000000000000	ca83a190-e168-441f-aa87-04a1992ee67c	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 00:06:49.975933+00	
00000000-0000-0000-0000-000000000000	abd33989-7497-42da-8901-05c290b85d8d	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 00:06:49.987612+00	
00000000-0000-0000-0000-000000000000	ea6e6132-fa4e-4645-a701-cbae24e02dab	{"action":"token_refreshed","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 01:06:17.861468+00	
00000000-0000-0000-0000-000000000000	01cb558c-55a6-4605-a688-998f41dab03c	{"action":"token_revoked","actor_id":"e05094eb-0452-43bd-aa3e-214a6c3b6966","actor_name":"Administrador Senderos","actor_username":"administrador@senderos.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 01:06:17.86505+00	
00000000-0000-0000-0000-000000000000	4e583914-514b-4d69-a00e-3c791e05862a	{"action":"token_refreshed","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 04:21:54.501387+00	
00000000-0000-0000-0000-000000000000	96c52fe3-22fd-4cb2-ba11-19115bfaa0b9	{"action":"token_revoked","actor_id":"67ff8340-41be-400d-a33b-cad1ced23bce","actor_name":"Admin Pruebas","actor_username":"pruebas@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-24 04:21:54.511409+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	{"sub": "e05094eb-0452-43bd-aa3e-214a6c3b6966", "role": "admin", "email": "administrador@senderos.com", "full_name": "Administrador Senderos", "email_verified": false, "phone_verified": false}	email	2025-08-02 20:46:41.783239+00	2025-08-02 20:46:41.783303+00	2025-08-02 20:46:41.783303+00	31a16f20-8f74-4daa-a43c-8de66789f172
67ff8340-41be-400d-a33b-cad1ced23bce	67ff8340-41be-400d-a33b-cad1ced23bce	{"sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "admin", "email": "pruebas@gmail.com", "full_name": "Admin Pruebas", "email_verified": false, "phone_verified": false}	email	2025-08-02 20:52:13.915224+00	2025-08-02 20:52:13.915276+00	2025-08-02 20:52:13.915276+00	afac6421-3899-457e-bd5b-b8dd55738738
507de59b-bccf-4f10-9bf1-a7825385b05b	507de59b-bccf-4f10-9bf1-a7825385b05b	{"sub": "507de59b-bccf-4f10-9bf1-a7825385b05b", "email": "staff@senderos.com", "email_verified": false, "phone_verified": false}	email	2025-08-03 18:39:17.607091+00	2025-08-03 18:39:17.607168+00	2025-08-03 18:39:17.607168+00	e8c5041f-1f03-4c99-a65d-af131f57aba2
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
131c1246-1e48-4770-8c34-6c1d3e3026f6	2025-08-20 14:24:00.684229+00	2025-08-20 14:24:00.684229+00	password	bde7cd57-5f73-4238-b1da-0651e33e7c2a
38d0d06e-a6af-4966-a693-2f04b98829ba	2025-08-20 18:42:37.503396+00	2025-08-20 18:42:37.503396+00	password	4ecbacc6-3002-401b-8663-af880be97f15
c48ca9a5-0bdb-4791-a5ad-23eb4f06dd89	2025-08-21 00:30:53.313626+00	2025-08-21 00:30:53.313626+00	password	4cf2c788-69d1-42ec-bd31-d14c7ec6b62e
a20d54b5-1b1c-4582-be76-36e00baba206	2025-08-21 01:02:13.927293+00	2025-08-21 01:02:13.927293+00	password	6c0ef413-785e-4f52-b7cf-03317c05b270
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
27ed0a3d-70e6-4194-ac97-faa29d60e120	e05094eb-0452-43bd-aa3e-214a6c3b6966	confirmation_token	dee4e46ec1e10183ce051b1fcbc1e5cae2e7a64bb4b90dbd52156742	administrador@senderos.com	2025-08-02 20:46:42.307642	2025-08-02 20:46:42.307642
aa95a712-8181-4648-ab6f-17d9ae3aca64	67ff8340-41be-400d-a33b-cad1ced23bce	confirmation_token	9cc0b31319a115af0cf333cd525b24f63a0ab78679fd5f6eb6e8fba3	pruebas@gmail.com	2025-08-02 20:52:14.388733	2025-08-02 20:52:14.388733
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	539	t5ekgyi3hnrt	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 18:42:37.497168+00	2025-08-20 19:41:04.021475+00	\N	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	540	lnmhygwuevxs	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 19:41:04.025243+00	2025-08-20 20:39:33.787856+00	t5ekgyi3hnrt	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	541	mkhtxgdwuqub	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 20:39:33.788539+00	2025-08-20 21:37:33.90219+00	lnmhygwuevxs	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	542	nbq66x4xjuih	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 21:37:33.905762+00	2025-08-20 22:35:33.838227+00	mkhtxgdwuqub	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	538	e2b4pd4ju3dw	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-20 14:24:00.681686+00	2025-08-20 23:00:56.382012+00	\N	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	543	e5j5rkvtcgvq	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 22:35:33.838871+00	2025-08-20 23:33:33.986818+00	nbq66x4xjuih	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	544	f5zi6cwaxo3e	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-20 23:00:56.383397+00	2025-08-20 23:59:38.247939+00	e2b4pd4ju3dw	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	545	t4lz2ijzuhlv	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-20 23:33:33.988186+00	2025-08-21 00:31:33.95962+00	e5j5rkvtcgvq	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	546	e63z3hnqiy5c	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-20 23:59:38.249227+00	2025-08-21 01:01:59.020764+00	f5zi6cwaxo3e	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	549	fly35oymlbbi	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 01:01:59.023669+00	2025-08-21 02:39:30.062374+00	e63z3hnqiy5c	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	550	fkqsykzynsnb	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 01:02:13.926156+00	2025-08-21 02:42:46.257896+00	\N	a20d54b5-1b1c-4582-be76-36e00baba206
00000000-0000-0000-0000-000000000000	552	ojorlrcc2ogt	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 02:42:46.259305+00	2025-08-21 04:13:11.622345+00	fkqsykzynsnb	a20d54b5-1b1c-4582-be76-36e00baba206
00000000-0000-0000-0000-000000000000	551	x6adpnmvw7u4	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 02:39:30.063044+00	2025-08-21 04:13:17.696709+00	fly35oymlbbi	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	554	e4pxn3kem2h6	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 04:13:17.697046+00	2025-08-21 08:53:51.413863+00	x6adpnmvw7u4	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	553	ve66pz4cwivu	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 04:13:11.623754+00	2025-08-21 08:54:22.618309+00	ojorlrcc2ogt	a20d54b5-1b1c-4582-be76-36e00baba206
00000000-0000-0000-0000-000000000000	555	hzmk5asrlesl	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 08:53:51.430465+00	2025-08-21 09:52:49.614179+00	e4pxn3kem2h6	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	547	bxrabeo2jxxc	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 00:30:53.308496+00	2025-08-21 13:46:11.996814+00	\N	c48ca9a5-0bdb-4791-a5ad-23eb4f06dd89
00000000-0000-0000-0000-000000000000	558	7stl45ylw7gc	e05094eb-0452-43bd-aa3e-214a6c3b6966	f	2025-08-21 13:46:11.997442+00	2025-08-21 13:46:11.997442+00	bxrabeo2jxxc	c48ca9a5-0bdb-4791-a5ad-23eb4f06dd89
00000000-0000-0000-0000-000000000000	548	fm5k2ntlwv2s	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 00:31:33.960295+00	2025-08-21 19:33:52.424899+00	t4lz2ijzuhlv	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	557	pmdgqgg5ekua	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 09:52:49.616104+00	2025-08-21 20:16:13.261304+00	hzmk5asrlesl	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	559	yptidzb6qwgr	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 19:33:52.442925+00	2025-08-21 20:32:16.112667+00	fm5k2ntlwv2s	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	561	tjmthpu7jmf3	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 20:32:16.117429+00	2025-08-21 21:30:46.110479+00	yptidzb6qwgr	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	562	e5el4mvctle7	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 21:30:46.117697+00	2025-08-21 22:29:16.174531+00	tjmthpu7jmf3	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	563	dg7vkdb3pt6x	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 22:29:16.180551+00	2025-08-21 23:27:46.160322+00	e5el4mvctle7	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	564	girprknfxjte	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 23:27:46.166104+00	2025-08-22 00:25:53.739004+00	dg7vkdb3pt6x	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	565	jzyjdrioum74	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 00:25:53.743781+00	2025-08-22 01:25:16.39977+00	girprknfxjte	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	560	6v4wjg4ovku5	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-21 20:16:13.268436+00	2025-08-22 03:45:28.021548+00	pmdgqgg5ekua	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	567	gf4knbddyj43	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 03:45:28.027763+00	2025-08-22 04:44:42.305924+00	6v4wjg4ovku5	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	568	u3hsggwv27zm	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 04:44:42.308922+00	2025-08-22 05:43:35.553538+00	gf4knbddyj43	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	569	krxvjqxwgb4y	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 05:43:35.559322+00	2025-08-22 08:12:59.679311+00	u3hsggwv27zm	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	570	vrwjmty2o5gv	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 08:12:59.68569+00	2025-08-22 11:41:36.668673+00	krxvjqxwgb4y	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	571	wuwboku6ioy2	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 11:41:36.677286+00	2025-08-22 12:41:29.876504+00	vrwjmty2o5gv	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	572	p33t2o72o3t2	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 12:41:29.878659+00	2025-08-22 13:40:05.874833+00	wuwboku6ioy2	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	566	szwxdgytruks	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 01:25:16.406358+00	2025-08-22 18:51:42.480262+00	jzyjdrioum74	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	574	dn4pl2rjehqj	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 18:51:42.487102+00	2025-08-22 19:50:13.008686+00	szwxdgytruks	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	575	at4gqdn6rve2	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 19:50:13.010679+00	2025-08-22 20:48:43.042626+00	dn4pl2rjehqj	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	576	uekwdrhpwkth	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 20:48:43.044495+00	2025-08-22 21:47:13.09765+00	at4gqdn6rve2	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	577	zbx2oj2idjoy	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 21:47:13.100731+00	2025-08-22 22:45:43.127934+00	uekwdrhpwkth	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	578	47soidh3p4za	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 22:45:43.131398+00	2025-08-22 23:44:13.175891+00	zbx2oj2idjoy	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	573	iqkk4meskzye	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-22 13:40:05.877452+00	2025-08-23 02:19:52.718408+00	p33t2o72o3t2	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	580	hevuyc57vebw	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 02:19:52.724224+00	2025-08-23 03:18:04.820477+00	iqkk4meskzye	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	581	sovjiko3hx7a	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 03:18:04.822637+00	2025-08-23 05:33:08.75063+00	hevuyc57vebw	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	582	yakhm4t3z2eh	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 05:33:08.758855+00	2025-08-23 06:32:07.56585+00	sovjiko3hx7a	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	583	axx3rngzbirp	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 06:32:07.569485+00	2025-08-23 07:31:07.766313+00	yakhm4t3z2eh	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	584	4zlhetob4fql	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 07:31:07.772563+00	2025-08-23 08:57:27.998811+00	axx3rngzbirp	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	556	kvnycxml7gqx	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-21 08:54:22.618721+00	2025-08-23 08:57:33.561718+00	ve66pz4cwivu	a20d54b5-1b1c-4582-be76-36e00baba206
00000000-0000-0000-0000-000000000000	586	yz6a2ph5rszx	e05094eb-0452-43bd-aa3e-214a6c3b6966	f	2025-08-23 08:57:33.563788+00	2025-08-23 08:57:33.563788+00	kvnycxml7gqx	a20d54b5-1b1c-4582-be76-36e00baba206
00000000-0000-0000-0000-000000000000	579	6rq53ia7fzjq	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-22 23:44:13.179101+00	2025-08-23 19:03:13.292264+00	47soidh3p4za	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	587	vwawvrrk2d5p	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-23 19:03:13.308146+00	2025-08-23 20:01:17.813578+00	6rq53ia7fzjq	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	585	kg5vt3d5nbzd	67ff8340-41be-400d-a33b-cad1ced23bce	t	2025-08-23 08:57:28.002468+00	2025-08-24 04:21:54.512666+00	4zlhetob4fql	131c1246-1e48-4770-8c34-6c1d3e3026f6
00000000-0000-0000-0000-000000000000	588	nwdkzidppkzz	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-23 20:01:17.817804+00	2025-08-23 20:59:47.767615+00	vwawvrrk2d5p	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	589	ltb4o4jslj5y	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-23 20:59:47.771417+00	2025-08-23 21:57:50.553132+00	nwdkzidppkzz	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	590	w7tic3qibnkr	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-23 21:57:50.557054+00	2025-08-23 23:07:58.671086+00	ltb4o4jslj5y	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	591	2otsctwjibus	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-23 23:07:58.674968+00	2025-08-24 00:06:49.98946+00	w7tic3qibnkr	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	592	4qy7buugg7dx	e05094eb-0452-43bd-aa3e-214a6c3b6966	t	2025-08-24 00:06:50.002317+00	2025-08-24 01:06:17.866806+00	2otsctwjibus	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	593	zwyktkcrrwky	e05094eb-0452-43bd-aa3e-214a6c3b6966	f	2025-08-24 01:06:17.872989+00	2025-08-24 01:06:17.872989+00	4qy7buugg7dx	38d0d06e-a6af-4966-a693-2f04b98829ba
00000000-0000-0000-0000-000000000000	594	xp7d4vj75k2w	67ff8340-41be-400d-a33b-cad1ced23bce	f	2025-08-24 04:21:54.524778+00	2025-08-24 04:21:54.524778+00	kg5vt3d5nbzd	131c1246-1e48-4770-8c34-6c1d3e3026f6
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
c48ca9a5-0bdb-4791-a5ad-23eb4f06dd89	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-21 00:30:53.30538+00	2025-08-21 13:46:12.340845+00	\N	aal1	\N	2025-08-21 13:46:12.340763	Vercel Edge Functions	18.230.191.72	\N
a20d54b5-1b1c-4582-be76-36e00baba206	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-21 01:02:13.921419+00	2025-08-23 08:57:33.566343+00	\N	aal1	\N	2025-08-23 08:57:33.566264	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	163.47.70.66	\N
38d0d06e-a6af-4966-a693-2f04b98829ba	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-20 18:42:37.490958+00	2025-08-24 01:06:17.878243+00	\N	aal1	\N	2025-08-24 01:06:17.87817	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	181.115.172.19	\N
131c1246-1e48-4770-8c34-6c1d3e3026f6	67ff8340-41be-400d-a33b-cad1ced23bce	2025-08-20 14:24:00.680942+00	2025-08-24 04:21:54.531774+00	\N	aal1	\N	2025-08-24 04:21:54.531699	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	163.47.70.66	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\N	2e288537-a785-4d7e-8a05-7bd37456dd05	\N	\N	admin.pruebas@test.com	$2a$06$E5i4uh/wJEGh//LTCfrhIOZWQS9s1ZBUkucDq14aDnoyvc47pIY5q	2025-08-02 20:47:13.914457+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-02 20:47:13.914457+00	2025-08-02 20:47:13.914457+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	bc42768e-f2d4-41c1-ba92-b393768e8234	\N	\N	adminpruebas@gmail.com	$2a$06$uBvUXtDsN/FrFyqhfsibwuJwAaNSc9PNktQJ25rV6WDukUolx/JrS	2025-08-02 20:50:35.38508+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-02 20:50:35.38508+00	2025-08-02 20:50:35.38508+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	507de59b-bccf-4f10-9bf1-a7825385b05b	authenticated	authenticated	staff@senderos.com	$2a$10$fgKk7kdKTyK9yD2x3LIsQOQQwYd/PB1U3J.Uq4sWZSnH0rh0lxr.m	2025-08-03 18:39:17.613681+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-03 18:39:17.576045+00	2025-08-03 18:39:17.614534+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	67ff8340-41be-400d-a33b-cad1ced23bce	authenticated	authenticated	pruebas@gmail.com	$2a$10$ahH7QiPBejpSto1Pb9vNxOCXj0YldbWOc4CVWaFiXT0whht.Py96K	2025-08-02 20:52:22.021061+00	\N	9cc0b31319a115af0cf333cd525b24f63a0ab78679fd5f6eb6e8fba3	2025-08-02 20:52:13.918434+00		\N			\N	2025-08-20 14:24:00.680861+00	{"provider": "email", "providers": ["email"]}	{"sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "admin", "email": "pruebas@gmail.com", "full_name": "Admin Pruebas", "email_verified": false, "phone_verified": false}	\N	2025-08-02 20:52:13.909056+00	2025-08-24 04:21:54.528179+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e05094eb-0452-43bd-aa3e-214a6c3b6966	authenticated	authenticated	administrador@senderos.com	$2a$10$8G2BbBaIvMgHMlQ5CnQXxOyh3fMT6Lk124ZtXLIa4DBeeZn9ocj3q	2025-08-02 20:46:46.774069+00	\N	dee4e46ec1e10183ce051b1fcbc1e5cae2e7a64bb4b90dbd52156742	2025-08-02 20:46:41.799491+00		\N			\N	2025-08-21 01:02:13.921329+00	{"provider": "email", "providers": ["email"]}	{"sub": "e05094eb-0452-43bd-aa3e-214a6c3b6966", "role": "admin", "email": "administrador@senderos.com", "full_name": "Administrador Senderos", "email_verified": false, "phone_verified": false}	\N	2025-08-02 20:46:41.768171+00	2025-08-24 01:06:17.876176+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_registers (id, restaurant_id, opened_at, closed_at, opening_amount, closing_amount, total_sales, total_qr, total_card, total_cash, difference, status, opened_by, closed_by, notes, created_at, updated_at) FROM stdin;
adf16611-6a62-4b95-903e-2bf77fbf5034	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-18 21:37:37.192577+00	2025-08-19 01:37:15.887+00	303.50	463.50	223.00	158.00	0.00	65.00	95.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 7239.72\nBalance bancario real: 7184.63	2025-08-18 21:37:37.192577+00	2025-08-18 21:37:37.192577+00
f7079f7b-fdbf-437f-b132-2069e37f3167	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-06 20:49:28.077347+00	2025-08-07 00:16:09.464+00	979.50	1038.50	377.00	278.00	0.00	99.00	-40.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 20:49:28.077347+00	2025-08-06 20:49:28.077347+00
1c65c73d-2d40-4e02-8db6-123dcb55de9d	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-07 19:43:22.463171+00	2025-08-08 00:09:08.373+00	2706.72	2870.72	336.00	156.00	0.00	180.00	-16.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 19:43:22.463171+00	2025-08-07 19:43:22.463171+00
f4eb4548-b6e4-4217-94eb-41bac14184f9	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-08 20:00:17.322269+00	2025-08-09 01:04:06.532+00	2925.72	3201.72	236.00	92.00	0.00	144.00	132.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 20:00:17.322269+00	2025-08-08 20:00:17.322269+00
ede9b118-be57-403c-8813-33aa5894e7ce	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-09 20:26:18.59036+00	2025-08-10 01:45:21.416+00	3455.72	3849.72	395.00	87.00	0.00	308.00	86.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-09 20:26:18.59036+00	2025-08-09 20:26:18.59036+00
c7a38c72-5c1a-4780-9060-cec6ccb0cc28	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-11 20:59:57.36291+00	2025-08-12 01:16:20.076+00	4116.42	4328.42	137.00	137.00	0.00	0.00	212.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-11 20:59:57.36291+00	2025-08-11 20:59:57.36291+00
8960daf3-7295-4ae1-b1d2-359c9c2bebd6	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-12 19:47:14.289134+00	2025-08-13 01:33:11.755+00	4783.42	5262.42	364.00	186.00	0.00	178.00	301.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 19:47:14.289134+00	2025-08-12 19:47:14.289134+00
8109b5c5-7522-402c-8022-ea084dd3878f	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-13 20:29:28.029105+00	2025-08-14 00:56:36.674+00	5262.42	5269.42	179.00	0.00	0.00	179.00	-172.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 20:29:28.029105+00	2025-08-13 20:29:28.029105+00
2bf22cf9-96da-467b-b482-dc983f71dcff	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-14 18:56:51.146997+00	2025-08-15 02:17:21.789+00	5269.42	6522.92	1017.00	81.00	0.00	936.00	317.50	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-14 18:56:51.146997+00	2025-08-14 18:56:51.146997+00
6ad48829-d7ff-4f8b-b716-3b4af2225626	a01006de-3963-406d-b060-5b7b34623a38	2025-08-02 21:37:13.498889+00	2025-08-15 05:10:52.168+00	200.00	300.00	1309.75	303.50	106.00	900.25	-800.25	closed	67ff8340-41be-400d-a33b-cad1ced23bce	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-02 21:37:13.498889+00	2025-08-02 21:37:13.498889+00
d396d1b4-9723-46cb-9bd2-27769b0da2b4	a01006de-3963-406d-b060-5b7b34623a38	2025-08-15 05:11:31.25518+00	2025-08-15 05:13:20.085+00	300.00	300.00	55.00	20.00	0.00	35.00	-35.00	closed	67ff8340-41be-400d-a33b-cad1ced23bce	67ff8340-41be-400d-a33b-cad1ced23bce	Balance bancario inicial: 500	2025-08-15 05:11:31.25518+00	2025-08-15 05:11:31.25518+00
eccef4cb-acfc-4972-b199-fd3bbe9274aa	a01006de-3963-406d-b060-5b7b34623a38	2025-08-15 05:25:09.227535+00	\N	200.00	\N	0.00	0.00	0.00	0.00	\N	open	67ff8340-41be-400d-a33b-cad1ced23bce	\N	Balance bancario inicial: 100	2025-08-15 05:25:09.227535+00	2025-08-15 05:25:09.227535+00
729c56b7-8b5b-4be6-a551-99d7a86b8f05	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-15 19:46:39.437341+00	2025-08-16 02:38:03.953+00	6467.92	7322.20	516.00	381.00	0.00	135.00	719.28	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 19:46:39.437341+00	2025-08-15 19:46:39.437341+00
23333f2a-1c2a-40d4-9c9a-27c950a76a85	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-16 14:13:12.210897+00	2025-08-17 02:08:45.019+00	7322.22	8115.22	693.00	556.00	0.00	137.00	656.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 14:13:12.210897+00	2025-08-16 14:13:12.210897+00
c179a509-8b7c-44ad-bfd9-1bb426deeaa9	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-20 19:20:13.141555+00	2025-08-21 01:00:01.667+00	716.50	790.50	340.00	200.00	0.00	140.00	-66.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 7276.63\nBalance bancario real: 6391.63	2025-08-20 19:20:13.141555+00	2025-08-20 19:20:13.141555+00
ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-21 20:25:03.876285+00	2025-08-22 01:52:37.191+00	290.50	575.00	676.00	440.00	0.00	236.00	48.50	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 7184.63\nBalance bancario real: 7236.63	2025-08-21 20:25:03.876285+00	2025-08-21 20:25:03.876285+00
2ac0385b-8064-4209-9975-ff7d9256e8b3	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-22 01:57:24.675684+00	2025-08-22 01:58:02.196+00	575.00	575.00	0.00	0.00	0.00	0.00	0.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 7236.63\nBalance bancario real: 7236.63	2025-08-22 01:57:24.675684+00	2025-08-22 01:57:24.675684+00
5c612b0e-b375-4b95-b8d8-e498bada6ac6	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-22 19:24:47.62155+00	2025-08-23 00:35:44.147+00	475.00	506.00	71.00	0.00	0.00	71.00	-40.00	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 7236.63\nBalance bancario real: 7181.63	2025-08-22 19:24:47.62155+00	2025-08-22 19:24:47.62155+00
e66dc660-fd5d-4958-8909-48895563baea	b333ede7-f67e-43d6-8652-9a918737d6e3	2025-08-23 23:30:56.21724+00	2025-08-24 01:28:06.977+00	7181.63	486.00	450.00	450.00	0.00	0.00	-6695.63	closed	e05094eb-0452-43bd-aa3e-214a6c3b6966	e05094eb-0452-43bd-aa3e-214a6c3b6966	Balance bancario inicial: 506\nBalance bancario real: 7631.63	2025-08-23 23:30:56.21724+00	2025-08-23 23:30:56.21724+00
\.


--
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_categories (id, created_at, name, display_order, is_available, restaurant_id) FROM stdin;
22	2025-08-02 20:33:04.504394+00	Hamburguesas	1	t	a01006de-3963-406d-b060-5b7b34623a38
23	2025-08-02 20:33:04.504394+00	Pizzas	2	t	a01006de-3963-406d-b060-5b7b34623a38
24	2025-08-02 20:33:04.504394+00	Bebidas	3	t	a01006de-3963-406d-b060-5b7b34623a38
41	2025-08-03 18:44:36.819763+00	Cafés en Máquina	1	t	b333ede7-f67e-43d6-8652-9a918737d6e3
42	2025-08-03 18:44:37.115225+00	Especialidad Métodos	2	t	b333ede7-f67e-43d6-8652-9a918737d6e3
43	2025-08-03 18:44:37.331036+00	Bebidas Calientes	3	t	b333ede7-f67e-43d6-8652-9a918737d6e3
47	2025-08-04 01:24:30.764002+00	Te de Especialidad	4	t	b333ede7-f67e-43d6-8652-9a918737d6e3
44	2025-08-03 18:44:37.533782+00	Jugos	5	t	b333ede7-f67e-43d6-8652-9a918737d6e3
45	2025-08-03 18:44:37.751224+00	Pastelería	6	t	b333ede7-f67e-43d6-8652-9a918737d6e3
46	2025-08-03 18:44:37.94672+00	Nuestros Especiales	7	t	b333ede7-f67e-43d6-8652-9a918737d6e3
50	2025-08-08 00:02:14.112217+00	Café en grano	8	t	b333ede7-f67e-43d6-8652-9a918737d6e3
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (id, created_at, name, description, price, image_url, category_id, is_available, display_order, restaurant_id, archived, cost) FROM stdin;
223	2025-08-06 23:41:02.777555+00	Chocolate caliente	Leche texturizada con chocolate.	18	\N	43	t	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
203	2025-08-04 22:13:03.480884+00	pedido especial	Producto especial creado el 4/8/2025 para orden #305	23	\N	\N	f	6	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
195	2025-08-04 21:06:46.948241+00	doble shot de cafe	Producto especial creado el 4/8/2025 para orden #298	20	\N	\N	f	9	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
234	2025-08-15 00:47:43.776001+00	Miel en frasco	Miel natural de taipiplaya	80	\N	50	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
79	2025-08-02 20:33:28.804688+00	Pizza Margherita	Pizza con tomate y mozzarella	40.00	\N	23	t	1	a01006de-3963-406d-b060-5b7b34623a38	f	15
80	2025-08-02 20:33:28.804688+00	Coca Cola	Bebida gaseosa	8.00	\N	24	t	1	a01006de-3963-406d-b060-5b7b34623a38	f	5
177	2025-08-03 18:44:42.142925+00	Tía Coco	Zanahoria, coco y ramas de canela	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_177_20.png	47	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
178	2025-08-03 18:44:42.351505+00	Mystic Chai	Té negro, garam masala (mezcla de especias) jengibre y naranja.	22	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_178_21.png	47	t	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
170	2025-08-03 18:44:40.713603+00	Té	Té negro de especialidad destilado.	12	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_170_13.png	43	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0.66
171	2025-08-03 18:44:40.920657+00	Sultana	Sultana de especialidad con cáscara de naranja y canela	16	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/1754270793304-14.png	43	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	2.29
172	2025-08-03 18:44:41.117059+00	Té de la Abuela	Té negro de especialidad con leche y miel	16	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/1754270774969-15.png	43	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
159	2025-08-03 18:44:38.354117+00	Capuccino	Café espresso con leche texturizada.	18	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_159_2.png	41	t	6	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.88
167	2025-08-03 18:44:40.07208+00	Prensa Francesa 	Destaca sabores intensos y con cuerpo robusto.	28	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_167_10.png	42	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
173	2025-08-03 18:44:41.337667+00	Mates: Coca - Manzanilla - Anís	Infusión de hojas y semillas deshidratadas y picadas.	10	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_173_16.png	43	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
179	2025-08-03 18:44:42.546399+00	Frutas de Temporada	Jugo de frutas de temporada	16	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_179_25.png	44	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
180	2025-08-03 18:44:42.711555+00	Frutas Exóticas	Jugo de frutas exóticas	21	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_180_22.png	44	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
219	2025-08-06 22:45:23.204634+00	Tostadas bicentenario	Tostadas de pan marraqueta con queso, jamón ahumado y mermelada de frutos rojos, con un toque de menta	15	\N	46	t	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
166	2025-08-03 18:44:39.873085+00	Chemex	Destaca la delicadeza del grano. 	28	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/1754270402067-9.png	42	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
182	2025-08-03 18:44:43.047715+00	Cupcake relleno	Pregunta el sabor del día	12	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_182_30.png	45	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
175	2025-08-03 18:44:41.75005+00	After Eigth	Té negro, hierba buena, menta, naranja y cacao.	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_175_18.png	47	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
158	2025-08-03 18:44:38.15647+00	Espresso	Café blendeado de catuai y typica con un tostado medio oscuro, extraído a presión.	14	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_158_1.png	41	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	8
196	2025-08-04 21:14:30.30543+00	prueba producto especial	Producto especial creado el 4/8/2025 para orden #299	10	\N	\N	f	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
163	2025-08-03 18:44:39.272694+00	Mocaccino Amazonico	Café espresso con cacao amazónico y una capa de leche texturizada.	25	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_163_3.png	41	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	10.8
181	2025-08-03 18:44:42.880015+00	Pulpas Açaí y Copoazú	Jugo de pulpas de açaí y copoazú	25	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_181_26.png	44	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	5.69
215	2025-08-06 22:17:04.827682+00	plato nuevo creado		23	\N	22	t	1	a01006de-3963-406d-b060-5b7b34623a38	f	10
168	2025-08-03 18:44:40.306554+00	V60	Revelando la complejidad y acidez brillante.	28	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_168_11.png	42	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
176	2025-08-03 18:44:41.938319+00	Espejito Espejito	Zanahoria, naranja, piña y mix de especias.	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_176_19.png	47	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
169	2025-08-03 18:44:40.509018+00	Aeropress	Suave y versátil, perfecto para un café concentrado o ligero	28	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_169_12.png	42	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
194	2025-08-04 04:10:32.425692+00	prpducto especial	Producto especial creado el 4/8/2025 para orden #286	20	\N	\N	f	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
174	2025-08-03 18:44:41.547193+00	Mímate	Té negro, buganvilla, canela y mix de especias.	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_174_17.png	47	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
231	2025-08-10 00:50:19.90284+00	Sultana té	Sultanas para llevar	18	\N	43	f	7	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
160	2025-08-03 18:44:38.54394+00	Americano	Espresso disuelto con agua caliente.	17	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_160_6.png	41	t	8	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.03
191	2025-08-03 18:44:44.5824+00	Requesón y Miel	Marraqueta con una mezcla entre lo dulce de la miel y lo cremoso del requesón.	12	\N	46	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	3.12
189	2025-08-03 18:44:44.276567+00	Sandwich Senderos - El Ahumadito	Pan baguette con requesón, mermelada de locoto jamón ahumado y salsas de la casa	25	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_189_31.png	46	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	10.3
216	2025-08-06 22:20:44.173509+00	PICANTE DE LA CASA CON CHARQUE		23	\N	22	t	3	a01006de-3963-406d-b060-5b7b34623a38	f	10
187	2025-08-03 18:44:43.935595+00	Empanadas de queso	Empanadas caseras de queso	8	\N	45	t	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
201	2025-08-04 21:35:58.512013+00	vrw	Producto especial creado el 4/8/2025 para orden #303	34	\N	\N	f	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
200	2025-08-04 21:32:53.392419+00	pr	Producto especial creado el 4/8/2025 para orden #302	23	\N	\N	f	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
198	2025-08-04 21:28:59.695225+00	Prueba producto especial 4	Producto especial creado el 4/8/2025 para orden #301	23	\N	\N	f	7	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
197	2025-08-04 21:17:25.080404+00	prueba producto especial 2	Producto especial creado el 4/8/2025 para orden #300	1	\N	\N	f	8	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
185	2025-08-03 18:44:43.583984+00	Pastel del día	Pastel especial del día	15	\N	45	t	6	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
161	2025-08-03 18:44:38.768358+00	Flat White	Doble ristreto con leche texturizada.	22	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_161_5.png	41	t	7	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.88
162	2025-08-03 18:44:38.976036+00	Latte	Café espresso con mayor cantidad de leche texturizada.	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_162_4.png	41	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.98
164	2025-08-03 18:44:39.428949+00	Tinto Campesino	Café americano con una base de miel y limón.	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_164_7.png	41	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.13
165	2025-08-03 18:44:39.708038+00	Espresso Honey	Café espresso doble, con base de miel y espuma de leche.	21	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_165_8.png	41	t	5	b333ede7-f67e-43d6-8652-9a918737d6e3	f	8.53
224	2025-08-08 00:03:18.911125+00	Honey	Blend de typica/catuai en proceso honey\nNotas amieladas, caramelo, chocolate 	110	\N	50	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	9.61
186	2025-08-03 18:44:43.762087+00	Cuñapes	Cuñapes tradicionales cambas	8	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_186_27.png	45	t	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	4
222	2025-08-06 22:47:06.116544+00	Café de la semana	Pregunta por el café de la semana.	25	\N	41	t	10	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
188	2025-08-03 18:44:44.106609+00	Combo quesito	Selecciona tus favoritos:\nDos cuñapes, dos empanadas o un cuñape y una empanada	15	\N	45	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
190	2025-08-03 18:44:44.43179+00	Clásico	Sandwich tradicional con jamón y queso con mayonesa ahumada.	15	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_190_32.png	46	t	1	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
229	2025-08-08 12:22:31.470692+00	Heterei	Blend de catuai y caturra en proceso lavado\nNotas acidas, ciruelo, uva y frutos secos	90	\N	50	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
202	2025-08-04 21:43:11.364558+00	[ELIMINADO] 4/8/2025	Producto especial eliminado automáticamente el 4/8/2025, 17:43:18	34	\N	\N	f	3	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
233	2025-08-14 22:18:56.152951+00	Soda italiana	Sirope casero con agua con gas	10	\N	44	t	4	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
217	2025-08-06 22:29:01.942998+00	PICANTE DE LA CASA CON CHARQUE		23	\N	22	t	2	a01006de-3963-406d-b060-5b7b34623a38	f	10
243	2025-08-19 03:30:48.66991+00	pizza rica		23	\N	23	t	2	a01006de-3963-406d-b060-5b7b34623a38	f	6
184	2025-08-03 18:44:43.404516+00	Torta especial	Torta especial del día	20	https://osvgapxefsqqhltkabku.supabase.co/storage/v1/object/public/menu-images/senderos_184_29.png	45	t	2	b333ede7-f67e-43d6-8652-9a918737d6e3	f	8.8
244	2025-08-23 23:13:51.425635+00	Pizzeta	Pizza en pan ciabata	20	\N	46	t	6	b333ede7-f67e-43d6-8652-9a918737d6e3	f	0
\.


--
-- Data for Name: modifier_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modifier_groups (id, menu_item_id, restaurant_id, name, is_required, min_selections, max_selections, display_order, created_at, updated_at) FROM stdin;
3161296f-afa4-464b-9c28-e584efc58965	79	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupofvfv	f	0	1	0	2025-08-17 06:46:57.009198+00	2025-08-19 02:55:46.604391+00
daa1829a-6365-49f2-b7bf-8d8944156df5	79	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:27:07.059113+00	2025-08-19 03:27:17.700024+00
4b3cecaa-79a3-4c1d-82c6-217dfaa940f1	79	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:29:35.960419+00	2025-08-19 03:31:15.541322+00
9a7c03f6-024c-47e1-9bc6-8de3c348359d	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:31:00.736504+00	2025-08-19 03:31:31.46307+00
043d8be3-c5da-4f28-b113-d6c1ffb6f707	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	1	2025-08-19 03:31:01.373779+00	2025-08-19 03:31:31.803971+00
3cb20f0b-3be1-42d9-8a11-94ccaf928d68	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:35:48.901723+00	2025-08-19 03:35:58.330668+00
e9d495e9-93ce-4aa3-9694-fccb98286693	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:38:49.422869+00	2025-08-19 03:40:59.381227+00
6ddf224f-47e0-473d-86ea-ede18269d9fd	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] leche	t	0	1	0	2025-08-19 03:40:59.730587+00	2025-08-19 03:44:53.959839+00
c87f7801-7c09-4241-80eb-851872dd7325	243	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-19] Nuevo Grupo	f	0	1	0	2025-08-19 03:45:16.275251+00	2025-08-19 03:53:25.389358+00
a3adba7e-54ff-4c8c-be8f-fe735752073a	79	a01006de-3963-406d-b060-5b7b34623a38	Nuevo Grupo	f	0	1	0	2025-08-19 03:53:55.263675+00	2025-08-19 03:53:55.263675+00
a3ab0ce5-a952-44e0-afb6-40c7a659f194	243	a01006de-3963-406d-b060-5b7b34623a38	sal	f	0	1	0	2025-08-19 03:54:07.855949+00	2025-08-19 03:54:07.855949+00
7b3f034c-36d6-4376-830f-f5ea91684017	161	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-03 18:44:46.461766+00	2025-08-03 18:44:46.461766+00
bd192e39-d3e1-4338-95cd-be3120de5036	162	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-03 18:44:46.849919+00	2025-08-03 18:44:46.849919+00
5ecd3209-c0ad-4490-824d-02690fb3ce45	163	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-03 18:44:47.258978+00	2025-08-03 18:44:47.258978+00
349fa553-ab89-46a5-8a34-75f0d69147f8	164	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-03 18:44:47.664304+00	2025-08-03 18:44:47.664304+00
b04dd4a9-3e9d-47f7-a6bf-17c830ba1e2d	165	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-03 18:44:48.050095+00	2025-08-03 18:44:48.050095+00
0368fda4-b32e-45f4-8e9c-502d75c13475	175	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Preparación	t	1	1	0	2025-08-03 18:44:49.305447+00	2025-08-03 18:44:49.305447+00
2abc28b2-a78a-41ae-bf70-dfca42d50702	175	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	1	2025-08-03 18:44:49.716378+00	2025-08-03 18:44:49.716378+00
43946ccb-9751-4aba-8012-257347467f98	176	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Preparación	t	1	1	0	2025-08-03 18:44:50.325218+00	2025-08-03 18:44:50.325218+00
41514b25-3b26-4c5b-99ee-2faa9533bc7e	176	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	1	2025-08-03 18:44:50.745699+00	2025-08-03 18:44:50.745699+00
01f497e0-a179-4e08-8e2a-08dd3c154dd8	177	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Preparación	t	1	1	0	2025-08-03 18:44:51.14288+00	2025-08-03 18:44:51.14288+00
fdedd008-a9f0-4c32-a5a3-d347ee9751c3	177	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	1	2025-08-03 18:44:51.562673+00	2025-08-03 18:44:51.562673+00
fd071ac4-ca23-44a7-b021-c669f8c2f06c	178	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Preparación	t	1	1	0	2025-08-03 18:44:51.973008+00	2025-08-03 18:44:51.973008+00
7f4f4b49-726e-4adb-95ca-91da864d00be	178	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	1	2025-08-03 18:44:52.374587+00	2025-08-03 18:44:52.374587+00
8fdc1fe0-51ba-4d11-a48e-90874e75c7bf	179	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Leche	t	1	1	0	2025-08-03 18:44:52.784937+00	2025-08-03 18:44:52.784937+00
e8faede0-05f7-4f72-9157-bb72ba5582ab	173	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de mate	t	1	1	1	2025-08-03 21:14:37.737526+00	2025-08-03 21:14:37.737526+00
8c04002f-d0f2-42f5-a02f-2a25c86e4eaf	168	b333ede7-f67e-43d6-8652-9a918737d6e3	Grano	t	1	1	0	2025-08-09 22:54:34.573339+00	2025-08-09 22:54:34.573339+00
6eec5c40-17de-46b8-8e2b-df096d747107	166	b333ede7-f67e-43d6-8652-9a918737d6e3	Grano	t	1	1	0	2025-08-09 22:54:42.751825+00	2025-08-09 22:54:42.751825+00
76cd5962-e00c-448d-942c-910093bc76b0	169	b333ede7-f67e-43d6-8652-9a918737d6e3	Grano	t	0	1	0	2025-08-09 22:55:58.98449+00	2025-08-09 22:55:58.98449+00
fcb5c939-d061-4f94-a39c-43ff4cd27cb1	181	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Leche	t	1	1	0	2025-08-09 22:58:03.940326+00	2025-08-09 22:58:03.940326+00
f8249a04-188e-4ac7-a582-5830322fe524	181	b333ede7-f67e-43d6-8652-9a918737d6e3	Pulpa	f	0	1	1	2025-08-09 22:58:04.344153+00	2025-08-09 22:58:04.344153+00
8983fb2a-8ff8-4090-b945-bb81185c16df	188	b333ede7-f67e-43d6-8652-9a918737d6e3	Masita seleccionada	t	1	1	0	2025-08-09 22:59:45.151687+00	2025-08-09 22:59:45.151687+00
600e7d75-6a37-4908-854f-b964c1ecfc3f	167	b333ede7-f67e-43d6-8652-9a918737d6e3	Grano	t	0	1	0	2025-08-18 13:35:00.635423+00	2025-08-18 13:35:00.635423+00
d40ea841-a7e2-4e38-b800-ada7edc16dde	180	b333ede7-f67e-43d6-8652-9a918737d6e3	Tipo de Leche	t	1	1	0	2025-08-18 13:36:55.23601+00	2025-08-18 13:36:55.23601+00
e05a23f9-d2ec-4bab-9390-b223b002acc1	180	b333ede7-f67e-43d6-8652-9a918737d6e3	Pulpa	f	1	1	1	2025-08-18 13:36:55.381796+00	2025-08-18 13:36:55.381796+00
4da9b053-79f9-4d9d-bb42-2b8a67bc4423	190	b333ede7-f67e-43d6-8652-9a918737d6e3	Lonjas de jamón	t	0	1	0	2025-08-18 21:53:10.713464+00	2025-08-18 21:53:10.713464+00
7fe212fa-937c-4189-b531-e01ba02bb612	174	b333ede7-f67e-43d6-8652-9a918737d6e3	Test Group 1	f	0	1	0	2025-08-19 02:46:30.19535+00	2025-08-19 02:46:30.19535+00
3b0a82d3-a106-45d9-b1b0-6da4aca00e71	160	b333ede7-f67e-43d6-8652-9a918737d6e3	[ARCHIVED_2025-08-19] Temperatura	f	0	1	0	2025-08-03 18:44:45.936155+00	2025-08-19 02:52:13.201384+00
8b21bf59-5069-4def-bd83-f6bd089fc691	216	a01006de-3963-406d-b060-5b7b34623a38	[ARCHIVED_2025-08-20] Nuevo Grupo	f	0	1	0	2025-08-20 14:24:29.077654+00	2025-08-20 14:24:37.147983+00
e1fd01e4-2444-4f52-b928-472d1b1cbdae	170	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura	f	0	1	0	2025-08-21 23:16:06.955683+00	2025-08-21 23:16:06.955683+00
1ee543de-ca63-45f1-8598-8f02cffbf405	160	b333ede7-f67e-43d6-8652-9a918737d6e3	[ARCHIVED_2025-08-24] Temperatura Nueva	t	1	1	0	2025-08-19 02:52:13.577567+00	2025-08-24 00:20:34.373496+00
afacaa20-ff9c-4157-a905-047fe1a61ee5	160	b333ede7-f67e-43d6-8652-9a918737d6e3	[ARCHIVED_2025-08-24] Tamaño Nuevo	f	0	1	1	2025-08-19 02:52:14.315447+00	2025-08-24 00:20:34.453705+00
57bf4979-578f-4254-92cd-3ebfc3d1d869	160	b333ede7-f67e-43d6-8652-9a918737d6e3	Temperatura Nueva	t	1	1	0	2025-08-24 00:20:34.501052+00	2025-08-24 00:20:34.501052+00
\.


--
-- Data for Name: modifiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modifiers (id, modifier_group_id, name, price_modifier, is_default, display_order, created_at, updated_at) FROM stdin;
fd8fdbd4-433e-432a-aa06-5f6308682483	76cd5962-e00c-448d-942c-910093bc76b0	Heterei	0.00	f	0	2025-08-09 22:55:59.414475+00	2025-08-09 22:55:59.414475+00
b45a50d2-959b-48a0-bdce-06aa6da84770	76cd5962-e00c-448d-942c-910093bc76b0	Honey	2.00	f	1	2025-08-09 22:55:59.414475+00	2025-08-09 22:55:59.414475+00
a9d31ab4-5e27-436a-8544-8405d448d726	fcb5c939-d061-4f94-a39c-43ff4cd27cb1	Con agua	0.00	t	0	2025-08-09 22:58:04.126316+00	2025-08-09 22:58:04.126316+00
e8e098e8-15ac-40d3-ad8f-fc6ad1242884	fcb5c939-d061-4f94-a39c-43ff4cd27cb1	Con leche	2.00	f	1	2025-08-09 22:58:04.126316+00	2025-08-09 22:58:04.126316+00
77134853-90d3-47c5-8e9a-4734f39896dd	8983fb2a-8ff8-4090-b945-bb81185c16df	Solo cuñape	0.00	f	0	2025-08-09 22:59:45.325663+00	2025-08-09 22:59:45.325663+00
f010746f-93b1-4d4e-9c9b-1b2598d0906e	8983fb2a-8ff8-4090-b945-bb81185c16df	Solo empanada	0.00	f	1	2025-08-09 22:59:45.325663+00	2025-08-09 22:59:45.325663+00
4bf802c0-134c-4e09-8381-3ef71b6cbb08	8983fb2a-8ff8-4090-b945-bb81185c16df	Un cuñape y una empanada	0.00	t	2	2025-08-09 22:59:45.325663+00	2025-08-09 22:59:45.325663+00
1fdffd56-3f53-405f-a961-cc519357f8bc	d40ea841-a7e2-4e38-b800-ada7edc16dde	Con agua	0.00	t	0	2025-08-18 13:36:55.326171+00	2025-08-18 13:36:55.326171+00
11a78391-23ee-4b0a-b63e-ff784b4ca7cf	d40ea841-a7e2-4e38-b800-ada7edc16dde	Con leche	2.00	f	1	2025-08-18 13:36:55.326171+00	2025-08-18 13:36:55.326171+00
7ed7b0d7-2506-4e3e-a7ae-79f4b0dc253f	4da9b053-79f9-4d9d-bb42-2b8a67bc4423	Simple	0.00	t	0	2025-08-18 21:53:10.788931+00	2025-08-18 21:53:10.788931+00
4952ac08-8c97-407d-a927-97ea504f3b5b	4da9b053-79f9-4d9d-bb42-2b8a67bc4423	Doble	5.00	f	1	2025-08-18 21:53:10.788931+00	2025-08-18 21:53:10.788931+00
9c14f604-0dc7-4c87-9862-7d97459d8df0	1ee543de-ca63-45f1-8598-8f02cffbf405	Caliente	0.00	t	0	2025-08-19 02:52:14.028315+00	2025-08-19 02:52:14.028315+00
753bf349-9bb6-4170-b948-5148bb3b9484	1ee543de-ca63-45f1-8598-8f02cffbf405	Frío	0.00	f	1	2025-08-19 02:52:14.028315+00	2025-08-19 02:52:14.028315+00
756aa331-c15e-4151-af0e-29f531a33aca	daa1829a-6365-49f2-b7bf-8d8944156df5	Nueva Opción	0.00	f	0	2025-08-19 03:27:07.371618+00	2025-08-19 03:27:07.371618+00
c706d297-d697-4ca1-97b0-2f24b26a99e7	daa1829a-6365-49f2-b7bf-8d8944156df5	Nueva Opción	0.00	f	1	2025-08-19 03:27:07.371618+00	2025-08-19 03:27:07.371618+00
da239af3-0190-423c-b919-711a1df3c554	9a7c03f6-024c-47e1-9bc6-8de3c348359d	Nueva Opción	0.00	f	0	2025-08-19 03:31:01.101896+00	2025-08-19 03:31:01.101896+00
89f790ce-42eb-4710-94de-9e9510de52f9	9a7c03f6-024c-47e1-9bc6-8de3c348359d	Nueva Opción	0.00	f	1	2025-08-19 03:31:01.101896+00	2025-08-19 03:31:01.101896+00
ed900f24-ec90-439a-b1dc-550905df687c	3cb20f0b-3be1-42d9-8a11-94ccaf928d68	Nueva Opción	0.00	f	0	2025-08-19 03:35:49.155163+00	2025-08-19 03:35:49.155163+00
e3c69c5b-b02c-4e8f-909c-580589bcb341	3cb20f0b-3be1-42d9-8a11-94ccaf928d68	Nueva Opción	0.00	f	1	2025-08-19 03:35:49.155163+00	2025-08-19 03:35:49.155163+00
a55ee4a9-b938-4fd5-9650-c8f9d1807f67	6ddf224f-47e0-473d-86ea-ede18269d9fd	con leche	0.00	t	0	2025-08-19 03:41:00.084368+00	2025-08-19 03:41:00.084368+00
4617de9e-7f60-4b40-ac0f-cfa103807143	6ddf224f-47e0-473d-86ea-ede18269d9fd	con agua	0.00	f	1	2025-08-19 03:41:00.084368+00	2025-08-19 03:41:00.084368+00
0fa5bb8b-b012-4387-b325-e93e2379e336	a3adba7e-54ff-4c8c-be8f-fe735752073a	Nueva Opción	0.00	f	0	2025-08-19 03:53:55.35652+00	2025-08-19 03:53:55.35652+00
092efb14-796e-4da2-a739-ac75e9d701f9	a3adba7e-54ff-4c8c-be8f-fe735752073a	Nueva Opción	0.00	f	1	2025-08-19 03:53:55.35652+00	2025-08-19 03:53:55.35652+00
2e686ab9-3d5f-4fb3-848b-a76dd3790c5d	a3adba7e-54ff-4c8c-be8f-fe735752073a	Nueva Opción	0.00	f	2	2025-08-19 03:53:55.35652+00	2025-08-19 03:53:55.35652+00
0e7e7580-1f41-4ea1-8f83-1eed4abbb8e8	3b0a82d3-a106-45d9-b1b0-6da4aca00e71	Caliente	0.00	t	0	2025-08-03 18:44:46.248192+00	2025-08-03 18:44:46.248192+00
1ec9ffd2-8c03-4ba1-b817-7a6d397b6664	3b0a82d3-a106-45d9-b1b0-6da4aca00e71	Frío	3.00	f	1	2025-08-03 18:44:46.248192+00	2025-08-03 18:44:46.248192+00
07664d59-86e2-4bd8-a261-0695c0dd931f	7b3f034c-36d6-4376-830f-f5ea91684017	Caliente	0.00	t	0	2025-08-03 18:44:46.64718+00	2025-08-03 18:44:46.64718+00
482be331-7b7b-4137-9ddc-6f935f8fde1e	7b3f034c-36d6-4376-830f-f5ea91684017	Frío	3.00	f	1	2025-08-03 18:44:46.64718+00	2025-08-03 18:44:46.64718+00
c2b7059a-5d82-4273-aa7f-827775021127	bd192e39-d3e1-4338-95cd-be3120de5036	Caliente	0.00	t	0	2025-08-03 18:44:47.06083+00	2025-08-03 18:44:47.06083+00
349cd80a-e830-48ac-acd7-489ecfa7b977	bd192e39-d3e1-4338-95cd-be3120de5036	Frío	3.00	f	1	2025-08-03 18:44:47.06083+00	2025-08-03 18:44:47.06083+00
5e3895bc-008f-482f-95b8-57263fa30444	5ecd3209-c0ad-4490-824d-02690fb3ce45	Caliente	0.00	t	0	2025-08-03 18:44:47.484807+00	2025-08-03 18:44:47.484807+00
30cd4a0f-ac94-40e4-b0ad-66304840114c	5ecd3209-c0ad-4490-824d-02690fb3ce45	Frío	3.00	f	1	2025-08-03 18:44:47.484807+00	2025-08-03 18:44:47.484807+00
f82b58cd-4b90-4605-905f-90cd9ca31313	349fa553-ab89-46a5-8a34-75f0d69147f8	Caliente	0.00	t	0	2025-08-03 18:44:47.868801+00	2025-08-03 18:44:47.868801+00
130a3394-28ef-4838-8bc0-eae492f7ec65	349fa553-ab89-46a5-8a34-75f0d69147f8	Frío	3.00	f	1	2025-08-03 18:44:47.868801+00	2025-08-03 18:44:47.868801+00
6ad7c6a0-f603-4faa-9994-95aea3a6f9b4	b04dd4a9-3e9d-47f7-a6bf-17c830ba1e2d	Caliente	0.00	t	0	2025-08-03 18:44:48.283557+00	2025-08-03 18:44:48.283557+00
a02a36bb-ca4f-428e-ba92-d517d79047a7	b04dd4a9-3e9d-47f7-a6bf-17c830ba1e2d	Frío	3.00	f	1	2025-08-03 18:44:48.283557+00	2025-08-03 18:44:48.283557+00
fc9f5f4c-878c-448b-8834-e77adc83edd3	0368fda4-b32e-45f4-8e9c-502d75c13475	Con agua	0.00	t	0	2025-08-03 18:44:49.528392+00	2025-08-03 18:44:49.528392+00
3eafc761-e9b5-4d9d-a3f7-4c744cb6f318	0368fda4-b32e-45f4-8e9c-502d75c13475	Con leche	2.00	f	1	2025-08-03 18:44:49.528392+00	2025-08-03 18:44:49.528392+00
f45440f5-aaa5-48b7-b260-e6520a3d1394	2abc28b2-a78a-41ae-bf70-dfca42d50702	Caliente	0.00	t	0	2025-08-03 18:44:49.932066+00	2025-08-03 18:44:49.932066+00
ff750a9c-2cb4-4a0d-bd6f-85ccf6fee273	2abc28b2-a78a-41ae-bf70-dfca42d50702	Frío	3.00	f	1	2025-08-03 18:44:49.932066+00	2025-08-03 18:44:49.932066+00
10422367-4c87-42db-8656-422d0b99cf56	43946ccb-9751-4aba-8012-257347467f98	Con agua	0.00	t	0	2025-08-03 18:44:50.533361+00	2025-08-03 18:44:50.533361+00
57323b6c-a5e9-4b83-aa09-efec8c2d2136	43946ccb-9751-4aba-8012-257347467f98	Con leche	2.00	f	1	2025-08-03 18:44:50.533361+00	2025-08-03 18:44:50.533361+00
26771bd8-94b9-431a-9944-b380afeb3a7f	41514b25-3b26-4c5b-99ee-2faa9533bc7e	Caliente	0.00	t	0	2025-08-03 18:44:50.93928+00	2025-08-03 18:44:50.93928+00
36f14ae3-f141-4cc3-b6b7-f8e275578a7c	41514b25-3b26-4c5b-99ee-2faa9533bc7e	Frío	3.00	f	1	2025-08-03 18:44:50.93928+00	2025-08-03 18:44:50.93928+00
5953a599-d71b-4f65-a3e5-57cd741a38c3	01f497e0-a179-4e08-8e2a-08dd3c154dd8	Con agua	0.00	t	0	2025-08-03 18:44:51.353938+00	2025-08-03 18:44:51.353938+00
0cdbae54-2ca9-49f6-9c85-6f6cdde199f4	01f497e0-a179-4e08-8e2a-08dd3c154dd8	Con leche	2.00	f	1	2025-08-03 18:44:51.353938+00	2025-08-03 18:44:51.353938+00
a7ed8307-e723-4d78-8c44-198a2c401a54	fdedd008-a9f0-4c32-a5a3-d347ee9751c3	Caliente	0.00	t	0	2025-08-03 18:44:51.769414+00	2025-08-03 18:44:51.769414+00
f5a871ab-febe-480c-9f1e-8a30b169e01b	fdedd008-a9f0-4c32-a5a3-d347ee9751c3	Frío	3.00	f	1	2025-08-03 18:44:51.769414+00	2025-08-03 18:44:51.769414+00
0fb8ca0f-699a-48fb-a25c-5f77f8c7b5c5	fd071ac4-ca23-44a7-b021-c669f8c2f06c	Con agua	0.00	t	0	2025-08-03 18:44:52.170338+00	2025-08-03 18:44:52.170338+00
b532d92e-9a07-4d9a-b411-947331f086da	fd071ac4-ca23-44a7-b021-c669f8c2f06c	Con leche	2.00	f	1	2025-08-03 18:44:52.170338+00	2025-08-03 18:44:52.170338+00
c3113246-a2a2-4404-a492-b4389a4e54ec	7f4f4b49-726e-4adb-95ca-91da864d00be	Caliente	0.00	t	0	2025-08-03 18:44:52.578823+00	2025-08-03 18:44:52.578823+00
c10b990b-a3f8-4be6-81df-fec09e420e28	7f4f4b49-726e-4adb-95ca-91da864d00be	Frío	3.00	f	1	2025-08-03 18:44:52.578823+00	2025-08-03 18:44:52.578823+00
522edc79-a3f7-4080-b880-047a50779d6c	8fdc1fe0-51ba-4d11-a48e-90874e75c7bf	Con agua	0.00	t	0	2025-08-03 18:44:52.987353+00	2025-08-03 18:44:52.987353+00
9ad8b7cc-8418-450d-b909-efeabc6e8d53	8fdc1fe0-51ba-4d11-a48e-90874e75c7bf	Con leche	2.00	f	1	2025-08-03 18:44:52.987353+00	2025-08-03 18:44:52.987353+00
ff3e0dc3-c651-4389-9f17-47164ca628bc	e8faede0-05f7-4f72-9157-bb72ba5582ab	Coca	0.00	t	1	2025-08-03 21:14:37.930843+00	2025-08-03 21:14:37.930843+00
d35fba70-1cda-4bb0-9696-d460f8fe7648	e8faede0-05f7-4f72-9157-bb72ba5582ab	Manzanilla	0.00	f	2	2025-08-03 21:14:37.930843+00	2025-08-03 21:14:37.930843+00
1f452d4f-c2f2-4d24-8648-a6602fce390d	e8faede0-05f7-4f72-9157-bb72ba5582ab	Anís	0.00	f	3	2025-08-03 21:14:37.930843+00	2025-08-03 21:14:37.930843+00
0d375a93-9b4e-46b0-a420-07dd2dad3916	f8249a04-188e-4ac7-a582-5830322fe524	Açaí 	0.00	f	0	2025-08-09 22:58:04.56006+00	2025-08-09 22:58:04.56006+00
44ef8131-d78f-4ab4-b084-656b8ce54a40	f8249a04-188e-4ac7-a582-5830322fe524	Copoazú	0.00	f	1	2025-08-09 22:58:04.56006+00	2025-08-09 22:58:04.56006+00
3f6919ef-b976-4f3b-892c-2d3a6814cee1	3161296f-afa4-464b-9c28-e584efc58965	Nueva Opcióndcdcd	0.00	f	0	2025-08-17 06:46:57.290495+00	2025-08-17 06:46:57.290495+00
4ae8fdf2-39d3-46e1-84a3-51b81d63fda3	3161296f-afa4-464b-9c28-e584efc58965	Nueva Opcióndcdcdcd	0.00	f	1	2025-08-17 06:46:57.290495+00	2025-08-17 06:46:57.290495+00
1f558279-9d84-41ac-a281-dd830e14dbb4	600e7d75-6a37-4908-854f-b964c1ecfc3f	Heterei	0.00	f	0	2025-08-18 13:35:00.751573+00	2025-08-18 13:35:00.751573+00
efd58049-f624-45b4-ac17-6c8c70b0ced7	600e7d75-6a37-4908-854f-b964c1ecfc3f	Honey	2.00	f	1	2025-08-18 13:35:00.751573+00	2025-08-18 13:35:00.751573+00
74a74a6c-723a-495c-bb82-515a2e21259e	e05a23f9-d2ec-4bab-9390-b223b002acc1	Acerola	0.00	f	0	2025-08-18 13:36:55.425519+00	2025-08-18 13:36:55.425519+00
7f9041dd-5f6d-4efd-b820-9250dc2ffcb7	8c04002f-d0f2-42f5-a02f-2a25c86e4eaf	Heterei	0.00	f	0	2025-08-09 22:54:34.752528+00	2025-08-09 22:54:34.752528+00
f63607da-c7c4-4ecf-8e49-cb5d082e0d32	8c04002f-d0f2-42f5-a02f-2a25c86e4eaf	Honey	2.00	f	1	2025-08-09 22:54:34.752528+00	2025-08-09 22:54:34.752528+00
93d735a9-5b58-4391-87b5-ef06ddadc49d	6eec5c40-17de-46b8-8e2b-df096d747107	Heteri	0.00	f	0	2025-08-09 22:54:42.917353+00	2025-08-09 22:54:42.917353+00
d3361668-5dc2-46a8-bde2-3255816b4ada	6eec5c40-17de-46b8-8e2b-df096d747107	Honey	2.00	f	1	2025-08-09 22:54:42.917353+00	2025-08-09 22:54:42.917353+00
bf3d8ead-34b8-45b3-8040-81156f11943d	e05a23f9-d2ec-4bab-9390-b223b002acc1	Guayaba	0.00	f	1	2025-08-18 13:36:55.425519+00	2025-08-18 13:36:55.425519+00
7bad7833-07f8-4b95-babd-cc068c862ade	e05a23f9-d2ec-4bab-9390-b223b002acc1	Acaí	0.00	f	2	2025-08-18 13:36:55.425519+00	2025-08-18 13:36:55.425519+00
2f3df99b-0b57-4ac8-8daa-e1afe97c7abc	e05a23f9-d2ec-4bab-9390-b223b002acc1	Copoazú	0.00	f	3	2025-08-18 13:36:55.425519+00	2025-08-18 13:36:55.425519+00
3f789e59-4deb-43d2-bf49-9bbbcec92fa8	7fe212fa-937c-4189-b531-e01ba02bb612	Test Modifier 1	0.00	f	0	2025-08-19 02:46:30.533062+00	2025-08-19 02:46:30.533062+00
281064a7-a1c5-4d79-82cf-4d21268b4952	afacaa20-ff9c-4157-a905-047fe1a61ee5	Normal	0.00	t	0	2025-08-19 02:52:14.623901+00	2025-08-19 02:52:14.623901+00
641a3bd7-a23b-4850-9bce-cec752d3b1e1	afacaa20-ff9c-4157-a905-047fe1a61ee5	Extra Grande	2000.00	f	1	2025-08-19 02:52:14.623901+00	2025-08-19 02:52:14.623901+00
776cdaa9-dfca-4bfe-9b28-eb7527a9ac69	4b3cecaa-79a3-4c1d-82c6-217dfaa940f1	Nueva Opción	0.00	f	0	2025-08-19 03:29:36.298573+00	2025-08-19 03:29:36.298573+00
e903656e-7b2f-4d78-9bce-fc296e3d2013	4b3cecaa-79a3-4c1d-82c6-217dfaa940f1	Nueva Opción	0.00	f	1	2025-08-19 03:29:36.298573+00	2025-08-19 03:29:36.298573+00
8be95763-28fe-4187-bad3-2c202001d4b9	043d8be3-c5da-4f28-b113-d6c1ffb6f707	Nueva Opción	0.00	f	0	2025-08-19 03:31:01.631469+00	2025-08-19 03:31:01.631469+00
1772aeb3-a497-4f47-bc6b-80667f99401d	043d8be3-c5da-4f28-b113-d6c1ffb6f707	Nueva Opción	0.00	f	1	2025-08-19 03:31:01.631469+00	2025-08-19 03:31:01.631469+00
ac214280-aaa1-453f-a2ba-c90053ad3eb0	e9d495e9-93ce-4aa3-9694-fccb98286693	Nueva Opción	0.00	f	0	2025-08-19 03:38:49.746757+00	2025-08-19 03:38:49.746757+00
007e9826-3ea2-4256-864a-a91f62dbacd5	e9d495e9-93ce-4aa3-9694-fccb98286693	Nueva Opción	0.00	f	1	2025-08-19 03:38:49.746757+00	2025-08-19 03:38:49.746757+00
7f9b0645-563d-4a20-8755-ddcf931c8f2a	c87f7801-7c09-4241-80eb-851872dd7325	Nueva Opción	0.00	f	0	2025-08-19 03:45:16.588356+00	2025-08-19 03:45:16.588356+00
3371dfe6-6210-4da0-a146-382ac466d4f5	c87f7801-7c09-4241-80eb-851872dd7325	Nueva Opción	0.00	f	1	2025-08-19 03:45:16.588356+00	2025-08-19 03:45:16.588356+00
2103a0b5-154a-41ad-a8fb-93d9dcf34aec	a3ab0ce5-a952-44e0-afb6-40c7a659f194	Nueva Opciónsasas	0.00	f	0	2025-08-19 03:54:07.949898+00	2025-08-19 03:54:07.949898+00
5dfe1f32-da65-4573-8388-0cfaaadce57b	a3ab0ce5-a952-44e0-afb6-40c7a659f194	Nueva Opciónsasde	0.00	f	1	2025-08-19 03:54:07.949898+00	2025-08-19 03:54:07.949898+00
393526aa-c4a1-4ce1-b534-6b69930167d1	8b21bf59-5069-4def-bd83-f6bd089fc691	Nueva Opción	0.00	f	0	2025-08-20 14:24:29.207629+00	2025-08-20 14:24:29.207629+00
1a4c7866-bdc5-4c6d-bbff-67e736aa0b50	8b21bf59-5069-4def-bd83-f6bd089fc691	Nueva Opción	0.00	f	1	2025-08-20 14:24:29.207629+00	2025-08-20 14:24:29.207629+00
c1fb3585-69e4-4e78-b5cc-4680af89fcda	e1fd01e4-2444-4f52-b928-472d1b1cbdae	Caliente	0.00	t	0	2025-08-21 23:16:07.030912+00	2025-08-21 23:16:07.030912+00
61d08a24-ec76-4a47-b7ff-7362d47745fa	e1fd01e4-2444-4f52-b928-472d1b1cbdae	Frío	3.00	f	1	2025-08-21 23:16:07.030912+00	2025-08-21 23:16:07.030912+00
e40a2904-13ae-4d81-aa31-b186aab78be0	57bf4979-578f-4254-92cd-3ebfc3d1d869	Caliente	0.00	t	0	2025-08-24 00:20:34.550109+00	2025-08-24 00:20:34.550109+00
f557d22a-7146-4d90-9b1e-c77a225cb0ed	57bf4979-578f-4254-92cd-3ebfc3d1d869	Frío	0.00	f	1	2025-08-24 00:20:34.550109+00	2025-08-24 00:20:34.550109+00
\.


--
-- Data for Name: order_item_modifiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_item_modifiers (id, order_item_id, modifier_id, modifier_group_id, price_at_order, created_at) FROM stdin;
915ba8cf-6e7b-4f72-bb1e-f0497a299cf3	1011	44ef8131-d78f-4ab4-b084-656b8ce54a40	f8249a04-188e-4ac7-a582-5830322fe524	0.00	2025-08-14 23:12:52.469713+00
85740029-bb2a-460b-a3d7-268f7bece64e	1014	44ef8131-d78f-4ab4-b084-656b8ce54a40	f8249a04-188e-4ac7-a582-5830322fe524	0.00	2025-08-14 23:22:27.195073+00
847ad0af-eb58-4ee9-a11d-dc6889bbfb67	1015	0d375a93-9b4e-46b0-a420-07dd2dad3916	f8249a04-188e-4ac7-a582-5830322fe524	0.00	2025-08-14 23:22:28.31232+00
7514207a-d230-4b12-a731-ceecdd7a3424	1019	44ef8131-d78f-4ab4-b084-656b8ce54a40	f8249a04-188e-4ac7-a582-5830322fe524	0.00	2025-08-14 23:31:42.606331+00
c1074fb3-c17b-4649-bd1e-ecf225a1a1ae	1118	4ae8fdf2-39d3-46e1-84a3-51b81d63fda3	3161296f-afa4-464b-9c28-e584efc58965	0.00	2025-08-18 08:57:24.397845+00
a4cbe3ae-5bfc-4781-86e0-a2d3f914e44b	1129	4ae8fdf2-39d3-46e1-84a3-51b81d63fda3	3161296f-afa4-464b-9c28-e584efc58965	0.00	2025-08-18 09:01:37.485548+00
8fbdd9c6-5e63-4e36-bbf5-04acb2fce85a	1159	4952ac08-8c97-407d-a927-97ea504f3b5b	4da9b053-79f9-4d9d-bb42-2b8a67bc4423	5.00	2025-08-18 21:54:49.651351+00
3b935734-707b-4568-9057-72a406e334fa	1164	7ed7b0d7-2506-4e3e-a7ae-79f4b0dc253f	4da9b053-79f9-4d9d-bb42-2b8a67bc4423	0.00	2025-08-18 23:48:52.780194+00
c0e40193-4f8f-4620-9989-ff40e72331c9	1191	281064a7-a1c5-4d79-82cf-4d21268b4952	afacaa20-ff9c-4157-a905-047fe1a61ee5	0.00	2025-08-21 20:39:18.841551+00
8263bc4f-ab95-4e48-9214-717732dff985	1242	281064a7-a1c5-4d79-82cf-4d21268b4952	afacaa20-ff9c-4157-a905-047fe1a61ee5	0.00	2025-08-24 00:20:13.326558+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, created_at, order_id, menu_item_id, quantity, notes, price_at_order, cost_at_order) FROM stdin;
870	2025-08-06 20:03:38.684811+00	497	186	1		7	0
871	2025-08-06 20:03:38.684811+00	497	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	15	0
873	2025-08-06 20:29:46.222719+00	499	165	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	19	0
875	2025-08-06 21:36:48.903457+00	501	79	3	\N	40	0
879	2025-08-06 22:58:10.772183+00	503	188	1	\N	15	0
880	2025-08-06 22:58:10.772183+00	503	219	2	\N	15	0
882	2025-08-06 22:58:10.772183+00	503	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	15	0
883	2025-08-06 22:58:10.772183+00	503	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	16	0
888	2025-08-06 23:09:18.950514+00	505	182	2		12	0
889	2025-08-06 23:09:18.950514+00	505	222	1		20	0
890	2025-08-06 23:09:18.950514+00	505	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	15	0
896	2025-08-07 17:07:33.514165+00	509	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
900	2025-08-07 20:29:11.064586+00	512	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
902	2025-08-07 21:31:36.64887+00	514	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
903	2025-08-07 21:32:18.363736+00	515	222	1		25	0
907	2025-08-07 21:53:26.966604+00	519	172	2		16	0
908	2025-08-07 21:53:26.966604+00	519	190	2	Sin mayonesa ; 	15	0
910	2025-08-07 22:51:10.216309+00	521	188	1		15	0
913	2025-08-08 00:03:53.808716+00	523	224	1	\N	80	0
917	2025-08-08 20:32:21.941836+00	526	190	2		15	0
919	2025-08-08 21:12:00.997182+00	528	182	1	\N	12	0
920	2025-08-08 21:12:00.997182+00	528	184	1	\N	20	0
923	2025-08-08 23:59:06.004394+00	530	172	1		16	0
924	2025-08-08 23:59:06.004394+00	530	184	1		20	0
925	2025-08-08 23:59:06.004394+00	530	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
928	2025-08-09 19:18:52.37312+00	533	79	1	\N	40	0
930	2025-08-09 20:04:04.586911+00	535	184	1		20	0
931	2025-08-09 20:04:04.586911+00	535	188	1		15	0
932	2025-08-09 20:04:04.586911+00	535	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
933	2025-08-09 20:04:04.586911+00	535	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
940	2025-08-09 20:51:59.174618+00	541	79	1	\N	40	0
944	2025-08-09 20:52:23.0324+00	543	80	1	\N	8	0
937	2025-08-09 20:50:30.112243+00	541	79	1	\N	40	0
947	2025-08-09 21:02:39.021736+00	545	217	1	\N	23	0
949	2025-08-09 21:02:58.183586+00	547	79	1	\N	40	0
950	2025-08-09 21:08:36.365142+00	549	222	1	\N	25	0
952	2025-08-09 21:30:26.092206+00	550	182	1		12	0
953	2025-08-09 21:30:26.092206+00	550	186	1		8	0
954	2025-08-09 21:30:26.092206+00	550	180	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	21	0
955	2025-08-09 21:30:26.092206+00	550	179	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	16	0
962	2025-08-09 22:19:55.968132+00	556	158	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	14	0
964	2025-08-09 23:23:29.574511+00	557	184	1	Prueba de sonido	20	0
957	2025-08-09 21:45:11.218629+00	553	191	2		12	0
958	2025-08-09 21:45:11.218629+00	553	181	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	23	0
966	2025-08-09 23:50:01.264612+00	559	217	1	\N	23	0
968	2025-08-10 00:51:29.509676+00	562	231	5	\N	15	0
970	2025-08-10 01:06:05.534473+00	563	231	1		15	0
975	2025-08-12 00:05:55.575158+00	566	171	1		16	0
976	2025-08-12 00:05:55.575158+00	566	184	1		20	0
978	2025-08-12 19:51:56.709973+00	568	160	3	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
981	2025-08-12 20:21:52.916452+00	570	184	1		20	0
986	2025-08-12 21:33:27.39867+00	572	159	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
987	2025-08-12 21:36:23.779929+00	568	187	1	\N	8	0
991	2025-08-12 22:39:55.000285+00	574	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
993	2025-08-13 01:00:05.477402+00	576	171	2		16	0
994	2025-08-13 01:00:05.477402+00	576	182	1		12	0
995	2025-08-13 01:00:05.477402+00	576	190	1		15	0
999	2025-08-13 22:18:03.74991+00	580	176	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	20	0
1000	2025-08-13 22:18:03.74991+00	580	177	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	20	0
1001	2025-08-13 22:18:03.74991+00	580	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
868	2025-08-06 19:13:46.356651+00	495	\N	1	\N	35	0
1010	2025-08-14 23:03:46.353231+00	586	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1012	2025-08-14 23:22:26.379936+00	588	189	2	\N	25	0
1013	2025-08-14 23:22:26.379936+00	588	190	1	\N	15	0
1014	2025-08-14 23:22:26.379936+00	588	181	2	{"selectedModifiers":{"Tipo de Leche":["Con agua"],"Pulpa":["Copoazú"]},"original_notes":""}	25	0
1015	2025-08-14 23:22:26.379936+00	588	181	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"],"Pulpa":["Açaí "]},"original_notes":""}	25	0
1016	2025-08-14 23:31:41.092729+00	589	186	1	\N	8	0
1017	2025-08-14 23:31:41.092729+00	589	219	4	\N	15	0
1019	2025-08-14 23:31:41.092729+00	589	181	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"],"Pulpa":["Copoazú"]},"original_notes":""}	25	0
1024	2025-08-15 00:23:56.255257+00	591	186	1		8	0
1025	2025-08-15 00:23:56.255257+00	591	190	1		15	0
1026	2025-08-15 00:23:56.255257+00	591	219	1		15	0
943	2025-08-09 20:52:23.0324+00	543	\N	1	\N	20	0
935	2025-08-09 20:13:15.694483+00	538	\N	1	\N	20	0
997	2025-08-13 08:05:42.64556+00	578	\N	1		20	0
872	2025-08-06 20:26:15.202089+00	498	189	1		22	0
1002	2025-08-13 22:18:09.064961+00	579	\N	2	\N	35	0
1007	2025-08-14 22:48:56.542146+00	585	\N	1		35	0
874	2025-08-06 20:47:42.591507+00	500	174	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	18	0
876	2025-08-06 22:47:52.660962+00	502	188	1	\N	15	0
878	2025-08-06 22:47:52.660962+00	502	222	1	\N	20	0
885	2025-08-06 23:07:32.709181+00	504	181	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	21	0
886	2025-08-06 23:07:32.709181+00	504	165	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	19	0
887	2025-08-06 23:07:32.709181+00	504	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
891	2025-08-07 16:51:18.379813+00	506	\N	1	{"type":"custom_product","name":"prueba prdocuto especial","original_notes":"esto es una prueba"}	20	0
892	2025-08-07 16:51:18.379813+00	506	174	1	{"selectedModifiers":{"Tipo de Preparación":["Con leche"],"Temperatura":["Frío"]},"original_notes":"prueba x2"}	23	0
893	2025-08-07 16:52:39.083588+00	507	175	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	18	0
894	2025-08-07 16:52:39.083588+00	507	180	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	21	0
895	2025-08-07 16:54:25.489547+00	508	158	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	14	0
897	2025-08-07 17:21:24.455105+00	510	217	1	\N	23	0
899	2025-08-07 17:21:34.947895+00	511	217	1	\N	23	0
901	2025-08-07 20:48:49.187654+00	513	158	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	14	0
904	2025-08-07 21:35:00.964587+00	516	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
909	2025-08-07 22:50:12.350058+00	520	168	1		28	0
911	2025-08-07 23:01:37.606652+00	522	219	1		15	0
912	2025-08-07 23:01:37.606652+00	522	179	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
914	2025-08-08 20:01:01.83673+00	524	184	2		20	0
915	2025-08-08 20:01:01.83673+00	524	159	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
916	2025-08-08 20:08:59.67506+00	525	174	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	18	0
918	2025-08-08 21:05:50.431985+00	527	182	1	\N	12	0
921	2025-08-08 21:52:52.457512+00	529	188	1		15	0
922	2025-08-08 21:52:52.457512+00	529	179	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
927	2025-08-09 19:14:46.897328+00	534	217	1	\N	23	0
956	2025-08-09 21:38:20.25863+00	551	\N	1	{"selectedModifiers":{"mezclador":["leche"]},"original_notes":""}	23	0
936	2025-08-09 20:50:19.825009+00	538	217	1	\N	23	0
946	2025-08-09 20:52:23.460726+00	544	80	1	\N	8	0
898	2025-08-07 17:21:24.455105+00	510	\N	3	\N	20	0
939	2025-08-09 20:51:58.808034+00	541	80	1	\N	8	0
941	2025-08-09 20:52:22.334412+00	543	79	1	\N	40	0
942	2025-08-09 20:52:22.334412+00	543	217	1	\N	23	0
934	2025-08-09 20:13:06.81715+00	538	79	1	\N	40	0
926	2025-08-09 19:14:20.252025+00	534	\N	3	\N	20	0
951	2025-08-09 21:08:53.323149+00	549	222	1	\N	25	0
959	2025-08-09 21:45:23.124704+00	553	184	1		20	0
960	2025-08-09 21:45:23.124704+00	553	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
963	2025-08-09 22:20:25.147197+00	556	158	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	14	0
961	2025-08-09 22:19:34.756766+00	556	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
965	2025-08-09 23:36:37.21364+00	558	184	1	\N	20	0
967	2025-08-09 23:54:34.792482+00	560	180	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	21	0
969	2025-08-10 00:52:16.552546+00	562	190	6	\N	15	0
971	2025-08-11 21:03:27.793046+00	564	184	1		20	0
972	2025-08-11 21:03:27.793046+00	564	181	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"],"Pulpa":["Açaí "]},"original_notes":""}	23	0
973	2025-08-11 21:12:26.645347+00	565	184	1	\N	20	0
974	2025-08-11 21:12:26.645347+00	565	179	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
977	2025-08-12 00:50:53.697454+00	567	184	1	\N	20	0
979	2025-08-12 19:52:51.760988+00	569	158	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	14	0
982	2025-08-12 21:05:30.72338+00	571	182	1		12	0
984	2025-08-12 21:05:30.72338+00	571	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
529	2025-08-06 04:53:28.459852+00	373	195	1	Item 1 de 4	20	0
530	2025-08-06 04:53:28.459852+00	373	203	1	Item 2 de 4	23	0
531	2025-08-06 04:53:28.459852+00	373	175	1	Item 3 de 4	18	0
532	2025-08-06 04:53:28.459852+00	373	176	1	Item 4 de 4	18	0
985	2025-08-12 21:05:30.72338+00	571	163	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	25	0
988	2025-08-12 22:27:47.53424+00	574	190	1		15	0
989	2025-08-12 22:27:47.53424+00	574	191	1		12	0
990	2025-08-12 22:27:47.53424+00	574	176	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Frío"]},"original_notes":"Sin azúcar"}	23	0
998	2025-08-13 21:35:03.081842+00	579	181	2	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	27	0
1003	2025-08-14 20:10:54.401846+00	582	159	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1004	2025-08-14 20:10:54.401846+00	582	188	1	{"selectedModifiers":{"Masita seleccionada":["Solo empanada"]},"original_notes":""}	15	0
1006	2025-08-14 22:48:41.940034+00	584	174	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	20	0
1008	2025-08-14 23:03:46.353231+00	586	170	1		12	0
1009	2025-08-14 23:03:46.353231+00	586	186	2		8	0
1020	2025-08-14 23:31:41.092729+00	589	179	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	16	0
1021	2025-08-14 23:31:41.092729+00	589	166	1	{"selectedModifiers":{"Grano":["Honey"]},"original_notes":""}	30	0
1022	2025-08-14 23:31:41.092729+00	589	159	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1037	2025-08-15 05:12:05.692829+00	599	\N	1	\N	20	0
884	2025-08-06 23:07:32.709181+00	504	\N	1	\N	35	0
1023	2025-08-14 23:38:49.4516+00	590	160	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
1005	2025-08-14 22:34:06.255221+00	588	159	3	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1027	2025-08-15 00:23:56.255257+00	591	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1028	2025-08-15 00:23:56.255257+00	591	176	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	20	0
1011	2025-08-14 23:12:51.359984+00	588	181	2	{"selectedModifiers":{"Tipo de Leche":["Con agua"],"Pulpa":["Copoazú"]},"original_notes":""}	25	0
1029	2025-08-15 00:49:04.166941+00	592	189	2	\N	25	0
1030	2025-08-15 00:49:04.166941+00	592	234	2	\N	80	0
1032	2025-08-15 02:00:42.847095+00	594	179	2	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
1031	2025-08-15 01:43:53.155403+00	594	184	1	\N	20	0
1033	2025-08-15 04:13:23.725038+00	595	217	1	\N	23	0
1040	2025-08-15 20:02:21.790311+00	602	184	1		20	0
1041	2025-08-15 20:02:21.790311+00	602	219	1		15	0
1042	2025-08-15 20:02:21.790311+00	602	166	1	{"selectedModifiers":{"Grano":["Heteri"]},"original_notes":""}	28	0
1043	2025-08-15 20:02:21.790311+00	602	168	1	{"selectedModifiers":{"Grano":["Honey"]},"original_notes":""}	30	0
1046	2025-08-15 21:41:42.482823+00	605	190	1		15	0
1047	2025-08-15 21:41:42.482823+00	605	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1048	2025-08-15 22:25:07.821167+00	606	190	2		15	0
1049	2025-08-15 22:25:07.821167+00	606	222	2		25	0
1050	2025-08-15 22:25:07.821167+00	606	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1051	2025-08-15 22:25:07.821167+00	606	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1052	2025-08-15 22:40:29.217058+00	607	185	1	pie de manzana	15	0
1053	2025-08-15 22:40:29.217058+00	607	222	1	\N	25	0
1093	2025-08-16 22:27:13.21481+00	622	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
1057	2025-08-16 00:19:20.30241+00	609	160	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
1058	2025-08-16 00:20:44.028385+00	610	160	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
1060	2025-08-16 00:34:29.362504+00	612	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1063	2025-08-16 00:41:19.206607+00	613	190	1	\N	15	0
1066	2025-08-16 01:13:55.440525+00	615	185	2	Un pie manzana y unpie de rqueson	15	0
1064	2025-08-16 01:10:24.831001+00	615	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1094	2025-08-16 22:28:49.42153+00	623	171	1		16	0
1065	2025-08-16 01:10:24.831001+00	615	160	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	17	0
1067	2025-08-16 14:13:45.175411+00	616	162	2	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1068	2025-08-16 14:31:00.303582+00	617	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1069	2025-08-16 14:31:00.303582+00	617	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1070	2025-08-16 19:39:18.979013+00	618	184	1		20	0
1071	2025-08-16 19:39:18.979013+00	618	185	2	Brazo guitano 	15	0
1072	2025-08-16 19:39:18.979013+00	618	191	4		12	0
1073	2025-08-16 19:39:18.979013+00	618	165	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	21	0
1074	2025-08-16 19:39:18.979013+00	618	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1075	2025-08-16 19:39:18.979013+00	618	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
1076	2025-08-16 19:44:28.617453+00	619	182	1	\N	12	0
1077	2025-08-16 19:44:28.617453+00	619	185	1	\N	15	0
1078	2025-08-16 19:44:28.617453+00	619	191	1	\N	12	0
1079	2025-08-16 19:44:28.617453+00	619	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1080	2025-08-16 19:44:28.617453+00	619	165	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	21	0
1081	2025-08-16 19:44:28.617453+00	619	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
1082	2025-08-16 20:24:40.365418+00	620	185	3	Brazo gitano 	15	0
1083	2025-08-16 20:24:40.365418+00	620	161	4	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":"Con leche deslactosada"}	22	0
1084	2025-08-16 22:23:10.821189+00	621	170	1		12	0
1085	2025-08-16 22:23:10.821189+00	621	186	1		8	0
1086	2025-08-16 22:23:10.821189+00	621	190	1		15	0
1088	2025-08-16 22:23:10.821189+00	621	223	1		18	0
1089	2025-08-16 22:23:10.821189+00	621	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1090	2025-08-16 22:23:10.821189+00	621	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1091	2025-08-16 22:23:10.821189+00	621	174	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	20	0
1092	2025-08-16 22:23:10.821189+00	621	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1095	2025-08-16 22:28:49.42153+00	623	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1087	2025-08-16 22:23:10.821189+00	621	219	1	\N	15	0
1096	2025-08-16 23:15:41.272419+00	624	190	1	\N	15	0
1097	2025-08-16 23:15:41.272419+00	624	223	1	\N	18	0
1099	2025-08-16 23:49:57.884991+00	626	179	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
1100	2025-08-17 00:00:15.543525+00	627	164	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1101	2025-08-17 00:00:15.543525+00	627	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":"Sin azúcar"}	18	0
1102	2025-08-17 00:25:18.256632+00	628	185	1		15	0
1103	2025-08-17 00:25:18.256632+00	628	219	1		15	0
1034	2025-08-15 04:26:39.006474+00	596	\N	1	\N	35	0
1035	2025-08-15 04:46:26.112575+00	597	\N	1	\N	35	0
1036	2025-08-15 05:11:50.487134+00	598	\N	1	\N	35	0
1038	2025-08-15 05:25:28.38639+00	600	\N	1	\N	20	0
1104	2025-08-17 00:25:18.256632+00	628	163	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	25	0
1105	2025-08-17 00:25:18.256632+00	628	178	1	{"selectedModifiers":{"Tipo de Preparación":["Con agua"],"Temperatura":["Caliente"]},"original_notes":""}	22	0
1098	2025-08-16 23:29:46.251142+00	626	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1106	2025-08-17 06:50:43.50136+00	629	217	1	\N	23	0
1164	2025-08-18 23:48:52.160928+00	652	190	2	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1158	2025-08-18 21:54:49.009057+00	652	191	1	\N	12	0
1159	2025-08-18 21:54:49.009057+00	652	190	1	{"selectedModifiers":{"Lonjas de jamón":["Doble"]},"original_notes":""}	20	0
869	2025-08-06 19:31:27.640423+00	496	\N	3	\N	35	0
929	2025-08-09 20:02:24.862818+00	534	\N	1	\N	35	0
945	2025-08-09 20:52:23.460726+00	544	\N	2	\N	35	0
938	2025-08-09 20:51:58.808034+00	541	\N	2	\N	35	0
948	2025-08-09 21:02:49.422492+00	547	\N	1	\N	35	0
996	2025-08-13 03:43:39.81183+00	577	\N	1	\N	35	0
1039	2025-08-15 05:25:38.976355+00	601	\N	1	\N	35	0
1107	2025-08-17 06:50:55.594971+00	629	\N	1	\N	35	0
1110	2025-08-17 07:03:01.434367+00	630	\N	4	\N	35	0
1111	2025-08-18 08:42:44.521408+00	631	216	1	\N	23	0
1113	2025-08-18 08:44:04.011241+00	632	217	2	\N	23	0
1117	2025-08-18 08:57:23.884697+00	634	215	3	\N	23	0
1118	2025-08-18 08:57:23.884697+00	634	79	5	{"selectedModifiers":{"Nuevo Grupofvfv":["Nueva Opcióndcdcdcd"]},"original_notes":""}	40	0
1119	2025-08-18 08:57:23.884697+00	634	79	4	{"selectedModifiers":{},"original_notes":""}	40	0
1120	2025-08-18 08:57:48.734556+00	634	80	3	\N	8	0
1115	2025-08-18 08:48:07.579284+00	634	80	4		8	0
1121	2025-08-18 08:57:57.951301+00	634	217	2	\N	23	0
1126	2025-08-18 09:00:02.776022+00	635	215	1	\N	23	0
1124	2025-08-18 08:59:40.985049+00	635	217	3	\N	23	0
1129	2025-08-18 09:01:37.012897+00	637	79	5	{"selectedModifiers":{"Nuevo Grupofvfv":["Nueva Opcióndcdcdcd"]},"original_notes":""}	40	0
1130	2025-08-18 09:01:45.578515+00	637	80	1	\N	8	0
1127	2025-08-18 09:01:08.116394+00	637	215	3		23	0
1131	2025-08-18 09:34:14.753871+00	638	215	1	\N	23	0
1132	2025-08-18 09:34:14.753871+00	638	216	1	\N	23	0
1133	2025-08-18 09:34:14.753871+00	638	217	1	\N	23	0
1134	2025-08-18 09:53:19.84005+00	639	215	1	\N	23	0
1135	2025-08-18 09:53:19.84005+00	639	216	1	\N	23	0
1136	2025-08-18 09:53:19.84005+00	639	217	1	\N	23	0
1137	2025-08-18 09:53:19.84005+00	639	79	1	{"selectedModifiers":{},"original_notes":""}	40	0
1140	2025-08-18 09:56:18.550848+00	641	216	1	\N	23	0
1141	2025-08-18 09:56:18.550848+00	641	79	1	{"selectedModifiers":{},"original_notes":""}	40	0
1142	2025-08-18 09:57:25.687582+00	642	215	1	\N	23	0
1143	2025-08-18 09:57:25.687582+00	642	216	1	\N	23	0
1144	2025-08-18 09:57:25.687582+00	642	79	1	{"selectedModifiers":{},"original_notes":""}	40	0
1145	2025-08-18 09:57:42.019709+00	643	\N	1	{"type":"custom_product","name":"sin sal","original_notes":""}	34	0
1146	2025-08-18 09:58:09.026026+00	644	216	1	\N	23	0
1147	2025-08-18 09:58:09.026026+00	644	79	1	{"selectedModifiers":{},"original_notes":""}	40	0
1148	2025-08-18 09:58:18.383071+00	645	216	4	\N	23	0
1149	2025-08-18 09:58:18.383071+00	645	217	1	\N	23	0
1150	2025-08-18 09:59:48.226161+00	646	80	1	\N	8	0
1151	2025-08-18 09:59:48.226161+00	646	217	1	\N	23	0
1152	2025-08-18 09:59:48.226161+00	646	79	1	{"selectedModifiers":{},"original_notes":""}	40	0
1153	2025-08-18 10:00:31.543709+00	647	215	1		23	0
1154	2025-08-18 10:00:31.543709+00	647	217	1		23	0
1156	2025-08-18 21:51:24.826631+00	648	233	1	\N	10	0
1157	2025-08-18 21:51:24.826631+00	648	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1163	2025-08-18 22:33:31.124047+00	651	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1160	2025-08-18 21:54:49.009057+00	652	159	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	18	0
1165	2025-08-18 23:49:51.082245+00	653	168	1	{"selectedModifiers":{"Grano":["Heterei"]},"original_notes":""}	28	0
1161	2025-08-18 22:15:11.172962+00	651	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1162	2025-08-18 22:33:31.124047+00	651	190	2	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1166	2025-08-19 00:45:33.357843+00	654	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
1167	2025-08-19 03:42:45.781052+00	655	243	1	{"selectedModifiers":{"leche":["con agua"]},"original_notes":""}	23	0
1169	2025-08-19 03:54:30.321425+00	657	79	1	{"selectedModifiers":{"Nuevo Grupo":["Nueva Opción"]},"original_notes":""}	40	0
1170	2025-08-19 03:54:30.321425+00	657	243	1	{"selectedModifiers":{"sal":["Nueva Opciónsasde"]},"original_notes":""}	23	0
1168	2025-08-19 03:45:43.391031+00	657	243	1	{"selectedModifiers":{"Nuevo Grupo":["Nueva Opción"]},"original_notes":""}	23	0
1138	2025-08-18 09:55:05.143206+00	642	216	1	\N	23	0
1139	2025-08-18 09:55:05.143206+00	642	217	1	\N	23	0
1171	2025-08-20 14:24:19.457928+00	658	217	1	\N	23	10
1175	2025-08-20 22:30:59.279843+00	660	170	1		12	0
1173	2025-08-20 22:07:50.765764+00	659	174	1	\N	20	0
1174	2025-08-20 22:10:47.800331+00	659	181	2	\N	25	0
1176	2025-08-20 22:30:59.279843+00	660	187	1		8	0
1177	2025-08-20 22:30:59.279843+00	660	189	1		25	0
1178	2025-08-20 22:30:59.279843+00	660	160	1	{"selectedModifiers":{"Temperatura Nueva":["Caliente"],"Tamaño Nuevo":["Normal"]},"original_notes":""}	17	0
1179	2025-08-20 22:30:59.279843+00	660	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1180	2025-08-20 22:30:59.279843+00	660	168	1	{"selectedModifiers":{"Grano":["Heterei"]},"original_notes":""}	28	0
1181	2025-08-20 22:34:04.651559+00	661	168	1	{"selectedModifiers":{"Grano":["Honey"]},"original_notes":"Sin azúcar"}	30	0
1182	2025-08-20 22:40:04.993903+00	662	189	1	Cortado en dos	25	10.3
1183	2025-08-20 22:40:04.993903+00	662	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":"Sirope de mocochinchi"}	20	9.98
1155	2025-08-18 21:51:24.826631+00	648	\N	1	\N	15	0
1185	2025-08-21 00:01:49.827121+00	664	233	1		10	0
1186	2025-08-21 00:01:49.827121+00	664	188	1	{"selectedModifiers":{"Masita seleccionada":["Solo cuñape"]},"original_notes":""}	15	0
1184	2025-08-20 23:13:41.572503+00	664	233	1		10	0
877	2025-08-06 22:47:52.660962+00	502	\N	1	\N	26	0
906	2025-08-07 21:53:17.950865+00	518	\N	1		26	0
983	2025-08-12 21:05:30.72338+00	571	\N	1		26	0
992	2025-08-13 00:47:50.244533+00	575	\N	1	\N	26	0
881	2025-08-06 22:58:10.772183+00	503	\N	2	\N	35	0
905	2025-08-07 21:39:25.358129+00	517	\N	2		35	0
1245	2025-08-24 01:25:14.698407+00	701	224	1	\N	110	9.61
1188	2025-08-21 00:45:48.577778+00	666	184	1	\N	20	8.8
1193	2025-08-21 21:18:17.039123+00	668	168	1	{"selectedModifiers":{"Grano":["Heterei"]},"original_notes":""}	28	0
1194	2025-08-21 21:18:17.039123+00	668	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1195	2025-08-21 21:19:43.480719+00	669	184	4	\N	20	8.8
1198	2025-08-21 22:12:56.841005+00	671	159	1		18	0
1189	2025-08-21 20:39:18.005436+00	669	159	1	\N	18	9.88
1190	2025-08-21 20:39:18.005436+00	669	233	1	naranja	10	0
1191	2025-08-21 20:39:18.005436+00	669	160	1	{"selectedModifiers":{"Temperatura Nueva":["Frío"],"Tamaño Nuevo":["Normal"]},"original_notes":""}	17	9.03
1192	2025-08-21 20:39:18.005436+00	669	168	1	{"selectedModifiers":{"Grano":["Heterei"]},"original_notes":""}	28	0
1199	2025-08-21 22:38:46.242386+00	672	158	1		14	0
1200	2025-08-21 22:40:57.772179+00	673	159	1	Leche deslactosada 	18	0
1201	2025-08-21 22:40:57.772179+00	673	191	1		12	0
1202	2025-08-21 22:42:44.198984+00	674	186	1		8	0
1203	2025-08-21 22:42:44.198984+00	674	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1204	2025-08-21 22:43:00.211321+00	675	184	1		20	0
1205	2025-08-21 22:43:00.211321+00	675	223	1	Por favor que no esté tan caliente 	18	0
1206	2025-08-21 22:43:08.640308+00	676	179	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":""}	16	0
1207	2025-08-21 22:43:13.897798+00	677	159	1		18	0
1208	2025-08-21 22:44:09.188864+00	678	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1209	2025-08-21 22:44:47.469934+00	679	159	1		18	0
1210	2025-08-21 22:44:47.469934+00	679	186	1		8	0
1212	2025-08-21 22:57:03.345944+00	681	233	2		10	0
1213	2025-08-21 22:57:03.345944+00	681	188	1	{"selectedModifiers":{"Masita seleccionada":["Un cuñape y una empanada"]},"original_notes":""}	15	0
1214	2025-08-21 22:57:03.345944+00	681	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1215	2025-08-21 23:03:53.987407+00	682	170	1		12	0
1216	2025-08-21 23:05:24.94614+00	683	179	1	{"selectedModifiers":{"Tipo de Leche":["Con agua"]},"original_notes":"Sin azúcar, sin hielo, jugo de manzana"}	16	0
1217	2025-08-21 23:07:31.160785+00	684	159	1		18	0
1219	2025-08-21 23:14:08.068233+00	686	162	1	{"selectedModifiers":{"Temperatura":["Frío"]},"original_notes":"Frapeado"}	23	9.98
1220	2025-08-21 23:16:41.045815+00	687	170	1	{"selectedModifiers":{"Temperatura":["Frío"]},"original_notes":""}	15	0.66
1221	2025-08-21 23:27:26.380378+00	688	170	1	{"selectedModifiers":{"Temperatura":["Frío"]},"original_notes":""}	15	0.66
1211	2025-08-21 22:53:44.378202+00	688	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1222	2025-08-21 23:29:54.262876+00	689	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1223	2025-08-21 23:31:02.258719+00	690	162	1	{"selectedModifiers":{"Temperatura":["Frío"]},"original_notes":"Frapeado"}	23	0
1218	2025-08-21 23:11:05.347412+00	690	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1196	2025-08-21 21:50:14.541309+00	671	233	1	Del sabor que recomiendes 	10	0
1197	2025-08-21 21:50:14.541309+00	671	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1224	2025-08-21 23:41:29.321285+00	690	184	1		20	0
1225	2025-08-22 00:27:03.526804+00	692	158	1		14	0
1226	2025-08-22 00:27:03.526804+00	692	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1227	2025-08-22 00:39:48.575772+00	693	190	1	{"selectedModifiers":{"Lonjas de jamón":["Simple"]},"original_notes":""}	15	0
1228	2025-08-22 01:10:51.919853+00	694	162	1	{"selectedModifiers":{"Temperatura":["Frío"]},"original_notes":"Frapeado"}	23	9.98
1229	2025-08-22 19:43:04.31643+00	695	189	1	\N	25	10.3
1230	2025-08-22 19:43:04.31643+00	695	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	9.98
1231	2025-08-22 21:40:53.870288+00	696	171	1		16	0
1232	2025-08-23 00:08:05.183846+00	697	233	1	\N	10	0
1018	2025-08-14 23:31:41.092729+00	589	\N	2	\N	35	0
1044	2025-08-15 21:09:26.313533+00	603	\N	1		35	0
1045	2025-08-15 21:09:27.304423+00	604	\N	1		35	0
1059	2025-08-16 00:33:39.312524+00	611	\N	1	\N	35	0
1187	2025-08-21 00:40:05.458103+00	664	\N	1	\N	35	0
1233	2025-08-23 23:29:16.207803+00	698	244	1	\N	20	0
1234	2025-08-23 23:37:23.915402+00	699	187	1		8	0
1235	2025-08-23 23:37:23.915402+00	699	219	1		15	0
1236	2025-08-23 23:37:23.915402+00	699	161	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	22	0
1237	2025-08-23 23:37:23.915402+00	699	162	1	{"selectedModifiers":{"Temperatura":["Caliente"]},"original_notes":""}	20	0
1238	2025-08-24 00:20:12.496792+00	700	159	1	\N	18	9.88
1239	2025-08-24 00:20:12.496792+00	700	186	2	\N	8	4
1240	2025-08-24 00:20:12.496792+00	700	219	1	\N	15	0
1241	2025-08-24 00:20:12.496792+00	700	244	2	\N	20	0
1242	2025-08-24 00:20:12.496792+00	700	160	2	{"selectedModifiers":{"Temperatura Nueva":["Caliente"],"Tamaño Nuevo":["Normal"]},"original_notes":""}	17	9.03
1243	2025-08-24 00:20:12.496792+00	700	178	1	{"selectedModifiers":{"Tipo de Preparación":["Con leche"],"Temperatura":["Caliente"]},"original_notes":""}	24	0
1244	2025-08-24 00:20:12.496792+00	700	179	1	{"selectedModifiers":{"Tipo de Leche":["Con leche"]},"original_notes":""}	18	0
1246	2025-08-24 01:25:14.698407+00	701	229	1	\N	90	0
\.


--
-- Data for Name: order_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_payments (id, order_id, cash_register_id, payment_method, amount, processed_at, processed_by, notes, created_at) FROM stdin;
293bfef8-f9fc-4015-8bb2-4357b421102d	500	f7079f7b-fdbf-437f-b132-2069e37f3167	qr	18.00	2025-08-06 20:50:20.742689+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 20:50:20.742689+00
50dc83cb-6d86-435f-ac82-6583aa5ea23b	501	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	72.00	2025-08-06 21:37:21.65111+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:37:21.65111+00
be3e316c-aaae-4c73-b4c1-96f4f00e7605	501	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	48.00	2025-08-06 21:37:21.65111+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:37:21.65111+00
7797eeb7-2dc5-46f7-85ac-a4d1828ada81	496	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	63.00	2025-08-06 21:38:07.939166+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:38:07.939166+00
450921b8-fad3-4c58-ab42-cdc2073a05fc	496	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	42.00	2025-08-06 21:38:07.939166+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:38:07.939166+00
22ec4785-81db-4370-961d-6db6651b2341	495	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	35.00	2025-08-06 21:38:15.40941+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:38:15.40941+00
33fe8ed2-aef3-4623-9f19-425ca0c7d31d	492	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	30.75	2025-08-06 21:38:28.355624+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:38:28.355624+00
5e172649-d513-4a29-aee0-57ecc88df53a	489	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	25.50	2025-08-06 21:38:51.960612+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:38:51.960612+00
30038ac9-97e3-4a3b-9745-1ccb0abfd989	480	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	32.75	2025-08-06 21:39:09.073598+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:39:09.073598+00
e7525721-22b0-4bc3-bebd-9eb8870f95e9	481	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	18.25	2025-08-06 21:39:19.067313+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:39:19.067313+00
2d4a4d00-ea74-4a5a-88a5-0893a0a8cd7a	479	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	25.50	2025-08-06 21:39:30.172328+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-06 21:39:30.172328+00
ae2d72f1-d9b8-4c23-8aa4-7580909302e9	502	f7079f7b-fdbf-437f-b132-2069e37f3167	qr	61.00	2025-08-06 22:48:16.400273+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 22:48:16.400273+00
4ba4750a-ae73-411d-9549-5e6385d5111f	503	f7079f7b-fdbf-437f-b132-2069e37f3167	qr	146.00	2025-08-06 22:58:31.415674+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 22:58:31.415674+00
220b607f-c2fd-455d-8877-b46f2bcaf8bc	504	f7079f7b-fdbf-437f-b132-2069e37f3167	qr	53.00	2025-08-06 23:27:39.193001+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 23:27:39.193001+00
63f3ed1e-779d-407d-bccb-887085dac1cd	504	f7079f7b-fdbf-437f-b132-2069e37f3167	cash	40.00	2025-08-06 23:27:39.193001+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 23:27:39.193001+00
deae36cd-6ca9-433a-bf92-e5f51967b70d	505	f7079f7b-fdbf-437f-b132-2069e37f3167	cash	59.00	2025-08-06 23:39:15.08849+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-06 23:39:15.08849+00
a9152ccb-2170-4093-b297-1d2dc8565a78	516	1c65c73d-2d40-4e02-8db6-123dcb55de9d	cash	22.00	2025-08-07 21:35:33.893045+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 21:35:33.893045+00
8ed14db2-d303-4156-b783-45274aa29053	518	1c65c73d-2d40-4e02-8db6-123dcb55de9d	cash	26.00	2025-08-07 22:22:58.763935+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 22:22:58.763935+00
8795a430-f448-4372-ae42-9318fd23b3dd	517	1c65c73d-2d40-4e02-8db6-123dcb55de9d	cash	70.00	2025-08-07 22:23:05.905018+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 22:23:05.905018+00
b0e592d7-d206-466e-a5ec-ec269c85943d	519	1c65c73d-2d40-4e02-8db6-123dcb55de9d	cash	62.00	2025-08-07 22:30:33.787375+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 22:30:33.787375+00
08ce76a6-047a-40c2-a855-01ce17c6f2a8	522	1c65c73d-2d40-4e02-8db6-123dcb55de9d	qr	33.00	2025-08-07 23:30:25.764425+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-07 23:30:25.764425+00
81dcbbfb-0220-4433-8136-8e03b217aeb8	521	1c65c73d-2d40-4e02-8db6-123dcb55de9d	qr	15.00	2025-08-08 00:01:50.494816+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 00:01:50.494816+00
a4ca8ab1-57fe-42c5-8117-4395d23b62b4	520	1c65c73d-2d40-4e02-8db6-123dcb55de9d	qr	28.00	2025-08-08 00:01:56.526971+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 00:01:56.526971+00
cd702678-92c4-4ea8-844e-b8b5874b82c3	523	1c65c73d-2d40-4e02-8db6-123dcb55de9d	qr	80.00	2025-08-08 00:04:09.456614+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 00:04:09.456614+00
5d8719cb-3525-427c-81ed-60eb51e098e0	526	f4eb4548-b6e4-4217-94eb-41bac14184f9	cash	30.00	2025-08-08 20:35:30.543369+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 20:35:30.543369+00
df800e17-6356-4df7-aba2-2f54a35011aa	527	f4eb4548-b6e4-4217-94eb-41bac14184f9	cash	12.00	2025-08-08 21:07:53.058667+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 21:07:53.058667+00
84460609-20b7-4c53-9a3c-1f56b9813f1e	524	f4eb4548-b6e4-4217-94eb-41bac14184f9	qr	60.00	2025-08-08 21:08:21.590697+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 21:08:21.590697+00
f6adcae1-eb14-44bc-a209-9332cabd57ea	524	f4eb4548-b6e4-4217-94eb-41bac14184f9	cash	16.00	2025-08-08 21:08:21.590697+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 21:08:21.590697+00
a243a50d-47c2-46c8-9834-97bea13ddfca	528	f4eb4548-b6e4-4217-94eb-41bac14184f9	qr	32.00	2025-08-08 21:22:46.199563+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 21:22:46.199563+00
d0aa89a0-b437-4faf-96f6-415e688936b7	529	f4eb4548-b6e4-4217-94eb-41bac14184f9	cash	33.00	2025-08-08 23:56:51.685592+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-08 23:56:51.685592+00
742ac86a-febe-4eb5-bb59-ef3add09c80b	530	f4eb4548-b6e4-4217-94eb-41bac14184f9	cash	53.00	2025-08-09 00:51:21.041559+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-09 00:51:21.041559+00
d55ae0bf-1676-40ea-a669-bb48ddbe4a4c	534	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	118.00	2025-08-09 20:02:55.9535+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 20:02:55.9535+00
faeba1b5-e508-4715-b084-cf2e3c08dfb6	533	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	40.00	2025-08-09 20:10:42.864592+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 20:10:42.864592+00
0872b09b-fb4c-4f29-973a-aa2437706258	535	ede9b118-be57-403c-8813-33aa5894e7ce	cash	71.00	2025-08-09 20:26:33.09921+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-09 20:26:33.09921+00
9982b805-1fc3-4956-8b35-064d96acf266	544	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	78.00	2025-08-09 20:55:32.405429+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 20:55:32.405429+00
e32eb309-33a9-4fd8-835d-81dad32bcc06	543	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	91.00	2025-08-09 20:57:11.968156+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 20:57:11.968156+00
9e508ebc-abb5-430f-8afd-3f9a69a1785a	541	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	155.00	2025-08-09 21:01:45.9899+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 21:01:45.9899+00
294cd1a4-30f2-4eb0-a9f7-ebbe9df22ecc	538	6ad48829-d7ff-4f8b-b716-3b4af2225626	card	83.00	2025-08-09 21:02:09.763585+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 21:02:09.763585+00
c1cbe061-7e79-48c6-9868-bbe85c4baf34	547	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	75.00	2025-08-09 21:03:31.292714+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 21:03:31.292714+00
ecdfd125-d4ba-420d-a8a8-3d631cd424d6	545	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	23.00	2025-08-09 21:03:54.949079+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-09 21:03:54.949079+00
13993189-1a19-45b6-a13c-7f32539b7df9	550	ede9b118-be57-403c-8813-33aa5894e7ce	cash	57.00	2025-08-09 22:16:49.139081+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-09 22:16:49.139081+00
a8a0382f-3250-4457-b123-0e2668754145	553	ede9b118-be57-403c-8813-33aa5894e7ce	qr	87.00	2025-08-10 00:49:25.845049+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-10 00:49:25.845049+00
c3d9edc2-8e44-48c0-8625-7456904f6852	562	ede9b118-be57-403c-8813-33aa5894e7ce	cash	165.00	2025-08-10 01:07:07.395441+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-10 01:07:07.395441+00
926c5db8-2aae-4961-be89-605e37fc80b1	563	ede9b118-be57-403c-8813-33aa5894e7ce	cash	15.00	2025-08-10 01:07:48.166286+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-10 01:07:48.166286+00
d9147b64-5f79-439a-9034-8c3cb2bd45de	564	c7a38c72-5c1a-4780-9060-cec6ccb0cc28	qr	43.00	2025-08-11 21:23:14.954902+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-11 21:23:14.954902+00
51523c06-dc58-4ba2-8276-ed7eeb4ff86f	566	c7a38c72-5c1a-4780-9060-cec6ccb0cc28	qr	36.00	2025-08-12 00:41:07.781875+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 00:41:07.781875+00
a2918745-0928-48a0-a2dc-b2fbf125b23a	565	c7a38c72-5c1a-4780-9060-cec6ccb0cc28	qr	38.00	2025-08-12 00:49:50.033757+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 00:49:50.033757+00
eb9da895-7c16-4c63-8cb2-a11bab954005	567	c7a38c72-5c1a-4780-9060-cec6ccb0cc28	qr	20.00	2025-08-12 00:51:12.658558+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 00:51:12.658558+00
278c90b1-7c53-4c7f-a9db-007d8e7833a2	571	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	qr	80.00	2025-08-12 21:22:00.422367+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 21:22:00.422367+00
b1c3495a-831d-4887-acba-658d80624547	570	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	cash	20.00	2025-08-12 21:30:19.956353+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 21:30:19.956353+00
fdf1762b-b46c-411a-977a-365465eb6b79	569	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	cash	14.00	2025-08-12 21:30:28.64814+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 21:30:28.64814+00
40302e68-ece6-41aa-9866-4525753a7961	568	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	cash	59.00	2025-08-12 21:36:42.77235+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 21:36:42.77235+00
4722b174-4073-4480-9528-58236d2548b2	572	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	qr	36.00	2025-08-12 21:49:34.079714+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-12 21:49:34.079714+00
96a81472-3c58-4703-b15b-69e7dbeeed75	575	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	cash	26.00	2025-08-13 00:48:05.036512+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 00:48:05.036512+00
9350a909-bedf-4258-834d-2f7afcbe4024	574	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	qr	70.00	2025-08-13 01:15:39.774745+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 01:15:39.774745+00
3a842f07-b394-4ac1-bf1b-9c9a0fc142ad	576	8960daf3-7295-4ae1-b1d2-359c9c2bebd6	cash	59.00	2025-08-13 01:17:52.345497+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 01:17:52.345497+00
5ac7db25-9293-4e8c-abc9-aa58cb178b5e	577	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	38.50	2025-08-13 03:43:59.664748+00	67ff8340-41be-400d-a33b-cad1ced23bce	Propina incluida: Bs 3.50	2025-08-13 03:43:59.664748+00
1d04d097-41aa-43fa-a12e-fff97f516c0b	579	8109b5c5-7522-402c-8022-ea084dd3878f	cash	124.00	2025-08-13 22:54:59.850423+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 22:54:59.850423+00
0455b527-683a-408d-b5a5-7b83c923dc07	580	8109b5c5-7522-402c-8022-ea084dd3878f	cash	55.00	2025-08-13 23:28:39.921234+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-13 23:28:39.921234+00
21f9efb2-abce-457d-bb6a-58c57158b1d4	582	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	51.00	2025-08-14 23:10:04.610864+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-14 23:10:04.610864+00
3bb3a62c-cef6-4302-9b33-d8012cada9f7	590	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	34.00	2025-08-14 23:39:33.046522+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-14 23:39:33.046522+00
466dfa64-84e5-4270-b7f3-fb21bd221f5b	585	2bf22cf9-96da-467b-b482-dc983f71dcff	qr	35.00	2025-08-15 00:48:21.45351+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 00:48:21.45351+00
bb059953-c7e2-4e6c-9c75-638f00c36488	584	2bf22cf9-96da-467b-b482-dc983f71dcff	qr	20.00	2025-08-15 00:48:29.224633+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 00:48:29.224633+00
7c56158b-a0ab-4590-9b8c-c799f55d782f	592	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	210.00	2025-08-15 00:51:02.701596+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 00:51:02.701596+00
d198650f-43de-4ae0-935c-67116f720cf8	588	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	244.00	2025-08-15 00:51:13.68719+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 00:51:13.68719+00
1e337172-6440-43a3-a06a-d57424015fc7	589	2bf22cf9-96da-467b-b482-dc983f71dcff	qr	26.00	2025-08-15 01:36:42.209155+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 01:36:42.209155+00
7ade3825-24ec-432c-8fe9-0e888008eecb	589	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	219.00	2025-08-15 01:36:42.209155+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 01:36:42.209155+00
f5b48ae0-5c7f-4ef6-99bd-ef6818b82756	591	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	76.00	2025-08-15 01:36:49.656533+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 01:36:49.656533+00
65b27b00-d305-4df8-845f-81e5a81be105	586	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	46.00	2025-08-15 01:36:57.476087+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 01:36:57.476087+00
72693999-c24c-4701-9bef-11b9e25795f9	594	2bf22cf9-96da-467b-b482-dc983f71dcff	cash	56.00	2025-08-15 02:01:12.846853+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-15 02:01:12.846853+00
cd18f807-7998-4f17-bb48-ec74d1f62f28	597	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	35.00	2025-08-15 05:02:40.939758+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:02:40.939758+00
3360b48f-9a15-480d-86ec-99eda26e0c10	596	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	35.00	2025-08-15 05:02:51.10913+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:02:51.10913+00
3aa425b5-173a-4fe1-ae92-2d1fe6fc7c67	595	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	23.00	2025-08-15 05:03:09.532026+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:03:09.532026+00
8bb1a5bc-a4ed-41e4-94bb-fd3e4c51ca61	578	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	20.00	2025-08-15 05:03:15.603717+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:03:15.603717+00
c779a5b8-0b43-4d85-8475-288b6288b09b	511	6ad48829-d7ff-4f8b-b716-3b4af2225626	card	23.00	2025-08-15 05:03:20.915195+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:03:20.915195+00
aa3ae7eb-4a1a-4cb9-9bbf-db6901f69b12	510	6ad48829-d7ff-4f8b-b716-3b4af2225626	qr	50.00	2025-08-15 05:03:34.589014+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:03:34.589014+00
eb54fd28-f47c-4c9c-8106-ad73b02cd0ac	510	6ad48829-d7ff-4f8b-b716-3b4af2225626	cash	33.00	2025-08-15 05:03:34.589014+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:03:34.589014+00
4cf7bcc9-8399-4612-810a-fea66f10cb38	599	d396d1b4-9723-46cb-9bd2-27769b0da2b4	qr	20.00	2025-08-15 05:12:22.884571+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:12:22.884571+00
9010a2e4-565d-4648-a9d7-2c9f943780bd	598	d396d1b4-9723-46cb-9bd2-27769b0da2b4	cash	35.00	2025-08-15 05:12:33.268123+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:12:33.268123+00
db686893-8cd3-4579-b4ec-b5f83aa73146	601	eccef4cb-acfc-4972-b199-fd3bbe9274aa	qr	35.00	2025-08-15 05:25:48.512718+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:25:48.512718+00
ae8befcd-f14d-4142-a850-122fde45788f	600	eccef4cb-acfc-4972-b199-fd3bbe9274aa	cash	20.00	2025-08-15 05:25:53.588375+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-15 05:25:53.588375+00
18a9f475-7912-4ed6-b4bf-3cd5e7f41641	606	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	110.00	2025-08-16 00:18:43.42213+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:18:43.42213+00
7ecdb5f5-d2d1-4c17-bfbe-7aa6850c0b7b	604	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	35.00	2025-08-16 00:18:56.997504+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:18:56.997504+00
424f5aa0-f0f7-44e9-841d-77bcf9a1e3dc	609	729c56b7-8b5b-4be6-a551-99d7a86b8f05	cash	34.00	2025-08-16 00:41:33.792704+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:41:33.792704+00
25b7d95e-cc10-4a74-8da1-435d75c863e8	610	729c56b7-8b5b-4be6-a551-99d7a86b8f05	cash	17.00	2025-08-16 00:45:28.516833+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:45:28.516833+00
e85b93ec-43c4-4b38-b661-e5355a5f4066	612	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	20.00	2025-08-16 00:49:22.704751+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:49:22.704751+00
8640edd8-dc74-4136-a6cf-809896f04bbb	611	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	35.00	2025-08-16 00:49:31.934635+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:49:31.934635+00
fb24ca1f-1712-4b7d-a65b-806039bfb5fa	607	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	40.00	2025-08-16 00:49:41.288383+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:49:41.288383+00
d0d771b9-5783-4539-a8b5-3074b67b0c2e	605	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	33.00	2025-08-16 00:49:53.477256+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:49:53.477256+00
c8ce27e0-a1fd-4287-8e1e-d40c1f461d58	613	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	15.00	2025-08-16 00:50:00.441526+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 00:50:00.441526+00
86ac1263-f2dc-4db9-b2dd-1f2cb50aa778	602	729c56b7-8b5b-4be6-a551-99d7a86b8f05	qr	93.00	2025-08-16 01:11:21.447038+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 01:11:21.447038+00
1198d9af-4f6a-4c07-990b-bde329783ac3	615	729c56b7-8b5b-4be6-a551-99d7a86b8f05	cash	84.00	2025-08-16 02:32:45.336129+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 02:32:45.336129+00
73969c74-a6d2-4734-aec8-a43430731900	616	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	40.00	2025-08-16 14:30:29.83383+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 14:30:29.83383+00
1ebc0053-1ff5-4173-809e-82ad68c6f8e6	617	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	38.00	2025-08-16 14:53:04.727065+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 14:53:04.727065+00
d1eb3b00-40b4-4a20-bb40-c775d98998b1	619	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	102.00	2025-08-16 20:18:58.261581+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 20:18:58.261581+00
72082533-5d7c-4dd1-b227-399c9ee6014f	620	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	133.00	2025-08-16 20:53:11.680654+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 20:53:11.680654+00
2bdfc692-55b9-4cc7-b493-4599a216136a	622	23333f2a-1c2a-40d4-9c9a-27c950a76a85	cash	22.00	2025-08-16 22:50:01.590126+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 22:50:01.590126+00
e3aead05-0b0e-4b9f-be7d-102b63506a60	623	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	36.00	2025-08-16 23:15:51.018506+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 23:15:51.018506+00
9a37b7ce-dcf5-48f7-ac0e-32bf98b5a168	621	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	141.00	2025-08-16 23:16:00.343222+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-16 23:16:00.343222+00
e62881e5-ccf7-46a9-b57c-4b3f0fa0e9e5	624	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	33.00	2025-08-17 01:42:05.194624+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-17 01:42:05.194624+00
ba4ee824-7fe8-479c-b316-9df57ef4c9b5	626	23333f2a-1c2a-40d4-9c9a-27c950a76a85	qr	33.00	2025-08-17 01:42:10.384134+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-17 01:42:10.384134+00
bdd277c3-359b-4016-8442-1fc40f844209	628	23333f2a-1c2a-40d4-9c9a-27c950a76a85	cash	77.00	2025-08-17 01:43:09.005042+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-17 01:43:09.005042+00
7d25168b-7dd5-41fb-a850-b2b07632d3ca	627	23333f2a-1c2a-40d4-9c9a-27c950a76a85	cash	38.00	2025-08-17 01:48:43.73036+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-17 01:48:43.73036+00
4e46fd9b-4c25-4f01-870b-7d4ada5a1d6f	634	eccef4cb-acfc-4972-b199-fd3bbe9274aa	cash	531.00	2025-08-18 08:59:13.520444+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-18 08:59:13.520444+00
6e77919c-82a8-4618-bc5e-5dac0b8504e6	635	eccef4cb-acfc-4972-b199-fd3bbe9274aa	qr	92.00	2025-08-18 09:00:23.531659+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-18 09:00:23.531659+00
50ba7e07-580d-4804-9c56-42ee553bbb46	648	adf16611-6a62-4b95-903e-2bf77fbf5034	cash	45.00	2025-08-18 21:55:05.535279+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-18 21:55:05.535279+00
3698aa90-b755-495b-bd54-5cbbfeca7f92	652	adf16611-6a62-4b95-903e-2bf77fbf5034	qr	80.00	2025-08-18 23:49:11.15723+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-18 23:49:11.15723+00
1b1d0a4f-ce8c-4879-ab15-1723d0dc8479	653	adf16611-6a62-4b95-903e-2bf77fbf5034	qr	8.00	2025-08-18 23:50:16.261415+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-18 23:50:16.261415+00
70c018d9-047d-40be-9d0b-223c08e82d73	653	adf16611-6a62-4b95-903e-2bf77fbf5034	cash	20.00	2025-08-18 23:50:16.261415+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-18 23:50:16.261415+00
076c4b90-49a6-472e-bce4-b46d0a0214a4	651	adf16611-6a62-4b95-903e-2bf77fbf5034	qr	70.00	2025-08-19 01:20:24.966134+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-19 01:20:24.966134+00
5ad1eee2-240c-4af9-9cf2-694f9cf8d5d9	644	eccef4cb-acfc-4972-b199-fd3bbe9274aa	cash	63.00	2025-08-19 01:44:23.121545+00	67ff8340-41be-400d-a33b-cad1ced23bce	\N	2025-08-19 01:44:23.121545+00
e452fa78-3013-4b77-93b2-c1dc24820dda	659	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	cash	70.00	2025-08-20 22:11:46.86056+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-20 22:11:46.86056+00
9d6c1de3-dea8-41c4-9d5f-f58546e88661	661	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	qr	30.00	2025-08-21 00:27:42.954781+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 00:27:42.954781+00
ee2bc48e-9b77-4ad3-87aa-30b80a129e5a	660	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	qr	105.00	2025-08-21 00:28:22.526974+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 00:28:22.526974+00
c47815b0-07ee-40b1-9cb2-69db95e24d1e	662	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	qr	50.00	2025-08-21 00:28:53.146693+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	Propina incluida: Bs 5.00	2025-08-21 00:28:53.146693+00
112d73f0-6634-451a-8417-58422665ccf3	664	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	cash	70.00	2025-08-21 00:40:24.477391+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 00:40:24.477391+00
16f3af4c-63ec-4d85-9ef9-5810a8f479a4	666	c179a509-8b7c-44ad-bfd9-1bb426deeaa9	qr	20.00	2025-08-21 00:47:28.80321+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 00:47:28.80321+00
5e95c774-261d-46c1-9e1c-cf75125a228b	669	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	cash	153.00	2025-08-21 22:38:47.239303+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 22:38:47.239303+00
8d086eb4-6852-4688-a5ad-3cdfef9a712a	681	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	50.00	2025-08-21 23:02:04.35474+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 23:02:04.35474+00
f4c11e83-d890-44f4-948f-33e6629394aa	668	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	43.00	2025-08-21 23:13:06.806567+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-21 23:13:06.806567+00
c8f835fd-8cce-4489-9cb0-8552ce3762ce	683	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	16.00	2025-08-22 00:32:44.880448+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 00:32:44.880448+00
fdfa2835-d10a-440a-bbb2-a97bc32d76c4	676	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	cash	16.00	2025-08-22 00:33:32.630179+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 00:33:32.630179+00
c98e6be6-42d0-478a-8214-45b3fb16a1e4	673	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	30.00	2025-08-22 00:33:42.505027+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 00:33:42.505027+00
99b985b8-f423-4249-87fe-04bb6d98bd24	674	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	28.00	2025-08-22 00:33:49.416384+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 00:33:49.416384+00
15e75779-b6a5-4432-b2a4-345cf230b0af	675	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	38.00	2025-08-22 00:58:16.233095+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 00:58:16.233095+00
c275c92e-b5d5-4aef-88d5-99237db91a37	679	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	26.00	2025-08-22 01:01:08.070136+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:01:08.070136+00
b9a6afd6-ec66-4118-8253-265c7195645e	688	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	30.00	2025-08-22 01:08:55.257848+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:08:55.257848+00
05533582-89c2-4d59-a233-de2dcf35155c	677	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	cash	18.00	2025-08-22 01:09:07.894877+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:07.894877+00
65feee8a-f68c-434e-beac-36e176164807	686	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	23.00	2025-08-22 01:09:13.597784+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:13.597784+00
47072ec0-1b2a-4001-87f8-a08ab190f4b3	692	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	cash	34.00	2025-08-22 01:09:24.861927+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:24.861927+00
055763fc-fe86-4591-bfbf-987b927e393a	671	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	43.00	2025-08-22 01:09:34.149225+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:34.149225+00
9bb5df8c-d8ba-426d-8003-4a3f24232cfd	672	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	14.00	2025-08-22 01:09:43.795928+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:43.795928+00
8dee1d17-9d2f-405f-a3a6-5108f9e3cf8a	684	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	18.00	2025-08-22 01:09:50.152434+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:09:50.152434+00
d5f09486-9d17-42c2-82d7-edb48d2ad511	693	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	cash	15.00	2025-08-22 01:10:02.936599+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:10:02.936599+00
197e53ba-0fcb-4e29-8d10-279e0b36e7bb	694	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	23.00	2025-08-22 01:11:01.812012+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:11:01.812012+00
3bfc965b-4f37-4583-9f71-7132171f4d8f	690	ce26a8a7-1764-4de9-85b3-1d3d2839a4b5	qr	58.00	2025-08-22 01:13:16.741216+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 01:13:16.741216+00
86ae4698-20f0-4a4d-8b5d-bc5ff4a563f5	695	5c612b0e-b375-4b95-b8d8-e498bada6ac6	cash	45.00	2025-08-22 19:47:20.509304+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 19:47:20.509304+00
c09f9647-ece4-4c30-a8ad-595645b0b5de	696	5c612b0e-b375-4b95-b8d8-e498bada6ac6	cash	16.00	2025-08-22 21:41:18.511102+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-22 21:41:18.511102+00
60150993-7832-427a-9914-0b3e864effba	697	5c612b0e-b375-4b95-b8d8-e498bada6ac6	cash	10.00	2025-08-23 00:19:51.743257+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-23 00:19:51.743257+00
b5e2a6e0-3a37-4e17-b180-dfa3099c81c1	698	e66dc660-fd5d-4958-8909-48895563baea	qr	20.00	2025-08-23 23:31:08.10038+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-23 23:31:08.10038+00
739bad74-b679-4e5a-8781-9276c501a495	699	e66dc660-fd5d-4958-8909-48895563baea	qr	65.00	2025-08-24 01:21:56.290842+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-24 01:21:56.290842+00
847b67ea-d001-45d1-b572-56986a19d849	700	e66dc660-fd5d-4958-8909-48895563baea	qr	165.00	2025-08-24 01:24:54.09053+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-24 01:24:54.09053+00
d70ce22a-c3eb-4851-a103-d134eaf49257	701	e66dc660-fd5d-4958-8909-48895563baea	qr	200.00	2025-08-24 01:25:49.27251+00	e05094eb-0452-43bd-aa3e-214a6c3b6966	\N	2025-08-24 01:25:49.27251+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, created_at, table_id, customer_name, status, total_price, notes, source, drink_printed, kitchen_printed, restaurant_id, archived, is_new_order, is_preparing, is_ready) FROM stdin;
655	2025-08-19 03:42:45.457862+00	861b499b-8294-4a83-b7b1-dcd316334db5	Davor	in_progress	23		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
373	2025-08-06 04:53:28.292144+00	861b499b-8294-4a83-b7b1-dcd316334db5	🟢 SERVIDO EN MESA - Cliente 3	served	79	Orden de prueba #3 - served - 4 items	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
498	2025-08-06 20:26:15.133557+00	dc38a06f-62f1-434a-9472-30078c3abca4	Ana	cancelled	22		customer_qr	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
642	2025-08-18 09:57:25.437699+00	861b499b-8294-4a83-b7b1-dcd316334db5	sergio	in_progress	132	Órdenes fusionadas: 640	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
640	2025-08-18 09:55:04.905162+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	merged	46	Fusionada en orden: 642	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
501	2025-08-06 21:36:48.423221+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	120	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
638	2025-08-18 09:34:14.493366+00	861b499b-8294-4a83-b7b1-dcd316334db5	Jorge	in_progress	69	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
533	2025-08-09 19:18:51.896576+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	jorge	completed	40	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
508	2025-08-07 16:54:25.414353+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor prueba impresora desconectada	cancelled	14		customer_qr	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
507	2025-08-07 16:52:38.999837+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	prueba Davor	cancelled	39	prueba por codigos Qr con impresora activada	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
506	2025-08-07 16:51:17.872548+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	davor prueba	cancelled	43	prueba por dashbaord orden con impresora activada y conectada	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
598	2025-08-15 05:11:50.235134+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
512	2025-08-07 20:29:10.580546+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	ana	cancelled	18	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
532	2025-08-09 19:14:46.447579+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	merged	83	Órdenes fusionadas: 531 | Fusionada en orden: 534 | Fusionada en orden: 531	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
531	2025-08-09 19:14:19.771311+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	cancelled	143	Fusionada en orden: 532 | Órdenes fusionadas: 532	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
525	2025-08-08 20:08:59.636088+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Carlos	cancelled	18		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
480	2025-08-06 07:52:56.504+00	8ce7f1e2-7ea6-4211-b156-1f3224865129	María Test	completed	32.75	\N	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
555	2025-08-09 22:19:55.463604+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	davor prueba merge	merged	14	Fusionada en orden: 556	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
552	2025-08-09 21:45:11.147699+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Josemaria Tapia	merged	47	Fusionada en orden: 553	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
540	2025-08-09 20:51:58.609845+00	861b499b-8294-4a83-b7b1-dcd316334db5	Test Dashboard 1	merged	75	Fusionada en orden: 541	dashboard	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
629	2025-08-17 06:50:43.248146+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	cancelled	58	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
558	2025-08-09 23:36:37.024644+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	prueba de sonido otra vez	cancelled	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
489	2025-08-06 18:52:31.206+00	861b499b-8294-4a83-b7b1-dcd316334db5	Test Sonido 1754506351206	completed	25.5	\N	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
536	2025-08-09 20:13:06.323326+00	861b499b-8294-4a83-b7b1-dcd316334db5	unir 1	merged	60	Órdenes fusionadas: 537 | Fusionada en orden: 538	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
548	2025-08-09 21:08:36.180158+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	davor prueba	merged	25	Fusionada en orden: 549	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
551	2025-08-09 21:38:20.170664+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor prueba menú QR	cancelled	23	Nuevo ítem con modificadores 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
561	2025-08-10 00:51:29.317188+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Para llevar	merged	75	Fusionada en orden: 562	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
581	2025-08-13 22:18:08.604168+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	pati	merged	70	Fusionada en orden: 579	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	t	f
492	2025-08-06 18:57:43.44+00	861b499b-8294-4a83-b7b1-dcd316334db5	Debug Sonido #2	completed	30.75	\N	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
495	2025-08-06 19:13:46.146344+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
544	2025-08-09 20:52:23.217247+00	eb8a2ad3-43db-4521-946a-8cc09f1e869d	Cliente Solo Mesa3	completed	78	\N	qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
577	2025-08-13 03:43:39.12822+00	861b499b-8294-4a83-b7b1-dcd316334db5	Esthaer	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
597	2025-08-15 04:46:25.876351+00	861b499b-8294-4a83-b7b1-dcd316334db5	martin	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
601	2025-08-15 05:25:38.734817+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	davor	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
631	2025-08-18 08:42:44.425393+00	861b499b-8294-4a83-b7b1-dcd316334db5	Davor	cancelled	23		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
643	2025-08-18 09:57:41.766554+00	c2836b31-f623-4b1f-b8c4-26914012d6d7	martin	in_progress	34	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
646	2025-08-18 09:59:47.971317+00	c2836b31-f623-4b1f-b8c4-26914012d6d7	fbfb	in_progress	71	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
593	2025-08-15 01:43:52.663993+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	patty	merged	20	Fusionada en orden: 594	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	t	f
633	2025-08-18 08:48:07.536964+00	861b499b-8294-4a83-b7b1-dcd316334db5	Horax coronel	merged	78	Fusionada en orden: 634	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	t	f
587	2025-08-14 23:12:50.859746+00	ad32b603-4de0-4723-8be4-c060a6153220	Reserva	merged	50	Fusionada en orden: 588	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
649	2025-08-18 21:54:48.540523+00	dc38a06f-62f1-434a-9472-30078c3abca4	Andrea	merged	50	Fusionada en orden: 652	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
654	2025-08-19 00:45:33.30991+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Ana	cancelled	22		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
499	2025-08-06 20:29:46.132826+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Ana	cancelled	19		customer_qr	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
545	2025-08-09 21:02:38.843149+00	861b499b-8294-4a83-b7b1-dcd316334db5	pruebas con impresora	completed	23	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
509	2025-08-07 17:07:33.320973+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	davor prueba	cancelled	20	prueba impresora desconectada, enviada por dashboard	staff_placed	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
547	2025-08-09 21:02:58.001293+00	861b499b-8294-4a83-b7b1-dcd316334db5	333	completed	75	Órdenes fusionadas: 546	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
513	2025-08-07 20:48:48.707696+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	ana	cancelled	14	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
656	2025-08-19 03:45:43.138303+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	merged	23	Fusionada en orden: 657	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
578	2025-08-13 08:05:42.591586+00	861b499b-8294-4a83-b7b1-dcd316334db5	Davor	completed	20		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
595	2025-08-15 04:13:23.455941+00	861b499b-8294-4a83-b7b1-dcd316334db5	DAvor	completed	23	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
556	2025-08-09 22:20:24.969173+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	davor pruebas	cancelled	48	Órdenes fusionadas: 555 | Órdenes fusionadas: 554	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
559	2025-08-09 23:50:00.800575+00	861b499b-8294-4a83-b7b1-dcd316334db5	swsw	cancelled	23	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
625	2025-08-16 23:29:46.150521+00	ad32b603-4de0-4723-8be4-c060a6153220	Mariana	merged	15	Fusionada en orden: 626	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
667	2025-08-21 20:39:16.509623+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	sandra	merged	73	Fusionada en orden: 669	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
698	2025-08-23 23:29:15.269078+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Gabo	completed	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
685	2025-08-21 23:11:05.256839+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Gabhino	merged	15	Fusionada en orden: 690	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
691	2025-08-21 23:41:29.230832+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos	merged	20	Fusionada en orden: 690	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
549	2025-08-09 21:08:52.84711+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	davor prueba	cancelled	50	Órdenes fusionadas: 548	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
599	2025-08-15 05:12:05.454665+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	jorrge	completed	20	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
481	2025-08-06 07:52:56.504+00	8ce7f1e2-7ea6-4211-b156-1f3224865129	José Test	completed	18.25	\N	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
496	2025-08-06 19:31:27.469589+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	105	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
534	2025-08-09 20:02:24.387302+00	861b499b-8294-4a83-b7b1-dcd316334db5	davoe	completed	118	Órdenes fusionadas: 532	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
538	2025-08-09 20:50:19.333349+00	861b499b-8294-4a83-b7b1-dcd316334db5	orden neuva	completed	83	Órdenes fusionadas: 536	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
541	2025-08-09 20:51:58.994627+00	861b499b-8294-4a83-b7b1-dcd316334db5	Test Dashboard 2	completed	155	Órdenes fusionadas: 540 | Órdenes fusionadas: 539	dashboard	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
543	2025-08-09 20:52:22.515842+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	Cliente QR Mesa2-B	completed	91	Órdenes fusionadas: 542	qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
608	2025-08-16 00:14:02.147763+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Mesa afuera	cancelled	0		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
699	2025-08-23 23:37:23.867834+00	dc38a06f-62f1-434a-9472-30078c3abca4	Gladys	completed	65		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
502	2025-08-06 22:47:52.489645+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Anónimo	completed	61	\N	staff_placed	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
503	2025-08-06 22:58:10.281802+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Ocampo	completed	146	\N	staff_placed	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
504	2025-08-06 23:07:32.524596+00	dc38a06f-62f1-434a-9472-30078c3abca4	anónimo	completed	93	\N	staff_placed	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
678	2025-08-21 22:44:09.141259+00	ad32b603-4de0-4723-8be4-c060a6153220	Joaquin	cancelled	20	Frío porfa 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	t	f
614	2025-08-16 01:10:24.744989+00	ad32b603-4de0-4723-8be4-c060a6153220	Jhonson	merged	37	Fusionada en orden: 615	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
497	2025-08-06 20:03:38.588364+00	dc38a06f-62f1-434a-9472-30078c3abca4	Ana	cancelled	22		customer_qr	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
657	2025-08-19 03:54:30.243325+00	861b499b-8294-4a83-b7b1-dcd316334db5	Horax coronel	in_progress	86	Órdenes fusionadas: 656	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
514	2025-08-07 21:31:36.460424+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	ana	cancelled	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
515	2025-08-07 21:32:18.29113+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor prueba	cancelled	25		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
537	2025-08-09 20:13:15.212226+00	861b499b-8294-4a83-b7b1-dcd316334db5	unir 2	merged	20	Fusionada en orden: 536	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
542	2025-08-09 20:52:21.796395+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	Cliente QR Mesa2	merged	63	Fusionada en orden: 543	qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
539	2025-08-09 20:50:29.638642+00	861b499b-8294-4a83-b7b1-dcd316334db5	orden nueva	merged	40	Fusionada en orden: 541	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
546	2025-08-09 21:02:48.927752+00	861b499b-8294-4a83-b7b1-dcd316334db5	priuebas con impresora	merged	35	Fusionada en orden: 547	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
554	2025-08-09 22:19:34.258365+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor prueba merge	merged	20	Fusionada en orden: 556	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
505	2025-08-06 23:09:18.906368+00	ad32b603-4de0-4723-8be4-c060a6153220	John	completed	59		customer_qr	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
557	2025-08-09 23:23:29.100141+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor prueba	cancelled	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	t	f
560	2025-08-09 23:54:34.327145+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	ultima prueba	cancelled	21	si no suena esta vez lloro	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
479	2025-08-06 07:52:56.503+00	8ce7f1e2-7ea6-4211-b156-1f3224865129	Carlos Test	completed	25.5	\N	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
510	2025-08-07 17:21:24.28443+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	83	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
511	2025-08-07 17:21:34.47425+00	861b499b-8294-4a83-b7b1-dcd316334db5	davor	completed	23	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
583	2025-08-14 22:34:05.76402+00	ad32b603-4de0-4723-8be4-c060a6153220	Reserva	merged	54	Fusionada en orden: 588	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
596	2025-08-15 04:26:38.755841+00	5fea702d-c5ed-494b-a29a-3cc9900ae931	jorge	completed	35	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	t	f	f	t
516	2025-08-07 21:35:00.788417+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	ana	completed	22	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
682	2025-08-21 23:03:53.909642+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Los	cancelled	12	Te frío 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
600	2025-08-15 05:25:28.139429+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	completed	20	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
603	2025-08-15 21:09:26.215925+00	367c3357-c794-4766-9961-d908f3eb9450	Fémur	cancelled	35		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
573	2025-08-12 22:27:47.443707+00	dc38a06f-62f1-434a-9472-30078c3abca4	Tai	merged	50	Fusionada en orden: 574	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
689	2025-08-21 23:29:54.178795+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos	cancelled	20	Frío por favor 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
517	2025-08-07 21:39:25.262176+00	ad32b603-4de0-4723-8be4-c060a6153220	Fabian Martínez	completed	70		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
647	2025-08-18 10:00:31.445354+00	861b499b-8294-4a83-b7b1-dcd316334db5	chama	in_progress	46		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	t	f
634	2025-08-18 08:57:23.618074+00	861b499b-8294-4a83-b7b1-dcd316334db5	dff	completed	531	Órdenes fusionadas: 633	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
618	2025-08-16 19:39:18.883647+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Luis	cancelled	161		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
635	2025-08-18 08:59:40.66483+00	861b499b-8294-4a83-b7b1-dcd316334db5	Elias	completed	92		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
644	2025-08-18 09:58:08.729543+00	c2836b31-f623-4b1f-b8c4-26914012d6d7	lore	completed	63	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
650	2025-08-18 22:15:11.097707+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Jt	merged	20	Fusionada en orden: 651	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
636	2025-08-18 09:01:07.802885+00	861b499b-8294-4a83-b7b1-dcd316334db5	staff	merged	0	Fusionada en orden: 637	customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
637	2025-08-18 09:01:36.778059+00	861b499b-8294-4a83-b7b1-dcd316334db5	dede	cancelled	208	Órdenes fusionadas: 636	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
639	2025-08-18 09:53:19.592331+00	861b499b-8294-4a83-b7b1-dcd316334db5	jorge	in_progress	109	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
630	2025-08-17 07:02:06.82714+00	861b499b-8294-4a83-b7b1-dcd316334db5	Davor	cancelled	140		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
645	2025-08-18 09:58:18.124934+00	b5ff58e0-5a36-44d0-a3fc-ef5444dee087	juju	in_progress	115	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
632	2025-08-18 08:44:03.709717+00	861b499b-8294-4a83-b7b1-dcd316334db5	Davor	cancelled	46		customer_qr	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
641	2025-08-18 09:56:18.304596+00	b5ff58e0-5a36-44d0-a3fc-ef5444dee087	sergio	in_progress	63	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	f	f	t
569	2025-08-12 19:52:51.706312+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos	completed	14		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
700	2025-08-24 00:20:10.132913+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Jukumaris	completed	165	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
500	2025-08-06 20:47:42.093162+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Davor	completed	18	\N	staff_placed	f	f	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
520	2025-08-07 22:50:12.30396+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Carlos Tapia	completed	28		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
521	2025-08-07 22:51:10.122765+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Carlos Tapia	completed	15		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
687	2025-08-21 23:16:40.370075+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Liz	cancelled	15	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
658	2025-08-20 14:24:18.947615+00	861b499b-8294-4a83-b7b1-dcd316334db5	wjorge	in_progress	23	\N	staff_placed	f	f	a01006de-3963-406d-b060-5b7b34623a38	f	t	f	f
522	2025-08-07 23:01:37.517723+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Josemaria Tapia	completed	33		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
523	2025-08-08 00:03:53.635642+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Carlos	completed	80	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
524	2025-08-08 20:01:01.49445+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Carlos	completed	76		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
526	2025-08-08 20:32:21.890078+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Español	completed	30		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
527	2025-08-08 21:05:49.940399+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Carlos	completed	12	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
528	2025-08-08 21:12:00.510444+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Patty	completed	32	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
529	2025-08-08 21:52:52.361099+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Josemaria Tapia	completed	33		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
530	2025-08-08 23:59:05.894896+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Andres	completed	53		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
663	2025-08-20 23:13:41.484631+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Jp	merged	10	Fusionada en orden: 664	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
665	2025-08-21 00:40:04.747749+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Patty	merged	35	Fusionada en orden: 664	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	t	f	f
535	2025-08-09 20:04:04.515685+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Guineito	completed	71	Tapia	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
550	2025-08-09 21:30:26.012665+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Nicolás	completed	57		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
553	2025-08-09 21:45:23.040564+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Nexi	completed	87	💖 | Órdenes fusionadas: 552	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
562	2025-08-10 00:52:16.0893+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos Para llevar	completed	165	Órdenes fusionadas: 561	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
563	2025-08-10 01:06:05.488722+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Martin	completed	15		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
564	2025-08-11 21:03:27.698342+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Alesergie	completed	43		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
565	2025-08-11 21:12:26.161205+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Patty	completed	38	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
566	2025-08-12 00:05:55.500386+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Iara Alexandra	completed	36		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
567	2025-08-12 00:50:53.221849+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Hiro	completed	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
701	2025-08-24 01:25:13.526534+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Para llevar	completed	200	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
568	2025-08-12 19:51:56.610989+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Papás san ignacio	completed	59		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
570	2025-08-12 20:21:52.81537+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Carlos	completed	20		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
571	2025-08-12 21:05:30.645026+00	ad32b603-4de0-4723-8be4-c060a6153220	Pérez	completed	80	Para llevar. 3 cucharillas de azúcar en cada café porfavor 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
659	2025-08-20 21:03:45.373191+00	e6084836-caa3-4e39-a4b0-a3fbf283d633	Paola	completed	70		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
660	2025-08-20 22:30:59.164354+00	ad32b603-4de0-4723-8be4-c060a6153220	Anne	completed	105		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
661	2025-08-20 22:34:04.607041+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Ricardo Benites	completed	30		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
662	2025-08-20 22:40:03.590416+00	dc38a06f-62f1-434a-9472-30078c3abca4	Degustaciones	completed	45	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
664	2025-08-21 00:01:49.70993+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Jp vice	completed	70	Órdenes fusionadas: 663 | Órdenes fusionadas: 665	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
666	2025-08-21 00:45:47.903301+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Hiroshi	completed	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
668	2025-08-21 21:18:16.988819+00	e6084836-caa3-4e39-a4b0-a3fbf283d633	Cami	completed	43		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
669	2025-08-21 21:19:42.489256+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	sandra	completed	153	Órdenes fusionadas: 667	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
672	2025-08-21 22:38:46.15959+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Juan	completed	14		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
673	2025-08-21 22:40:57.678008+00	ad32b603-4de0-4723-8be4-c060a6153220	Turfa :)	completed	30		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
675	2025-08-21 22:43:00.116607+00	ad32b603-4de0-4723-8be4-c060a6153220	Abigail Castillo	completed	38		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
676	2025-08-21 22:43:08.588436+00	ad32b603-4de0-4723-8be4-c060a6153220	Rodrigo	completed	16		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
677	2025-08-21 22:43:13.823423+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Heather	completed	18		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
679	2025-08-21 22:44:47.38164+00	ad32b603-4de0-4723-8be4-c060a6153220	Andrea	completed	26		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
681	2025-08-21 22:57:03.286261+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Jose Tapia	completed	50		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
683	2025-08-21 23:05:24.875333+00	ad32b603-4de0-4723-8be4-c060a6153220	Milena	completed	16		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
686	2025-08-21 23:14:07.116536+00	ad32b603-4de0-4723-8be4-c060a6153220	Joaquin	completed	23	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
688	2025-08-21 23:27:25.396335+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Liz	completed	30	Órdenes fusionadas: 680	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
690	2025-08-21 23:31:02.178514+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos	completed	58	Órdenes fusionadas: 685 | Órdenes fusionadas: 691	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
692	2025-08-22 00:27:03.479818+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Mesa 4	completed	34		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
693	2025-08-22 00:39:48.495403+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Luz	completed	15		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
694	2025-08-22 01:10:51.2778+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Gladys	completed	23	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
697	2025-08-23 00:08:04.581866+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Jose	completed	10	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
518	2025-08-07 21:53:17.905606+00	ad32b603-4de0-4723-8be4-c060a6153220	Fabian Martínez	completed	26	Para llevar porfis :)	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
519	2025-08-07 21:53:26.888321+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Felipe	completed	62		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
572	2025-08-12 21:33:27.315101+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Hugo Prado	completed	36		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
574	2025-08-12 22:39:54.942846+00	dc38a06f-62f1-434a-9472-30078c3abca4	Joel	completed	70	Órdenes fusionadas: 573	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
575	2025-08-13 00:47:49.717063+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Ivan	completed	26	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
576	2025-08-13 01:00:05.386676+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Carlos y Patty	completed	59		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
579	2025-08-13 21:35:02.589932+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	pati	completed	124	Órdenes fusionadas: 581	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
580	2025-08-13 22:18:03.654113+00	dc38a06f-62f1-434a-9472-30078c3abca4	Cristina	completed	55		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
582	2025-08-14 20:10:54.308975+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Tapia	completed	51	Eeeee nose 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
584	2025-08-14 22:48:41.833495+00	fb206025-7666-4408-aa69-7c87a225ef72	Lucia	completed	20		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
585	2025-08-14 22:48:56.453704+00	fb206025-7666-4408-aa69-7c87a225ef72	Camila Vargas	completed	35		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
586	2025-08-14 23:03:46.300626+00	da18bdaa-c7fd-4b44-965a-0771b89fecf8	Machicado	completed	46		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
588	2025-08-14 23:22:25.92154+00	ad32b603-4de0-4723-8be4-c060a6153220	Reserva	completed	244	Órdenes fusionadas: 587 | Órdenes fusionadas: 583	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
680	2025-08-21 22:53:44.300574+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Liz	merged	15	Fusionada en orden: 688	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
589	2025-08-14 23:31:40.595552+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Pasanaku	completed	245	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
590	2025-08-14 23:38:49.267755+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Marraqueta	completed	34	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
670	2025-08-21 21:50:14.491218+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Juan	merged	25	Fusionada en orden: 671	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	f	f	f	t
591	2025-08-15 00:23:56.148551+00	e8652d94-03e5-4db0-af08-3b5bf7b043f0	Jessica Flores	completed	76		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
592	2025-08-15 00:49:03.963867+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Gonzalo	completed	210	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
594	2025-08-15 02:00:42.653868+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	patty	completed	56	Órdenes fusionadas: 593	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
602	2025-08-15 20:02:21.69127+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Nino	completed	93		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
604	2025-08-15 21:09:27.236992+00	367c3357-c794-4766-9961-d908f3eb9450	Fémur	completed	35		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
624	2025-08-16 23:15:40.777193+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	CASTILLO	completed	33	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
626	2025-08-16 23:49:57.797733+00	ad32b603-4de0-4723-8be4-c060a6153220	Leandro	completed	33	un vasito de agua fria por favorcito  | Órdenes fusionadas: 625	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
627	2025-08-17 00:00:15.427545+00	e6084836-caa3-4e39-a4b0-a3fbf283d633	Dalence	completed	38	Servilletas extra por favor 	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
628	2025-08-17 00:25:18.174794+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Damian	completed	77		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
648	2025-08-18 21:51:24.362869+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Gabo	completed	45	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
651	2025-08-18 22:33:31.046018+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Nex	completed	70	Capuchino mocochinchi | Órdenes fusionadas: 650	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
652	2025-08-18 23:48:51.982312+00	dc38a06f-62f1-434a-9472-30078c3abca4	andrea	completed	80	Órdenes fusionadas: 649	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
653	2025-08-18 23:49:50.907409+00	ad32b603-4de0-4723-8be4-c060a6153220	para llevar	completed	28	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
671	2025-08-21 22:12:56.762197+00	3e3f46ee-8580-45ef-a6d8-152cf9b83eea	Juan	completed	43	Leche dealactosada por favor  | Órdenes fusionadas: 670	customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
605	2025-08-15 21:41:42.379443+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Patty	completed	33		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
606	2025-08-15 22:25:07.737074+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Carla	completed	110		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
607	2025-08-15 22:40:28.696508+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Carlos	completed	40	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
609	2025-08-16 00:19:20.219123+00	ad32b603-4de0-4723-8be4-c060a6153220	Mesa externa	completed	34		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
610	2025-08-16 00:20:43.855379+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	martin	completed	17	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
611	2025-08-16 00:33:38.802732+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Patty	completed	35	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
612	2025-08-16 00:34:29.175535+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Patty	completed	20	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
613	2025-08-16 00:36:12.918792+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Josemaria	completed	15		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
615	2025-08-16 01:13:55.271434+00	ad32b603-4de0-4723-8be4-c060a6153220	Jhon	completed	84	Órdenes fusionadas: 614	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
616	2025-08-16 14:13:44.680544+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Recomendado	completed	40	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
617	2025-08-16 14:30:59.830086+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Mesa de afuera	completed	38	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
619	2025-08-16 19:44:28.140605+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	LUIS	completed	102	\N	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
620	2025-08-16 20:24:40.27254+00	e6084836-caa3-4e39-a4b0-a3fbf283d633	Canedo	completed	133		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
621	2025-08-16 22:23:10.749522+00	ad32b603-4de0-4723-8be4-c060a6153220	Mariel	completed	141		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
622	2025-08-16 22:27:13.153167+00	c1aa6297-3405-4263-83ec-9c2e02b7228c	Gladys	completed	22		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
623	2025-08-16 22:28:49.321117+00	cf06cf5e-f263-4397-a9b9-e184c35e89c0	Georgina	completed	36		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
674	2025-08-21 22:42:44.153571+00	7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	Iris	completed	28		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
684	2025-08-21 23:07:31.083265+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	Owen Rodriguez	completed	18		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
695	2025-08-22 19:43:03.433259+00	fa8ee30e-a6e8-4d07-ae22-72794596c97c	extranjera	completed	45	china creo :3	staff_placed	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
696	2025-08-22 21:40:53.795694+00	dc38a06f-62f1-434a-9472-30078c3abca4	Mesa 2	completed	16		customer_qr	t	t	b333ede7-f67e-43d6-8652-9a918737d6e3	t	f	f	t
\.


--
-- Data for Name: printers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.printers (id, created_at, restaurant_id, name, type, vendor_id, product_id, is_active, description, location, last_status_check, status, error_message) FROM stdin;
f4910a2c-9348-4fcd-bdc7-295da0e4053a	2025-08-02 21:41:19.727874+00	b333ede7-f67e-43d6-8652-9a918737d6e3	Impresora Star Micronics BSC10	receipt	1305	11	t	Star Micronics BSC10 para cocina - USB 0519:000b - Perfil TM-T88V	Estación de cocina principal	\N	unknown	\N
41539f44-e88a-43c5-a679-495f9f216a46	2025-08-02 20:33:04.504394+00	a01006de-3963-406d-b060-5b7b34623a38	Impresora Bebidas	drink	\N	\N	f	Impresora para bebidas	\N	\N	unknown	\N
c90fbd59-ae85-4277-adb8-b92816ed0d43	2025-08-02 20:33:04.504394+00	a01006de-3963-406d-b060-5b7b34623a38	Impresora Hamburguesas	kitchen	\N	\N	f	Impresora para hamburguesas	\N	\N	unknown	\N
d32eab77-cdcb-46fe-9097-275c1b35e68f	2025-08-02 20:33:04.504394+00	a01006de-3963-406d-b060-5b7b34623a38	Impresora Pizzas	kitchen	\N	\N	f	Impresora para pizzas	\N	\N	unknown	\N
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, created_at, full_name, role, restaurant_id) FROM stdin;
67ff8340-41be-400d-a33b-cad1ced23bce	2025-08-02 20:52:13.908726+00	Admin Pruebas	admin	a01006de-3963-406d-b060-5b7b34623a38
507de59b-bccf-4f10-9bf1-a7825385b05b	2025-08-03 18:39:17.575701+00	\N	staff	\N
e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-02 20:46:41.76784+00	Administrador Senderos	admin	b333ede7-f67e-43d6-8652-9a918737d6e3
2e288537-a785-4d7e-8a05-7bd37456dd05	2025-08-02 20:47:13.914457+00	Admin Pruebas	admin	a01006de-3963-406d-b060-5b7b34623a38
bc42768e-f2d4-41c1-ba92-b393768e8234	2025-08-02 20:50:35.38508+00	Admin Pruebas	admin	a01006de-3963-406d-b060-5b7b34623a38
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.restaurants (id, name, created_at, logo_url, background_images, primary_color, secondary_color) FROM stdin;
a01006de-3963-406d-b060-5b7b34623a38	Restaurante de Pruebas	2025-08-02 20:32:50.820635+00	\N	\N	#1f2937	#fbbf24
b333ede7-f67e-43d6-8652-9a918737d6e3	Senderos	2025-07-31 21:57:49.243811+00	\N	\N	#1e3a8a	#fbbf24
\.


--
-- Data for Name: staging_menu_costs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staging_menu_costs (name, cost_text) FROM stdin;
Espresso DOBLE	8
Capuchino	9,88
Flat White	9,88
Latte	9,98
Mocaccino	10,8
Americano	8,4
Tinto Campesino	9,13
Espresso Honey	8,53
Catuai rojo	8,61
Honey	9,61
Té	0,66
Sultana	2,29
Mates etc	0,5
Te chai	1,2
te especial	1,22
Te chai con leche	1,2
te especial leche	1,12
Affogato	13,24
Ice latte	1,23
Americano Frio	9,03
Te de especialidad frio	1,75
Jugo agua frutilla	2,9
Jugo frutilla leche	3,79
jugos exoticos agua	3,9
Pulpas acai y copoazu	5,69
jugos exoticos leche	4,2
Pulpas acai y copoazu leche	5,69
queque de chocolate	3,2
Queque de limón	4
Queque de arándanos	4,5
Brazon gitano	4
Cheesecake de maracuya	10
Conos con cremas	3
Cuñapes	4
Media luna de jamón y queso	3
mouse de frutas	5
mousse de frutos rojos	5
Magdalenas caseras	3
2 empanadas de pollo	10
Desayuno 1	19,33
Desayuno 2	13,8
Desayuno 3	8,69
Sandwiches jamón y queso especial	4,99
Sandwiches jamón y queso especial doble	7,98
Sandwich de queso	6,56
Sandwich de requesón y miel	3,12
Sandwich de requesón	2,5
Sandwich de miel	1,12
miel en bote	34,87
cafe en bolsa	29
Torta	8,8
Sandwich senderos Ahumadito	10,3
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tables (id, restaurant_id, table_number, created_at) FROM stdin;
cf06cf5e-f263-4397-a9b9-e184c35e89c0	b333ede7-f67e-43d6-8652-9a918737d6e3	1	2025-07-31 21:58:50.309142+00
dc38a06f-62f1-434a-9472-30078c3abca4	b333ede7-f67e-43d6-8652-9a918737d6e3	2	2025-07-31 21:58:50.309142+00
3e3f46ee-8580-45ef-a6d8-152cf9b83eea	b333ede7-f67e-43d6-8652-9a918737d6e3	3	2025-07-31 21:58:50.309142+00
fa8ee30e-a6e8-4d07-ae22-72794596c97c	b333ede7-f67e-43d6-8652-9a918737d6e3	4	2025-07-31 21:58:50.309142+00
ad32b603-4de0-4723-8be4-c060a6153220	b333ede7-f67e-43d6-8652-9a918737d6e3	5	2025-07-31 21:58:50.309142+00
7b840aa6-b7a2-4334-bfa4-3f8541c61eaa	b333ede7-f67e-43d6-8652-9a918737d6e3	6	2025-07-31 21:58:50.309142+00
da18bdaa-c7fd-4b44-965a-0771b89fecf8	b333ede7-f67e-43d6-8652-9a918737d6e3	7	2025-07-31 21:58:50.309142+00
367c3357-c794-4766-9961-d908f3eb9450	b333ede7-f67e-43d6-8652-9a918737d6e3	8	2025-07-31 21:58:50.309142+00
e6084836-caa3-4e39-a4b0-a3fbf283d633	b333ede7-f67e-43d6-8652-9a918737d6e3	9	2025-07-31 21:58:50.309142+00
fb206025-7666-4408-aa69-7c87a225ef72	b333ede7-f67e-43d6-8652-9a918737d6e3	10	2025-07-31 21:58:50.309142+00
861b499b-8294-4a83-b7b1-dcd316334db5	a01006de-3963-406d-b060-5b7b34623a38	1	2025-08-02 20:33:04.504394+00
5fea702d-c5ed-494b-a29a-3cc9900ae931	a01006de-3963-406d-b060-5b7b34623a38	2	2025-08-02 20:33:04.504394+00
eb8a2ad3-43db-4521-946a-8cc09f1e869d	a01006de-3963-406d-b060-5b7b34623a38	3	2025-08-02 20:33:04.504394+00
6e75588b-aff5-445a-8f8c-3aeaf638b7be	a01006de-3963-406d-b060-5b7b34623a38	4	2025-08-02 20:33:04.504394+00
b5ff58e0-5a36-44d0-a3fc-ef5444dee087	a01006de-3963-406d-b060-5b7b34623a38	5	2025-08-02 20:33:04.504394+00
973ba6e5-2566-4e23-becb-0b755f715984	a01006de-3963-406d-b060-5b7b34623a38	6	2025-08-02 22:11:36.045481+00
c2836b31-f623-4b1f-b8c4-26914012d6d7	a01006de-3963-406d-b060-5b7b34623a38	7	2025-08-02 22:11:36.045481+00
2e21ce11-4c32-4e28-b62c-16e0d38d35ae	a01006de-3963-406d-b060-5b7b34623a38	8	2025-08-02 22:11:36.045481+00
e8652d94-03e5-4db0-af08-3b5bf7b043f0	b333ede7-f67e-43d6-8652-9a918737d6e3	11	2025-08-04 00:34:32.792323+00
d897d13b-9c66-4571-b650-16ee02879bc7	b333ede7-f67e-43d6-8652-9a918737d6e3	12	2025-08-04 00:34:32.792323+00
c4bdbeb7-c568-489f-8eab-ba3b1f08d0b5	b333ede7-f67e-43d6-8652-9a918737d6e3	13	2025-08-04 00:34:32.792323+00
c1aa6297-3405-4263-83ec-9c2e02b7228c	b333ede7-f67e-43d6-8652-9a918737d6e3	barra 1	2025-08-04 03:13:49.441799+00
8ce7f1e2-7ea6-4211-b156-1f3224865129	a01006de-3963-406d-b060-5b7b34623a38	Mesa 5	2025-08-06 07:52:56.340771+00
\.


--
-- Data for Name: messages_2025_08_21; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_21 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_22; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_22 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_23; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_23 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_24; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_24 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_25; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_25 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_26; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_26 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_27; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_27 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-06-24 22:12:52
20211116045059	2025-06-24 22:12:52
20211116050929	2025-06-24 22:12:52
20211116051442	2025-06-24 22:12:52
20211116212300	2025-06-24 22:12:53
20211116213355	2025-06-24 22:12:53
20211116213934	2025-06-24 22:12:53
20211116214523	2025-06-24 22:12:53
20211122062447	2025-06-24 22:12:53
20211124070109	2025-06-24 22:12:53
20211202204204	2025-06-24 22:12:53
20211202204605	2025-06-24 22:12:54
20211210212804	2025-06-24 22:12:54
20211228014915	2025-06-24 22:12:55
20220107221237	2025-06-24 22:12:55
20220228202821	2025-06-24 22:12:55
20220312004840	2025-06-24 22:12:55
20220603231003	2025-06-24 22:12:55
20220603232444	2025-06-24 22:12:56
20220615214548	2025-06-24 22:12:56
20220712093339	2025-06-24 22:12:56
20220908172859	2025-06-24 22:12:56
20220916233421	2025-06-24 22:12:57
20230119133233	2025-06-24 22:12:57
20230128025114	2025-06-24 22:12:57
20230128025212	2025-06-24 22:12:57
20230227211149	2025-06-24 22:12:57
20230228184745	2025-06-24 22:12:58
20230308225145	2025-06-24 22:12:58
20230328144023	2025-06-24 22:12:58
20231018144023	2025-06-24 22:12:58
20231204144023	2025-06-24 22:12:59
20231204144024	2025-06-24 22:12:59
20231204144025	2025-06-24 22:12:59
20240108234812	2025-06-24 22:12:59
20240109165339	2025-06-24 22:12:59
20240227174441	2025-06-24 22:13:00
20240311171622	2025-06-24 22:13:00
20240321100241	2025-06-24 22:13:01
20240401105812	2025-06-24 22:13:01
20240418121054	2025-06-24 22:13:01
20240523004032	2025-06-24 22:13:02
20240618124746	2025-06-24 22:13:02
20240801235015	2025-06-24 22:13:03
20240805133720	2025-06-24 22:13:03
20240827160934	2025-06-24 22:13:03
20240919163303	2025-06-24 22:13:03
20240919163305	2025-06-24 22:13:03
20241019105805	2025-06-24 22:13:04
20241030150047	2025-06-24 22:13:04
20241108114728	2025-06-24 22:13:05
20241121104152	2025-06-24 22:13:05
20241130184212	2025-06-24 22:13:05
20241220035512	2025-06-24 22:13:05
20241220123912	2025-06-24 22:13:05
20241224161212	2025-06-24 22:13:06
20250107150512	2025-06-24 22:13:06
20250110162412	2025-06-24 22:13:06
20250123174212	2025-06-24 22:13:06
20250128220012	2025-06-24 22:13:06
20250506224012	2025-06-24 22:13:07
20250523164012	2025-06-24 22:13:07
20250714121412	2025-07-18 19:06:49
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
12692	de443066-80a1-11f0-b170-0a58a9feac02	public.orders	{}	{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1755699840}], "aud": "authenticated", "exp": 1756012914, "iat": 1756009314, "iss": "https://osvgapxefsqqhltkabku.supabase.co/auth/v1", "sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "authenticated", "email": "pruebas@gmail.com", "phone": "", "session_id": "131c1246-1e48-4770-8c34-6c1d3e3026f6", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "admin", "email": "pruebas@gmail.com", "full_name": "Admin Pruebas", "email_verified": false, "phone_verified": false}}	2025-08-24 04:22:01.59148
12693	de443872-80a1-11f0-a039-0a58a9feac02	public.orders	{}	{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1755699840}], "aud": "authenticated", "exp": 1756012914, "iat": 1756009314, "iss": "https://osvgapxefsqqhltkabku.supabase.co/auth/v1", "sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "authenticated", "email": "pruebas@gmail.com", "phone": "", "session_id": "131c1246-1e48-4770-8c34-6c1d3e3026f6", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"sub": "67ff8340-41be-400d-a33b-cad1ced23bce", "role": "admin", "email": "pruebas@gmail.com", "full_name": "Admin Pruebas", "email_verified": false, "phone_verified": false}}	2025-08-24 04:22:01.59148
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
menu-images	menu-images	\N	2025-06-26 19:30:16.674695+00	2025-06-26 19:30:16.674695+00	t	f	\N	\N	\N
restaurant-assets	restaurant-assets	\N	2025-08-05 03:22:26.461212+00	2025-08-05 03:22:26.461212+00	t	f	5242880	{image/jpeg,image/jpg,image/png,image/webp}	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-06-24 22:12:54.636102
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-06-24 22:12:54.639583
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-06-24 22:12:54.642275
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-06-24 22:12:54.653433
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-06-24 22:12:54.672546
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-06-24 22:12:54.675428
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-06-24 22:12:54.678459
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-06-24 22:12:54.681571
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-06-24 22:12:54.684467
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-06-24 22:12:54.687215
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-06-24 22:12:54.690502
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-06-24 22:12:54.694187
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-06-24 22:12:54.697399
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-06-24 22:12:54.700012
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-06-24 22:12:54.70278
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-06-24 22:12:54.726318
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-06-24 22:12:54.729017
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-06-24 22:12:54.731699
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-06-24 22:12:54.734729
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-06-24 22:12:54.738332
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-06-24 22:12:54.741167
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-06-24 22:12:54.749295
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-06-24 22:12:54.777204
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-06-24 22:12:54.802025
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-06-24 22:12:54.805335
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-06-24 22:12:54.808239
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
38a6e11a-5385-4f9c-8109-20dbf14fe612	menu-images	1750969474274-Screenshot 2024-02-14 193749.png	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-06-26 20:24:36.015364+00	2025-06-26 20:24:36.015364+00	2025-06-26 20:24:36.015364+00	{"eTag": "\\"f1a1c637b731c004e902ae6629609941\\"", "size": 145785, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-26T20:24:36.000Z", "contentLength": 145785, "httpStatusCode": 200}	20104ad7-090c-4711-bd2b-bbc2867a607c	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
85bba2e7-f190-48a2-94e3-3679c5ab8d8e	menu-images	senderos_175_18.png	\N	2025-08-03 21:13:24.113745+00	2025-08-03 21:13:24.113745+00	2025-08-03 21:13:24.113745+00	{"eTag": "\\"d59610f4da77370855b906d3ee26b395\\"", "size": 480548, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:25.000Z", "contentLength": 480548, "httpStatusCode": 200}	73a91fe7-614b-4042-af82-c69c597d323f	\N	{}
9eff0118-0b72-4428-a1d6-e989f6851aea	menu-images	1752007265223-Screenshot 2024-02-14 193749.png	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-08 20:41:06.146837+00	2025-07-08 20:41:06.146837+00	2025-07-08 20:41:06.146837+00	{"eTag": "\\"f1a1c637b731c004e902ae6629609941\\"", "size": 145785, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-08T20:41:07.000Z", "contentLength": 145785, "httpStatusCode": 200}	5fdc6ca0-23f5-4f3f-a5bc-d2b08ea3bc45	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
a7c98cc9-a898-4164-a1fd-9ba744691ff8	menu-images	1752218596505-Api con pastel.jpeg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-11 07:23:17.389595+00	2025-07-11 07:23:17.389595+00	2025-07-11 07:23:17.389595+00	{"eTag": "\\"60be6ce107529d2726a455ce4ff67b33\\"", "size": 5921, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T07:23:18.000Z", "contentLength": 5921, "httpStatusCode": 200}	ad55184f-fd07-4a28-8cfc-50bb3f15d89a	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
788988f1-f236-4544-8f1a-2c427cc7b5d1	menu-images	1752218630726-pique-a-lo-macho-12.webp	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-11 07:23:52.053021+00	2025-07-11 07:23:52.053021+00	2025-07-11 07:23:52.053021+00	{"eTag": "\\"b7a44a65420f3efeb010b040e43ece42\\"", "size": 48136, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T07:23:52.000Z", "contentLength": 48136, "httpStatusCode": 200}	d7610dc7-46c7-4e7c-8e33-c048de7cfcb8	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
bf8bf104-b472-4c62-afb4-7cbec004c330	menu-images	1753141109666-picante de la casa.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:38:30.784274+00	2025-07-21 23:38:30.784274+00	2025-07-21 23:38:30.784274+00	{"eTag": "\\"b7f4cd73d3754a4459228cf08b7f2dce\\"", "size": 73104, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:38:31.000Z", "contentLength": 73104, "httpStatusCode": 200}	1cad7452-a821-44f2-b70f-b25efbab9ffd	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
6a195555-ed12-45b2-8640-020bae478b4e	menu-images	1753141987864-WhatsApp Image 2025-07-18 at 13.35.28_320412c4.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:53:10.473092+00	2025-07-21 23:53:10.473092+00	2025-07-21 23:53:10.473092+00	{"eTag": "\\"f3bbf49cc0ac03113a667a4e864749bf\\"", "size": 144442, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:53:11.000Z", "contentLength": 144442, "httpStatusCode": 200}	2ade509a-278d-499c-ad3b-65a87658d30f	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
6d0aaca6-1940-425b-b7a4-42f89c6d1ac1	menu-images	1753142016980-picante mixto.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:53:38.076773+00	2025-07-21 23:53:38.076773+00	2025-07-21 23:53:38.076773+00	{"eTag": "\\"ae425220b8f8bd9e53e22c1412a45ecc\\"", "size": 189183, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:53:38.000Z", "contentLength": 189183, "httpStatusCode": 200}	149eeaae-da5e-4de1-bba2-1982a9508f9c	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
17b7b721-f1a2-4084-8a5f-9bf9db81e864	menu-images	1753142058578-picante de lengua.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:54:20.88982+00	2025-07-21 23:54:20.88982+00	2025-07-21 23:54:20.88982+00	{"eTag": "\\"cf9892528bac2abfc524e605c331e4b6\\"", "size": 353945, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:54:21.000Z", "contentLength": 353945, "httpStatusCode": 200}	2c0bae68-1c66-4ebd-ad29-a29695973162	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
d77a9b54-c279-4a8d-b21b-23b0cbd2bdda	menu-images	1753142133185-Fricase.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:55:34.718129+00	2025-07-21 23:55:34.718129+00	2025-07-21 23:55:34.718129+00	{"eTag": "\\"ac8551197ef3875c55d44e521cc1eced\\"", "size": 139423, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:55:35.000Z", "contentLength": 139423, "httpStatusCode": 200}	d65e0bd3-00b5-4169-8c28-a415857e466c	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
80040313-3ebd-4ab4-a8a4-fdb25247c2ee	menu-images	1753142219787-falso mixto.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:57:01.075493+00	2025-07-21 23:57:01.075493+00	2025-07-21 23:57:01.075493+00	{"eTag": "\\"b5642c7bc0767e2aa0fc71f5fc659937\\"", "size": 199110, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:57:01.000Z", "contentLength": 199110, "httpStatusCode": 200}	aa4c6daa-d78a-4f14-9345-f0650299d97e	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
c6629da5-fbf8-40c2-83df-87c7a3e95072	menu-images	1753142250805-trucha.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:57:31.700706+00	2025-07-21 23:57:31.700706+00	2025-07-21 23:57:31.700706+00	{"eTag": "\\"a1f4c52a5789466af41da2cf52e44104\\"", "size": 121427, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:57:32.000Z", "contentLength": 121427, "httpStatusCode": 200}	9b7f5416-bb3d-4b9f-95a1-0d956e46ef2d	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
834dad19-fc64-44b8-adad-2947f7cf905a	menu-images	1753142477332-charque.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 00:01:18.533879+00	2025-07-22 00:01:18.533879+00	2025-07-22 00:01:18.533879+00	{"eTag": "\\"bb50bafa16837de509855c39a258891c\\"", "size": 359572, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T00:01:19.000Z", "contentLength": 359572, "httpStatusCode": 200}	e3509b2d-8e90-4416-bf00-d5190b0ee197	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
379066c7-1374-4208-8d6a-84f7a97d3efa	menu-images	1754270346354-30.png	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-04 01:19:09.374402+00	2025-08-04 01:19:09.374402+00	2025-08-04 01:19:09.374402+00	{"eTag": "\\"212041a342f254b5905560fb705c4912\\"", "size": 951715, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T01:19:10.000Z", "contentLength": 951715, "httpStatusCode": 200}	4b820d71-c68f-4170-9f8c-fad220b5d0bf	e05094eb-0452-43bd-aa3e-214a6c3b6966	{}
853ac686-6337-4336-94e6-b14420ded17d	menu-images	1753142492599-picante mixto.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 00:01:33.487338+00	2025-07-22 00:01:33.487338+00	2025-07-22 00:01:33.487338+00	{"eTag": "\\"ae425220b8f8bd9e53e22c1412a45ecc\\"", "size": 189183, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T00:01:34.000Z", "contentLength": 189183, "httpStatusCode": 200}	32985043-0254-44aa-9027-6e39c751658d	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
dc3862bb-58d2-4794-9718-1d92eb5e6d85	menu-images	1753142541757-sandwich de chorizo.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 00:02:22.900001+00	2025-07-22 00:02:22.900001+00	2025-07-22 00:02:22.900001+00	{"eTag": "\\"a4d3e0f51fdd0ad31bbb78eab8090d63\\"", "size": 161641, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T00:02:23.000Z", "contentLength": 161641, "httpStatusCode": 200}	2a0a345e-7373-4274-945b-10d77dc6d58f	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
43f1a49f-241b-4886-97e8-4ed14c396197	menu-images	1754270402067-9.png	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-04 01:20:03.684568+00	2025-08-04 01:20:03.684568+00	2025-08-04 01:20:03.684568+00	{"eTag": "\\"33a3a980a25f28456677e0a5c95ba4fa\\"", "size": 624394, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T01:20:04.000Z", "contentLength": 624394, "httpStatusCode": 200}	2564b88e-f595-4242-93b9-5ec7a58bf16f	e05094eb-0452-43bd-aa3e-214a6c3b6966	{}
d84adb9e-84a3-443d-a4c1-4e752772e564	menu-images	1753142570964-charque.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 00:02:52.174621+00	2025-07-22 00:02:52.174621+00	2025-07-22 00:02:52.174621+00	{"eTag": "\\"bb50bafa16837de509855c39a258891c\\"", "size": 359572, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T00:02:53.000Z", "contentLength": 359572, "httpStatusCode": 200}	674c2c7b-566d-42e7-8f1a-077913ec7a71	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
b2947508-618a-4587-993f-b9a0c2328c82	menu-images	1754270774969-15.png	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-04 01:26:18.180113+00	2025-08-04 01:26:18.180113+00	2025-08-04 01:26:18.180113+00	{"eTag": "\\"47ffe4566ec492209552c3a823bafea6\\"", "size": 209649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T01:26:19.000Z", "contentLength": 209649, "httpStatusCode": 200}	4914dd00-7e6b-4c72-a25a-d73a9e2ea5a6	e05094eb-0452-43bd-aa3e-214a6c3b6966	{}
e4cb1b7d-507a-4e71-ad15-082245b4fc56	menu-images	senderos_163_3.png	\N	2025-08-03 20:52:41.559806+00	2025-08-03 21:13:12.496403+00	2025-08-03 20:52:41.559806+00	{"eTag": "\\"0d72c14ff24082c15220f43d59f8654c\\"", "size": 312300, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:13.000Z", "contentLength": 312300, "httpStatusCode": 200}	44814032-8e79-4fd3-9348-e6e456d1879e	\N	{}
859278f0-6cae-4757-a2c1-b4841b5e69bf	menu-images	1753142275221-chorizo cochabambino.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:57:55.928002+00	2025-07-21 23:57:55.928002+00	2025-07-21 23:57:55.928002+00	{"eTag": "\\"c809b6284af69435f92861d2e12164af\\"", "size": 176622, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:57:56.000Z", "contentLength": 176622, "httpStatusCode": 200}	892018d8-f549-4a43-833b-38092fcef2c9	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
018f272e-2038-4414-b664-c27b2bca9a88	menu-images	senderos_158_1.png	\N	2025-08-03 20:52:39.052278+00	2025-08-03 21:13:10.13442+00	2025-08-03 20:52:39.052278+00	{"eTag": "\\"b44b914f3ebabe77b9cc629cb2ad3290\\"", "size": 289471, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:11.000Z", "contentLength": 289471, "httpStatusCode": 200}	25feb555-d515-4f2b-9a1e-da57d4f2642a	\N	{}
c4f60888-ecf4-4040-99dd-27b4ffd412f9	menu-images	1753142306875-chicharron de pescados y mariscos.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:58:27.972201+00	2025-07-21 23:58:27.972201+00	2025-07-21 23:58:27.972201+00	{"eTag": "\\"2588e6ee26df3bdeb2d99ede29d18146\\"", "size": 386618, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:58:28.000Z", "contentLength": 386618, "httpStatusCode": 200}	147df3e1-cfd2-4d95-b656-3ca39f53e395	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
b8247734-ef3d-4a9c-9da9-935e1bfe3c20	menu-images	1753142326868-lechon.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:58:47.911928+00	2025-07-21 23:58:47.911928+00	2025-07-21 23:58:47.911928+00	{"eTag": "\\"040403873cdeace0966a9cb01736a7ea\\"", "size": 199278, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:58:48.000Z", "contentLength": 199278, "httpStatusCode": 200}	c0ff6c0e-e5d7-4c83-9f61-319b884f5c3e	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
d8ca97b4-43a3-4115-a8e8-c722af4822db	menu-images	senderos_159_2.png	\N	2025-08-03 20:52:40.624767+00	2025-08-03 21:13:11.321193+00	2025-08-03 20:52:40.624767+00	{"eTag": "\\"c586405ee313a267034ef6f855238a3f\\"", "size": 321110, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:12.000Z", "contentLength": 321110, "httpStatusCode": 200}	08fb5900-3ef1-4b10-9bd0-c67c72bdca0e	\N	{}
9e9d7a72-da7f-45e4-8a45-aa9dc6568017	menu-images	1753142359268-pique macho.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-21 23:59:20.646098+00	2025-07-21 23:59:20.646098+00	2025-07-21 23:59:20.646098+00	{"eTag": "\\"51b581312b1f17ae24f4bf5e9d0c7c39\\"", "size": 349429, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-21T23:59:21.000Z", "contentLength": 349429, "httpStatusCode": 200}	30a3782e-9cc1-4ae8-948f-01cabc77f8aa	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
12ed8283-82c0-45c8-a74d-473158aa0f0b	menu-images	senderos_162_4.png	\N	2025-08-03 20:52:42.474124+00	2025-08-03 21:13:13.78381+00	2025-08-03 20:52:42.474124+00	{"eTag": "\\"12dfa82d0df6c048ebe79ffed0d94538\\"", "size": 344110, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:14.000Z", "contentLength": 344110, "httpStatusCode": 200}	8752af2a-4407-4c0d-9227-2508d930ea37	\N	{}
fefa0bfb-22d2-4906-a7f6-da1b40eba103	menu-images	1753142421696-chicharon micto de pescado.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 00:00:23.033125+00	2025-07-22 00:00:23.033125+00	2025-07-22 00:00:23.033125+00	{"eTag": "\\"7dae29dbb7244c40b471c314c4ebb6e6\\"", "size": 281058, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T00:00:23.000Z", "contentLength": 281058, "httpStatusCode": 200}	3c5cc486-952b-48d6-8287-d36f2e6ed08c	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
028f1b11-9111-48b5-8e8f-2b8c83fa8829	menu-images	1753209585720-sandwich de chorizo.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 18:39:48.276437+00	2025-07-22 18:39:48.276437+00	2025-07-22 18:39:48.276437+00	{"eTag": "\\"a4d3e0f51fdd0ad31bbb78eab8090d63\\"", "size": 161641, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T18:39:49.000Z", "contentLength": 161641, "httpStatusCode": 200}	57724d76-807a-4063-b10d-22acb75bc722	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
612d5c89-8895-4edb-86bc-1d8585f4b8e4	menu-images	1754270793304-14.png	e05094eb-0452-43bd-aa3e-214a6c3b6966	2025-08-04 01:26:34.424037+00	2025-08-04 01:26:34.424037+00	2025-08-04 01:26:34.424037+00	{"eTag": "\\"c593636fe4ccf09b915f4a0633abee07\\"", "size": 392428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T01:26:35.000Z", "contentLength": 392428, "httpStatusCode": 200}	16e404ea-6f17-4055-ba50-02693d363770	e05094eb-0452-43bd-aa3e-214a6c3b6966	{}
0dc4b232-d0a1-4e8d-b77b-db0d034f1bdf	menu-images	1753209610314-sandwich lengua.jpg	42642c6c-e4ee-438e-98df-2c8e79581fd6	2025-07-22 18:40:11.461004+00	2025-07-22 18:40:11.461004+00	2025-07-22 18:40:11.461004+00	{"eTag": "\\"73531c66ccc1a9c69148b069104698bf\\"", "size": 62243, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T18:40:12.000Z", "contentLength": 62243, "httpStatusCode": 200}	cd3b0660-d58f-4c37-bf15-752e4a690c23	42642c6c-e4ee-438e-98df-2c8e79581fd6	{}
ed3ada05-88e4-4b1a-9c35-23c28ac4eade	menu-images	senderos_161_5.png	\N	2025-08-03 20:52:43.952263+00	2025-08-03 21:13:14.687223+00	2025-08-03 20:52:43.952263+00	{"eTag": "\\"c6dbed48191903e84a17583cf972571a\\"", "size": 621254, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:15.000Z", "contentLength": 621254, "httpStatusCode": 200}	f127a757-8a40-4d25-b18d-bdcf8a66c7b4	\N	{}
21d3ffbd-dca0-42e2-af01-a6907e0bdab4	menu-images	senderos_160_6.png	\N	2025-08-03 20:52:44.70715+00	2025-08-03 21:13:15.394576+00	2025-08-03 20:52:44.70715+00	{"eTag": "\\"d7218ac0028eb9575f46502c7ec36e1b\\"", "size": 336289, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:16.000Z", "contentLength": 336289, "httpStatusCode": 200}	d514152b-49c8-4921-8e13-1ca6e78decd0	\N	{}
0fdfa409-c38c-4fe4-9bac-baee7d036573	menu-images	senderos_164_7.png	\N	2025-08-03 20:52:45.852681+00	2025-08-03 21:13:16.061499+00	2025-08-03 20:52:45.852681+00	{"eTag": "\\"b7a4e262b5c9e9cb35f96fb364ed6600\\"", "size": 263250, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:16.000Z", "contentLength": 263250, "httpStatusCode": 200}	bccf0e18-05f9-4e5f-b831-d5b55e1f6e56	\N	{}
f61b5eb7-8523-4eaf-924a-9eaf3c393c10	menu-images	senderos_165_8.png	\N	2025-08-03 20:52:46.498095+00	2025-08-03 21:13:16.77908+00	2025-08-03 20:52:46.498095+00	{"eTag": "\\"00c5348720699f2ed1d1f37d953a9a97\\"", "size": 297086, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:17.000Z", "contentLength": 297086, "httpStatusCode": 200}	568faf6f-00ec-4ed5-84d2-bac4ddb5a611	\N	{}
a3d30afc-a08f-460e-898a-12b1c872edae	menu-images	senderos_166_9.png	\N	2025-08-03 20:55:13.262116+00	2025-08-03 21:13:17.630719+00	2025-08-03 20:55:13.262116+00	{"eTag": "\\"33a3a980a25f28456677e0a5c95ba4fa\\"", "size": 624394, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:18.000Z", "contentLength": 624394, "httpStatusCode": 200}	e9e14103-a5e1-45e1-9ca1-c1c0417ba749	\N	{}
11e379c8-1778-4b3c-a4ce-c3a20f63f135	menu-images	senderos_167_10.png	\N	2025-08-03 21:01:18.474647+00	2025-08-03 21:13:18.370664+00	2025-08-03 21:01:18.474647+00	{"eTag": "\\"596baec0d09a3a4af15840ed12c9731c\\"", "size": 518174, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:19.000Z", "contentLength": 518174, "httpStatusCode": 200}	a21ba06a-943a-4938-993b-5515d20c6d39	\N	{}
4ec31a4b-2c56-4524-b2d2-675a212eddfd	menu-images	senderos_168_11.png	\N	2025-08-03 21:01:19.351958+00	2025-08-03 21:13:19.207532+00	2025-08-03 21:01:19.351958+00	{"eTag": "\\"e96ba8715a12380b87400e6a4a2f611f\\"", "size": 553804, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:20.000Z", "contentLength": 553804, "httpStatusCode": 200}	f96b4732-a343-4a29-93a1-8d8704ba3241	\N	{}
69811e43-44a2-4c9e-84f5-5396fc4321eb	menu-images	senderos_169_12.png	\N	2025-08-03 21:01:20.239902+00	2025-08-03 21:13:19.921663+00	2025-08-03 21:01:20.239902+00	{"eTag": "\\"3150872ffb6eb511f6fe56cdac7e5658\\"", "size": 356042, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:20.000Z", "contentLength": 356042, "httpStatusCode": 200}	b5087a9e-8388-4381-a574-ca3ea4cd0443	\N	{}
89d25844-97e2-4e34-8d33-ed0fe65f4ef6	menu-images	senderos_170_13.png	\N	2025-08-03 21:01:20.906487+00	2025-08-03 21:13:20.665836+00	2025-08-03 21:01:20.906487+00	{"eTag": "\\"9481fb005566e6377b25aec783215712\\"", "size": 377975, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:21.000Z", "contentLength": 377975, "httpStatusCode": 200}	9a0c559b-b065-4802-8d91-530321bce5ae	\N	{}
c8d58a3f-f7af-446d-9e75-b0a1f4505177	menu-images	senderos_172_14.png	\N	2025-08-03 21:01:21.582151+00	2025-08-03 21:13:21.308371+00	2025-08-03 21:01:21.582151+00	{"eTag": "\\"c593636fe4ccf09b915f4a0633abee07\\"", "size": 392428, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:22.000Z", "contentLength": 392428, "httpStatusCode": 200}	5e7c5a2f-bd76-4e15-b347-cfe3fab5d117	\N	{}
1d460b07-cd1f-43a6-a397-573a7d2cc628	menu-images	senderos_179_25.png	\N	2025-08-03 20:52:47.266634+00	2025-08-03 21:13:28.434873+00	2025-08-03 20:52:47.266634+00	{"eTag": "\\"1f3ee132f3e86a79327831f5900f6c70\\"", "size": 495878, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:29.000Z", "contentLength": 495878, "httpStatusCode": 200}	3765d5e9-5360-4a4a-8184-29b29d826a44	\N	{}
66aee035-b43e-4a52-bda6-fd4e659ea076	menu-images	senderos_181_26.png	\N	2025-08-03 20:52:47.983959+00	2025-08-03 21:13:29.181143+00	2025-08-03 20:52:47.983959+00	{"eTag": "\\"4450c81f1c7f402313a9bdb07d2673fa\\"", "size": 512491, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:30.000Z", "contentLength": 512491, "httpStatusCode": 200}	134e2cc8-25a7-4881-b61c-838993a79865	\N	{}
981c5176-33d2-4df5-ac98-b8b3687d9953	menu-images	senderos_182_30.png	\N	2025-08-03 20:52:48.905508+00	2025-08-03 21:13:31.872599+00	2025-08-03 20:52:48.905508+00	{"eTag": "\\"212041a342f254b5905560fb705c4912\\"", "size": 951715, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:32.000Z", "contentLength": 951715, "httpStatusCode": 200}	689ab7a9-61ab-4bae-9240-91ad80a9725f	\N	{}
dfd5754e-64fe-4d3d-be2b-8f6db69ab4bc	menu-images	senderos_189_31.png	\N	2025-08-03 20:52:49.692842+00	2025-08-03 21:13:32.614624+00	2025-08-03 20:52:49.692842+00	{"eTag": "\\"3d587a56c1db6fed295ca40032adb5e6\\"", "size": 508259, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:33.000Z", "contentLength": 508259, "httpStatusCode": 200}	52fc90fa-74e6-4bfe-8347-8019eb6ef61a	\N	{}
f0b51a0c-2bc0-4686-ba88-65d83cdce67e	menu-images	senderos_190_32.png	\N	2025-08-03 20:52:50.642063+00	2025-08-03 21:13:33.36674+00	2025-08-03 20:52:50.642063+00	{"eTag": "\\"417bde180d9e0ddcfd5addde6dac238c\\"", "size": 542255, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:34.000Z", "contentLength": 542255, "httpStatusCode": 200}	ba384c83-b1f3-40f8-a2d8-a2af3daa4df2	\N	{}
0f7a8601-7e67-483d-bb2b-a784367897cd	restaurant-assets	restaurants/1/background.jpeg	\N	2025-08-05 03:22:27.234247+00	2025-08-05 03:22:27.234247+00	2025-08-05 03:22:27.234247+00	{"eTag": "\\"4b596848b8f7a44907b526b6f38b5c82\\"", "size": 108757, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-08-05T03:22:28.000Z", "contentLength": 108757, "httpStatusCode": 200}	0ebcfad9-85d7-4e8e-8d50-16ba1431ab55	\N	{}
04e7e932-0633-44b0-bc47-bbb61fa55510	menu-images	senderos_173_18.png	\N	2025-08-03 20:55:58.415112+00	2025-08-03 21:10:18.873034+00	2025-08-03 20:55:58.415112+00	{"eTag": "\\"d59610f4da77370855b906d3ee26b395\\"", "size": 480548, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:10:19.000Z", "contentLength": 480548, "httpStatusCode": 200}	601e972d-d0f4-4e86-a65d-511fa073f33f	\N	{}
08c5e354-b33b-47fe-9d81-bcf7885fa468	menu-images	senderos_176_19.png	\N	2025-08-03 21:10:19.626153+00	2025-08-03 21:13:24.771815+00	2025-08-03 21:10:19.626153+00	{"eTag": "\\"36007a5736d0a21d281373e75f9b659a\\"", "size": 454921, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:25.000Z", "contentLength": 454921, "httpStatusCode": 200}	974ccbf9-001e-4d06-8711-88f3b3e74ddc	\N	{}
f5e36a73-f802-4e5a-a63d-545433cb791e	menu-images	senderos_178_15.png	\N	2025-08-03 21:01:22.50577+00	2025-08-03 21:13:21.940529+00	2025-08-03 21:01:22.50577+00	{"eTag": "\\"47ffe4566ec492209552c3a823bafea6\\"", "size": 209649, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:22.000Z", "contentLength": 209649, "httpStatusCode": 200}	8f993250-573c-442b-84a3-db14a6d78116	\N	{}
526c40f6-d2cf-4743-aa0f-a903a23ec674	menu-images	senderos_173_16.png	\N	2025-08-03 21:10:17.407236+00	2025-08-03 21:13:22.643623+00	2025-08-03 21:10:17.407236+00	{"eTag": "\\"c7ff55e56e43c85fd56c51f45a1f5602\\"", "size": 290284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:23.000Z", "contentLength": 290284, "httpStatusCode": 200}	d5d2bab0-c65d-4b2e-bc1b-4522820bfec1	\N	{}
2bbf7760-1cec-4b97-81aa-e2281ed7c72e	menu-images	senderos_177_20.png	\N	2025-08-03 21:10:20.358101+00	2025-08-03 21:13:25.509666+00	2025-08-03 21:10:20.358101+00	{"eTag": "\\"fcc7d4d668baed6b2620568ec25cab9d\\"", "size": 464377, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:26.000Z", "contentLength": 464377, "httpStatusCode": 200}	3e5b3606-93dc-4b76-8bfb-dc5be959993e	\N	{}
9a78b49d-3b17-4eba-937b-d3c914ec293e	menu-images	senderos_179_23.png	\N	2025-08-03 21:10:22.747833+00	2025-08-03 21:13:27.788178+00	2025-08-03 21:10:22.747833+00	{"eTag": "\\"1fa31c4777f19ec02d35bf0edd911440\\"", "size": 628745, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:28.000Z", "contentLength": 628745, "httpStatusCode": 200}	88a9af3f-1ae3-49de-80c6-8cacf3889e0a	\N	{}
f7f85b51-958a-4968-bde7-ba97ac32ce7c	menu-images	senderos_174_17.png	\N	2025-08-03 21:10:18.092611+00	2025-08-03 21:13:23.337151+00	2025-08-03 21:10:18.092611+00	{"eTag": "\\"3398f127ce75dc89dcd57e5dbac89c2d\\"", "size": 477705, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:24.000Z", "contentLength": 477705, "httpStatusCode": 200}	a7388e32-d6cc-4a1b-9ee1-5fbf4d421f2e	\N	{}
1c1a568f-56a0-41d1-b6de-85078b045acc	menu-images	senderos_178_21.png	\N	2025-08-03 21:10:21.091816+00	2025-08-03 21:13:26.245075+00	2025-08-03 21:10:21.091816+00	{"eTag": "\\"aefdd6305aaaa5b3c60dc88822effd47\\"", "size": 448556, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:27.000Z", "contentLength": 448556, "httpStatusCode": 200}	63c9572a-b3b5-4e16-9187-81f5c2eb851b	\N	{}
f2483dde-1d7e-48b3-bc90-7fcc2cfb6a57	menu-images	senderos_180_22.png	\N	2025-08-03 21:01:24.262541+00	2025-08-03 21:13:27.031023+00	2025-08-03 21:01:24.262541+00	{"eTag": "\\"60c5a128b84017654369cafb0b836d34\\"", "size": 665441, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:27.000Z", "contentLength": 665441, "httpStatusCode": 200}	726360b0-499e-4160-acd2-00e1d81d18b0	\N	{}
438863ca-6213-4c5c-9ff4-defe3a61f96b	menu-images	senderos_186_27.png	\N	2025-08-03 21:01:26.546716+00	2025-08-03 21:13:29.97164+00	2025-08-03 21:01:26.546716+00	{"eTag": "\\"0941319aee725330d28cece148bdd852\\"", "size": 460037, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:30.000Z", "contentLength": 460037, "httpStatusCode": 200}	69dbbdd6-1e2e-4d2c-a08c-b797dbda10f6	\N	{}
b7de9936-24b4-4172-84ac-4a4705634488	menu-images	senderos_184_29.png	\N	2025-08-03 21:01:27.360757+00	2025-08-03 21:13:30.914872+00	2025-08-03 21:01:27.360757+00	{"eTag": "\\"54be9b883f8f6e0c6def56f6124cd3a6\\"", "size": 735332, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-03T21:13:31.000Z", "contentLength": 735332, "httpStatusCode": 200}	7fe9670e-d06f-420a-9776-53f93bafa70e	\N	{}
2a46b10f-611e-4835-a0c1-e1171136a56e	restaurant-assets	restaurants/1/logo.jpg	\N	2025-08-05 03:22:27.716636+00	2025-08-05 03:22:27.716636+00	2025-08-05 03:22:27.716636+00	{"eTag": "\\"729ead4b7359b5975bf720ab399cae00\\"", "size": 71898, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-08-05T03:22:28.000Z", "contentLength": 71898, "httpStatusCode": 200}	656df5bc-70d4-4087-bd8f-4b262544e6ad	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key) FROM stdin;
20250131	{"-- Configurar políticas de Storage para acceso público a assets del restaurante\r\n-- Esto permite que las imágenes de fondo y logo sean accesibles sin autenticación\r\n\r\n-- Habilitar RLS en el bucket restaurant-assets si no está habilitado\r\n-- (Esto se hace automáticamente al crear el bucket, pero lo incluimos por seguridad)\r\n\r\n-- Crear política para permitir acceso público de lectura a todos los archivos del bucket\r\nCREATE POLICY \\"Public read access for restaurant assets\\" ON storage.objects\r\nFOR SELECT\r\nUSING (bucket_id = 'restaurant-assets')","-- Crear política para permitir inserción de archivos (solo para usuarios autenticados)\r\nCREATE POLICY \\"Authenticated users can upload restaurant assets\\" ON storage.objects\r\nFOR INSERT\r\nWITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated')","-- Crear política para permitir actualización de archivos (solo para usuarios autenticados)\r\nCREATE POLICY \\"Authenticated users can update restaurant assets\\" ON storage.objects\r\nFOR UPDATE\r\nUSING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated')","-- Crear política para permitir eliminación de archivos (solo para usuarios autenticados)\r\nCREATE POLICY \\"Authenticated users can delete restaurant assets\\" ON storage.objects\r\nFOR DELETE\r\nUSING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated')","-- Comentario: Estas políticas permiten acceso público de lectura a las imágenes\r\n-- mientras mantienen la seguridad para operaciones de escritura"}	create_storage_policies	\N	\N
20250806034046	{"-- Función para fusionar órdenes\nCREATE OR REPLACE FUNCTION merge_orders(\n  source_order_ids INTEGER[],\n  target_order_id INTEGER,\n  new_total DECIMAL(10,2)\n)\nRETURNS VOID\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nDECLARE\n  source_order_id INTEGER;\n  merged_notes TEXT;\nBEGIN\n  -- Iniciar transacción\n  BEGIN\n    -- Mover todos los items de las órdenes fuente a la orden objetivo\n    UPDATE order_items \n    SET order_id = target_order_id\n    WHERE order_id = ANY(source_order_ids);\n    \n    -- Actualizar el total de la orden objetivo\n    UPDATE orders \n    SET total_price = new_total,\n        notes = CASE \n          WHEN notes IS NOT NULL AND notes != '' THEN \n            notes || ' | Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')\n          ELSE \n            'Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')\n        END\n    WHERE id = target_order_id;\n    \n    -- Marcar las órdenes fuente como fusionadas (cambiar status a 'merged')\n    UPDATE orders \n    SET status = 'merged',\n        notes = CASE \n          WHEN notes IS NOT NULL AND notes != '' THEN \n            notes || ' | Fusionada en orden: ' || target_order_id\n          ELSE \n            'Fusionada en orden: ' || target_order_id\n        END\n    WHERE id = ANY(source_order_ids);\n    \n    -- Commit implícito\n  EXCEPTION\n    WHEN OTHERS THEN\n      -- Rollback implícito\n      RAISE EXCEPTION 'Error al fusionar órdenes: %', SQLERRM;\n  END;\nEND;\n$$;\n\n-- Agregar el estado 'merged' al enum si no existe\nDO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN\n    CREATE TYPE order_status_enum AS ENUM (\n      'pending', 'in_progress', 'completed', 'cancelled', 'merged'\n    );\n  ELSE\n    -- Agregar 'merged' al enum existente si no está presente\n    IF NOT EXISTS (\n      SELECT 1 FROM pg_enum \n      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status_enum')\n      AND enumlabel = 'merged'\n    ) THEN\n      ALTER TYPE order_status_enum ADD VALUE 'merged';\n    END IF;\n  END IF;\nEND $$;"}	create_merge_orders_function	davorvargascostas@gmail.com	\N
20250818063245	{"CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(start_date timestamptz, end_date timestamptz)\nRETURNS json\nLANGUAGE sql\nAS $$\n  SELECT json_build_object(\n    'kpis', (\n      SELECT json_build_object(\n        'total_revenue', COALESCE(SUM(oi.quantity * oi.price_at_order), 0),\n        'total_cost',    COALESCE(SUM(oi.quantity * oi.cost_at_order), 0),\n        'total_profit',  COALESCE(SUM(oi.quantity * oi.price_at_order), 0) - COALESCE(SUM(oi.quantity * oi.cost_at_order), 0)\n      )\n      FROM public.orders o\n      JOIN public.order_items oi ON o.id = oi.order_id\n      WHERE o.created_at BETWEEN start_date AND end_date\n        AND o.status = 'completed'\n        AND o.restaurant_id = get_user_restaurant_id()\n    ),\n    'item_performance', (\n      SELECT COALESCE(json_agg(item_stats), '[]'::json)\n      FROM (\n        SELECT\n          mi.id,\n          mi.name,\n          SUM(oi.quantity)                           AS units_sold,\n          SUM(oi.quantity * oi.price_at_order)       AS revenue,\n          SUM(oi.quantity * oi.cost_at_order)        AS cost,\n          SUM(oi.quantity * oi.price_at_order) -\n          SUM(oi.quantity * oi.cost_at_order)        AS profit\n        FROM public.menu_items mi\n        JOIN public.order_items oi ON mi.id = oi.menu_item_id\n        JOIN public.orders o ON oi.order_id = o.id\n        WHERE o.created_at BETWEEN start_date AND end_date\n          AND o.status = 'completed'\n          AND o.restaurant_id = get_user_restaurant_id()\n        GROUP BY mi.id, mi.name\n        ORDER BY profit DESC\n      ) AS item_stats\n    )\n  );\n$$;"}	20250817_update_get_dashboard_analytics_scoped	davorvargascostas@gmail.com	\N
20250819125301	{"CREATE OR REPLACE FUNCTION get_dashboard_analytics_weekly(p_restaurant_id UUID)\nRETURNS JSON AS $$\nDECLARE\n    result JSON;\n    weekly_revenue JSON[];\n    weekly_orders JSON[];\n    current_date DATE := CURRENT_DATE;\n    i INTEGER;\nBEGIN\n    -- Generate weekly revenue data (last 7 days)\n    FOR i IN 0..6 LOOP\n        weekly_revenue := array_append(weekly_revenue, \n            json_build_object(\n                'day', TO_CHAR(current_date - i, 'Day'),\n                'date', current_date - i,\n                'revenue', COALESCE((\n                    SELECT SUM(total_price)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0),\n                'orders', COALESCE((\n                    SELECT COUNT(*)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0)\n            )\n        );\n    END LOOP;\n\n    -- Build the result\n    SELECT json_build_object(\n        'revenue_today', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'revenue_yesterday', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_today', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_yesterday', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'weekly_data', array_to_json(weekly_revenue),\n        \n        'total_customers', COALESCE((\n            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) >= CURRENT_DATE - 7\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'top_items', (\n            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)\n            FROM (\n                SELECT \n                    mi.name,\n                    SUM(oi.quantity) as quantity,\n                    SUM(oi.quantity * oi.price) as revenue\n                FROM order_items oi\n                JOIN orders o ON oi.order_id = o.id\n                JOIN menu_items mi ON oi.menu_item_id = mi.id\n                WHERE o.restaurant_id = p_restaurant_id\n                AND DATE(o.created_at) = CURRENT_DATE\n                AND o.status NOT IN ('cancelled')\n                GROUP BY mi.name\n                LIMIT 10\n            ) item_data\n        ),\n        \n        'payment_methods', (\n            SELECT COALESCE(json_agg(payment_data), '[]'::json)\n            FROM (\n                SELECT \n                    payment_method as method,\n                    SUM(total_price) as total,\n                    COUNT(*) as count\n                FROM orders\n                WHERE restaurant_id = p_restaurant_id\n                AND DATE(created_at) = CURRENT_DATE\n                AND status NOT IN ('cancelled')\n                GROUP BY payment_method\n            ) payment_data\n        ),\n        \n        'profit_matrix', (\n            SELECT json_build_object(\n                'stars', COALESCE((\n                    SELECT json_agg(star_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC, quantity DESC\n                        LIMIT 5\n                    ) star_data\n                ), '[]'::json),\n                'gems', COALESCE((\n                    SELECT json_agg(gem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC\n                        LIMIT 5\n                    ) gem_data\n                ), '[]'::json),\n                'popular', COALESCE((\n                    SELECT json_agg(popular_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) < 50\n                        ORDER BY quantity DESC\n                        LIMIT 5\n                    ) popular_data\n                ), '[]'::json),\n                'problems', COALESCE((\n                    SELECT json_agg(problem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) < 50\n                        ORDER BY profit_margin ASC, quantity ASC\n                        LIMIT 5\n                    ) problem_data\n                ), '[]'::json)\n            )\n        )\n    ) INTO result;\n    \n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"}	fix_dashboard_analytics_weekly_column	davorvargascostas@gmail.com	\N
20250817030722	{"-- Cambiar la restricción de clave foránea para permitir eliminación de ítems del menú\n-- Primero eliminamos la restricción existente\nALTER TABLE order_items DROP CONSTRAINT order_items_menu_item_id_fkey;\n\n-- Luego la recreamos con SET NULL para permitir eliminación\nALTER TABLE order_items \nADD CONSTRAINT order_items_menu_item_id_fkey \nFOREIGN KEY (menu_item_id) \nREFERENCES menu_items(id) \nON DELETE SET NULL \nON UPDATE NO ACTION;\n\n-- Agregar un comentario para documentar el cambio\nCOMMENT ON CONSTRAINT order_items_menu_item_id_fkey ON order_items IS 'Permite eliminar ítems del menú estableciendo menu_item_id como NULL en order_items';"}	fix_menu_items_deletion_constraint	davorvargascostas@gmail.com	\N
20250819121844	{"-- Función RPC para obtener analytics del dashboard\nCREATE OR REPLACE FUNCTION get_dashboard_analytics(p_restaurant_id UUID)\nRETURNS JSON\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  revenue_today DECIMAL(10,2) := 0;\n  revenue_yesterday DECIMAL(10,2) := 0;\n  orders_today INTEGER := 0;\n  orders_yesterday INTEGER := 0;\n  top_items JSON;\n  low_items JSON;\n  payment_methods JSON;\n  result JSON;\nBEGIN\n  -- Revenue y órdenes de hoy\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_today, orders_today\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE\n    AND status NOT IN ('cancelled', 'refunded');\n\n  -- Revenue y órdenes de ayer\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_yesterday, orders_yesterday\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'\n    AND status NOT IN ('cancelled', 'refunded');\n\n  -- Top 5 productos más vendidos (hoy)\n  WITH today_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled', 'refunded')\n    GROUP BY 1\n    ORDER BY quantity DESC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO top_items\n  FROM today_items;\n\n  -- Bottom 5 productos menos vendidos (últimos 7 días para tener más datos)\n  WITH week_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'\n      AND o.status NOT IN ('cancelled', 'refunded')\n    GROUP BY 1\n    HAVING SUM(oi.quantity) > 0\n    ORDER BY quantity ASC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO low_items\n  FROM week_items;\n\n  -- Métodos de pago (hoy) - usando la columna source de orders como fallback\n  WITH payment_stats AS (\n    SELECT \n      CASE \n        WHEN op.payment_method IS NOT NULL THEN op.payment_method\n        WHEN o.source = 'customer_qr' THEN 'qr'\n        ELSE 'No especificado'\n      END as method,\n      SUM(COALESCE(op.amount, o.total_price)) as total,\n      COUNT(*) as count\n    FROM orders o\n    LEFT JOIN order_payments op ON o.id = op.order_id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled', 'refunded')\n    GROUP BY 1\n  )\n  SELECT json_agg(\n    json_build_object(\n      'method', method,\n      'total', total,\n      'count', count\n    )\n  ) INTO payment_methods\n  FROM payment_stats;\n\n  -- Construir resultado final\n  result := json_build_object(\n    'revenue_today', revenue_today,\n    'revenue_yesterday', revenue_yesterday,\n    'orders_today', orders_today,\n    'orders_yesterday', orders_yesterday,\n    'top_items', COALESCE(top_items, '[]'::json),\n    'low_items', COALESCE(low_items, '[]'::json),\n    'payment_methods', COALESCE(payment_methods, '[]'::json)\n  );\n\n  RETURN result;\nEND;\n$$;\n\n-- Otorgar permisos\nGRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO authenticated;\nGRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO anon;"}	create_dashboard_analytics_function	davorvargascostas@gmail.com	\N
20250819125359	{"CREATE OR REPLACE FUNCTION get_dashboard_analytics_weekly(p_restaurant_id UUID)\nRETURNS JSON AS $$\nDECLARE\n    result JSON;\n    weekly_revenue JSON[];\n    weekly_orders JSON[];\n    current_date DATE := CURRENT_DATE;\n    i INTEGER;\nBEGIN\n    -- Generate weekly revenue data (last 7 days)\n    FOR i IN 0..6 LOOP\n        weekly_revenue := array_append(weekly_revenue, \n            json_build_object(\n                'day', TO_CHAR(current_date - i, 'Day'),\n                'date', current_date - i,\n                'revenue', COALESCE((\n                    SELECT SUM(total_price)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0),\n                'orders', COALESCE((\n                    SELECT COUNT(*)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0)\n            )\n        );\n    END LOOP;\n\n    -- Build the result\n    SELECT json_build_object(\n        'revenue_today', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'revenue_yesterday', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_today', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_yesterday', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'weekly_data', array_to_json(weekly_revenue),\n        \n        'total_customers', COALESCE((\n            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) >= CURRENT_DATE - 7\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'top_items', (\n            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)\n            FROM (\n                SELECT \n                    mi.name,\n                    SUM(oi.quantity) as quantity,\n                    SUM(oi.quantity * oi.price_at_order) as revenue\n                FROM order_items oi\n                JOIN orders o ON oi.order_id = o.id\n                JOIN menu_items mi ON oi.menu_item_id = mi.id\n                WHERE o.restaurant_id = p_restaurant_id\n                AND DATE(o.created_at) = CURRENT_DATE\n                AND o.status NOT IN ('cancelled')\n                GROUP BY mi.name\n                LIMIT 10\n            ) item_data\n        ),\n        \n        'payment_methods', (\n            SELECT COALESCE(json_agg(payment_data), '[]'::json)\n            FROM (\n                SELECT \n                    payment_method as method,\n                    SUM(total_price) as total,\n                    COUNT(*) as count\n                FROM orders\n                WHERE restaurant_id = p_restaurant_id\n                AND DATE(created_at) = CURRENT_DATE\n                AND status NOT IN ('cancelled')\n                GROUP BY payment_method\n            ) payment_data\n        ),\n        \n        'profit_matrix', (\n            SELECT json_build_object(\n                'stars', COALESCE((\n                    SELECT json_agg(star_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC, quantity DESC\n                        LIMIT 5\n                    ) star_data\n                ), '[]'::json),\n                'gems', COALESCE((\n                    SELECT json_agg(gem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC\n                        LIMIT 5\n                    ) gem_data\n                ), '[]'::json),\n                'popular', COALESCE((\n                    SELECT json_agg(popular_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY quantity DESC\n                        LIMIT 5\n                    ) popular_data\n                ), '[]'::json),\n                'problems', COALESCE((\n                    SELECT json_agg(problem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY profit_margin ASC, quantity ASC\n                        LIMIT 5\n                    ) problem_data\n                ), '[]'::json)\n            )\n        )\n    ) INTO result;\n    \n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"}	fix_dashboard_analytics_price_column	davorvargascostas@gmail.com	\N
20250806010040	{"-- Agregar columnas para estados internos de las órdenes\nALTER TABLE orders ADD COLUMN is_new_order BOOLEAN DEFAULT true;\nALTER TABLE orders ADD COLUMN is_preparing BOOLEAN DEFAULT false;\nALTER TABLE orders ADD COLUMN is_ready BOOLEAN DEFAULT false;"}	add_internal_order_states	davorvargascostas@gmail.com	\N
20250817030732	{"-- Eliminar las políticas existentes que causan conflictos\nDROP POLICY IF EXISTS \\"Users can delete modifier groups from their restaurant\\" ON modifier_groups;\nDROP POLICY IF EXISTS \\"Users can insert modifier groups to their restaurant\\" ON modifier_groups;\nDROP POLICY IF EXISTS \\"Users can update modifier groups from their restaurant\\" ON modifier_groups;\nDROP POLICY IF EXISTS \\"Users can delete modifiers from their restaurant\\" ON modifiers;\nDROP POLICY IF EXISTS \\"Users can insert modifiers to their restaurant\\" ON modifiers;\nDROP POLICY IF EXISTS \\"Users can update modifiers from their restaurant\\" ON modifiers;\n\n-- Crear nuevas políticas que funcionen correctamente con usuarios autenticados\nCREATE POLICY \\"modifier_groups_authenticated_manage\\" ON modifier_groups\n    FOR ALL USING (\n        restaurant_id = get_user_restaurant_id() OR is_admin()\n    )\n    WITH CHECK (\n        restaurant_id = get_user_restaurant_id() OR is_admin()\n    );\n\nCREATE POLICY \\"modifiers_authenticated_manage\\" ON modifiers\n    FOR ALL USING (\n        modifier_group_id IN (\n            SELECT id FROM modifier_groups \n            WHERE restaurant_id = get_user_restaurant_id() OR is_admin()\n        )\n    )\n    WITH CHECK (\n        modifier_group_id IN (\n            SELECT id FROM modifier_groups \n            WHERE restaurant_id = get_user_restaurant_id() OR is_admin()\n        )\n    );\n\n-- Mantener las políticas de SELECT públicas para el frontend\n-- (estas ya existen y están bien configuradas)"}	fix_modifier_rls_policies	davorvargascostas@gmail.com	\N
20250819121924	{"-- Función RPC para obtener analytics del dashboard (corregida)\nCREATE OR REPLACE FUNCTION get_dashboard_analytics(p_restaurant_id UUID)\nRETURNS JSON\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  revenue_today DECIMAL(10,2) := 0;\n  revenue_yesterday DECIMAL(10,2) := 0;\n  orders_today INTEGER := 0;\n  orders_yesterday INTEGER := 0;\n  top_items JSON;\n  low_items JSON;\n  payment_methods JSON;\n  result JSON;\nBEGIN\n  -- Revenue y órdenes de hoy\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_today, orders_today\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE\n    AND status NOT IN ('cancelled');\n\n  -- Revenue y órdenes de ayer\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_yesterday, orders_yesterday\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'\n    AND status NOT IN ('cancelled');\n\n  -- Top 5 productos más vendidos (hoy)\n  WITH today_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n    ORDER BY quantity DESC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO top_items\n  FROM today_items;\n\n  -- Bottom 5 productos menos vendidos (últimos 7 días para tener más datos)\n  WITH week_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n    HAVING SUM(oi.quantity) > 0\n    ORDER BY quantity ASC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO low_items\n  FROM week_items;\n\n  -- Métodos de pago (hoy) - usando la columna source de orders como fallback\n  WITH payment_stats AS (\n    SELECT \n      CASE \n        WHEN op.payment_method IS NOT NULL THEN op.payment_method\n        WHEN o.source = 'customer_qr' THEN 'qr'\n        ELSE 'No especificado'\n      END as method,\n      SUM(COALESCE(op.amount, o.total_price)) as total,\n      COUNT(*) as count\n    FROM orders o\n    LEFT JOIN order_payments op ON o.id = op.order_id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n  )\n  SELECT json_agg(\n    json_build_object(\n      'method', method,\n      'total', total,\n      'count', count\n    )\n  ) INTO payment_methods\n  FROM payment_stats;\n\n  -- Construir resultado final\n  result := json_build_object(\n    'revenue_today', revenue_today,\n    'revenue_yesterday', revenue_yesterday,\n    'orders_today', orders_today,\n    'orders_yesterday', orders_yesterday,\n    'top_items', COALESCE(top_items, '[]'::json),\n    'low_items', COALESCE(low_items, '[]'::json),\n    'payment_methods', COALESCE(payment_methods, '[]'::json)\n  );\n\n  RETURN result;\nEND;\n$$;"}	fix_dashboard_analytics_enum	davorvargascostas@gmail.com	\N
20250819125522	{"CREATE OR REPLACE FUNCTION get_dashboard_analytics_weekly(p_restaurant_id UUID)\nRETURNS JSON AS $$\nDECLARE\n    result JSON;\n    weekly_revenue JSON[];\n    current_date DATE := CURRENT_DATE;\n    i INTEGER;\nBEGIN\n    -- Generate weekly revenue data (last 7 days)\n    FOR i IN 0..6 LOOP\n        weekly_revenue := array_append(weekly_revenue, \n            json_build_object(\n                'day', TO_CHAR(current_date - i, 'Day'),\n                'date', current_date - i,\n                'revenue', COALESCE((\n                    SELECT SUM(total_price)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0),\n                'orders', COALESCE((\n                    SELECT COUNT(*)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0)\n            )\n        );\n    END LOOP;\n\n    -- Build the result\n    SELECT json_build_object(\n        'revenue_today', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'revenue_yesterday', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_today', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_yesterday', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'weekly_data', array_to_json(weekly_revenue),\n        \n        'total_customers', COALESCE((\n            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) >= CURRENT_DATE - 7\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'top_items', (\n            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)\n            FROM (\n                SELECT \n                    mi.name,\n                    SUM(oi.quantity) as quantity,\n                    SUM(oi.quantity * oi.price_at_order) as revenue\n                FROM order_items oi\n                JOIN orders o ON oi.order_id = o.id\n                JOIN menu_items mi ON oi.menu_item_id = mi.id\n                WHERE o.restaurant_id = p_restaurant_id\n                AND DATE(o.created_at) = CURRENT_DATE\n                AND o.status NOT IN ('cancelled')\n                GROUP BY mi.name\n                LIMIT 10\n            ) item_data\n        ),\n        \n        'payment_methods', '[]'::json,\n        \n        'profit_matrix', (\n            SELECT json_build_object(\n                'stars', COALESCE((\n                    SELECT json_agg(star_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC, quantity DESC\n                        LIMIT 5\n                    ) star_data\n                ), '[]'::json),\n                'gems', COALESCE((\n                    SELECT json_agg(gem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC\n                        LIMIT 5\n                    ) gem_data\n                ), '[]'::json),\n                'popular', COALESCE((\n                    SELECT json_agg(popular_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY quantity DESC\n                        LIMIT 5\n                    ) popular_data\n                ), '[]'::json),\n                'problems', COALESCE((\n                    SELECT json_agg(problem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY profit_margin ASC, quantity ASC\n                        LIMIT 5\n                    ) problem_data\n                ), '[]'::json)\n            )\n        )\n    ) INTO result;\n    \n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"}	fix_dashboard_analytics_simplified	davorvargascostas@gmail.com	\N
20250817030818	{"-- Agregar campo archived a menu_items para soft delete\nALTER TABLE menu_items \nADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;\n\n-- Crear índice para mejorar performance en consultas de ítems activos\nCREATE INDEX IF NOT EXISTS idx_menu_items_archived \nON menu_items(restaurant_id, archived) \nWHERE archived = FALSE;\n\n-- Agregar comentario para documentar el campo\nCOMMENT ON COLUMN menu_items.archived IS 'Indica si el ítem del menú ha sido archivado (soft delete)';\n\n-- Actualizar la política de SELECT para excluir ítems archivados por defecto\nDROP POLICY IF EXISTS \\"menu_items_public_select\\" ON menu_items;\n\nCREATE POLICY \\"menu_items_public_select\\" ON menu_items\n    FOR SELECT USING (\n        archived = FALSE\n    );"}	add_menu_items_archived_field_fixed	davorvargascostas@gmail.com	\N
20250819123733	{"-- Función RPC mejorada con Profit Matrix\nCREATE OR REPLACE FUNCTION get_dashboard_analytics(p_restaurant_id UUID)\nRETURNS JSON\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  revenue_today DECIMAL(10,2) := 0;\n  revenue_yesterday DECIMAL(10,2) := 0;\n  orders_today INTEGER := 0;\n  orders_yesterday INTEGER := 0;\n  top_items JSON;\n  low_items JSON;\n  payment_methods JSON;\n  profit_matrix JSON;\n  result JSON;\nBEGIN\n  -- Revenue y órdenes de hoy\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_today, orders_today\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE\n    AND status NOT IN ('cancelled');\n\n  -- Revenue y órdenes de ayer\n  SELECT \n    COALESCE(SUM(total_price), 0),\n    COUNT(*)\n  INTO revenue_yesterday, orders_yesterday\n  FROM orders \n  WHERE restaurant_id = p_restaurant_id \n    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'\n    AND status NOT IN ('cancelled');\n\n  -- Top 5 productos más vendidos (hoy)\n  WITH today_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n    ORDER BY quantity DESC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO top_items\n  FROM today_items;\n\n  -- Bottom 5 productos menos vendidos (últimos 7 días)\n  WITH week_items AS (\n    SELECT \n      COALESCE(mi.name, \n        CASE \n          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN\n            COALESCE(\n              (oi.notes::json->>'name'),\n              'Producto Especial'\n            )\n          ELSE 'Producto Especial'\n        END\n      ) as name,\n      SUM(oi.quantity) as quantity,\n      SUM(oi.price_at_order * oi.quantity) as revenue\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n    HAVING SUM(oi.quantity) > 0\n    ORDER BY quantity ASC\n    LIMIT 5\n  )\n  SELECT json_agg(\n    json_build_object(\n      'name', name,\n      'quantity', quantity,\n      'revenue', revenue\n    )\n  ) INTO low_items\n  FROM week_items;\n\n  -- Métodos de pago (hoy)\n  WITH payment_stats AS (\n    SELECT \n      CASE \n        WHEN op.payment_method IS NOT NULL THEN op.payment_method\n        WHEN o.source = 'customer_qr' THEN 'qr'\n        ELSE 'No especificado'\n      END as method,\n      SUM(COALESCE(op.amount, o.total_price)) as total,\n      COUNT(*) as count\n    FROM orders o\n    LEFT JOIN order_payments op ON o.id = op.order_id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) = CURRENT_DATE\n      AND o.status NOT IN ('cancelled')\n    GROUP BY 1\n  )\n  SELECT json_agg(\n    json_build_object(\n      'method', method,\n      'total', total,\n      'count', count\n    )\n  ) INTO payment_methods\n  FROM payment_stats;\n\n  -- PROFIT MATRIX (últimos 7 días para tener más datos)\n  WITH profit_analysis AS (\n    SELECT \n      COALESCE(mi.name, 'Producto Especial') as name,\n      SUM(oi.quantity) as total_sold,\n      SUM(oi.price_at_order * oi.quantity) as revenue,\n      SUM(oi.cost_at_order * oi.quantity) as total_cost,\n      SUM((oi.price_at_order - oi.cost_at_order) * oi.quantity) as profit,\n      AVG(oi.price_at_order - oi.cost_at_order) as avg_profit_per_unit,\n      CASE \n        WHEN SUM(oi.price_at_order * oi.quantity) > 0 THEN\n          ((SUM((oi.price_at_order - oi.cost_at_order) * oi.quantity) / SUM(oi.price_at_order * oi.quantity)) * 100)\n        ELSE 0\n      END as profit_margin\n    FROM order_items oi\n    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id\n    JOIN orders o ON oi.order_id = o.id\n    WHERE o.restaurant_id = p_restaurant_id \n      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'\n      AND o.status NOT IN ('cancelled')\n      AND oi.cost_at_order > 0  -- Solo productos con costo definido\n    GROUP BY 1\n    HAVING SUM(oi.quantity) > 0\n  ),\n  profit_matrix_data AS (\n    SELECT \n      name,\n      total_sold,\n      revenue,\n      profit,\n      profit_margin,\n      CASE \n        WHEN total_sold >= 10 AND profit_margin >= 50 THEN 'stars'     -- 🏆 ESTRELLAS\n        WHEN total_sold < 10 AND profit_margin >= 50 THEN 'gems'       -- ⭐ JOYAS  \n        WHEN total_sold >= 10 AND profit_margin < 50 THEN 'popular'    -- 🔄 POPULARES\n        ELSE 'problems'                                                 -- ⚠️ PROBLEMAS\n      END as category\n    FROM profit_analysis\n  )\n  SELECT json_build_object(\n    'stars', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'stars'),\n    'gems', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'gems'),\n    'popular', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'popular'),\n    'problems', (SELECT json_agg(json_build_object('name', name, 'sold', total_sold, 'profit_margin', profit_margin, 'revenue', revenue)) FROM profit_matrix_data WHERE category = 'problems')\n  ) INTO profit_matrix\n  FROM profit_matrix_data\n  LIMIT 1;\n\n  -- Construir resultado final\n  result := json_build_object(\n    'revenue_today', revenue_today,\n    'revenue_yesterday', revenue_yesterday,\n    'orders_today', orders_today,\n    'orders_yesterday', orders_yesterday,\n    'top_items', COALESCE(top_items, '[]'::json),\n    'low_items', COALESCE(low_items, '[]'::json),\n    'payment_methods', COALESCE(payment_methods, '[]'::json),\n    'profit_matrix', COALESCE(profit_matrix, '{\\"stars\\":[],\\"gems\\":[],\\"popular\\":[],\\"problems\\":[]}'::json)\n  );\n\n  RETURN result;\nEND;\n$$;"}	add_profit_matrix_to_analytics	davorvargascostas@gmail.com	\N
20250819054810	{"CREATE OR REPLACE FUNCTION get_dashboard_analytics_weekly(p_restaurant_id UUID)\nRETURNS JSON AS $$\nDECLARE\n    result JSON;\n    weekly_revenue JSON[];\n    current_date DATE := CURRENT_DATE;\n    i INTEGER;\nBEGIN\n    -- Generate weekly revenue data (last 7 days)\n    FOR i IN 0..6 LOOP\n        weekly_revenue := array_append(weekly_revenue, \n            json_build_object(\n                'day', TO_CHAR(current_date - i, 'Day'),\n                'date', current_date - i,\n                'revenue', COALESCE((\n                    SELECT SUM(total_price)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0),\n                'orders', COALESCE((\n                    SELECT COUNT(*)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0)\n            )\n        );\n    END LOOP;\n\n    -- Build the result\n    SELECT json_build_object(\n        'revenue_today', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'revenue_yesterday', COALESCE((\n            SELECT SUM(total_price)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_today', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_yesterday', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'weekly_data', array_to_json(weekly_revenue),\n        \n        'total_customers', COALESCE((\n            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) >= CURRENT_DATE - 7\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'top_items', (\n            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)\n            FROM (\n                SELECT \n                    mi.name,\n                    SUM(oi.quantity) as quantity,\n                    SUM(oi.quantity * oi.price_at_order) as revenue\n                FROM order_items oi\n                JOIN orders o ON oi.order_id = o.id\n                JOIN menu_items mi ON oi.menu_item_id = mi.id\n                WHERE o.restaurant_id = p_restaurant_id\n                AND DATE(o.created_at) >= CURRENT_DATE - 7\n                AND o.status NOT IN ('cancelled')\n                GROUP BY mi.name\n                LIMIT 10\n            ) item_data\n        ),\n        \n        'payment_methods', '[]'::json,\n        \n        'profit_matrix', (\n            SELECT json_build_object(\n                'stars', COALESCE((\n                    SELECT json_agg(star_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) >= CURRENT_DATE - 7\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC, quantity DESC\n                        LIMIT 5\n                    ) star_data\n                ), '[]'::json),\n                'gems', COALESCE((\n                    SELECT json_agg(gem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) >= CURRENT_DATE - 7\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC\n                        LIMIT 5\n                    ) gem_data\n                ), '[]'::json),\n                'popular', COALESCE((\n                    SELECT json_agg(popular_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) >= CURRENT_DATE - 7\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY quantity DESC\n                        LIMIT 5\n                    ) popular_data\n                ), '[]'::json),\n                'problems', COALESCE((\n                    SELECT json_agg(problem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) >= CURRENT_DATE - 7\n                        AND o.status NOT IN ('cancelled')\n                        AND oi.cost_at_order > 0\n                        GROUP BY mi.name\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN oi.cost_at_order > 0 THEN ((oi.price_at_order - oi.cost_at_order) / oi.price_at_order) * 100 ELSE 0 END) < 50\n                        ORDER BY profit_margin ASC, quantity ASC\n                        LIMIT 5\n                    ) problem_data\n                ), '[]'::json)\n            )\n        )\n    ) INTO result;\n    \n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"}	fix_dashboard_analytics_last_week	davorvargascostas@gmail.com	\N
20250818062953	{"-- 1) Add cost to menu_items and cost_at_order to order_items\nALTER TABLE public.menu_items\nADD COLUMN IF NOT EXISTS cost numeric NOT NULL DEFAULT 0;\n\nALTER TABLE public.order_items\nADD COLUMN IF NOT EXISTS cost_at_order numeric NOT NULL DEFAULT 0;\n\n-- 2) Create analytics function (RPC)\nCREATE OR REPLACE FUNCTION public.get_dashboard_analytics(start_date timestamptz, end_date timestamptz)\nRETURNS json\nLANGUAGE sql\nAS $$\n  SELECT json_build_object(\n    'kpis', (\n      SELECT json_build_object(\n        'total_revenue', COALESCE(SUM(oi.quantity * oi.price_at_order), 0),\n        'total_cost',    COALESCE(SUM(oi.quantity * oi.cost_at_order), 0),\n        'total_profit',  COALESCE(SUM(oi.quantity * oi.price_at_order), 0) - COALESCE(SUM(oi.quantity * oi.cost_at_order), 0)\n      )\n      FROM public.orders o\n      JOIN public.order_items oi ON o.id = oi.order_id\n      WHERE o.created_at BETWEEN start_date AND end_date\n        AND o.status = 'completed'\n    ),\n    'item_performance', (\n      SELECT COALESCE(json_agg(item_stats), '[]'::json)\n      FROM (\n        SELECT\n          mi.id,\n          mi.name,\n          SUM(oi.quantity)                           AS units_sold,\n          SUM(oi.quantity * oi.price_at_order)       AS revenue,\n          SUM(oi.quantity * oi.cost_at_order)        AS cost,\n          SUM(oi.quantity * oi.price_at_order) -\n          SUM(oi.quantity * oi.cost_at_order)        AS profit\n        FROM public.menu_items mi\n        JOIN public.order_items oi ON mi.id = oi.menu_item_id\n        JOIN public.orders o ON oi.order_id = o.id\n        WHERE o.created_at BETWEEN start_date AND end_date\n          AND o.status = 'completed'\n        GROUP BY mi.id, mi.name\n        ORDER BY profit DESC\n      ) AS item_stats\n    )\n  );\n$$;"}	20250817_add_cost_columns_and_dashboard_function	davorvargascostas@gmail.com	\N
20250819124805	{"CREATE OR REPLACE FUNCTION get_dashboard_analytics_weekly(p_restaurant_id UUID)\nRETURNS JSON AS $$\nDECLARE\n    result JSON;\n    weekly_revenue JSON[];\n    weekly_orders JSON[];\n    current_date DATE := CURRENT_DATE;\n    i INTEGER;\nBEGIN\n    -- Generate weekly revenue data (last 7 days)\n    FOR i IN 0..6 LOOP\n        weekly_revenue := array_append(weekly_revenue, \n            json_build_object(\n                'day', TO_CHAR(current_date - i, 'Day'),\n                'date', current_date - i,\n                'revenue', COALESCE((\n                    SELECT SUM(total_amount)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0),\n                'orders', COALESCE((\n                    SELECT COUNT(*)\n                    FROM orders \n                    WHERE restaurant_id = p_restaurant_id \n                    AND DATE(created_at) = current_date - i\n                    AND status NOT IN ('cancelled')\n                ), 0)\n            )\n        );\n    END LOOP;\n\n    -- Build the result\n    SELECT json_build_object(\n        'revenue_today', COALESCE((\n            SELECT SUM(total_amount)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'revenue_yesterday', COALESCE((\n            SELECT SUM(total_amount)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_today', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'orders_yesterday', COALESCE((\n            SELECT COUNT(*)\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) = CURRENT_DATE - 1\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'weekly_data', array_to_json(weekly_revenue),\n        \n        'total_customers', COALESCE((\n            SELECT COUNT(DISTINCT COALESCE(customer_name, 'Anónimo'))\n            FROM orders \n            WHERE restaurant_id = p_restaurant_id \n            AND DATE(created_at) >= CURRENT_DATE - 7\n            AND status NOT IN ('cancelled')\n        ), 0),\n        \n        'top_items', (\n            SELECT COALESCE(json_agg(item_data ORDER BY quantity DESC), '[]'::json)\n            FROM (\n                SELECT \n                    mi.name,\n                    SUM(oi.quantity) as quantity,\n                    SUM(oi.quantity * oi.price) as revenue\n                FROM order_items oi\n                JOIN orders o ON oi.order_id = o.id\n                JOIN menu_items mi ON oi.menu_item_id = mi.id\n                WHERE o.restaurant_id = p_restaurant_id\n                AND DATE(o.created_at) = CURRENT_DATE\n                AND o.status NOT IN ('cancelled')\n                GROUP BY mi.name\n                LIMIT 10\n            ) item_data\n        ),\n        \n        'payment_methods', (\n            SELECT COALESCE(json_agg(payment_data), '[]'::json)\n            FROM (\n                SELECT \n                    payment_method as method,\n                    SUM(total_amount) as total,\n                    COUNT(*) as count\n                FROM orders\n                WHERE restaurant_id = p_restaurant_id\n                AND DATE(created_at) = CURRENT_DATE\n                AND status NOT IN ('cancelled')\n                GROUP BY payment_method\n            ) payment_data\n        ),\n        \n        'profit_matrix', (\n            SELECT json_build_object(\n                'stars', COALESCE((\n                    SELECT json_agg(star_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC, quantity DESC\n                        LIMIT 5\n                    ) star_data\n                ), '[]'::json),\n                'gems', COALESCE((\n                    SELECT json_agg(gem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) >= 50\n                        ORDER BY profit_margin DESC\n                        LIMIT 5\n                    ) gem_data\n                ), '[]'::json),\n                'popular', COALESCE((\n                    SELECT json_agg(popular_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) >= 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) < 50\n                        ORDER BY quantity DESC\n                        LIMIT 5\n                    ) popular_data\n                ), '[]'::json),\n                'problems', COALESCE((\n                    SELECT json_agg(problem_data)\n                    FROM (\n                        SELECT \n                            mi.name,\n                            SUM(oi.quantity) as quantity,\n                            AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) as profit_margin\n                        FROM order_items oi\n                        JOIN orders o ON oi.order_id = o.id\n                        JOIN menu_items mi ON oi.menu_item_id = mi.id\n                        WHERE o.restaurant_id = p_restaurant_id\n                        AND DATE(o.created_at) = CURRENT_DATE\n                        AND o.status NOT IN ('cancelled')\n                        AND mi.cost > 0\n                        GROUP BY mi.name, mi.price, mi.cost\n                        HAVING SUM(oi.quantity) < 3 AND AVG(CASE WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price) * 100 ELSE 0 END) < 50\n                        ORDER BY profit_margin ASC, quantity ASC\n                        LIMIT 5\n                    ) problem_data\n                ), '[]'::json)\n            )\n        )\n    ) INTO result;\n    \n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"}	enhance_dashboard_analytics_weekly	davorvargascostas@gmail.com	\N
20250130	{"-- Create print_jobs table for tracking print requests and status\nCREATE TABLE IF NOT EXISTS print_jobs (\n    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n    order_id INTEGER REFERENCES orders(id) NOT NULL,\n    printer_id UUID REFERENCES printers(id) NOT NULL,\n    print_type TEXT NOT NULL CHECK (print_type IN ('kitchen', 'drink', 'receipt')),\n    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'failed', 'cancelled')),\n    requested_by UUID REFERENCES auth.users(id) NOT NULL,\n    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),\n    started_at TIMESTAMP WITH TIME ZONE,\n    completed_at TIMESTAMP WITH TIME ZONE,\n    error_message TEXT,\n    retry_count INTEGER NOT NULL DEFAULT 0,\n    max_retries INTEGER NOT NULL DEFAULT 3,\n    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()\n)","-- Create indexes for better query performance\nCREATE INDEX IF NOT EXISTS idx_print_jobs_order_id ON print_jobs(order_id)","CREATE INDEX IF NOT EXISTS idx_print_jobs_printer_id ON print_jobs(printer_id)","CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status)","CREATE INDEX IF NOT EXISTS idx_print_jobs_print_type ON print_jobs(print_type)","CREATE INDEX IF NOT EXISTS idx_print_jobs_requested_at ON print_jobs(requested_at DESC)","-- Enable RLS (Row Level Security)\nALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY","-- Create RLS policies\nCREATE POLICY \\"Staff can view print jobs\\" ON print_jobs\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Staff can insert print jobs\\" ON print_jobs\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Staff can update print jobs\\" ON print_jobs\n    FOR UPDATE USING (auth.role() = 'authenticated')","-- Update trigger for updated_at\nCREATE TRIGGER update_print_jobs_updated_at \n    BEFORE UPDATE ON print_jobs \n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Add printer_last_seen field to printers table to track when printer was last active\nALTER TABLE printers ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE","ALTER TABLE printers ADD COLUMN IF NOT EXISTS last_error TEXT","ALTER TABLE printers ADD COLUMN IF NOT EXISTS print_queue_count INTEGER DEFAULT 0","COMMENT ON TABLE print_jobs IS 'Tracks individual print job requests and their status'","COMMENT ON COLUMN print_jobs.print_type IS 'Type of print job: kitchen, drink, or receipt'","COMMENT ON COLUMN print_jobs.status IS 'Current status: pending, printing, completed, failed, cancelled'","COMMENT ON COLUMN print_jobs.retry_count IS 'Number of retry attempts made'","COMMENT ON COLUMN print_jobs.max_retries IS 'Maximum number of retries allowed'"}	create_print_jobs	\N	\N
20250804	{"-- Allow NULL values in menu_item_id for custom products\r\n-- This enables the system to handle custom/special products that don't exist in the menu_items table\r\n\r\nALTER TABLE order_items \r\nALTER COLUMN menu_item_id DROP NOT NULL","-- Add a comment to document this change\r\nCOMMENT ON COLUMN order_items.menu_item_id IS 'References menu_items.id. Can be NULL for custom/special products that are not in the menu.'"}	allow_null_menu_item_id	\N	\N
20250805	{"-- Add archived field to orders table for soft delete functionality\r\n-- This allows orders to be hidden from dashboard without losing historical data\r\n\r\nALTER TABLE orders \r\nADD COLUMN archived BOOLEAN DEFAULT FALSE","-- Add index for better performance when filtering by archived status\r\nCREATE INDEX idx_orders_archived ON orders(archived)","-- Add index for common dashboard query (restaurant_id + archived + created_at)\r\nCREATE INDEX idx_orders_dashboard ON orders(restaurant_id, archived, created_at)","-- Update any existing orders to set archived = false (just to be explicit)\r\nUPDATE orders SET archived = FALSE WHERE archived IS NULL"}	add_archived_field	\N	\N
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 594, true);


--
-- Name: menu_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.menu_categories_id_seq', 50, true);


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 244, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1246, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 701, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 12693, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: modifier_groups modifier_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modifier_groups
    ADD CONSTRAINT modifier_groups_pkey PRIMARY KEY (id);


--
-- Name: modifiers modifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_pkey PRIMARY KEY (id);


--
-- Name: order_item_modifiers order_item_modifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_modifiers
    ADD CONSTRAINT order_item_modifiers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_payments order_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: printers printers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printers
    ADD CONSTRAINT printers_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: tables unique_table_per_restaurant; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT unique_table_per_restaurant UNIQUE (restaurant_id, table_number);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_21 messages_2025_08_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_21
    ADD CONSTRAINT messages_2025_08_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_22 messages_2025_08_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_22
    ADD CONSTRAINT messages_2025_08_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_23 messages_2025_08_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_23
    ADD CONSTRAINT messages_2025_08_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_24 messages_2025_08_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_24
    ADD CONSTRAINT messages_2025_08_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_25 messages_2025_08_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_25
    ADD CONSTRAINT messages_2025_08_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_26 messages_2025_08_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_26
    ADD CONSTRAINT messages_2025_08_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_27 messages_2025_08_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_27
    ADD CONSTRAINT messages_2025_08_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_cash_registers_restaurant_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_registers_restaurant_date ON public.cash_registers USING btree (restaurant_id, opened_at);


--
-- Name: idx_cash_registers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cash_registers_status ON public.cash_registers USING btree (status);


--
-- Name: idx_menu_items_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_archived ON public.menu_items USING btree (restaurant_id, archived) WHERE (archived = false);


--
-- Name: idx_modifier_groups_menu_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modifier_groups_menu_item ON public.modifier_groups USING btree (menu_item_id);


--
-- Name: idx_modifier_groups_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modifier_groups_restaurant ON public.modifier_groups USING btree (restaurant_id);


--
-- Name: idx_modifiers_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modifiers_group ON public.modifiers USING btree (modifier_group_id);


--
-- Name: idx_order_item_modifiers_order_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_modifiers_order_item ON public.order_item_modifiers USING btree (order_item_id);


--
-- Name: idx_order_payments_cash_register_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_payments_cash_register_id ON public.order_payments USING btree (cash_register_id);


--
-- Name: idx_order_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_payments_order_id ON public.order_payments USING btree (order_id);


--
-- Name: idx_orders_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_archived ON public.orders USING btree (archived);


--
-- Name: idx_orders_dashboard; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_dashboard ON public.orders USING btree (restaurant_id, archived, created_at);


--
-- Name: idx_orders_drink_printed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_drink_printed ON public.orders USING btree (drink_printed) WHERE (drink_printed = false);


--
-- Name: idx_printers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_printers_active ON public.printers USING btree (is_active);


--
-- Name: idx_printers_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_printers_restaurant_id ON public.printers USING btree (restaurant_id);


--
-- Name: idx_printers_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_printers_type ON public.printers USING btree (type);


--
-- Name: idx_profiles_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_restaurant_id ON public.profiles USING btree (restaurant_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages_2025_08_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_21_pkey;


--
-- Name: messages_2025_08_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_22_pkey;


--
-- Name: messages_2025_08_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_23_pkey;


--
-- Name: messages_2025_08_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_24_pkey;


--
-- Name: messages_2025_08_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_25_pkey;


--
-- Name: messages_2025_08_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_26_pkey;


--
-- Name: messages_2025_08_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_27_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: modifier_groups update_modifier_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_modifier_groups_updated_at BEFORE UPDATE ON public.modifier_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: modifiers update_modifiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_modifiers_updated_at BEFORE UPDATE ON public.modifiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: cash_registers cash_registers_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES auth.users(id);


--
-- Name: cash_registers cash_registers_opened_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES auth.users(id);


--
-- Name: cash_registers cash_registers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: menu_categories menu_categories_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories(id);


--
-- Name: menu_items menu_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE SET NULL;


--
-- Name: modifier_groups modifier_groups_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modifier_groups
    ADD CONSTRAINT modifier_groups_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: modifier_groups modifier_groups_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modifier_groups
    ADD CONSTRAINT modifier_groups_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- Name: modifiers modifiers_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_groups(id) ON DELETE CASCADE;


--
-- Name: order_item_modifiers order_item_modifiers_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_modifiers
    ADD CONSTRAINT order_item_modifiers_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_groups(id);


--
-- Name: order_item_modifiers order_item_modifiers_modifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_modifiers
    ADD CONSTRAINT order_item_modifiers_modifier_id_fkey FOREIGN KEY (modifier_id) REFERENCES public.modifiers(id);


--
-- Name: order_item_modifiers order_item_modifiers_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item_modifiers
    ADD CONSTRAINT order_item_modifiers_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_payments order_payments_cash_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_cash_register_id_fkey FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON DELETE SET NULL;


--
-- Name: order_payments order_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_payments order_payments_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES auth.users(id);


--
-- Name: orders orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE SET NULL;


--
-- Name: orders orders_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);


--
-- Name: printers printers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printers
    ADD CONSTRAINT printers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- Name: tables tables_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_categories Allow admin full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access" ON public.menu_categories USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: menu_items Allow admin full access for menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access for menu items" ON public.menu_items USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: restaurants Allow admin full access to restaurants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access to restaurants" ON public.restaurants USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: tables Allow admin to manage tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to manage tables" ON public.tables USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: menu_items Allow admins to delete menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to delete menu items" ON public.menu_items FOR DELETE TO authenticated USING ((public.get_my_role() = 'admin'::text));


--
-- Name: menu_items Allow admins to insert menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK ((public.get_my_role() = 'admin'::text));


--
-- Name: menu_items Allow admins to update menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to update menu items" ON public.menu_items FOR UPDATE TO authenticated USING ((public.get_my_role() = 'admin'::text)) WITH CHECK ((public.get_my_role() = 'admin'::text));


--
-- Name: order_items Allow all to create order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all to create order items" ON public.order_items FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: cash_registers Users can insert cash registers for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert cash registers for their restaurant" ON public.cash_registers FOR INSERT WITH CHECK ((restaurant_id IN ( SELECT tables.restaurant_id
   FROM public.tables
  WHERE (tables.restaurant_id IS NOT NULL))));


--
-- Name: order_item_modifiers Users can insert order item modifiers to their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert order item modifiers to their restaurant" ON public.order_item_modifiers FOR INSERT WITH CHECK ((order_item_id IN ( SELECT oi.id
   FROM (public.order_items oi
     JOIN public.orders o ON ((oi.order_id = o.id)))
  WHERE (o.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- Name: order_payments Users can insert order payments for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert order payments for their restaurant" ON public.order_payments FOR INSERT WITH CHECK ((order_id IN ( SELECT o.id
   FROM (public.orders o
     JOIN public.tables t ON ((o.table_id = t.id)))
  WHERE (t.restaurant_id IS NOT NULL))));


--
-- Name: cash_registers Users can update cash registers for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update cash registers for their restaurant" ON public.cash_registers FOR UPDATE USING ((restaurant_id IN ( SELECT tables.restaurant_id
   FROM public.tables
  WHERE (tables.restaurant_id IS NOT NULL))));


--
-- Name: order_payments Users can update order payments for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update order payments for their restaurant" ON public.order_payments FOR UPDATE USING ((order_id IN ( SELECT o.id
   FROM (public.orders o
     JOIN public.tables t ON ((o.table_id = t.id)))
  WHERE (t.restaurant_id IS NOT NULL))));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: cash_registers Users can view cash registers for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view cash registers for their restaurant" ON public.cash_registers FOR SELECT USING ((restaurant_id IN ( SELECT tables.restaurant_id
   FROM public.tables
  WHERE (tables.restaurant_id IS NOT NULL))));


--
-- Name: order_item_modifiers Users can view order item modifiers from their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view order item modifiers from their restaurant" ON public.order_item_modifiers FOR SELECT USING ((order_item_id IN ( SELECT oi.id
   FROM (public.order_items oi
     JOIN public.orders o ON ((oi.order_id = o.id)))
  WHERE (o.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- Name: order_payments Users can view order payments for their restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view order payments for their restaurant" ON public.order_payments FOR SELECT USING ((order_id IN ( SELECT o.id
   FROM (public.orders o
     JOIN public.tables t ON ((o.table_id = t.id)))
  WHERE (t.restaurant_id IS NOT NULL))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()));


--
-- Name: restaurants Users can view own restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own restaurant" ON public.restaurants FOR SELECT USING ((id = public.get_user_restaurant_id()));


--
-- Name: order_items Users can view own restaurant order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own restaurant order items" ON public.order_items USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.restaurant_id = public.get_user_restaurant_id())))));


--
-- Name: printers Users can view own restaurant printers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own restaurant printers" ON public.printers USING ((restaurant_id = public.get_user_restaurant_id()));


--
-- Name: cash_registers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_registers cash_registers_restaurant_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cash_registers_restaurant_policy ON public.cash_registers USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: menu_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_categories menu_categories_authenticated_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY menu_categories_authenticated_manage ON public.menu_categories TO authenticated USING (((restaurant_id = public.get_user_restaurant_id()) OR (public.get_my_role() = 'admin'::text)));


--
-- Name: menu_categories menu_categories_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY menu_categories_public_select ON public.menu_categories FOR SELECT USING (true);


--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items menu_items_admin_or_staff_update_cost; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY menu_items_admin_or_staff_update_cost ON public.menu_items FOR UPDATE TO authenticated USING (((public.get_my_role() = ANY (ARRAY['admin'::text, 'staff'::text])) AND (restaurant_id = public.get_user_restaurant_id()))) WITH CHECK (((public.get_my_role() = ANY (ARRAY['admin'::text, 'staff'::text])) AND (restaurant_id = public.get_user_restaurant_id())));


--
-- Name: menu_items menu_items_authenticated_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY menu_items_authenticated_manage ON public.menu_items TO authenticated USING (((restaurant_id = public.get_user_restaurant_id()) OR (public.get_my_role() = 'admin'::text)));


--
-- Name: menu_items menu_items_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY menu_items_public_select ON public.menu_items FOR SELECT USING ((archived = false));


--
-- Name: modifier_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: modifier_groups modifier_groups_authenticated_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modifier_groups_authenticated_manage ON public.modifier_groups USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin())) WITH CHECK (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: modifier_groups modifier_groups_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modifier_groups_public_select ON public.modifier_groups FOR SELECT USING (true);


--
-- Name: modifiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;

--
-- Name: modifiers modifiers_authenticated_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modifiers_authenticated_manage ON public.modifiers USING ((modifier_group_id IN ( SELECT modifier_groups.id
   FROM public.modifier_groups
  WHERE ((modifier_groups.restaurant_id = public.get_user_restaurant_id()) OR public.is_admin())))) WITH CHECK ((modifier_group_id IN ( SELECT modifier_groups.id
   FROM public.modifier_groups
  WHERE ((modifier_groups.restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()))));


--
-- Name: modifiers modifiers_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modifiers_public_select ON public.modifiers FOR SELECT USING (true);


--
-- Name: order_item_modifiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items order_items_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_insert_policy ON public.order_items FOR INSERT WITH CHECK (true);


--
-- Name: order_items order_items_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_public_insert ON public.order_items FOR INSERT WITH CHECK (true);


--
-- Name: order_items order_items_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_public_select ON public.order_items FOR SELECT USING (true);


--
-- Name: order_items order_items_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_select_policy ON public.order_items FOR SELECT USING (true);


--
-- Name: order_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: order_payments order_payments_restaurant_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_payments_restaurant_policy ON public.order_payments USING (((order_id IN ( SELECT o.id
   FROM public.orders o
  WHERE (o.restaurant_id = public.get_user_restaurant_id()))) OR public.is_admin()));


--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: orders orders_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_delete_policy ON public.orders FOR DELETE USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: orders orders_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_insert_policy ON public.orders FOR INSERT WITH CHECK (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: orders orders_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_public_insert ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: orders orders_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_public_select ON public.orders FOR SELECT USING (true);


--
-- Name: orders orders_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_select_policy ON public.orders FOR SELECT USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: orders orders_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_update_policy ON public.orders FOR UPDATE USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin())) WITH CHECK (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: printers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

--
-- Name: printers printers_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY printers_public_select ON public.printers FOR SELECT USING (true);


--
-- Name: printers printers_restaurant_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY printers_restaurant_policy ON public.printers USING (((restaurant_id = public.get_user_restaurant_id()) OR public.is_admin()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_own_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_own_policy ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles profiles_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: restaurants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurants restaurants_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY restaurants_admin_policy ON public.restaurants USING (public.is_admin());


--
-- Name: restaurants restaurants_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY restaurants_select_policy ON public.restaurants FOR SELECT USING (true);


--
-- Name: tables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

--
-- Name: tables tables_authenticated_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tables_authenticated_manage ON public.tables TO authenticated USING (((restaurant_id = public.get_user_restaurant_id()) OR (public.get_my_role() = 'admin'::text)));


--
-- Name: tables tables_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tables_public_select ON public.tables FOR SELECT USING (true);


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow admins to upload menu images 1xs2w12_0; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow admins to upload menu images 1xs2w12_0" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'menu-images'::text) AND (public.get_my_role() = 'admin'::text)));


--
-- Name: objects Allow anyone to view menu images 1xs2w12_0; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow anyone to view menu images 1xs2w12_0" ON storage.objects FOR SELECT USING ((bucket_id = 'menu-images'::text));


--
-- Name: objects Authenticated users can delete restaurant assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can delete restaurant assets" ON storage.objects FOR DELETE USING (((bucket_id = 'restaurant-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can update restaurant assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can update restaurant assets" ON storage.objects FOR UPDATE USING (((bucket_id = 'restaurant-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can upload restaurant assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload restaurant assets" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'restaurant-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Public read access for restaurant assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public read access for restaurant assets" ON storage.objects FOR SELECT USING ((bucket_id = 'restaurant-assets'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime order_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_items;


--
-- Name: supabase_realtime_messages_publication order_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY public.order_items;


--
-- Name: supabase_realtime orders; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.orders;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

