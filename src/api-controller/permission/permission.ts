import { sql } from "@/lib/neon";
import { StandardResponse } from "@/lib/types";
import type { Permission, User } from "@/lib/types";
// import { v4 as uuidv4 } from "uuid";

export async function getAllPermissions(
    user: User
): Promise<StandardResponse<Permission[]>> {
    try {
        const query =
            user.role !== "ADMIN"
                ? sql`SELECT *
                        FROM permissions p
                        JOIN shifts s ON s."ShiftId" = p.shift_id
                    WHERE initial = ${user.username}`
                : sql`SELECT * 
                        FROM permissions p
                        JOIN shifts s ON s."ShiftId" = p.shift_id`;
        const permissions = await sql`${query}`;

        const mapped = permissions.map((p) => ({
            ...p,
            shift: {
                ShiftId: p.ShiftId ?? "UNKNOWN",
                Start: p.Start ?? "UNKNOWN",
                End: p.End ?? "UNKNOWN",
            },
        })) as Permission[];

        return {
            success: true,
            message: "All permissions fetched successfully.",
            data: mapped,
        };
    } catch (error) {
        console.error("Error fetching pending permissions:", error);
        return {
            success: false,
            message: "Failed to fetch pending permissions.",
        };
    }
}

export async function getPermissionByStatus(
    status: string,
    user: User
): Promise<StandardResponse<Permission[]>> {
    try {
        const query =
            user.role !== "ADMIN"
                ? sql`SELECT * FROM permissions p
                        JOIN shifts s ON s."ShiftId" = p.shift_id WHERE status = ${status} AND initial = ${user.username}`
                : sql`SELECT * FROM permissions p
                        JOIN shifts s ON s."ShiftId" = p.shift_id WHERE status = ${status}`;

        const permissions = await sql`${query}`;

        const mapped = permissions.map((p) => ({
            ...p,
            shift: {
                ShiftId: p.ShiftId ?? "UNKNOWN",
                Start: p.Start ?? "UNKNOWN",
                End: p.End ?? "UNKNOWN",
            },
        })) as Permission[];

        return {
            success: true,
            message: `${status} permissions fetched successfully.`,
            data: mapped,
        };
    } catch (error) {
        console.error(`Error fetching ${status} permissions:`, error);
        return {
            success: false,
            message: "Failed to fetch pending permissions.",
        };
    }
}

export async function approvePermission(
    id: string,
    reason?: string
): Promise<StandardResponse<null>> {
    try {
        const result = await sql`
            UPDATE permissions
            SET 
                status = 'approved',
                status_reason = ${reason ?? null}
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return {
                success: false,
                message: "No permission found with the given ID.",
            };
        }

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
        if (!reason || reason.trim() === "") {
            return {
                success: false,
                message: "Rejection reason cannot be empty.",
            };
        }

        const result = await sql`
            UPDATE permissions
            SET 
                status = 'rejected',
                status_reason = ${reason}
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return {
                success: false,
                message: "No permission found with the given ID.",
            };
        }

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

// export async function createPermission(
//     payload: Permission
// ): Promise<StandardResponse<Permission>> {
//     try {
//         const {
//             initial,
//             reason,
//             class: classCode,
//             room,
//             course,
//             shift_id,
//         } = payload;

//         const new_id = uuidv4();

//         const rows = (await sql`
//             INSERT INTO permissions (
//                 id,
//                 initial,
//                 reason,
//                 class,
//                 room,
//                 course,
//                 shift_id,
//                 status,
//                 status_reason
//             )
//             VALUES (
//                 ${new_id},
//                 ${initial},
//                 ${reason},
//                 ${classCode},
//                 ${room},
//                 ${course},
//                 ${shift_id},
//                 'pending',
//                 NULL
//             )
//             RETURNING
//                 id,
//                 initial,
//                 reason,
//                 status,
//                 status_reason,
//                 class,
//                 room,
//                 course,
//                 shift_id
//         `) as Permission[];

//         if (rows.length === 0) {
//             return {
//                 success: false,
//                 message: "Unknown Error - Failed to create permission.",
//             };
//         }

//         return {
//             success: true,
//             message: "Permission created successfully.",
//             data: rows[0],
//         };
//     } catch (error) {
//         console.error("Error creating permission:", error);
//         return {
//             success: false,
//             message: "Failed to create permission.",
//         };
//     }
// }
