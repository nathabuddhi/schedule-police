import { NextResponse } from "next/server";
import {
    getAllAssistants,
    updateRole,
} from "@/api-controller/assistant/assistant";

export async function GET() {
    const result = await getAllAssistants();
    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}

export async function PATCH(req: Request) {
    const { initial, role } = await req.json();

    if (!initial || !role) {
        return NextResponse.json(
            { success: false, message: "initial and role are required." },
            { status: 400 }
        );
    }

    const result = await updateRole(initial, role);

    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}
