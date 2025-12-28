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

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState<PermissionFilter>("pending");

    const fetchPermissions = useCallback(async () => {
        if (!user || user.role !== "ADMIN") {
            setFetching(false);
            return;
        }

        setFetching(true);
        try {
            const url =
                filter === "pending"
                    ? "/api/permissions"
                    : `/api/permissions?type=${filter}`;

            const res = await fetch(url, {
                credentials: "include",
            });
            const json = await res.json();

            if (json.success) {
                setPermissions(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch permissions:", err);
        } finally {
            setFetching(false);
        }
    }, [user, filter]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    if (loading || fetching) return <Loading />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {user.role !== "ADMIN" ? (
                    <div className="w-full flex flex-col justify-center items-center text-center py-10">
                        <h1 className="text-xl font-medium">
                            Create Permission Request
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Please wait for a review from RMO
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Filter buttons */}
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

                        {/* Permission list */}
                        {permissions.length > 0 ? (
                            permissions.map((p) => (
                                <PermissionCard
                                    key={p.id} // ✅ ADD THIS
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
                            <div className="w-full flex flex-col justify-center items-center text-center py-10">
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
