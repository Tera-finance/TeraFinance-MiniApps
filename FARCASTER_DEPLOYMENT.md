# Farcaster Mini App Deployment Guide

This guide will walk you through deploying your Tera Finance Mini App to Farcaster.

## Prerequisites

Before deploying, ensure you have:

- [ ] A Farcaster account
- [ ] A stable domain name for your app
- [ ] App icon (1024x1024px PNG without transparency)
- [ ] Screenshots (optional, 1284x2778px portrait orientation)
- [ ] Hero image (optional, 1200x630px for social sharing)

## Deployment Options

You have two options for hosting your Farcaster manifest:

### Option A: Farcaster Hosted Manifest (Recommended)

This is the easiest approach and allows you to update your manifest without redeploying your app.

**Pros:**
- No need to manage manifest files in your codebase
- Update manifest details without redeploying
- Easier to maintain

**Cons:**
- Depends on Farcaster's hosted service
- Requires using their manifest creation tool

### Option B: Self-Hosted Manifest

Host the manifest file directly on your domain at `/.well-known/farcaster.json`.

**Pros:**
- Full control over the manifest
- No external dependencies

**Cons:**
- Requires redeployment to update manifest
- More complex setup

---

## Step-by-Step Deployment

### Step 1: Create Required Assets

#### 1.1 App Icon (Required)

Create a 1024x1024px PNG icon without transparency:

```bash
# Place your icon at:
public/icon-1024.png
```

**Requirements:**
- Dimensions: 1024x1024px
- Format: PNG
- No alpha channel (no transparency)
- File size: < 1MB recommended

#### 1.2 Additional Assets (Optional)

Create these optional assets to enhance your app's presentation:

```bash
# Splash screen (200x200px)
public/splash-200.png

# Hero image for social sharing (1200x630px)
public/hero-1200x630.png

# Screenshots for app store listing (1284x2778px portrait)
public/screenshot-1.png
public/screenshot-2.png
public/screenshot-3.png
```

### Step 2: Choose Your Manifest Strategy

#### Option A: Farcaster Hosted Manifest Setup

1. **Go to Farcaster Developer Portal:**
   Visit https://farcaster.xyz/~/developers/mini-apps/manifest

2. **Create Your Manifest:**
   Fill in the following details:

   - **Name**: Tera Finance (max 32 characters)
   - **Subtitle**: Cross-Border Payments (max 30 characters)
   - **Description**: Fast, affordable, and secure cross-border money transfers powered by Base blockchain
   - **Icon URL**: https://YOUR_DOMAIN/icon-1024.png
   - **Home URL**: https://YOUR_DOMAIN
   - **Primary Category**: Finance
   - **Tags**: payments, crypto, blockchain, transfers, finance

3. **Get Your Manifest ID:**
   After creating the manifest, you'll receive a hosted manifest ID like:
   ```
   tera-finance-miniapp
   ```

4. **Update vercel.json:**
   The redirect is already configured in `vercel.json`. Update the manifest ID if needed:

   ```json
   {
     "redirects": [
       {
         "source": "/.well-known/farcaster.json",
         "destination": "https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_MANIFEST_ID",
         "permanent": false
       }
     ]
   }
   ```

5. **Skip to Step 3 (Deploy to Vercel)**

#### Option B: Self-Hosted Manifest Setup

1. **Update the Manifest File:**
   Edit `public/.well-known/farcaster.json` and replace all placeholder values:

   ```json
   {
     "accountAssociation": {
       "header": "YOUR_BASE64_HEADER",
       "payload": "YOUR_BASE64_PAYLOAD",
       "signature": "YOUR_BASE64_SIGNATURE"
     },
     "miniapp": {
       "version": "1",
       "name": "Tera Finance",
       "iconUrl": "https://YOUR_DOMAIN/icon-1024.png",
       "homeUrl": "https://YOUR_DOMAIN",
       ...
     }
   }
   ```

   Replace:
   - `YOUR_DOMAIN` with your actual production domain
   - Account association fields (see Step 4 for how to generate these)

