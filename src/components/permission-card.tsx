"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // standard shadcn helper

interface PermissionRequestCardProps {
    request: {
        id: string;
        senderName: string;
        classCode: string;
        reason: string;
        courseCode: string;
        time: string;
        room: string;
    };
    onApprove?: (id: string) => void;
    onReject?: (id: string, reason: string) => void;
}

export function PermissionCard({
    request,
    onApprove,
    onReject,
}: PermissionRequestCardProps) {
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessed, setIsProcessed] = useState(false);

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-white/20 bg-white/10 backdrop-blur-md dark:bg-black/20 group">
            {/* Glassy Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative p-5 space-y-4">
                <div className="flex items-start gap-4">
                    {/* Modern Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20">
                        {getInitials(request.senderName)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg tracking-tight truncate">
                                {request.senderName}
                            </h3>
                            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                {request.classCode}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                {request.courseCode}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
                            &quot;{request.reason}&quot;
                        </p>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[12px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                        <span>🕒 {request.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                        <span>📍 Room {request.room}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                {!isProcessed && !showRejectionForm && (
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => {
                                setIsProcessed(true);
                                onApprove?.(request.id);
                            }}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-none transition-transform active:scale-95"
                        >
                            Approve
                        </Button>
                        <Button
                            onClick={() => setShowRejectionForm(true)}
                            variant="outline"
                            className="flex-1 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 bg-transparent"
                        >
                            Reject
                        </Button>
                    </div>
                )}

                {showRejectionForm && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <textarea
                            placeholder="Enter reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full min-h-20 text-sm p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setIsProcessed(true);
                                    onReject?.(request.id, rejectionReason);
                                }}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25"
                                disabled={!rejectionReason.trim()}
                            >
                                Submit Reject
                            </Button>
                            <Button
                                onClick={() => setShowRejectionForm(false)}
                                variant="ghost"
                                className="px-3"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {isProcessed && (
                    <div className="text-center py-2 px-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                        ✓ Request Processed
                    </div>
                )}
            </div>
        </Card>
    );
}
