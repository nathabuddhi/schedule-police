import { sql } from "@/lib/neon";
import { errorResponse, successResponse } from "@/lib/types";
import { LineWebhookMessagePayload } from "@/api-controller/line/types";
import { replyMessage } from "../line/send";

export async function GetConnectionString(username: string) {
    try {
        const randomKey = Math.random()
            .toString(36)
            .substring(2, 2 + 64);

        const connectionString = `CONNECT_LINE_ID-${username}-${randomKey}`;

        await sql`INSERT INTO assistant_connect (initial, connection_string) VALUES (${username}, ${connectionString}) ON CONFLICT (initial) DO UPDATE SET connection_string = EXCLUDED.connection_string, created_at = EXCLUDED.created_at`;

        return successResponse(
            "Connection String obtained successfully!",
            connectionString
        );
    } catch (error) {
        console.error("Error in GetConnectionString:", error);
        return errorResponse("Failed to obtain Connection String.");
    }
}

export async function HandleConnectRequest(
    webhook_payload: LineWebhookMessagePayload
) {
    console.log("HandleConnectRequest called with payload:", webhook_payload);

    const connectionString = webhook_payload.message.text;
    const replyToken = webhook_payload.replyToken;

    try {
        const result =
            await sql`SELECT initial, created_at FROM assistant_connect WHERE connection_string = ${connectionString}`;

        if (result.length === 0) {
            console.log("No matching connection string found.");
            return;
        }

        const row = result[0];

        if (
            new Date(`${row.created_at}Z`) <
            new Date(Date.now() + 15 * 60 * 1000)
        ) {
            console.log("Connection string has expired.");
            replyMessage(
                replyToken,
                "The connection string has expired. Please generate a new one from https://schedule-police.nathabuddhi.com"
            );
            return;
        }
        
        const userInitial = row.initial;
        await sql`UPDATE assistants SET line_user_id = ${webhook_payload.source.userId} WHERE initial = ${userInitial}`;
    } catch (error) {
        console.error("Error in HandleConnectRequest:", error);
    }
}
