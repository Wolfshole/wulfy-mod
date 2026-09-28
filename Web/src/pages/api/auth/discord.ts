import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
    const params = new URLSearchParams({
        client_id: import.meta.env.DISCORD_CLIENT_ID,
        redirect_uri: import.meta.env.DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds',
        prompt: 'consent'
    });

    return redirect(`https://discord.com/api/oauth2/authorize?${params}`);
};