2. **Remove the Redirect (Optional):**
   If you're self-hosting, you may want to remove the redirect from `vercel.json`:

   ```bash
   # Delete or comment out the redirects section in vercel.json
   ```

### Step 3: Configure Production Environment

1. **Copy the production environment template:**

   ```bash
   cp .env.production .env.production.local
   ```

2. **Update `.env.production.local` with your values:**

   ```env
   # Frontend URLs
   NEXT_PUBLIC_FRONTEND_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

   # Backend API
   NEXT_PUBLIC_BACKEND_API_URL=https://api-trustbridge.izcy.tech

   # Network (Base Sepolia for testing, Base Mainnet for production)
   NEXT_PUBLIC_CHAIN_ID=84532
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_EXPLORER_URL=https://sepolia.basescan.org

   # WalletConnect
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

   # Farcaster
   NEXT_PUBLIC_FARCASTER_MINIKIT_API_KEY=your_api_key
   ```

   **For Base Mainnet (production), use:**
   ```env
   NEXT_PUBLIC_CHAIN_ID=8453
   NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_EXPLORER_URL=https://basescan.org
   ```

### Step 4: Deploy to Vercel

#### 4.1 Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

#### 4.2 Login to Vercel

```bash
vercel login
```

#### 4.3 Deploy

For the first deployment:

```bash
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project: No
- Project name: tera-miniapps (or your preferred name)
- Directory: ./
- Override settings: No

#### 4.4 Configure Environment Variables in Vercel

Go to your project in Vercel Dashboard:

1. Navigate to **Settings** → **Environment Variables**
2. Add all variables from `.env.production.local`:
   - `NEXT_PUBLIC_FRONTEND_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_BACKEND_API_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_EXPLORER_URL`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_FARCASTER_MINIKIT_API_KEY`

3. Set environment to: **Production**

#### 4.5 Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

#### 4.6 Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel Dashboard
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

### Step 5: Verify Domain Ownership (Required for Developer Rewards)

To prove ownership of your domain and become eligible for developer rewards:

1. **Generate Account Association:**

   Use Warpcast's Mini App Manifest Tool:
   - Visit: https://farcaster.xyz/~/developers/mini-apps/manifest
   - Follow the process to generate a cryptographically signed `accountAssociation`

2. **Get the Signature Components:**

   You'll receive three base64-encoded values:
   - `header`: JFS header
   - `payload`: Must include your domain
   - `signature`: Cryptographic signature

3. **Update Your Manifest:**

   **For Hosted Manifest:**
   - Update in the Farcaster Developer Portal

   **For Self-Hosted Manifest:**
   - Update `public/.well-known/farcaster.json`:

   ```json
   {
     "accountAssociation": {
       "header": "eyJhbGc...",
       "payload": "eyJkb21haW4...",
       "signature": "MHg3Zjk..."
     },
     ...
   }
   ```

   - Redeploy: `vercel --prod`

### Step 6: Test Your Mini App

1. **Enable Developer Mode:**

   Visit: https://farcaster.xyz/~/settings/developer-tools

   Enable developer mode on either mobile or desktop while logged into Farcaster.

2. **Access Your Manifest:**

   Test that your manifest is accessible:
   ```bash
   curl https://YOUR_DOMAIN/.well-known/farcaster.json
   ```

   Should return your manifest JSON.

3. **Test in Farcaster Client:**

   - Open Farcaster (Warpcast app or web)
   - Search for your domain
   - Open your mini app
   - Test all features:
     - [ ] SDK initialization (`sdk.actions.ready()`)
     - [ ] Authentication flow
     - [ ] Navigation between pages
     - [ ] Wallet connection
     - [ ] Transfer functionality

### Step 7: Publish and Share

Once testing is complete:

1. **Announce Your Mini App:**

   Create a cast on Farcaster announcing your mini app with:
   - Brief description
   - Link to your domain
   - Screenshot or demo

2. **Monitor Usage:**

   Track analytics in Vercel:
   - Go to **Analytics** tab
   - Monitor page views, performance, etc.

