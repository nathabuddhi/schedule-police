"use client";

import Loading from "@/components/loading";
import { LogoutButton } from "@/components/logout-button";
import Navbar from "@/components/navbar";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function Page() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

    if (loading) return <Loading />;
    else if (!user) return null;

    return (
        <div>
            <Navbar />
            <h1>Dashboard</h1>
            <p>Welcome, {user?.username}!</p>
            <LogoutButton className="btn-primary">Sign Out</LogoutButton>
        </div>
    );
}
