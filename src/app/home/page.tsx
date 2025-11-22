"use client";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function Page() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

    if (loading) return <Loading />;
    else if (!user) return null;

    return (
        <div>
            <Navbar />
        </div>
    );
}
