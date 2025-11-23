import { NotifyTeachingMessage, StandardResponse } from "@/lib/types";

export async function sendGroupMessage(
    messages: NotifyTeachingMessage[]
): Promise<StandardResponse<void>> {
    try {
        const sendMessageResponse = await fetch(
            "https://line-schedule-police.nathabuddhi.com/send-notification-message",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${process.env.X_AUTH_TOKEN}`,
                },
                body: JSON.stringify({ messages: messages }),
            }
        );

        if (!sendMessageResponse.ok) {
            throw new Error(
                `Failed to send group message. Status: ${sendMessageResponse.status}`
            );
        }

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
