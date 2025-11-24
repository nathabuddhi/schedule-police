import { sendGroupMessage } from "@/api-controller/line/send";
import { successResponse } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    await sendGroupMessage((await request.json()).messages);
    return successResponse("Notification sent successfully.", null);
}
