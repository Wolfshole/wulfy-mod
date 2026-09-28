import type { APIRoute } from 'astro';
import pool from '../../lib/db';

export const GET: APIRoute = async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        return new Response(JSON.stringify({
            status: 'ok',
            db: rows
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            status: 'error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};