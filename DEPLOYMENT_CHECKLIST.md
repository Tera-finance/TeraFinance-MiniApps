# Farcaster Deployment Checklist

Your Tera Finance Mini App is configured and ready for deployment!

## Configuration Summary

✅ **Farcaster Hosted Manifest**: Configured
- Manifest ID: `0199f133-924e-3298-5fe4-212340015c36`
- Redirect configured in `vercel.json`

✅ **Deployment Domain**: `https://tera-finance.vercel.app`
- Production environment variables updated

✅ **App Details**:
- Name: Tera Finance
- Subtitle: TeraFi
- Description: Cross-Border Asset Transfer (Remittance) Combining Use Whatsapp Chatbot
- Category: Finance
- Icon: Configured in Farcaster

---

## Next Steps to Deploy

### 1. Deploy to Vercel (or Redeploy)

If you haven't deployed yet:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

If already deployed, push to trigger a new deployment:

```bash
# Commit your changes
git add .
git commit -m "feat: configure Farcaster manifest redirect"
git push origin main
```

Vercel will automatically redeploy.

### 2. Verify Environment Variables in Vercel

Go to your Vercel Dashboard: https://vercel.com/dashboard

Navigate to: **Your Project → Settings → Environment Variables**

Ensure these are set for **Production**:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://api-trustbridge.izcy.tech
NEXT_PUBLIC_FRONTEND_URL=https://tera-finance.vercel.app
NEXT_PUBLIC_APP_URL=https://tera-finance.vercel.app
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.basescan.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1217fd11f86767cb61eed313a9f6ade6
NEXT_PUBLIC_FARCASTER_MINIKIT_API_KEY=demo_key
```

**Important**: If you add/change variables, you must redeploy:
```bash
vercel --prod
```

### 3. Test the Redirect

After deployment, verify the manifest redirect works:

```bash
curl https://tera-finance.vercel.app/.well-known/farcaster.json
```

You should see your manifest JSON with:
- `frame.name`: "Tera Finance"
- `frame.homeUrl`: "https://tera-finance.vercel.app/"
- All other manifest details

### 4. Test in Farcaster

#### Enable Developer Mode

1. Visit: https://farcaster.xyz/~/settings/developer-tools
2. Enable developer mode (works on mobile or desktop)

#### Open Your Mini App

1. Open Warpcast app or Farcaster web client
2. Search for: `tera-finance.vercel.app`
3. Or directly navigate to your app URL
4. Your mini app should open inside Farcaster

#### Test All Features

- [ ] App loads successfully
- [ ] Farcaster SDK initializes (`sdk.actions.ready()`)
- [ ] Login flow works
- [ ] Navigation works (Home, Transfer, History, Wallet)
- [ ] Wallet connection works
- [ ] Transfer functionality works
- [ ] All pages render correctly

### 5. Complete Account Association (Optional but Recommended)

To verify domain ownership and become eligible for developer rewards:

1. You'll need to generate account association signatures
2. Visit: https://farcaster.xyz/~/developers/mini-apps/manifest
3. Find your manifest and follow the verification process
4. The `accountAssociation` fields will be automatically populated in your hosted manifest

This proves you own the Farcaster account associated with the mini app.

### 6. Monitor and Iterate

#### Vercel Analytics
- Go to **Analytics** tab in Vercel Dashboard
- Monitor page views, performance metrics
- Check for errors

#### Collect Feedback
- Test with real users on Farcaster
- Monitor console errors
- Iterate based on feedback

---

## Troubleshooting

### Redirect Not Working

**Problem**: `/.well-known/farcaster.json` returns 404 or doesn't redirect

**Solution**:
1. Verify `vercel.json` is in the project root
2. Ensure the redirect configuration is correct
3. Redeploy: `vercel --prod`
4. Clear cache: `vercel --prod --force`

### App Not Loading in Farcaster

**Problem**: Mini app doesn't open or shows errors

**Solutions**:
1. Verify you're testing with developer mode enabled
2. Check that `homeUrl` in manifest matches your deployed URL
3. Open browser console (if testing on desktop) to check for errors
4. Verify Farcaster SDK is initialized: Look for `sdk.actions.ready()` call

### Environment Variables Not Working

**Problem**: App behaves incorrectly in production

**Solutions**:
1. Verify all variables are set in Vercel Dashboard
2. Variables must be set for **Production** environment
3. After adding/changing variables, redeploy: `vercel --prod`
4. Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Backend API Issues

**Problem**: Authentication or transfers not working

**Solutions**:
1. Verify backend API is accessible from production
2. Check CORS settings on backend allow `https://tera-finance.vercel.app`
3. Monitor network tab for failed API calls
4. Verify `NEXT_PUBLIC_BACKEND_API_URL` is correct

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Force deploy (clears cache)
vercel --prod --force

# Test manifest redirect
curl https://tera-finance.vercel.app/.well-known/farcaster.json

# View deployment logs
vercel logs

# Check environment variables
vercel env ls
```

---

## Files Modified

The following files have been configured for Farcaster deployment:

1. **vercel.json** - Redirect to Farcaster Hosted Manifest
2. **.env.production** - Production environment variables
3. **next.config.ts** - Headers for manifest file
4. **app/layout.tsx** - Metadata configuration
5. **public/.well-known/farcaster.json** - Local manifest template (not used with hosted manifest)

---

## Support Resources

- **Farcaster Mini Apps Docs**: https://miniapps.farcaster.xyz/docs/getting-started
- **Vercel Docs**: https://vercel.com/docs
- **Full Deployment Guide**: [FARCASTER_DEPLOYMENT.md](./FARCASTER_DEPLOYMENT.md)

---

**Your mini app is configured and ready to launch! 🚀**

Once deployed, share your mini app on Farcaster and start collecting feedback from users.
