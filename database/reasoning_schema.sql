-- =====================================================
-- Production-Ready AI Reasoning System Database Schema
-- =====================================================
-- This schema supports the complete reasoning system with:
-- - Reasoning sessions and phases tracking
-- - User preferences and performance metrics  
-- - Caching system with semantic similarity
-- - Template usage analytics
-- - Long-term memory and learning

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For embeddings (requires pgvector)

-- =====================================================
-- CORE REASONING TABLES
-- =====================================================

-- Main reasoning sessions table
CREATE TABLE reasoning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    project_id UUID, -- Optional reference to projects
    query TEXT NOT NULL,
    complexity_level VARCHAR(50) NOT NULL CHECK (complexity_level IN ('SIMPLE', 'MODERATE', 'COMPLEX', 'CREATIVE')),
    complexity_confidence DECIMAL(3,2) NOT NULL CHECK (complexity_confidence >= 0 AND complexity_confidence <= 1),
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    duration INTEGER NOT NULL DEFAULT 0, -- in milliseconds
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-5',
    template_used VARCHAR(255),
    correction_count INTEGER NOT NULL DEFAULT 0,
    user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
    user_feedback_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual reasoning phases within sessions
CREATE TABLE reasoning_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES reasoning_sessions(id) ON DELETE CASCADE,
    phase_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0, -- in milliseconds
    confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    temperature DECIMAL(3,2) DEFAULT 0.5 CHECK (temperature >= 0 AND temperature <= 2),
    has_correction BOOLEAN NOT NULL DEFAULT FALSE,
    correction_count INTEGER NOT NULL DEFAULT 0,
    phase_order INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self-corrections detected during reasoning
