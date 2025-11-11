import { NextResponse } from "next/server";

export async function POST() {
    // return NextResponse.json(await login());
    return NextResponse.json({ success: true, message: "Login successful." });
}
