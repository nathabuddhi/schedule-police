import { sql } from "@/lib/neon";
import { StandardResponse } from "@/lib/types";
import type { Permission } from "@/lib/types";

export async function getAllPermissions(): Promise<
    StandardResponse<Permission[]>
> {
    try {
        const permissions = (await sql`
            SELECT 
                id,
                initial,
                reason,
                status,
                status_reason,
                class,
                room,
                course,
                shiftid
            FROM permissions
            WHERE status = 'pending'
            ORDER BY id DESC
        `) as Permission[];

        return {
            success: true,
            message: "Pending permissions fetched successfully.",
            data: permissions,
        };
    } catch (error) {
        console.error("Error fetching pending permissions:", error);
        return {
            success: false,
            message: "Failed to fetch pending permissions.",
        };
    }
}

export async function getRejectedPermissions(): Promise<
    StandardResponse<Permission[]>
> {
    try {
        const permissions = (await sql`
            SELECT 
                id,
                initial,
                reason,
                status,
                status_reason,
                class,
                room,
                course,
                shiftid
            FROM permissions
            WHERE status = 'rejected'
            ORDER BY id DESC
            LIMIT 5
        `) as Permission[];

        return {
            success: true,
            message: "Last 5 rejected permissions fetched successfully.",
            data: permissions,
        };
    } catch (error) {
        console.error("Error fetching rejected permissions:", error);
        return {
            success: false,
            message: "Failed to fetch rejected permissions.",
        };
    }
}

export async function getApprovedPermissions(): Promise<
    StandardResponse<Permission[]>
> {
    try {
        const permissions = (await sql`
            SELECT 
                id,
                initial,
                reason,
                status,
                status_reason,
                class,
                room,
                course,
                shiftid
            FROM permissions
            WHERE status = 'approved'
            ORDER BY id DESC
            LIMIT 5
        `) as Permission[];

        return {
            success: true,
            message: "Last 5 approved permissions fetched successfully.",
            data: permissions,
        };
    } catch (error) {
        console.error("Error fetching approved permissions:", error);
        return {
            success: false,
            message: "Failed to fetch approved permissions.",
        };
    }
}

export async function approvePermission(
    id: string
): Promise<StandardResponse<null>> {
    try {
        const result = await sql`
            UPDATE permissions
            SET 
                status = 'approved',
                status_reason = NULL
            WHERE id = ${id}
        `;

        return {
            success: true,
            message: "Permission approved successfully.",
        };
    } catch (error) {
        console.error("Error approving permission:", error);
        return {
            success: false,
            message: "Failed to approve permission.",
        };
    }
}

export async function rejectPermission(
    id: string,
    reason: string
): Promise<StandardResponse<null>> {
    try {
        const result = await sql`
            UPDATE permissions
            SET 
                status = 'rejected',
                status_reason = ${reason}
            WHERE id = ${id}
        `;

        return {
            success: true,
            message: "Permission rejected successfully.",
        };
    } catch (error) {
        console.error("Error rejecting permission:", error);
        return {
            success: false,
            message: "Failed to reject permission.",
        };
    }
}
