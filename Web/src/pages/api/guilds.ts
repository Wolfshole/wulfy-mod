import type { APIRoute } from 'astro';
import { getSession } from '../../lib/auth';
import { getUserGuilds } from '../../lib/discord';

export const GET: APIRoute = async ({ cookies }) => {
    const session = getSession(cookies);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const guilds = await getUserGuilds(session.accessToken);
        return new Response(JSON.stringify(guilds), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};