"use client";

import { useEffect, useState, useCallback } from "react";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { PermissionCard } from "@/components/permission-card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { Permission } from "@/lib/types";

export default function MyPermissionPage() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [fetching, setFetching] = useState(false);

    const fetchSelfPermissions = useCallback(async () => {
        if (!user) return;

        console.log("[CLIENT] fetching self permissions (mypermission page)");

        setFetching(true);
        try {
            const res = await fetch("/api/permissions?type=self", {
                credentials: "include",
            });
            const json = await res.json();

            console.log("[CLIENT] self permissions response:", json);

            if (json.success) {
                setPermissions(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch self permissions:", err);
        } finally {
            setFetching(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSelfPermissions();
    }, [fetchSelfPermissions]);

  

    if (loading || fetching) return <Loading />;
    if (!user) return null;

 

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold">My Permissions</h1>
                    <p className="text-muted-foreground">
                        View the status of your submitted permission requests.
                    </p>
                </header>

                {permissions.length > 0 ? (
                    <div className="space-y-4">
                        {permissions.map((p) => (
                            <PermissionCard key={p.id} permission={p} />
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center text-center py-10">
                        <h1 className="text-xl font-medium">
                            No permission requests yet
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Your submitted requests will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
