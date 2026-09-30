import type { APIRoute } from 'astro';
import { getSession } from '../../lib/auth';

const BOT_TOKEN = import.meta.env.DISCORD_BOT_TOKEN;

export const GET: APIRoute = async ({ url, cookies }) => {
    const session = getSession(cookies);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });
    }

    const guildId = url.searchParams.get('guild_id');
    if (!guildId || guildId !== session.selectedGuildId) {
        return new Response(JSON.stringify({ error: 'Kein Zugriff' }), { status: 403 });
    }

    try {
        // Discord-API abfragen
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Discord-API-Fehler' }), { status: 500 });
        }

        const channels = await response.json();

        // Nur Text- und Voice-Kanäle + Kategorien zurückgeben
        const filtered = channels
            .filter(ch => ch.type === 0 || ch.type === 2 || ch.type === 4)
            .map(ch => ({
                id: ch.id,
                name: ch.name,
                type: ch.type === 0 ? 'text' : ch.type === 2 ? 'voice' : 'category',
                parent_id: ch.parent_id
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return new Response(JSON.stringify(filtered), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};