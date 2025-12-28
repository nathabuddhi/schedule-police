"use client";

import { useEffect, useState, useCallback } from "react";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { PermissionCard } from "@/components/permission-card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/types";

type PermissionFilter = "pending" | "approved" | "rejected";

export default function Page() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

   

    // ADMIN
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [filter, setFilter] = useState<PermissionFilter>("pending");
    const [adminFetching, setAdminFetching] = useState(false);

    // SELF
    const [selfPermissions, setSelfPermissions] = useState<Permission[]>([]);
    const [selfFetching, setSelfFetching] = useState(false);


    const fetchPermissions = useCallback(async () => {
        if (!user || user.role !== "ADMIN") return;

        setAdminFetching(true);
        try {
            const url =
                filter === "pending"
                    ? "/api/permissions"
                    : `/api/permissions?type=${filter}`;

            const res = await fetch(url, { credentials: "include" });
            const json = await res.json();

            if (json.success) {
                setPermissions(json.data);
            }
        } catch (err) {
            console.error("[ADMIN] fetch permissions failed:", err);
        } finally {
            setAdminFetching(false);
        }
    }, [user, filter]);


    const fetchSelfPermissions = useCallback(async () => {
        if (!user || user.role === "ADMIN") return;

        console.log("[CLIENT] fetching self permissions");

        setSelfFetching(true);
        try {
            const res = await fetch("/api/permissions?type=self", {
                credentials: "include",
            });
            const json = await res.json();

            console.log("[CLIENT] self permissions response:", json);

            if (json.success) {
                setSelfPermissions(json.data);
            }
        } catch (err) {
            console.error("[SELF] fetch permissions failed:", err);
        } finally {
            setSelfFetching(false);
        }
    }, [user]);

 

    useEffect(() => {
        if (!user) return;

        if (user.role === "ADMIN") {
            fetchPermissions();
        } else {
            fetchSelfPermissions();
        }
    }, [user, fetchPermissions, fetchSelfPermissions]);

   

    if (loading) return <Loading />;

    if (user?.role === "ADMIN" && adminFetching) return <Loading />;
    if (user?.role !== "ADMIN" && selfFetching) return <Loading />;

    if (!user) return null;

   

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {user.role !== "ADMIN" ? (
                    selfPermissions.length > 0 ? (
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Permission Request History
                            </h1>
                            {selfPermissions.map((p) => (
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
                    ) 
                ) : (
                    <>
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    filter === "pending" ? "default" : "outline"
                                }
                                onClick={() => setFilter("pending")}
                            >
                                Pending
                            </Button>

                            <Button
                                variant={
                                    filter === "approved"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setFilter("approved")}
                            >
                                Approved
                            </Button>

                            <Button
                                variant={
                                    filter === "rejected"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setFilter("rejected")}
                            >
                                Rejected
                            </Button>
                        </div>

                        {permissions.length > 0 ? (
                            permissions.map((p) => (
                                <PermissionCard
                                    key={p.id}
                                    permission={p}
                                    onApprove={async (id) => {
                                        await fetch("/api/permissions", {
                                            method: "PATCH",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                action: "approve",
                                                id,
                                            }),
                                        });
                                        fetchPermissions();
                                    }}
                                    onReject={async (id, reason) => {
                                        await fetch("/api/permissions", {
                                            method: "PATCH",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                action: "reject",
                                                id,
                                                reason,
                                            }),
                                        });
                                        fetchPermissions();
                                    }}
                                />
                            ))
                        ) : (
                            <div className="w-full flex flex-col items-center text-center py-10">
                                <h1 className="text-xl font-medium">
                                    No {filter} permissions
                                </h1>
                                <p className="text-muted-foreground mt-2">
                                    You're all caught up!
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
