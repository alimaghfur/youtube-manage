"""
AI API Helper.
Supports multiple AI providers: Gemini, Groq, OpenRouter.
Handles rate limiting, model fallback, and retries.
"""

import asyncio
import requests


async def call_gemini(api_key: str, prompt: str, max_retries: int = 2) -> str:
    """
    Call AI API with automatic provider fallback.
    Tries Gemini first, falls back to Groq if available.
    Returns the response text.
    """
    # Check if we should use Groq instead
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT value FROM settings WHERE key = 'groq_api_key'")
        row = await cursor.fetchone()
        groq_key = row[0] if row else None

        cursor = await db.execute("SELECT value FROM settings WHERE key = 'ai_provider'")
        row = await cursor.fetchone()
        provider = row[0] if row else "auto"
    finally:
        await db.close()

    # If provider is groq or auto with groq key available
    if provider == "groq" or (provider == "auto" and groq_key):
        if groq_key:
            try:
                return await call_groq(groq_key, prompt)
            except Exception as e:
                if provider == "groq":
                    raise e
                # If auto, fall through to Gemini

    # Try Gemini
    try:
        return await _call_gemini_direct(api_key, prompt, max_retries)
    except Exception as gemini_error:
        # If Gemini fails and we have Groq, try Groq as fallback
        if groq_key and provider == "auto":
            try:
                return await call_groq(groq_key, prompt)
            except Exception:
                pass
        raise gemini_error


async def _call_gemini_direct(api_key: str, prompt: str, max_retries: int = 2) -> str:
    """Direct Gemini API call with model fallback."""
    from google import genai
    client = genai.Client(api_key=api_key)

    models = ["gemini-2.0-flash-lite", "gemini-2.0-flash"]
    last_error = None

    for attempt in range(max_retries + 1):
        for model_name in models:
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=prompt,
                )
                return response.text
            except Exception as e:
                last_error = e
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    await asyncio.sleep(3)
                    continue
                elif "404" in error_str or "NOT_FOUND" in error_str:
                    continue
                elif "400" in error_str or "INVALID" in error_str:
                    continue
                else:
                    raise e

        if attempt < max_retries:
            await asyncio.sleep(10)

    raise ValueError(
        f"Gemini API failed after {max_retries + 1} attempts. "
        f"Consider adding Groq API key as alternative (free, no rate limit). "
        f"Last error: {last_error}"
    )


async def call_groq(api_key: str, prompt: str) -> str:
    """
    Call Groq API (free, very fast, generous limits).
    Models: llama-3.3-70b-versatile, llama-3.1-8b-instant
    """
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Try models in order
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    last_error = None

    for model_name in models:
        try:
            data = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 4096,
            }

            response = await asyncio.to_thread(
                requests.post, url, json=data, headers=headers, timeout=60
            )

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                await asyncio.sleep(2)
                continue
            else:
                last_error = f"Groq API error {response.status_code}: {response.text[:200]}"
                continue
        except Exception as e:
            last_error = str(e)
            continue

    raise ValueError(f"Groq API failed: {last_error}")
