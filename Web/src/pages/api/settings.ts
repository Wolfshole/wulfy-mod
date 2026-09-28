import type { APIRoute } from 'astro';
import pool from '../../lib/db';

// GET: Einstellungen eines Moduls laden
export const GET: APIRoute = async ({ url }) => {
    const guildId = url.searchParams.get('guild_id');
    const module = url.searchParams.get('module');

    if (!guildId || !module) {
        return new Response(JSON.stringify({ error: 'guild_id und module benötigt' }), { status: 400 });
    }

    const [rows] = await pool.execute(
        'SELECT settings_json, enabled FROM guild_settings WHERE guild_id = ? AND module_name = ?',
        [guildId, module]
    );

    return new Response(JSON.stringify(rows[0] ?? { settings_json: {}, enabled: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

// POST: Einstellungen speichern
export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { guild_id, module, settings, enabled } = body;

    await pool.execute(
        `INSERT INTO guild_settings (guild_id, module_name, settings_json, enabled)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE settings_json = ?, enabled = ?`,
        [guild_id, module, JSON.stringify(settings), enabled, JSON.stringify(settings), enabled]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
};