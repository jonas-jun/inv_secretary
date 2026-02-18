"""
summarization_service.py
────────────────────────
티커 단위 및 시장 전체 종합 요약 서비스.
사용자 커스텀 프롬프트를 반영하여 시장 뉴스를 요약한다.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional

import anthropic
import google.generativeai as genai
from pydantic import BaseModel

logger = logging.getLogger(__name__)

MAX_ARTICLES        = 10
MAX_CONTENT_CHARS   = 500
MAX_SUMMARY_BULLETS = 10

CLAUDE_MODEL  = "claude-3-5-sonnet-20240620"
GEMINI_MODEL  = "gemini-2.0-flash"

class ArticleInput(BaseModel):
    id: int
    title: str
    source: str
    content: str

class SummaryPoint(BaseModel):
    point: str      # 종합 요약 bullet 문장
    quote: str      # 근거 원문 구절

class DigestResult(BaseModel):
    summary: list[SummaryPoint]
    sentiment_score: float
    sentiment_label: str
    model_version: str
    article_ids: list[int]
    article_count: int
    created_at: datetime


# ── API 응답 모델 ─────────────────────────────────────────────────────────────

class SentimentOut(BaseModel):
    score: float
    label: str

class DigestOut(BaseModel):
    summary: list[SummaryPoint]
    sentiment: SentimentOut
    based_on_articles: int

class ArticleOut(BaseModel):
    id: int
    title: str
    source: str
    url: str
    published_at: str

class NewsResponse(BaseModel):
    symbol: str
    company_name: str
    last_updated: str
    digest: DigestOut
    articles: list[ArticleOut]


def _build_prompt(
    symbol: str,
    company_name: str,
    articles: list[ArticleInput],
    lang: str = "ko",
) -> str:
    lang_instruction = "한국어로 작성하세요." if lang == "ko" else "Please write in English."
    
    articles_block = ""
    for i, article in enumerate(articles, start=1):
        trimmed = article.content[:MAX_CONTENT_CHARS]
        articles_block += f"[기사 {i}] 제목: {article.title}\n출처: {article.source}\n내용: {trimmed}\n\n"

    # Market Pulse (MarketWatch) 전용 프롬프트 (사용자 요청 반영)
    if symbol == "MARKET":
        return f"""너는 주식투자에 도움을 주는 똑똑한 비서야.
아래 제공된 MarketWatch 페이지의 최신 {len(articles)}개의 뉴스를 잘 요약하고 정리해줘.
https://www.marketwatch.com

## 지시사항
1. 투자자에게 중요한 핵심 인사이트를 {MAX_SUMMARY_BULLETS}개 이내의 bullet point로 요약하세요.
2. 각 요약은 객관적이고 전문적인 톤을 유지하세요.
3. 전체 뉴스 흐름에 대한 Sentiment Score (-1.0 ~ +1.0)를 산출하세요.
4. {lang_instruction}

## 응답 형식 (반드시 아래 JSON 포맷만 출력)
{{
  "summary": [
    {{"point": "요약 문장", "quote": "근거 원문 (영어)"}},
    ...
  ],
  "sentiment_score": 0.00,
  "sentiment_label": "Positive | Neutral | Negative"
}}

## 뉴스 데이터
{articles_block}"""

    # 일반 티커 요약 프롬프트
    return f"""당신은 금융 뉴스 분석 전문가입니다. {symbol}({company_name})에 관한 최신 뉴스 {len(articles)}개를 분석합니다.

## 지시사항
1. {symbol} 투자자에게 중요한 핵심 인사이트를 {MAX_SUMMARY_BULLETS}줄 이내로 요약하세요.
2. 중복된 내용은 하나로 합치고 투자자 관점에서 중요한 순서로 나열하세요.
3. 전체 뉴스 흐름에 대한 Sentiment Score (-1.0 ~ +1.0)를 산출하세요.
4. {lang_instruction}

## 응답 형식 (반드시 아래 JSON 포맷만 출력)
{{
  "summary": [
    {{"point": "요약 문장", "quote": "근거 원문 (영어)"}}
  ],
  "sentiment_score": 0.0,
  "sentiment_label": "Positive | Neutral | Negative"
}}

## 뉴스 데이터
{articles_block}"""

def _parse_llm_response(raw_text: str) -> dict:
    raw_text = raw_text.strip()
    if "```json" in raw_text:
        raw_text = raw_text.split("```json")[1].split("```")[0]
    elif "```" in raw_text:
        raw_text = raw_text.split("```")[1].split("```")[0]
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("LLM 응답 파싱 실패")

async def summarize_articles(
    symbol: str,
    company_name: str,
    articles: list[ArticleInput],
    lang: str = "ko",
    api_key: Optional[str] = None,
    provider: str = "gemini",
) -> DigestResult:
    if not articles:
        raise ValueError("기사가 없습니다.")

    prompt = _build_prompt(symbol, company_name, articles[:MAX_ARTICLES], lang)
    
    if provider == "gemini":
        if api_key: genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = await model.generate_content_async(prompt)
        raw_text, model_version = response.text, GEMINI_MODEL
    else:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        message = await client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text, model_version = message.content[0].text, CLAUDE_MODEL

    parsed = _parse_llm_response(raw_text)
    bullets = [SummaryPoint(**b) for b in parsed.get("summary", [])]
    
    return DigestResult(
        summary=bullets,
        sentiment_score=parsed.get("sentiment_score", 0.0),
        sentiment_label=parsed.get("sentiment_label", "Neutral"),
        model_version=model_version,
        article_ids=[a.id for a in articles[:MAX_ARTICLES]],
        article_count=len(articles[:MAX_ARTICLES]),
        created_at=datetime.now(tz=timezone.utc),
    )