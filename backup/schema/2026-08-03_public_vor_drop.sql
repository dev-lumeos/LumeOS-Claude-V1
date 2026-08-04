--
-- PostgreSQL database dump
--

\restrict YTfSGOPWhgLkyopLEUrhFfPVAvqMjEM90bj5VgXsMsDRwZ3uf4kfKMNUerUIgKK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: wo_phase; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.wo_phase AS ENUM (
    '1',
    '2',
    '3'
);


ALTER TYPE public.wo_phase OWNER TO postgres;

--
-- Name: wo_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.wo_state AS ENUM (
    'wo_generated',
    'graph_validated',
    'queue_released',
    'blocked',
    'ready',
    'dispatched',
    'running',
    'done',
    'failed',
    'reviewed',
    'retry_scheduled',
    'closed',
    'cancelled',
    'graph_repair_pending'
);


ALTER TYPE public.wo_state OWNER TO postgres;

--
-- Name: wo_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.wo_type AS ENUM (
    'micro',
    'macro'
);


ALTER TYPE public.wo_type OWNER TO postgres;

--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: execution_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_id uuid NOT NULL,
    wo_id character varying(100) NOT NULL,
    artefakt_hash character varying(72) NOT NULL,
    nonce character varying(64) NOT NULL,
    issued_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    issuer_key_id character varying(32) NOT NULL,
    sat_check_results jsonb NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.execution_tokens OWNER TO postgres;

--
-- Name: governance_artefacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.governance_artefacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artefakt_hash character varying(72) NOT NULL,
    wo_id character varying(100) NOT NULL,
    source_macro character varying(255),
    compiled_by character varying(100) NOT NULL,
    compiled_at timestamp with time zone NOT NULL,
    artefakt_json jsonb NOT NULL,
    sat_check_result character varying(10),
    sat_check_details jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT governance_artefacts_sat_check_result_check CHECK (((sat_check_result)::text = ANY ((ARRAY['pass'::character varying, 'reject'::character varying])::text[])))
);


ALTER TABLE public.governance_artefacts OWNER TO postgres;

--
-- Name: wo_failure_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wo_failure_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wo_id character varying(100) NOT NULL,
    batch_id character varying(100),
    failure_class character varying(50) NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    node character varying(20),
    agent_type character varying(50),
    error_message text,
    error_details jsonb,
    "timestamp" timestamp with time zone DEFAULT now(),
    CONSTRAINT wo_failure_events_failure_class_check CHECK (((failure_class)::text = ANY ((ARRAY['technical_transient'::character varying, 'technical_persistent'::character varying, 'semantic_output'::character varying, 'scope_violation'::character varying, 'dependency_invalid'::character varying, 'guardrail_violation'::character varying])::text[]))),
    CONSTRAINT wo_failure_events_node_check CHECK (((node)::text = ANY ((ARRAY['spark-a'::character varying, 'spark-b'::character varying, 'openrouter'::character varying, 'external'::character varying])::text[])))
);


ALTER TABLE public.wo_failure_events OWNER TO postgres;

