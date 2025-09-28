#!/usr/bin/env python3
"""
Simple test script for AI APIs
"""

import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

def test_groq_simple():
    """Simple Groq API test."""
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Hello! How are you?"}],
            temperature=0.6,
            max_completion_tokens=100,
            stream=True,
        )
        
        print("🤖 Groq Response:")
        for chunk in completion:
            print(chunk.choices[0].delta.content or "", end="")
        print("\n")
        
    except Exception as e:
        print(f"❌ Groq Error: {e}")

if __name__ == "__main__":
    test_groq_simple()
