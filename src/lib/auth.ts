import "dotenv/config";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export function generateToken(payload: object) {
    if (!SECRET_KEY) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
    if (!SECRET_KEY) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    try {
        return jwt.verify(token, SECRET_KEY);
    } catch {
        return null;
    }
}
