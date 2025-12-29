import { sql } from "@/lib/neon";
import { StandardResponse } from "@/lib/types";
import type { Assistant } from "@/lib/types";

export async function getAllAssistants(): Promise<
    StandardResponse<Assistant[]>
> {
    try {
        const assistants = (await sql`
            SELECT 
                initial,
                role
            FROM assistants
            ORDER BY initial ASC
        `) as Assistant[];

        return {
            success: true,
            message: "Assistants fetched successfully.",
            data: assistants,
        };
    } catch (error) {
        console.error("Error fetching assistants:", error);
        return {
            success: false,
            message: "Failed to fetch assistants.",
        };
    }
}

export async function updateRole(
    initial: string,
    role: string
): Promise<StandardResponse<null>> {
    try {
        const result = await sql`
            UPDATE assistants
            SET role = ${role}
            WHERE initial = ${initial}
            RETURNING id
        `;

        if (result.length === 0) {
            return {
                success: false,
                message: "No assistant found with the given initial.",
            };
        }

        return {
            success: true,
            message: "Role updated successfully.",
        };
    } catch (error) {
        console.error("Error updating assistant role:", error);
        return {
            success: false,
            message: "Failed to update role.",
        };
    }
}