3. **Iterate Based on Feedback:**

   Collect user feedback and iterate on your app.

---

## Troubleshooting

### Manifest Not Found (404)

**Problem:** `/.well-known/farcaster.json` returns 404

**Solutions:**
- Verify the file exists at `public/.well-known/farcaster.json`
- Check that Next.js headers config is correct in `next.config.ts`
- Clear Vercel cache: `vercel --prod --force`
- For hosted manifest: verify redirect in `vercel.json`

### Manifest Not Valid

**Problem:** Farcaster reports invalid manifest

**Solutions:**
- Validate JSON syntax: Use https://jsonlint.com/
- Check all required fields are present:
  - `accountAssociation` (header, payload, signature)
  - `miniapp.version` (must be "1")
  - `miniapp.name` (max 32 chars)
  - `miniapp.iconUrl` (valid URL)
  - `miniapp.homeUrl` (valid URL)
- Ensure icon URL is accessible (1024x1024px PNG)

### SDK Not Initializing

**Problem:** `sdk.actions.ready()` not working

**Solutions:**
- Check that you're testing within Farcaster client (not external browser)
- Verify `@farcaster/miniapp-sdk` is installed: `npm list @farcaster/miniapp-sdk`
- Check browser console for errors
- Ensure manifest `homeUrl` matches your current URL

### Authentication Issues

**Problem:** Login flow not working

**Solutions:**
- Verify backend API is accessible from production
- Check CORS settings on backend
- Verify environment variables are set in Vercel
- Check network tab for failed API calls

### Build Failures

**Problem:** Build fails during deployment

**Solutions:**
- Test locally first: `npm run build`
- Check for TypeScript errors: `npm run lint`
- Verify all dependencies are installed
- Check Vercel build logs for specific errors

---

## Maintenance

### Updating Your App

1. Make changes to your code
2. Commit to Git
3. Deploy: `vercel --prod`

Vercel will automatically:
- Build your app
- Run tests (if configured)
- Deploy to production

### Updating Manifest

**For Hosted Manifest:**
- Update at https://farcaster.xyz/~/developers/mini-apps/manifest
- Changes take effect immediately (may need cache refresh)

**For Self-Hosted Manifest:**
- Edit `public/.well-known/farcaster.json`
- Redeploy: `vercel --prod`
- Farcaster clients may cache for up to 1 hour

### Monitoring

1. **Vercel Analytics:**
   - Track page views, performance
   - Monitor errors in real-time

2. **Farcaster Developer Tools:**
   - Monitor your mini app's usage
   - Check for errors reported by users

3. **Backend Logs:**
   - Monitor API calls from your mini app
   - Track authentication flows

---

## Additional Resources

- **Farcaster Mini Apps Docs:** https://miniapps.farcaster.xyz/docs/getting-started
- **Publishing Guide:** https://miniapps.farcaster.xyz/docs/guides/publishing
- **Specification:** https://miniapps.farcaster.xyz/docs/specification
- **Vercel Docs:** https://vercel.com/docs
- **Base Network Docs:** https://docs.base.org/

---

## Checklist

Use this checklist to track your deployment progress:

### Pre-Deployment
- [ ] App icon created (1024x1024px PNG)
- [ ] Production environment variables configured
- [ ] Backend API accessible from production
- [ ] Build tested locally (`npm run build`)

### Deployment
- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables set in Vercel

### Farcaster Setup
- [ ] Manifest created (hosted or self-hosted)
- [ ] Domain ownership verified
- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] Developer mode enabled in Farcaster

### Testing
- [ ] Mini app opens in Farcaster
- [ ] SDK initializes successfully
- [ ] Authentication works
- [ ] All features functional
- [ ] Mobile and desktop tested

### Launch
- [ ] Announcement cast created
- [ ] Analytics monitoring setup
- [ ] Feedback collection process established

---

**Need Help?**

- Check the official Farcaster docs: https://miniapps.farcaster.xyz/
- Join the Farcaster developer community
- Contact the Tera Finance team for internal support

---

**Built with ❤️ by the Tera Finance Team**
