"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PermissionRequestCardProps {
    request: {
        id: string;
        senderName: string;
        classCode: string;
        reason: string;
        courseCode: string;
        time: string;
        room: string;
        status: "pending" | "approved" | "rejected";
        statusReason?: string | null;
    };
    onApprove?: (id: string) => void;
    onReject?: (id: string, reason: string) => void;
}

export function PermissionCard({
    request,
    onApprove,
    onReject,
}: PermissionRequestCardProps) {
    const isPending = request.status === "pending";

    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const statusBadge = {
        pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    }[request.status];

    return (
        <Card className="relative overflow-hidden border-white/20 bg-white/10 backdrop-blur-md dark:bg-black/20">
            <div className="relative p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold">
                        {getInitials(request.senderName)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg truncate">
                                {request.senderName}
                            </h3>
                            <span
                                className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border ${statusBadge}`}
                            >
                                {request.status}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground italic mt-1">
                            “{request.reason}”
                        </p>
                    </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-[12px] text-muted-foreground">
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                        🕒 {request.time}
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                        📍 Room {request.room}
                    </div>
                </div>

                {/* Rejection reason (history only) */}
                {request.status === "rejected" && request.statusReason && (
                    <div className="text-sm p-3 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <strong>Rejection reason:</strong>{" "}
                        {request.statusReason}
                    </div>
                )}

                {/* Actions (ONLY for pending) */}
                {isPending && !showRejectionForm && (
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => onApprove?.(request.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            Approve
                        </Button>
                        <Button
                            onClick={() => setShowRejectionForm(true)}
                            variant="outline"
                            className="flex-1 border-rose-500 text-rose-500"
                        >
                            Reject
                        </Button>
                    </div>
                )}

                {isPending && showRejectionForm && (
                    <div className="space-y-3">
                        <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full min-h-20 text-sm p-3 rounded-xl bg-black/5 dark:bg-white/5"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    onReject?.(request.id, rejectionReason)
                                }
                                disabled={!rejectionReason.trim()}
                                className="flex-1 bg-rose-500 text-white"
                            >
                                Submit Reject
                            </Button>
                            <Button
                                onClick={() => setShowRejectionForm(false)}
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
