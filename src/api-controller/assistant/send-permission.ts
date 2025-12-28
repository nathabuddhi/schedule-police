import { sql } from "@/lib/neon";
import { errorResponse, successResponse } from "@/lib/types";
import { LineWebhookMessagePayload } from "@/api-controller/line/types";
import { replyMessage } from "@/api-controller/line/send";
import { v4 as uuidv4 } from "uuid";

export async function HandlePermissionRequest(
    webhook_payload: LineWebhookMessagePayload
) {
    const reason = webhook_payload.message.text;
    const lineUserId = webhook_payload.source.userId;
    const replyToken = webhook_payload.replyToken;

    try {
    
        const assistantResult = await sql`
            SELECT initial
            FROM assistants
            WHERE line_id = ${lineUserId}
        `;

        if (assistantResult.length === 0) {
            replyMessage(
                replyToken,
                "Your LINE account is not linked yet. Please connect first."
            );
            return;
        }

        const assistantInitial = assistantResult[0].initial;

        const permissionId = uuidv4();

        await sql`
            INSERT INTO permissions (
                id,
                assistant_initial,
                reason,
                status
            )
            VALUES (
                ${permissionId},
                ${assistantInitial},
                ${reason},
                'pending'
            )
        `;

        replyMessage(
            replyToken,
            "Your permission request has been submitted and is pending approval."
        );

        return successResponse("Permission request created.", {
            id: permissionId,
        });
    } catch (error) {
        console.error("Error in HandlePermissionRequest:", error);
        replyMessage(
            replyToken,
            "An error occurred while submitting your request."
        );
        return errorResponse("Failed to submit permission request.");
    }
}