CREATE TABLE reasoning_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES reasoning_sessions(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES reasoning_phases(id) ON DELETE CASCADE,
    trigger_phrase VARCHAR(255) NOT NULL,
    original_content TEXT NOT NULL,
    corrected_content TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    correction_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PREFERENCES AND MEMORY
-- =====================================================

-- User reasoning preferences
CREATE TABLE user_reasoning_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_complexity VARCHAR(50) CHECK (preferred_complexity IN ('SIMPLE', 'MODERATE', 'COMPLEX', 'CREATIVE')),
    always_show_thinking BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_verbosity VARCHAR(50) NOT NULL DEFAULT 'detailed' CHECK (preferred_verbosity IN ('concise', 'detailed', 'comprehensive')),
    enable_parallel_reasoning BOOLEAN NOT NULL DEFAULT FALSE,
    default_model VARCHAR(100) DEFAULT 'gpt-5',
    max_cost_per_session DECIMAL(8,4) DEFAULT 1.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User performance metrics (aggregated)
CREATE TABLE user_reasoning_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(12,6) NOT NULL DEFAULT 0.0,
    avg_satisfaction DECIMAL(3,2) DEFAULT NULL,
    favorite_templates TEXT[] DEFAULT '{}',
    complexity_distribution JSONB NOT NULL DEFAULT '{}', -- {"SIMPLE": 10, "COMPLEX": 5}
    success_rate_by_complexity JSONB NOT NULL DEFAULT '{}',
    monthly_usage JSONB NOT NULL DEFAULT '{}', -- {"2024-01": {"sessions": 20, "tokens": 5000}}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical complexity assessments for learning
CREATE TABLE complexity_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_hash VARCHAR(64) NOT NULL, -- SHA256 of normalized query
    query_preview TEXT NOT NULL, -- First 200 chars for human readability
    predicted_complexity VARCHAR(50) NOT NULL,
    actual_complexity VARCHAR(50), -- Set when user provides feedback
    confidence DECIMAL(3,2) NOT NULL,
    pattern_matches TEXT[] DEFAULT '{}',
    context_tokens INTEGER DEFAULT 0,
    feedback_provided BOOLEAN NOT NULL DEFAULT FALSE,
    assessment_method VARCHAR(50) NOT NULL DEFAULT 'ensemble', -- 'pattern', 'llm', 'ensemble'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CACHING SYSTEM
-- =====================================================

-- Semantic query cache with embeddings
CREATE TABLE reasoning_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(64) NOT NULL UNIQUE, -- Hash of query + context
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    query_embedding vector(1536), -- OpenAI embedding dimension
    complexity_level VARCHAR(50) NOT NULL,
    result JSONB NOT NULL, -- Full ReasoningResult object
    hit_count INTEGER NOT NULL DEFAULT 0,
    similarity_threshold DECIMAL(4,3) NOT NULL DEFAULT 0.85,
    tags TEXT[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache performance tracking
CREATE TABLE cache_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_requests INTEGER NOT NULL DEFAULT 0,
    cache_hits INTEGER NOT NULL DEFAULT 0,
    cache_misses INTEGER NOT NULL DEFAULT 0,
    hit_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    avg_similarity DECIMAL(4,3) DEFAULT NULL,
    tokens_saved INTEGER NOT NULL DEFAULT 0,
    cost_saved DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- =====================================================
-- TEMPLATE SYSTEM
-- =====================================================

-- Template usage analytics
CREATE TABLE template_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id VARCHAR(255) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES reasoning_sessions(id) ON DELETE CASCADE,
    usage_duration INTEGER NOT NULL, -- in milliseconds
    usage_cost DECIMAL(10,6) NOT NULL,
    was_successful BOOLEAN NOT NULL DEFAULT TRUE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    complexity_match BOOLEAN NOT NULL DEFAULT TRUE, -- Did template complexity match actual?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom user templates
CREATE TABLE user_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    complexity VARCHAR(50) NOT NULL,
    query_patterns TEXT[] NOT NULL,
    phases JSONB NOT NULL, -- Array of phase definitions
    metadata JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(4,3) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARALLEL REASONING SYSTEM
-- =====================================================

-- Parallel reasoning paths for complex queries
CREATE TABLE reasoning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES reasoning_sessions(id) ON DELETE CASCADE,
    path_name VARCHAR(100) NOT NULL, -- 'analytical', 'creative', 'systematic'
    approach VARCHAR(50) NOT NULL,
    phases JSONB NOT NULL, -- Array of phases for this path
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    token_count INTEGER NOT NULL DEFAULT 0,
    execution_time INTEGER NOT NULL DEFAULT 0,
    final_result TEXT,
    was_selected BOOLEAN NOT NULL DEFAULT FALSE, -- Was this path's result used in final synthesis?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND MONITORING
-- =====================================================

-- System-wide reasoning analytics
CREATE TABLE reasoning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    sessions_by_complexity JSONB NOT NULL DEFAULT '{}',
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(12,6) NOT NULL DEFAULT 0.0,
    avg_session_duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
    avg_user_satisfaction DECIMAL(3,2) DEFAULT NULL,
    error_rate DECIMAL(4,3) NOT NULL DEFAULT 0.0,
    correction_rate DECIMAL(4,3) NOT NULL DEFAULT 0.0,
    template_usage JSONB NOT NULL DEFAULT '{}',
    model_usage JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Error tracking for debugging and improvement
CREATE TABLE reasoning_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES reasoning_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_context JSONB NOT NULL DEFAULT '{}',
    phase_type VARCHAR(50),
    query_preview TEXT,
    is_recoverable BOOLEAN NOT NULL DEFAULT FALSE,
    recovery_attempted BOOLEAN NOT NULL DEFAULT FALSE,
    recovery_successful BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Reasoning sessions indexes
CREATE INDEX idx_reasoning_sessions_user_id ON reasoning_sessions(user_id);
CREATE INDEX idx_reasoning_sessions_created_at ON reasoning_sessions(created_at DESC);
CREATE INDEX idx_reasoning_sessions_complexity ON reasoning_sessions(complexity_level);
CREATE INDEX idx_reasoning_sessions_template ON reasoning_sessions(template_used);
CREATE INDEX idx_reasoning_sessions_project ON reasoning_sessions(project_id);

-- Reasoning phases indexes
CREATE INDEX idx_reasoning_phases_session_id ON reasoning_phases(session_id);
CREATE INDEX idx_reasoning_phases_type ON reasoning_phases(phase_type);
CREATE INDEX idx_reasoning_phases_order ON reasoning_phases(session_id, phase_order);

-- Cache indexes for fast lookup
CREATE INDEX idx_reasoning_cache_key ON reasoning_cache(cache_key);
CREATE INDEX idx_reasoning_cache_user ON reasoning_cache(user_id);
CREATE INDEX idx_reasoning_cache_expires ON reasoning_cache(expires_at);
CREATE INDEX idx_reasoning_cache_similarity ON reasoning_cache USING ivfflat (query_embedding vector_cosine_ops);

-- Template analytics indexes
CREATE INDEX idx_template_analytics_template_id ON template_analytics(template_id);
CREATE INDEX idx_template_analytics_user_id ON template_analytics(user_id);
CREATE INDEX idx_template_analytics_created_at ON template_analytics(created_at DESC);

-- Complexity assessments indexes
CREATE INDEX idx_complexity_assessments_hash ON complexity_assessments(query_hash);
CREATE INDEX idx_complexity_assessments_user ON complexity_assessments(user_id);
CREATE INDEX idx_complexity_assessments_created ON complexity_assessments(created_at DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update user reasoning metrics
CREATE OR REPLACE FUNCTION update_user_reasoning_metrics()
RETURNS TRIGGER AS $$
DECLARE
    user_metrics_id UUID;
BEGIN
    -- Insert or update user metrics
    INSERT INTO user_reasoning_metrics (user_id, total_sessions, total_tokens, total_cost)
    VALUES (NEW.user_id, 1, NEW.total_tokens, NEW.total_cost)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_sessions = user_reasoning_metrics.total_sessions + 1,
        total_tokens = user_reasoning_metrics.total_tokens + NEW.total_tokens,
        total_cost = user_reasoning_metrics.total_cost + NEW.total_cost,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user metrics
CREATE TRIGGER trigger_update_user_metrics
    AFTER INSERT ON reasoning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reasoning_metrics();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM reasoning_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache hit statistics
CREATE OR REPLACE FUNCTION update_cache_hit(cache_key_param VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE reasoning_cache 
    SET hit_count = hit_count + 1,
        last_accessed = NOW()
    WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily analytics
CREATE OR REPLACE FUNCTION calculate_daily_reasoning_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    session_count INTEGER;
    complexity_dist JSONB;
    total_tokens_sum INTEGER;
    total_cost_sum DECIMAL(12,6);
    avg_duration INTEGER;
    avg_satisfaction DECIMAL(3,2);
    error_count INTEGER;
    correction_count INTEGER;
BEGIN
    -- Calculate basic metrics
    SELECT COUNT(*), SUM(total_tokens), SUM(total_cost), AVG(duration)::INTEGER
    INTO session_count, total_tokens_sum, total_cost_sum, avg_duration
    FROM reasoning_sessions
    WHERE DATE(created_at) = target_date;
    
    -- Calculate complexity distribution
    SELECT jsonb_object_agg(complexity_level, count)
    INTO complexity_dist
    FROM (
        SELECT complexity_level, COUNT(*) as count
        FROM reasoning_sessions
        WHERE DATE(created_at) = target_date
        GROUP BY complexity_level
    ) t;
    
    -- Calculate average satisfaction
    SELECT AVG(user_feedback_rating)
    INTO avg_satisfaction
    FROM reasoning_sessions
    WHERE DATE(created_at) = target_date
    AND user_feedback_rating IS NOT NULL;
    
    -- Count errors and corrections
    SELECT COUNT(*)
    INTO error_count
    FROM reasoning_errors
    WHERE DATE(created_at) = target_date;
    
    SELECT SUM(correction_count)
    INTO correction_count
    FROM reasoning_sessions
    WHERE DATE(created_at) = target_date;
    
    -- Insert or update analytics
    INSERT INTO reasoning_analytics (
        date, total_sessions, sessions_by_complexity, total_tokens,
        total_cost, avg_session_duration, avg_user_satisfaction,
        error_rate, correction_rate
    )
    VALUES (
        target_date, 
        COALESCE(session_count, 0),
        COALESCE(complexity_dist, '{}'),
        COALESCE(total_tokens_sum, 0),
        COALESCE(total_cost_sum, 0.0),
        COALESCE(avg_duration, 0),
        avg_satisfaction,
        CASE WHEN session_count > 0 THEN error_count::DECIMAL / session_count ELSE 0 END,
        CASE WHEN session_count > 0 THEN correction_count::DECIMAL / session_count ELSE 0 END
    )
    ON CONFLICT (date)
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        sessions_by_complexity = EXCLUDED.sessions_by_complexity,
        total_tokens = EXCLUDED.total_tokens,
        total_cost = EXCLUDED.total_cost,
        avg_session_duration = EXCLUDED.avg_session_duration,
        avg_user_satisfaction = EXCLUDED.avg_user_satisfaction,
        error_rate = EXCLUDED.error_rate,
        correction_rate = EXCLUDED.correction_rate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =====================================================

-- Enable RLS on all user-related tables
ALTER TABLE reasoning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reasoning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reasoning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

-- Policies for reasoning_sessions
CREATE POLICY "Users can view their own reasoning sessions"
ON reasoning_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reasoning sessions"
ON reasoning_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policies for user preferences
CREATE POLICY "Users can manage their own preferences"
ON user_reasoning_preferences
TO authenticated
USING (auth.uid() = user_id);

-- Policies for user metrics (read-only for users)
CREATE POLICY "Users can view their own metrics"
ON user_reasoning_metrics FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policies for cache (users can only see their own cached results)
CREATE POLICY "Users can access their own cache"
ON reasoning_cache
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL); -- Allow global cache entries

-- Policies for user templates
CREATE POLICY "Users can manage their own templates"
ON user_templates
TO authenticated
USING (auth.uid() = user_id OR is_public = true);

-- =====================================================
-- STORED PROCEDURES FOR API
-- =====================================================

-- Procedure to get user reasoning statistics
CREATE OR REPLACE FUNCTION get_user_reasoning_stats(target_user_id UUID)
RETURNS TABLE (
    total_sessions INTEGER,
    total_tokens INTEGER,
    total_cost DECIMAL(12,6),
    avg_satisfaction DECIMAL(3,2),
    favorite_complexity VARCHAR(50),
    success_rate DECIMAL(4,3),
    recent_activity JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.total_sessions,
        m.total_tokens,
        m.total_cost,
        m.avg_satisfaction,
        (SELECT key FROM jsonb_each(m.complexity_distribution) ORDER BY value DESC LIMIT 1) as favorite_complexity,
        COALESCE(
            (SELECT AVG(CASE WHEN user_feedback_rating >= 4 THEN 1.0 ELSE 0.0 END)
             FROM reasoning_sessions 
             WHERE user_id = target_user_id AND user_feedback_rating IS NOT NULL), 
            0.8
        )::DECIMAL(4,3) as success_rate,
        jsonb_build_object(
            'last_30_days', (
                SELECT COUNT(*) FROM reasoning_sessions 
                WHERE user_id = target_user_id 
                AND created_at > NOW() - INTERVAL '30 days'
            ),
            'this_week', (
                SELECT COUNT(*) FROM reasoning_sessions 
                WHERE user_id = target_user_id 
                AND created_at > NOW() - INTERVAL '7 days'
            )
        ) as recent_activity
    FROM user_reasoning_metrics m
    WHERE m.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA AND CLEANUP JOBS
-- =====================================================

-- Schedule cleanup job (this would be handled by cron or similar)
-- SELECT cron.schedule('cleanup-reasoning-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');
-- SELECT cron.schedule('daily-analytics', '0 1 * * *', 'SELECT calculate_daily_reasoning_analytics();');

COMMENT ON SCHEMA public IS 'Production-Ready AI Reasoning System Database Schema - Supports complex reasoning workflows, caching, analytics, and user preferences';