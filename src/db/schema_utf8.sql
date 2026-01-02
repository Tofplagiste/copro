


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    matching_owner_id INTEGER;
    user_full_name TEXT;
    should_approve BOOLEAN := FALSE;
    user_status TEXT := 'pending';
BEGIN
    -- A. R├®cup├®ration du nom
    user_full_name := NEW.raw_user_meta_data->>'full_name';
    IF user_full_name IS NULL OR user_full_name = '' THEN
        user_full_name := 'Nouveau Copropri├®taire';
    END IF;

    -- B. Recherche du propri├®taire (Lecture seule pour l'instant)
    BEGIN
        SELECT id INTO matching_owner_id
        FROM public.owners
        WHERE LOWER(email) = LOWER(NEW.email)
        LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
        matching_owner_id := NULL;
    END;

    -- C. Calcul des status (Si on a trouv├® un match)
    IF matching_owner_id IS NOT NULL THEN
        should_approve := FALSE; -- On reste prudent (validation manuelle requise par ton p├¿re)
        user_status := 'pending';
    END IF;

    -- D. CRUCIAL : On cr├®e le Profil D'ABORD (pour que l'ID existe)
    INSERT INTO public.profiles (id, email, full_name, role, is_approved, status)
    VALUES (
        NEW.id, 
        NEW.email, 
        user_full_name, 
        'user', 
        should_approve, 
        user_status
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- E. On fait la liaison ENSUITE (Maintenant que le profil existe, ├ºa passe !)
    IF matching_owner_id IS NOT NULL THEN
        UPDATE public.owners
        SET profile_id = NEW.id
        WHERE id = matching_owner_id;
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "initial_balance" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."budget_items" (
    "id" integer NOT NULL,
    "category" "text" NOT NULL,
    "name" "text" NOT NULL,
    "reel" numeric(12,2) DEFAULT 0,
    "previ" numeric(12,2) DEFAULT 0,
    "previ_n1" numeric(12,2) DEFAULT 0,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "budget_items_category_check" CHECK (("category" = ANY (ARRAY['general'::"text", 'special'::"text", 'menage'::"text", 'travaux'::"text"])))
);


ALTER TABLE "public"."budget_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."budget_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."budget_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."budget_items_id_seq" OWNED BY "public"."budget_items"."id";



CREATE TABLE IF NOT EXISTS "public"."carnet_admin" (
    "id" integer NOT NULL,
    "syndic_name" "text",
    "syndic_address" "text",
    "syndic_phone" "text",
    "ag_nomination" "date",
    "fin_mandat" "date",
    "conseil_syndical" "jsonb" DEFAULT '[]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carnet_admin" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carnet_admin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carnet_admin_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carnet_admin_id_seq" OWNED BY "public"."carnet_admin"."id";



CREATE TABLE IF NOT EXISTS "public"."carnet_general" (
    "id" integer NOT NULL,
    "address" "text",
    "lots_description" "text",
    "reglement" "text",
    "modifications" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carnet_general" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carnet_general_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carnet_general_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carnet_general_id_seq" OWNED BY "public"."carnet_general"."id";



CREATE TABLE IF NOT EXISTS "public"."carnet_prestataires" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "contrat" "text",
    "contact" "text",
    "phones" "jsonb" DEFAULT '[]'::"jsonb",
    "emails" "jsonb" DEFAULT '[]'::"jsonb",
    "address" "text",
    "codes" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carnet_prestataires" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carnet_prestataires_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carnet_prestataires_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carnet_prestataires_id_seq" OWNED BY "public"."carnet_prestataires"."id";



CREATE TABLE IF NOT EXISTS "public"."carnet_technique" (
    "id" integer NOT NULL,
    "construction" "text",
    "surface" "text",
    "toiture" "text",
    "facade" "text",
    "code_peinture" "text",
    "chauffage" "text",
    "eau_chaude" "text",
    "diagnostics" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carnet_technique" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carnet_technique_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carnet_technique_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carnet_technique_id_seq" OWNED BY "public"."carnet_technique"."id";



CREATE TABLE IF NOT EXISTS "public"."carnet_travaux" (
    "id" integer NOT NULL,
    "annee" "text" NOT NULL,
    "nature" "text" NOT NULL,
    "entreprise" "text",
    "cout" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carnet_travaux" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carnet_travaux_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carnet_travaux_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carnet_travaux_id_seq" OWNED BY "public"."carnet_travaux"."id";



CREATE TABLE IF NOT EXISTS "public"."credit_copros" (
    "id" integer NOT NULL,
    "simulation_id" integer,
    "copro_name" "text" NOT NULL,
    "commune" "text",
    "lot" "text",
    "tantiemes" integer DEFAULT 0,
    "a_cellier" boolean DEFAULT false,
    "a_balcon" boolean DEFAULT false,
    "grand_balcon" boolean DEFAULT false,
    "tant_cellier" integer DEFAULT 0,
    "apport_personnel" numeric(12,2) DEFAULT 0,
    "paiement_comptant" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."credit_copros" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."credit_copros_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."credit_copros_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."credit_copros_id_seq" OWNED BY "public"."credit_copros"."id";



CREATE TABLE IF NOT EXISTS "public"."credit_simulations" (
    "id" integer NOT NULL,
    "created_by" "uuid",
    "title" "text" DEFAULT 'Simulation Cr├®dit'::"text",
    "duree" integer DEFAULT 120,
    "taux_nominal" numeric(6,3) DEFAULT 3.5,
    "taux_assurance" numeric(6,3) DEFAULT 0.36,
    "fonds_travaux" numeric(12,2) DEFAULT 0,
    "parties_communes" numeric(12,2) DEFAULT 0,
    "grand_balcon" numeric(12,2) DEFAULT 0,
    "petits_balcons" numeric(12,2) DEFAULT 0,
    "celliers" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."credit_simulations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."credit_simulations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."credit_simulations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."credit_simulations_id_seq" OWNED BY "public"."credit_simulations"."id";



CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "code" "text" NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_operations" (
    "id" integer NOT NULL,
    "account_id" "text",
    "date" "date" NOT NULL,
    "due_date" "date",
    "accounting_date" "date",
    "description" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "category_code" "text",
    "owner_id" integer,
    "is_reconciled" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."finance_operations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."finance_operations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."finance_operations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."finance_operations_id_seq" OWNED BY "public"."finance_operations"."id";



CREATE TABLE IF NOT EXISTS "public"."owners" (
    "id" integer NOT NULL,
    "profile_id" "uuid",
    "name" "text" NOT NULL,
    "apt" "text",
    "lot" "text",
    "tantiemes" integer DEFAULT 0 NOT NULL,
    "has_meter" boolean DEFAULT true,
    "exo_gest" boolean DEFAULT false,
    "exo_men" boolean DEFAULT false,
    "email" "text",
    "phone" "text",
    "address" "text",
    "is_common" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."owners" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."owners_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."owners_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."owners_id_seq" OWNED BY "public"."owners"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'user'::"text",
    "is_approved" boolean DEFAULT false,
    "status" "text" DEFAULT 'pending'::"text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'syndic'::"text", 'user'::"text"]))),
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vote_copros" (
    "id" integer NOT NULL,
    "session_id" integer,
    "owner_id" integer,
    "name" "text" NOT NULL,
    "tantiemes" integer NOT NULL,
    "presence" "text",
    "procuration_to" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vote_copros_presence_check" CHECK (("presence" = ANY (ARRAY['present'::"text", 'procuration'::"text", 'correspondance'::"text", 'absent'::"text"])))
);


ALTER TABLE "public"."vote_copros" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vote_copros_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vote_copros_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vote_copros_id_seq" OWNED BY "public"."vote_copros"."id";



CREATE TABLE IF NOT EXISTS "public"."vote_participations" (
    "id" integer NOT NULL,
    "point_id" integer,
    "copro_id" integer,
    "vote_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vote_participations_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['pour'::"text", 'contre'::"text", 'abstention'::"text"])))
);


ALTER TABLE "public"."vote_participations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vote_participations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vote_participations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vote_participations_id_seq" OWNED BY "public"."vote_participations"."id";



CREATE TABLE IF NOT EXISTS "public"."vote_points" (
    "id" integer NOT NULL,
    "session_id" integer,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "title" "text" NOT NULL,
    "article" "text" DEFAULT '24'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vote_points_article_check" CHECK (("article" = ANY (ARRAY['24'::"text", '25'::"text", '26'::"text", 'unanimite'::"text"])))
);


ALTER TABLE "public"."vote_points" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vote_points_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vote_points_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vote_points_id_seq" OWNED BY "public"."vote_points"."id";



CREATE TABLE IF NOT EXISTS "public"."vote_sessions" (
    "id" integer NOT NULL,
    "created_by" "uuid",
    "session_date" "date" NOT NULL,
    "title" "text" DEFAULT 'Assembl├®e G├®n├®rale'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "total_tantiemes" integer DEFAULT 1000,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vote_sessions_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."vote_sessions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vote_sessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vote_sessions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vote_sessions_id_seq" OWNED BY "public"."vote_sessions"."id";



CREATE TABLE IF NOT EXISTS "public"."water_meters" (
    "id" integer NOT NULL,
    "owner_id" integer,
    "meter_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."water_meters" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."water_meters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."water_meters_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."water_meters_id_seq" OWNED BY "public"."water_meters"."id";



CREATE TABLE IF NOT EXISTS "public"."water_projections" (
    "id" integer NOT NULL,
    "owner_id" integer,
    "year" integer NOT NULL,
    "projected_volume" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."water_projections" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."water_projections_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."water_projections_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."water_projections_id_seq" OWNED BY "public"."water_projections"."id";



CREATE TABLE IF NOT EXISTS "public"."water_readings" (
    "id" integer NOT NULL,
    "owner_id" integer,
    "year" integer NOT NULL,
    "quarter" "text" NOT NULL,
    "old_value" numeric(12,2) DEFAULT 0,
    "new_value" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "water_readings_quarter_check" CHECK (("quarter" = ANY (ARRAY['T1'::"text", 'T2'::"text", 'T3'::"text", 'T4'::"text"])))
);


ALTER TABLE "public"."water_readings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."water_readings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."water_readings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."water_readings_id_seq" OWNED BY "public"."water_readings"."id";



CREATE TABLE IF NOT EXISTS "public"."water_settings" (
    "id" integer NOT NULL,
    "year" integer NOT NULL,
    "active_quarter" "text" DEFAULT 'T1'::"text",
    "price_mode" "text" DEFAULT 'annual'::"text",
    "invoice_total" numeric(12,2) DEFAULT 0,
    "annual_total" numeric(12,2) DEFAULT 0,
    "annual_sub" numeric(12,2) DEFAULT 0,
    "annual_vol" numeric(12,2) DEFAULT 0,
    "manual_price" numeric(8,4) DEFAULT 0,
    "sub_amount" numeric(12,2) DEFAULT 0,
    "proj_price" numeric(8,4) DEFAULT 5.08,
    "proj_sub" numeric(12,2) DEFAULT 92.21,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "water_settings_active_quarter_check" CHECK (("active_quarter" = ANY (ARRAY['T1'::"text", 'T2'::"text", 'T3'::"text", 'T4'::"text"]))),
    CONSTRAINT "water_settings_price_mode_check" CHECK (("price_mode" = ANY (ARRAY['annual'::"text", 'manual'::"text", 'invoice'::"text"])))
);


ALTER TABLE "public"."water_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."water_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."water_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."water_settings_id_seq" OWNED BY "public"."water_settings"."id";



ALTER TABLE ONLY "public"."budget_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."budget_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carnet_admin" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carnet_admin_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carnet_general" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carnet_general_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carnet_prestataires" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carnet_prestataires_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carnet_technique" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carnet_technique_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carnet_travaux" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carnet_travaux_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."credit_copros" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."credit_copros_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."credit_simulations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."credit_simulations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."finance_operations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."finance_operations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."owners" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."owners_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vote_copros" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vote_copros_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vote_participations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vote_participations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vote_points" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vote_points_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vote_sessions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vote_sessions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."water_meters" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."water_meters_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."water_projections" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."water_projections_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."water_readings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."water_readings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."water_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."water_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carnet_admin"
    ADD CONSTRAINT "carnet_admin_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carnet_general"
    ADD CONSTRAINT "carnet_general_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carnet_prestataires"
    ADD CONSTRAINT "carnet_prestataires_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carnet_technique"
    ADD CONSTRAINT "carnet_technique_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carnet_travaux"
    ADD CONSTRAINT "carnet_travaux_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credit_copros"
    ADD CONSTRAINT "credit_copros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credit_simulations"
    ADD CONSTRAINT "credit_simulations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."finance_operations"
    ADD CONSTRAINT "finance_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."owners"
    ADD CONSTRAINT "owners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_copros"
    ADD CONSTRAINT "vote_copros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_participations"
    ADD CONSTRAINT "vote_participations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_participations"
    ADD CONSTRAINT "vote_participations_point_id_copro_id_key" UNIQUE ("point_id", "copro_id");



ALTER TABLE ONLY "public"."vote_points"
    ADD CONSTRAINT "vote_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_sessions"
    ADD CONSTRAINT "vote_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."water_meters"
    ADD CONSTRAINT "water_meters_owner_id_key" UNIQUE ("owner_id");



ALTER TABLE ONLY "public"."water_meters"
    ADD CONSTRAINT "water_meters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."water_projections"
    ADD CONSTRAINT "water_projections_owner_id_year_key" UNIQUE ("owner_id", "year");



ALTER TABLE ONLY "public"."water_projections"
    ADD CONSTRAINT "water_projections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."water_readings"
    ADD CONSTRAINT "water_readings_owner_id_year_quarter_key" UNIQUE ("owner_id", "year", "quarter");



ALTER TABLE ONLY "public"."water_readings"
    ADD CONSTRAINT "water_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."water_settings"
    ADD CONSTRAINT "water_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."water_settings"
    ADD CONSTRAINT "water_settings_year_key" UNIQUE ("year");



CREATE INDEX "idx_budget_items_category" ON "public"."budget_items" USING "btree" ("category");



CREATE INDEX "idx_credit_copros_simulation" ON "public"."credit_copros" USING "btree" ("simulation_id");



CREATE INDEX "idx_credit_simulations_created_by" ON "public"."credit_simulations" USING "btree" ("created_by");



CREATE INDEX "idx_finance_operations_account" ON "public"."finance_operations" USING "btree" ("account_id");



CREATE INDEX "idx_finance_operations_date" ON "public"."finance_operations" USING "btree" ("date");



CREATE INDEX "idx_owners_profile" ON "public"."owners" USING "btree" ("profile_id");



CREATE INDEX "idx_vote_copros_session" ON "public"."vote_copros" USING "btree" ("session_id");



CREATE INDEX "idx_vote_points_session" ON "public"."vote_points" USING "btree" ("session_id");



CREATE INDEX "idx_water_readings_owner" ON "public"."water_readings" USING "btree" ("owner_id", "year");



ALTER TABLE ONLY "public"."credit_copros"
    ADD CONSTRAINT "credit_copros_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "public"."credit_simulations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."credit_simulations"
    ADD CONSTRAINT "credit_simulations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_operations"
    ADD CONSTRAINT "finance_operations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_operations"
    ADD CONSTRAINT "finance_operations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."owners"
    ADD CONSTRAINT "owners_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_copros"
    ADD CONSTRAINT "vote_copros_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vote_copros"
    ADD CONSTRAINT "vote_copros_procuration_to_fkey" FOREIGN KEY ("procuration_to") REFERENCES "public"."vote_copros"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vote_copros"
    ADD CONSTRAINT "vote_copros_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."vote_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participations"
    ADD CONSTRAINT "vote_participations_copro_id_fkey" FOREIGN KEY ("copro_id") REFERENCES "public"."vote_copros"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participations"
    ADD CONSTRAINT "vote_participations_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "public"."vote_points"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_points"
    ADD CONSTRAINT "vote_points_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."vote_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_sessions"
    ADD CONSTRAINT "vote_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."water_meters"
    ADD CONSTRAINT "water_meters_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."water_projections"
    ADD CONSTRAINT "water_projections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."water_readings"
    ADD CONSTRAINT "water_readings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can update all profiles" ON "public"."profiles" FOR UPDATE USING (("public"."is_admin"() = true));



CREATE POLICY "Approved users can read budget" ON "public"."budget_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_approved" = true)))));



CREATE POLICY "Approved users can read owners" ON "public"."owners" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_approved" = true)))));



CREATE POLICY "Enable insert for auth trigger" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Syndic can manage budget" ON "public"."budget_items" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'syndic'::"text"])) AND ("profiles"."is_approved" = true)))));



CREATE POLICY "Syndic can manage owners" ON "public"."owners" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'syndic'::"text"])) AND ("profiles"."is_approved" = true)))));



