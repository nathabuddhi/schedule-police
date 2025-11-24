import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/types";
import { verifyLineSignature } from "@/api-controller/line/verify";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    const valid = verifyLineSignature(body, signature || "");
    if (!valid.success || !valid.data) {
        return errorResponse("Invalid signature", 401);
    }

    console.log("Valid LINE webhook received:", body);

    return successResponse("Message received.", null);
}
