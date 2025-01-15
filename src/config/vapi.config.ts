export const vapiConfig = {
    provider: 'webhook',
    authenticationPlan: {
        type: 'oauth2',
        url: process.env.VITE_VAPI_AUTH_URL || 'https://api.wewash.fr/auth/token',
        clientId: process.env.VITE_VAPI_CLIENT_ID,
        clientSecret: process.env.VITE_VAPI_CLIENT_SECRET
    },
    server: {
        url: process.env.VITE_VAPI_WEBHOOK_URL || 'https://api.wewash.fr/webhook',
        headers: {
            'Content-Type': 'application/json'
        }
    }
};
