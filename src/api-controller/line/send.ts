import {
    lineMessagingApiClient,
    MentionSubstitutionObject,
    Message,
    TextMessageV2,
} from "@/lib/line";
import { NotifyTeachingMessage, StandardResponse } from "@/lib/types";

export async function sendTeachingReminderToGroup(
    messages: NotifyTeachingMessage[],
    groupLineId: string
): Promise<StandardResponse<void>> {
    try {
        const prefixText =
            "Dear all mentioned assistants, this is a reminder to re-login onto messier and scan BinusMaya Attendance QR Code.\n\n";

        const suffixText = "\n\nThank you.";

        const textTemplateParts: string[] = [];
        const substitutionObjects: Record<string, MentionSubstitutionObject> =
            {};

        messages.forEach((msg, index) => {
            const idx = index + 1;
            const userId = msg.userId;
            const text = msg.text ?? "";
            const mention = msg.mention;

            if (!userId) return;

            if (mention) {
                const placeholder = `user${idx}`;

                textTemplateParts.push(`${idx}. {${placeholder}} - ${text}`);

                substitutionObjects[placeholder] = {
                    type: "mention",
                    mentionee: {
                        type: "user",
                        userId,
                    },
                };
            } else {
                textTemplateParts.push(`${idx}. @${userId} - ${text}`);
            }
        });

        const fullText = prefixText + textTemplateParts.join("\n") + suffixText;

        const lineMessage: TextMessageV2 = {
            type: "textV2",
            text: fullText,
            substitution:
                Object.keys(substitutionObjects).length > 0
                    ? substitutionObjects
                    : undefined,
        };

        await lineMessagingApiClient.pushMessage({
            to: groupLineId,
            messages: [lineMessage],
        });

        return {
            success: true,
            message: "Group message sent successfully.",
        };
    } catch (error) {
        console.error("Error sending group message:", error);

        return {
            success: false,
            message: "An error occurred while sending the group message.",
        };
    }
}

export function replyMessage(replyToken: string, message: string) {
    lineMessagingApiClient.replyMessage({
        replyToken: replyToken,
        messages: [
            {
                type: "text",
                text: message,
            } as Message,
        ],
    });
}
