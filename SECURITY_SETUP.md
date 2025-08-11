# Security Setup Guide

## API Key Configuration

### ⚠️ IMPORTANT: Never use NEXT_PUBLIC_ prefix for API keys!

API keys should **NEVER** be exposed to the browser. Use server-side environment variables instead.

### Correct Setup:

1. **Create `.env.local` file** (not tracked by git):
```bash
# ✅ CORRECT - Server-side only (not exposed to browser)
STABILITY_API_KEY=your_stability_key_here
REPLICATE_API_KEY=your_replicate_key_here
OPENAI_API_KEY=your_openai_key_here

# ❌ WRONG - Never do this (exposed to browser)
NEXT_PUBLIC_STABILITY_API_KEY=your_key_here
```

2. **For Vercel deployment**, add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add environment variables without `NEXT_PUBLIC_` prefix
   - Redeploy your application

### How it works:

- **Client-side**: Calls `/api/ai/generate` endpoint
- **Server-side**: API route handles AI generation with secure API keys
- **Result**: API keys stay on server, never exposed to browser

### Testing:

1. Start development server: `npm run dev`
2. Go to AI generation page
3. Upload image and generate
4. Check browser console - no API keys visible

### Troubleshooting:

If you see "No AI service configured" error:
1. Check `.env.local` file exists
2. Verify API keys are set (without `NEXT_PUBLIC_` prefix)
3. Restart development server
4. Check server logs for API key loading

### Security Benefits:

✅ API keys never exposed to browser  
✅ No client-side API key handling  
✅ Secure server-side processing  
✅ Environment variable protection  
✅ Vercel deployment ready

