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
        // 1. Alle Rollen laden
        const rolesResponse = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        if (!rolesResponse.ok) {
            return new Response(JSON.stringify({ error: 'Discord-API-Fehler' }), { status: 500 });
        }

        const roles = await rolesResponse.json();

        // 2. Bot-User laden
        const botResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        if (!botResponse.ok) {
            return new Response(JSON.stringify({ error: 'Bot-Info nicht ladbar' }), { status: 500 });
        }

        const botUser = await botResponse.json();

        // 3. Bot-Mitglied im Server laden
        const memberResponse = await fetch(
            `https://discord.com/api/guilds/${guildId}/members/${botUser.id}`,
            { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
        );

        if (!memberResponse.ok) {
            return new Response(JSON.stringify({ error: 'Bot-Mitglied nicht gefunden' }), { status: 500 });
        }

        const botMember = await memberResponse.json();

        // 4. Höchste Position der Bot-Rollen ermitteln
        let botHighestPosition = 0;
        for (const roleId of botMember.roles) {
            const role = roles.find(r => r.id === roleId);
            if (role && role.position > botHighestPosition) {
                botHighestPosition = role.position;
            }
        }

        // 5. Rollen filtern: nur die, die unter der Bot-Rolle stehen
        const manageableRoles = roles
            .filter(r => r.name !== '@everyone' && r.position < botHighestPosition)
            .map(r => ({ id: r.id, name: r.name, color: r.color, position: r.position }))
            .sort((a, b) => b.position - a.position);

        // 6. Blockierte Rollen (über der Bot-Rolle)
        const blockedRoles = roles
            .filter(r => r.name !== '@everyone' && r.position >= botHighestPosition)
            .map(r => ({ id: r.id, name: r.name, position: r.position }));

        return new Response(JSON.stringify({
            roles: manageableRoles,
            botHighestPosition,
            blockedRoles
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};