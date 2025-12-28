import { NextResponse } from "next/server";
import {
    getAllPermissions,
    getApprovedPermissions,
    getRejectedPermissions,
    approvePermission,
    rejectPermission,
    getSelfPermissions,
} from "@/api-controller/permission/permission";
import { getUserFromRequest } from "@/lib/server-auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let result;

    switch (type) {
        case "approved":
            result = await getApprovedPermissions();
            break;

        case "rejected":
            result = await getRejectedPermissions();
            break;

        case "self": {
            const user = await getUserFromRequest();

            console.log("[API] self user resolved:", user);

            if (!user) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 401 }
                );
            }

            result = await getSelfPermissions(user.initial);
            break;
        }

        default:
            result = await getAllPermissions();
    }

    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}

export async function PATCH(req: Request) {
    const body = await req.json();
    const { action, id, reason } = body;

    let result;

    switch (action) {
        case "approve":
            result = await approvePermission(id);
            break;

        case "reject":
            if (!reason) {
                return NextResponse.json(
                    { success: false, message: "Rejection reason required." },
                    { status: 400 }
                );
            }
            result = await rejectPermission(id, reason);
            break;

        default:
            return NextResponse.json(
                { success: false, message: "Invalid action." },
                { status: 400 }
            );
    }

    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}
