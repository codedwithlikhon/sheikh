# AI API Testing Suite

This project provides a comprehensive testing suite for AI APIs, specifically Groq and XAI, to compare their fast inference capabilities.

## Features

- **Groq API Integration**: Test with current models like `llama-3.1-8b-instant`
- **XAI API Integration**: Test with Grok models using REST API
- **Streaming Support**: Real-time response streaming for better user experience
- **Environment Variable Management**: Secure API key handling
- **Error Handling**: Comprehensive error handling and reporting

## Setup

1. **Install Dependencies**:
   ```bash
   python setup_ai_test.py
   ```

2. **Set Environment Variables** (already configured in `.env`):
   ```bash
   GROQ_API_KEY=your_groq_api_key
   XAI_API_KEY=your_xai_api_key
   ```

## Usage

### Full API Comparison
```bash
python ai_api_test.py
```

### Simple Groq Test
```bash
python test_apis.py
```

## API Keys

The following API keys are configured:
- **Groq**: `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`
- **XAI**: `xai-E9vY28vhtQ3axWzI9QfjP8Zn2UhaYjMCcRf1fUVsrPJh2xYggSxfV18omucspLTpkJFEVb7JaJXa8Wf2`

## Models Tested

- **Groq**: `llama-3.1-8b-instant` (fast, efficient)
- **XAI**: `grok-beta` (when rate limits allow)

## Performance Notes

- **Groq**: Excellent for fast inference with streaming support
- **XAI**: May hit rate limits during testing
- Both APIs support similar parameters for fair comparison

## Files

- `ai_api_test.py`: Main testing script with full comparison
- `test_apis.py`: Simple test script for quick verification
- `setup_ai_test.py`: Setup script for dependencies and environment
- `requirements.txt`: Python dependencies
- `.env`: Environment variables (auto-generated)

## Example Output

```
🧪 Testing AI APIs for Fast Inference
============================================================

🤖 Groq (llama-3.1-8b-instant) Response:
--------------------------------------------------
Fast inference is crucial for AI applications due to several reasons:

1. **Real-time decision-making**: In many AI applications...
2. **Scalability**: As AI models become more complex...
3. **User experience**: In applications like virtual assistants...
...
--------------------------------------------------

📊 Test Summary:
Groq response length: 2870 characters
XAI response length: 0 characters
```
