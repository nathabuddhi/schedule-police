import { generateToken } from "@/lib/jwt";

export async function validateUser(username: string, password: string) {
    if (username === "admin" && password === "admin") {
        const token = generateToken({ username, role: "admin" });
        return { success: true, token };
    }
    return { success: false, message: "Invalid credentials" };
}