--
-- Name: workorders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workorders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wo_id character varying(100) NOT NULL,
    batch_id character varying(100) NOT NULL,
    wo_type public.wo_type NOT NULL,
    agent_type character varying(50) NOT NULL,
    state public.wo_state DEFAULT 'wo_generated'::public.wo_state NOT NULL,
    phase public.wo_phase NOT NULL,
    scope_files text[] NOT NULL,
    task text[] NOT NULL,
    blocked_by text[] DEFAULT '{}'::text[],
    conflicts_with text[] DEFAULT '{}'::text[],
    acceptance_auto_checks text[] DEFAULT '{}'::text[],
    acceptance_review_checks text[] DEFAULT '{}'::text[],
    acceptance_human_checks text[] DEFAULT '{}'::text[],
    retry_max_attempts integer DEFAULT 3,
    retry_attempt_number integer DEFAULT 0,
    retry_context jsonb,
    failure_class character varying(50),
    assigned_node character varying(20),
    execution_token_id uuid,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    source_subtask_id character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    wo_category text,
    wo_module text,
    wo_complexity text,
    wo_risk text,
    db_access text,
    files_allowed text[] DEFAULT '{}'::text[],
    files_blocked text[] DEFAULT '{}'::text[],
    assigned_spark text,
    routing_reason text,
    needs_db_check boolean DEFAULT false,
    requires_schema_change boolean DEFAULT false,
    wo_priority integer DEFAULT 2,
    CONSTRAINT workorders_db_access_check CHECK ((db_access = ANY (ARRAY['none'::text, 'read'::text, 'write'::text, 'migration'::text]))),
    CONSTRAINT workorders_wo_complexity_check CHECK ((wo_complexity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT workorders_wo_risk_check CHECK ((wo_risk = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
);


ALTER TABLE public.workorders OWNER TO postgres;

--
-- Name: execution_tokens execution_tokens_nonce_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_tokens
    ADD CONSTRAINT execution_tokens_nonce_key UNIQUE (nonce);


--
-- Name: execution_tokens execution_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_tokens
    ADD CONSTRAINT execution_tokens_pkey PRIMARY KEY (id);


--
-- Name: execution_tokens execution_tokens_token_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_tokens
    ADD CONSTRAINT execution_tokens_token_id_key UNIQUE (token_id);


--
-- Name: governance_artefacts governance_artefacts_artefakt_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governance_artefacts
    ADD CONSTRAINT governance_artefacts_artefakt_hash_key UNIQUE (artefakt_hash);


--
-- Name: governance_artefacts governance_artefacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governance_artefacts
    ADD CONSTRAINT governance_artefacts_pkey PRIMARY KEY (id);


--
-- Name: wo_failure_events wo_failure_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wo_failure_events
    ADD CONSTRAINT wo_failure_events_pkey PRIMARY KEY (id);


--
-- Name: workorders workorders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workorders
    ADD CONSTRAINT workorders_pkey PRIMARY KEY (id);


--
-- Name: workorders workorders_wo_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workorders
    ADD CONSTRAINT workorders_wo_id_key UNIQUE (wo_id);


--
-- Name: idx_execution_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_tokens_expires_at ON public.execution_tokens USING btree (expires_at);


--
-- Name: idx_execution_tokens_nonce; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_tokens_nonce ON public.execution_tokens USING btree (nonce);


--
-- Name: idx_execution_tokens_wo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_tokens_wo_id ON public.execution_tokens USING btree (wo_id);


--
-- Name: idx_governance_artefacts_compiled_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_governance_artefacts_compiled_at ON public.governance_artefacts USING btree (compiled_at);


--
-- Name: idx_governance_artefacts_wo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_governance_artefacts_wo_id ON public.governance_artefacts USING btree (wo_id);


--
-- Name: idx_wo_failure_events_failure_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wo_failure_events_failure_class ON public.wo_failure_events USING btree (failure_class);


--
-- Name: idx_wo_failure_events_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wo_failure_events_timestamp ON public.wo_failure_events USING btree ("timestamp");


--
-- Name: idx_wo_failure_events_wo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wo_failure_events_wo_id ON public.wo_failure_events USING btree (wo_id);


--
-- Name: idx_workorders_agent_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_agent_type ON public.workorders USING btree (agent_type);


--
-- Name: idx_workorders_assigned_spark; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_assigned_spark ON public.workorders USING btree (assigned_spark);


--
-- Name: idx_workorders_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_batch_id ON public.workorders USING btree (batch_id);


--
-- Name: idx_workorders_phase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_phase ON public.workorders USING btree (phase);


--
-- Name: idx_workorders_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_state ON public.workorders USING btree (state);


--
-- Name: idx_workorders_wo_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_wo_module ON public.workorders USING btree (wo_module);


--
-- Name: idx_workorders_wo_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workorders_wo_priority ON public.workorders USING btree (wo_priority);


--
-- Name: workorders workorders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER workorders_updated_at BEFORE UPDATE ON public.workorders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: execution_tokens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.execution_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: governance_artefacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.governance_artefacts ENABLE ROW LEVEL SECURITY;

--
-- Name: wo_failure_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wo_failure_events ENABLE ROW LEVEL SECURITY;

--
-- Name: workorders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workorders ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION update_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at() TO service_role;


--
-- Name: TABLE execution_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.execution_tokens TO anon;
GRANT ALL ON TABLE public.execution_tokens TO authenticated;
GRANT ALL ON TABLE public.execution_tokens TO service_role;


--
-- Name: TABLE governance_artefacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.governance_artefacts TO anon;
GRANT ALL ON TABLE public.governance_artefacts TO authenticated;
GRANT ALL ON TABLE public.governance_artefacts TO service_role;


--
-- Name: TABLE wo_failure_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wo_failure_events TO anon;
GRANT ALL ON TABLE public.wo_failure_events TO authenticated;
GRANT ALL ON TABLE public.wo_failure_events TO service_role;


--
-- Name: TABLE workorders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workorders TO anon;
GRANT ALL ON TABLE public.workorders TO authenticated;
GRANT ALL ON TABLE public.workorders TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict YTfSGOPWhgLkyopLEUrhFfPVAvqMjEM90bj5VgXsMsDRwZ3uf4kfKMNUerUIgKK

