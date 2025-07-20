-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create product_embeddings table
CREATE TABLE IF NOT EXISTS product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    keywords TEXT[] NOT NULL,
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_category ON product_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_keywords ON product_embeddings USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_search ON product_embeddings USING GIN(search_vector);

-- Create function to update search_vector automatically
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.category, '') || ' ' || 
        COALESCE(NEW.brand, '') || ' ' ||
        COALESCE(array_to_string(NEW.keywords, ' '), '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
CREATE TRIGGER trigger_update_product_search_vector
    BEFORE INSERT OR UPDATE ON product_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    product_id INTEGER,
    name TEXT,
    description TEXT,
    category TEXT,
    brand TEXT,
    price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    keywords TEXT[],
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pe.product_id,
        pe.name,
        pe.description,
        pe.category,
        pe.brand,
        pe.price,
        pe.wholesale_price,
        pe.keywords,
        (
            -- Text similarity score
            ts_rank(pe.search_vector, plainto_tsquery('english', search_query)) * 0.4 +
            -- Keyword match score
            (
                SELECT COALESCE(
                    (SELECT COUNT(*) FROM unnest(pe.keywords) AS keyword 
                     WHERE keyword ILIKE '%' || ANY(string_to_array(lower(search_query), ' ')) || '%')::REAL / 
                    GREATEST(array_length(pe.keywords, 1), 1), 0
                )
            ) * 0.3 +
            -- Name similarity score
            (CASE 
                WHEN pe.name ILIKE '%' || search_query || '%' THEN 0.3
                WHEN pe.name ILIKE '%' || ANY(string_to_array(search_query, ' ')) || '%' THEN 0.2
                ELSE 0
            END)
        )::REAL AS similarity_score
    FROM product_embeddings pe
    WHERE 
        pe.search_vector @@ plainto_tsquery('english', search_query)
        OR pe.name ILIKE '%' || search_query || '%'
        OR pe.description ILIKE '%' || search_query || '%'
        OR pe.category ILIKE '%' || search_query || '%'
        OR EXISTS (
            SELECT 1 FROM unnest(pe.keywords) AS keyword 
            WHERE keyword ILIKE '%' || ANY(string_to_array(lower(search_query), ' ')) || '%'
        )
    ORDER BY similarity_score DESC, pe.name ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
