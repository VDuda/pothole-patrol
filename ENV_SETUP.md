# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# World ID Configuration
# Get your App ID from: https://developer.worldcoin.org/
NEXT_PUBLIC_WLD_APP_ID=your_world_app_id_here

# Mapbox Configuration
# Get your token from: https://account.mapbox.com/
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Lighthouse (Filecoin) Configuration
# Get your API key from: https://lighthouse.storage/
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

## Getting API Keys

### 1. World ID App ID
1. Visit [World Developer Portal](https://developer.worldcoin.org/)
2. Create a new app
3. Set the action to `report-pothole`
4. Copy your App ID

### 2. Mapbox Token
1. Visit [Mapbox](https://account.mapbox.com/)
2. Create an account or sign in
3. Go to Access Tokens
4. Create a new token or use the default public token

### 3. Lighthouse API Key
1. Visit [Lighthouse Storage](https://lighthouse.storage/)
2. Create an account
3. Go to API Keys section
4. Generate a new API key

## Testing Without API Keys

For local development without API keys:
- **Dashcam**: Will work but World ID verification will be skipped
- **Portal**: Map won't load without Mapbox token
- **Filecoin Upload**: Will fail without Lighthouse API key

You can still test the AI detection and UI flows without all keys configured.
