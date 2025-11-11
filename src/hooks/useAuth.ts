"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { verifyToken } from "@/lib/jwt";

type User = any; // Replace with your user type

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    const checkAuth = useCallback(() => {
        const token = Cookies.get("token");
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const decoded: User = verifyToken(token);
            setUser(decoded);
        } catch (err) {
            setUser(null);
            // Optional: console.error("Token verification failed:", err);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                checkAuth();
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login error:", err);
            return false;
        }
    };

    const logout = () => {
        Cookies.remove("token");
        setUser(null);
    };

    return { user, login, logout };
}
