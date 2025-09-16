# 🔐 Vercel Environment Variables

## Required Environment Variables

Add these to your Vercel project dashboard:

### OpenAI API Key (Required)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```
- Get your key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Must start with `sk-`
- Required for food analysis functionality

### Supabase (Optional)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
- Get these from your Supabase project settings
- Only needed if using database features

## How to Add Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name and value
   - Select environments: **Production**, **Preview**, **Development**

3. **Redeploy**
   - After adding variables, redeploy your project
   - Variables are only available after redeployment

## Environment Variable Checklist

- [ ] `OPENAI_API_KEY` - Required for food analysis
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Optional for database
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional for database
- [ ] All variables set for Production, Preview, and Development
- [ ] Project redeployed after adding variables

## Security Notes

- Never commit `.env` files to Git
- Use Vercel's environment variable system
- Rotate API keys regularly
- Monitor usage and costs