CREATE POLICY "Users and Admins Access" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR ("public"."is_admin"() = true)));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users update own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."budget_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carnet_admin" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carnet_general" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carnet_prestataires" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carnet_technique" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carnet_travaux" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_copros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_simulations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."owners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_copros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_participations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."water_meters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."water_projections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."water_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."water_settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."budget_items" TO "anon";
GRANT ALL ON TABLE "public"."budget_items" TO "authenticated";
GRANT ALL ON TABLE "public"."budget_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."budget_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."budget_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."budget_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carnet_admin" TO "anon";
GRANT ALL ON TABLE "public"."carnet_admin" TO "authenticated";
GRANT ALL ON TABLE "public"."carnet_admin" TO "service_role";



GRANT ALL ON SEQUENCE "public"."carnet_admin_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."carnet_admin_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."carnet_admin_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carnet_general" TO "anon";
GRANT ALL ON TABLE "public"."carnet_general" TO "authenticated";
GRANT ALL ON TABLE "public"."carnet_general" TO "service_role";



GRANT ALL ON SEQUENCE "public"."carnet_general_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."carnet_general_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."carnet_general_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carnet_prestataires" TO "anon";
GRANT ALL ON TABLE "public"."carnet_prestataires" TO "authenticated";
GRANT ALL ON TABLE "public"."carnet_prestataires" TO "service_role";



