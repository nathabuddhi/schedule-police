import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/types";
import { verifyLineSignature } from "@/api-controller/line/verify";
import { HandleConnectRequest } from "@/api-controller/assistant/connect";
import { checkTeachingSchedule } from "@/api-controller/notify/teaching";
import { sql } from "@/lib/neon";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    const valid = verifyLineSignature(body, signature || "");
    if (!valid.success || !valid.data) {
        return errorResponse("Invalid signature", 401);
    }

    const rawPayload = JSON.parse(body);

    const payloadToProcess = rawPayload.events[0];

    if (!payloadToProcess) {
        return successResponse("Message received.", null);
    }

    switch (payloadToProcess.type) {
        case "message":
            if (payloadToProcess.message.text.startsWith("CONNECT_LINE_ID-")) {
                await HandleConnectRequest(payloadToProcess);
                break;
            } else if (
                payloadToProcess.message.text.startsWith("notify_messier")
            ) {
                const check =
                    await sql`SELECT role FROM assistants WHERE line_id = ${payloadToProcess.source.userId}`;

                if (check.length === 0 && check[0].role === "ADMIN")
                    await checkTeachingSchedule(
                        "reply",
                        payloadToProcess.replyToken,
                        payloadToProcess.source.groupId ?? ""
                    );
                break;
            } else {
                console.log("Received message:", payloadToProcess);
                break;
            }

        default:
            console.log("Unhandled event type:", payloadToProcess);
            break;
    }

    return successResponse("Message received.", null);
}
