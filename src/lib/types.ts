import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export interface StandardResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface User extends jwt.JwtPayload {
    username: string;
    role: string;
    line_id?: string;
}

export type LoginResponse = {
    access_token: string;
    user: User;
};

export function successResponse<T>(
    message: string,
    data?: T,
    status: number = 200
): NextResponse<StandardResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    );
}

export function errorResponse(
    message: string,
    status: number = 400
): NextResponse<StandardResponse<never>> {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}
