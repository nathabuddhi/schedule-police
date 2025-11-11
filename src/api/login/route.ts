import { NextResponse } from "next/server";
import { validateUser } from "@/lib/auth";

export async function POST(req: Request) {
    const { username, password } = await req.json();
    const result = await validateUser(username, password);

    if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 401 });
    }

    if (!result.token) {
        return NextResponse.json({ message: "Missing token" }, { status: 500 });
    }

    const token = result.token;

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
    return response;
}
