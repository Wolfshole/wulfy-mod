import type { APIRoute } from 'astro';
import { getSession, updateSession } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
    const session = getSession(cookies);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });
    }

    const { guildId } = await request.json();
    if (!guildId) {
        return new Response(JSON.stringify({ error: 'guildId fehlt' }), { status: 400 });
    }

    updateSession(cookies, { ...session, selectedGuildId: guildId });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};