GRANT ALL ON SEQUENCE "public"."carnet_prestataires_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."carnet_prestataires_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."carnet_prestataires_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carnet_technique" TO "anon";
GRANT ALL ON TABLE "public"."carnet_technique" TO "authenticated";
GRANT ALL ON TABLE "public"."carnet_technique" TO "service_role";



GRANT ALL ON SEQUENCE "public"."carnet_technique_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."carnet_technique_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."carnet_technique_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."carnet_travaux" TO "anon";
GRANT ALL ON TABLE "public"."carnet_travaux" TO "authenticated";
GRANT ALL ON TABLE "public"."carnet_travaux" TO "service_role";



GRANT ALL ON SEQUENCE "public"."carnet_travaux_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."carnet_travaux_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."carnet_travaux_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."credit_copros" TO "anon";
GRANT ALL ON TABLE "public"."credit_copros" TO "authenticated";
GRANT ALL ON TABLE "public"."credit_copros" TO "service_role";



GRANT ALL ON SEQUENCE "public"."credit_copros_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."credit_copros_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."credit_copros_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."credit_simulations" TO "anon";
GRANT ALL ON TABLE "public"."credit_simulations" TO "authenticated";
GRANT ALL ON TABLE "public"."credit_simulations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."credit_simulations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."credit_simulations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."credit_simulations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON TABLE "public"."finance_operations" TO "anon";
GRANT ALL ON TABLE "public"."finance_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_operations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."finance_operations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."finance_operations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."finance_operations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."owners" TO "anon";
GRANT ALL ON TABLE "public"."owners" TO "authenticated";
GRANT ALL ON TABLE "public"."owners" TO "service_role";



