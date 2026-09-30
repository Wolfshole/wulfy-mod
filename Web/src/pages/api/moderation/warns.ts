import type { APIRoute } from 'astro';
import pool from '../../../lib/db';
import { getSession } from '../../../lib/auth';

// GET: Alle Warns eines Servers
export const GET: APIRoute = async ({ url, cookies }) => {
    const session = getSession(cookies);
    if (!session) return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });

    const guildId = url.searchParams.get('guild_id');
    if (!guildId || guildId !== session.selectedGuildId) {
        return new Response(JSON.stringify({ error: 'Kein Zugriff' }), { status: 403 });
    }

    try {
        const [rows] = await pool.execute(
            `SELECT w.id, w.user_id, w.moderator_id, w.reason, w.created_at
             FROM warns w
             WHERE w.guild_id = ?
             ORDER BY w.created_at DESC
             LIMIT 100`,
            [guildId]
        );

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

// DELETE: Warn entfernen
export const DELETE: APIRoute = async ({ url, cookies }) => {
    const session = getSession(cookies);
    if (!session) return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });

    const warnId = url.searchParams.get('id');
    const guildId = url.searchParams.get('guild_id');

    if (!warnId || !guildId || guildId !== session.selectedGuildId) {
        return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400 });
    }

    try {
        await pool.execute('DELETE FROM warns WHERE id = ? AND guild_id = ?', [warnId, guildId]);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};