import { messagingApi } from "@line/bot-sdk";

const { MessagingApiClient } = messagingApi;

export const lineMessagingApiClient = new MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export type PushMessageRequest = messagingApi.PushMessageRequest;
