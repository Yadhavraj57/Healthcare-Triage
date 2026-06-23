"""Run: python test_gemini.py"""
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GROQ_API_KEY")
print(f"Key found: {bool(key)}")
print(f"Key prefix: {key[:8] if key else 'MISSING'}...")

try:
    from groq import Groq
    client = Groq(api_key=key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say hello in one word."}],
    )
    print(f"\nSUCCESS: {response.choices[0].message.content}")
except Exception as e:
    print(f"\nERROR: {e}")
