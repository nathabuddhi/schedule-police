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

export interface Shift {
    ShiftId: string;
    Start: string;
    End: string;
}

export interface ShiftWithDate extends Shift {
    startDate: Date;
}

export interface LecturerDetail {
    AttendDate: string;
    AttendPlace: string;
    Status: string;
    UserName: string;
}

export interface Lecturer {
    First: LecturerDetail;
    Next: LecturerDetail;
}

export interface Attendance {
    CampusName: string;
    ClassName: string;
    CourseName: string;
    GSLC: boolean;
    Lecturers: Lecturer[];
    Room: string;
}

export interface NotifyTeachingMessage {
    userId: string;
    text: string;
    mention: boolean;
}
