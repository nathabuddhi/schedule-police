import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/api-controller/auth/auth";
import { errorResponse } from "@/lib/types";
import { verifyToken } from "@/api-controller/auth/jwt";
import { GetConnectionString } from "@/api-controller/assistant/connect";

export async function GET(request: NextRequest) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
        return errorResponse("No token found.", 401);
    }

    const payload = verifyToken(token);

    if (!payload.success || !payload.data) {
        return errorResponse(payload.message, 401);
    }

    return await GetConnectionString(payload.data.username);
}
