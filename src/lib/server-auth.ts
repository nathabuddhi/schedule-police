import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/neon";
import type { Assistant } from "@/lib/types";

export async function getUserFromRequest(): Promise<Assistant | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) {
            console.warn("[auth] missing auth_token");
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            username: string;
            role: string;
        };

        console.log("[auth] decoded JWT:", decoded);

        const rows = await sql`
            SELECT initial, role
            FROM assistants
            WHERE initial = ${decoded.username}
               OR messier_token IS NOT NULL
            LIMIT 1
        `;

        if (rows.length === 0) {
            console.warn("[auth] no assistant found for", decoded.username);
            return null;
        }

        return {
            initial: rows[0].initial,
            role: rows[0].role,
        };
    } catch (err) {
        console.error("[auth] failed to extract user:", err);
        return null;
    }
}
