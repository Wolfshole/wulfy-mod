import type { APIRoute } from 'astro';
import { createSession, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('Kein Code von Discord erhalten.', { status: 400 });
    }

    try {
        // 1. Code gegen Access-Token tauschen
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: import.meta.env.DISCORD_CLIENT_ID,
                client_secret: import.meta.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: import.meta.env.DISCORD_REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token-Fehler:', errorText);
            return new Response('Fehler beim Token-Austausch.', { status: 500 });
        }

        const tokenData = await tokenResponse.json();

        // 2. User-Info laden
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        if (!userResponse.ok) {
            return new Response('Fehler beim Laden der User-Daten.', { status: 500 });
        }

        const user = await userResponse.json();

        // 3. Session-Cookie mit access_token setzen
        const session = createSession(user, tokenData.access_token);
        cookies.set(SESSION_COOKIE_NAME, session, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        // 4. Weiterleitung zur Server-Auswahl
        return redirect('/dashboard/servers');
    } catch (err) {
        console.error('Auth-Fehler:', err);
        return new Response('Interner Fehler.', { status: 500 });
    }
};