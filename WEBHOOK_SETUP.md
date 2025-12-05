# Character Image Generation Webhook Setup

## Overview
This setup allows the app to generate custom character images using n8n workflows with JWT authentication.

## n8n Webhook Configuration

### Webhook Settings
- **URL**: `https://mindflex.app.n8n.cloud/webhook/8057d7ee-93b9-453d-bf18-db22a8f1d1d2`
- **Method**: POST
- **Authentication**: JWT
- **Algorithm**: HS256
- **Secret**: `therapy-ai-character-gen-2024-secure-key-xyz789`

### Expected Request Format
```json
{
  "description": "A wise elderly wizard with a long white beard...",
  "characterName": "Gandalf",
  "timestamp": "2024-12-05T14:37:00.000Z"
}
```

### Expected Response Format
```json
{
  "imageUrl": "https://your-storage.com/generated-image.jpg",
  "success": true
}
```

## n8n Workflow Steps

1. **Webhook Trigger** (JWT Auth enabled)
   - Receives the character description
   - Validates JWT token

2. **AI Image Generation** (e.g., DALL-E, Midjourney, Stable Diffusion)
   - Use the description to generate an image
   - Example prompt: "Professional therapy character portrait: {description}"

3. **Upload to Storage** (Supabase Storage or similar)
   - Upload the generated image
   - Get public URL

4. **Respond to Webhook**
   - Return JSON with imageUrl

## App Integration

The app will:
1. User enters character description in the "image" step
2. Click "Generate Image" button
3. App sends POST request with JWT auth
4. n8n generates image and returns URL
5. App displays the generated image
6. User can regenerate or proceed

## Security Notes

- JWT tokens expire after 1 hour
- Secret key should be stored in environment variables in production
- Consider rate limiting on n8n side
- Validate image URLs before displaying

## Testing

Test the webhook manually:
```bash
curl -X POST https://mindflex.app.n8n.cloud/webhook/8057d7ee-93b9-453d-bf18-db22a8f1d1d2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"description": "A friendly robot therapist", "characterName": "RoboTherapist"}'
```
