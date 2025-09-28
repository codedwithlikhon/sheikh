#!/usr/bin/env python3
"""
AI API Testing Script
Tests both XAI and Groq APIs for fast inference capabilities.
"""

import os
import asyncio
import requests
import json
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIAPITester:
    """Test class for comparing AI API performance and responses."""
    
    def __init__(self):
        """Initialize the API tester with environment variables."""
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.xai_api_key = os.getenv("XAI_API_KEY")
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        if not self.xai_api_key:
            raise ValueError("XAI_API_KEY environment variable not set")
            
        self.groq_client = Groq(api_key=self.groq_api_key)
        self.xai_headers = {
            "Authorization": f"Bearer {self.xai_api_key}",
            "Content-Type": "application/json"
        }
        
    def test_groq_inference(self, prompt: str, model: str = "llama-3.1-8b-instant") -> str:
        """Test Groq API inference with streaming."""
        try:
            completion = self.groq_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_completion_tokens=1024,
                top_p=0.95,
                stream=True,
                stop=None,
            )
            
            response = ""
            print(f"\n🤖 Groq ({model}) Response:")
            print("-" * 50)
            
            for chunk in completion:
                content = chunk.choices[0].delta.content or ""
                response += content
                print(content, end="", flush=True)
            
            print("\n" + "-" * 50)
            return response
            
        except Exception as e:
            print(f"❌ Groq API Error: {e}")
            return ""
    
    def test_xai_inference(self, prompt: str, model: str = "grok-beta") -> str:
        """Test XAI API inference using REST API."""
        try:
            url = "https://api.x.ai/v1/chat/completions"
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.6,
                "max_tokens": 1024,
                "top_p": 0.95,
                "stream": False
            }
            
            response = requests.post(url, headers=self.xai_headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            print(f"\n🚀 XAI ({model}) Response:")
            print("-" * 50)
            print(content)
            print("-" * 50)
            
            return content
            
        except Exception as e:
            print(f"❌ XAI API Error: {e}")
            return ""


def main():
    """Main function to run AI API tests."""
    try:
        tester = AIAPITester()
        
        # Test prompt about fast inference
        prompt = "Why is fast inference so important for AI applications?"
        
        print("🧪 Testing AI APIs for Fast Inference")
        print("=" * 60)
        
        # Test Groq
        groq_response = tester.test_groq_inference(prompt)
        
        # Test XAI (placeholder)
        xai_response = tester.test_xai_inference(prompt)
        
        print(f"\n📊 Test Summary:")
        print(f"Groq response length: {len(groq_response)} characters")
        print(f"XAI response length: {len(xai_response)} characters")
        
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
