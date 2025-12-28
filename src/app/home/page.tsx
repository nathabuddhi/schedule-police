"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { PermissionCard } from "@/components/permission-card";
import { useAuthGuard } from "@/hooks/use-auth-guard";

interface Permission {
    id: string;
    initial: string;
    reason: string;
    status: string;
    status_reason: string | null;
    class: string;
    room: string;
    course: string;
    shiftid: string;
}

export default function Page() {
    const { user, loading } = useAuthGuard({ requireAuth: true });
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            try {
                const res = await fetch("/api/permissions", {
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
        }

        if (user) fetchPermissions();
    }, [user]);

    if (loading || fetching) return <Loading />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 space-y-8">
                {permissions.length > 0 ? (
                    permissions.map((p) => (
                        <PermissionCard
                            key={p.id}
                            request={{
                                id: p.id,
                                senderName: p.initial,
                                reason: p.reason,
                                classCode: p.class,
                                time: p.shiftid,
                                courseCode: p.course,
                                room: p.room,
                            }}
                            onApprove={(id) => console.log("Approved:", id)}
                            onReject={(id, reason) =>
                                console.log("Rejected:", id, reason)
                            }
                        />
                    ))
                ) : (
                    <div className="w-full flex flex-col justify-center items-center text-center py-10">
                        <h1 className="text-xl font-medium">
                            Well unfortunately, there&apos;s nothing here yet...
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            But perhaps, in the meantime, go ahead and connect
                            your line account in the navbar!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
