-- ============================================================
-- Migration: 001_initial_schema
-- Description: 전체 초기 스키마 + ticker_summaries (종합 요약)
-- Date: 2026-02-17
-- ============================================================


-- ── 1. tickers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickers (
    id          SERIAL PRIMARY KEY,
    symbol      VARCHAR(20) NOT NULL UNIQUE,    -- AAPL, 005930.KS 등
    name        VARCHAR(255) NOT NULL,
    exchange    VARCHAR(50),                    -- NASDAQ, NYSE, KRX 등
    sector      VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 2. news_articles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
    id              SERIAL PRIMARY KEY,
    ticker_id       INTEGER NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    url             TEXT NOT NULL UNIQUE,
    source          VARCHAR(100),               -- Yahoo Finance, MarketWatch 등
    published_at    TIMESTAMPTZ,
    raw_content     TEXT,                       -- 원문 (요약 입력용)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 3. ticker_summaries ─────────────────────────────────────────────────────
-- 티커 단위 종합 요약을 저장하는 캐시 테이블.
-- 캐시 키: (ticker_id, created_at 기준 24h TTL)
CREATE TABLE IF NOT EXISTS ticker_summaries (
    id              SERIAL PRIMARY KEY,
    ticker_id       INTEGER NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
    article_ids     INTEGER[] NOT NULL DEFAULT '{}',    -- 요약에 사용된 기사 ID 배열
    summary_ko      TEXT,           -- 한국어 bullet 종합 요약 (줄바꿈 구분)
    summary_en      TEXT,           -- 영어 bullet 종합 요약 (줄바꿈 구분)
    sentiment_score DECIMAL(3,2)    CHECK (sentiment_score BETWEEN -1.00 AND 1.00),
    sentiment_label VARCHAR(20)     CHECK (sentiment_label IN ('Positive', 'Neutral', 'Negative')),
    model_version   VARCHAR(50),
    article_count   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ticker_summaries IS
    '티커 단위 종합 요약 캐시. 동일 ticker_id 기준 24h TTL로 재사용.';


-- ── 권한 부여 ─────────────────────────────────────────────────────────────────
-- PostgREST(service_role)가 SERIAL 시퀀스에 INSERT할 수 있도록 USAGE 권한 부여
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;


-- ── 인덱스 ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_news_ticker_date      ON news_articles(ticker_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_url              ON news_articles(url);
CREATE INDEX IF NOT EXISTS idx_tickers_symbol        ON tickers(symbol);
CREATE INDEX IF NOT EXISTS idx_ticker_summaries_ticker_date
    ON ticker_summaries(ticker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticker_summaries_ticker_day
    ON ticker_summaries(ticker_id, ((created_at AT TIME ZONE 'UTC' + INTERVAL '9 hours')::DATE));


-- ── MARKET 시드 데이터 ────────────────────────────────────────────────────────
-- market-pulse 기사/요약 캐싱을 위한 가상 티커
INSERT INTO tickers (symbol, name, exchange, sector)
VALUES ('MARKET', 'MarketWatch Top Stories', NULL, NULL)
ON CONFLICT (symbol) DO NOTHING;
