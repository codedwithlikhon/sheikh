#!/usr/bin/env python3
"""
Setup script for AI API testing environment.
"""

import os
import subprocess
import sys


def create_env_file():
    """Create .env file with API keys."""
    env_content = """# AI API Keys
GROQ_API_KEY=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
XAI_API_KEY=xai-E9vY28vhtQ3axWzI9QfjP8Zn2UhaYjMCcRf1fUVsrPJh2xYggSxfV18omucspLTpkJFEVb7JaJXa8Wf2
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with your API keys")


def install_dependencies():
    """Install required Python packages."""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")


def main():
    """Main setup function."""
    print("🚀 Setting up AI API testing environment...")
    
    # Create .env file
    create_env_file()
    
    # Install dependencies
    install_dependencies()
    
    print("\n🎉 Setup complete! You can now run:")
    print("   python ai_api_test.py")
    print("\nOr with environment variables loaded:")
    print("   python -c \"from dotenv import load_dotenv; load_dotenv(); exec(open('ai_api_test.py').read())\"")


if __name__ == "__main__":
    main()
