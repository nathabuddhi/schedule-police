import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/api-controller/auth/auth";
import { errorResponse, successResponse } from "@/lib/types";
import { verifyToken } from "@/api-controller/auth/jwt";
import { sql } from "@/lib/neon";

export async function PUT(request: NextRequest) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
        return errorResponse("No token found.", 401);
    }

    const payload = verifyToken(token);

    if (!payload.success || !payload.data) {
        return errorResponse(payload.message, 401);
    }

    const body = await request.json();
    const line_id = body.line_id;

    if (!line_id) {
        return errorResponse("New line_id is required.", 400);
    }

    try {
        await sql`
            UPDATE assistants
            SET line_id = ${line_id}
            WHERE initial = ${payload.data.username}
        `;
        return successResponse("line_id updated successfully.");
    } catch (error) {
        console.error("Error updating line_id:", error);
        return errorResponse("Internal server error.", 500);
    }
}
