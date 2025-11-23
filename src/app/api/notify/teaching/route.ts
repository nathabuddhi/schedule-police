import { checkTeachingSchedule } from "@/app/api/api-controller/notify/teaching";
import { errorResponse } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const token = request.headers.get("X-Auth-Token");

    if (token !== process.env.X_AUTH_TOKEN) {
        return errorResponse("Unauthorized.", 401);
    }

    return await checkTeachingSchedule();
}
