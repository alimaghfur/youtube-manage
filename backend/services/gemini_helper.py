"""
Gemini API Helper.
Handles rate limiting, model fallback, and retries.
"""

import asyncio


async def call_gemini(api_key: str, prompt: str, max_retries: int = 2) -> str:
    """
    Call Gemini API with automatic model fallback and retry on rate limit.
    Returns the response text.
    """
    from google import genai
    client = genai.Client(api_key=api_key)

    # Models to try in order (lite has higher free quota)
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
                    # Rate limited - try next model
                    await asyncio.sleep(3)
                    continue
                elif "400" in error_str or "INVALID" in error_str:
                    # Bad request - try next model
                    continue
                else:
                    raise e

        # All models failed this attempt, wait before retrying
        if attempt < max_retries:
            await asyncio.sleep(10)

    raise ValueError(
        f"Gemini API rate limited on all models after {max_retries + 1} attempts. "
        f"Please wait a few minutes or create a new API key at https://aistudio.google.com/apikey. "
        f"Last error: {last_error}"
    )