GRANT ALL ON SEQUENCE "public"."owners_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."owners_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."owners_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."vote_copros" TO "anon";
GRANT ALL ON TABLE "public"."vote_copros" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_copros" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_copros_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_copros_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_copros_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vote_participations" TO "anon";
GRANT ALL ON TABLE "public"."vote_participations" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_participations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_participations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_participations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_participations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vote_points" TO "anon";
GRANT ALL ON TABLE "public"."vote_points" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_points" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_points_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_points_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_points_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vote_sessions" TO "anon";
GRANT ALL ON TABLE "public"."vote_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."water_meters" TO "anon";
GRANT ALL ON TABLE "public"."water_meters" TO "authenticated";
GRANT ALL ON TABLE "public"."water_meters" TO "service_role";



GRANT ALL ON SEQUENCE "public"."water_meters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."water_meters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."water_meters_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."water_projections" TO "anon";
GRANT ALL ON TABLE "public"."water_projections" TO "authenticated";
GRANT ALL ON TABLE "public"."water_projections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."water_projections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."water_projections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."water_projections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."water_readings" TO "anon";
GRANT ALL ON TABLE "public"."water_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."water_readings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."water_readings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."water_readings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."water_readings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."water_settings" TO "anon";
GRANT ALL ON TABLE "public"."water_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."water_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."water_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."water_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."water_settings_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







