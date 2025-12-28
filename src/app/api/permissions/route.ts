import { NextResponse } from "next/server";
import {
    getAllPermissions,
    getApprovedPermissions,
    getRejectedPermissions,
} from "@/api-controller/permission/permission";

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
        default:
            result = await getAllPermissions();
    }

    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}
