import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { GetConnectionString } from "@/frontend-controller/assistant-controller";
import { ScriptCopyBtn } from "@/components/ui/script-copy-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

export default function LinkAccountDialog() {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="hover:cursor-pointer">
                        Connect Line Account
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <LinkAccountInstructions />
                </DialogContent>
            </Dialog>
        </>
    );
}

export function LinkAccountInstructions() {
    const instructions: { title: string; desc: ReactNode }[] = [
        {
            title: "Add the Line Bot",
            desc: (
                <>
                    Click{" "}
                    <Link
                        href="https://lin.ee/ogjG6al"
                        target="_blank"
                        className="text-blue-600 underline">
                        here
                    </Link>{" "}
                    to add the Line Bot.
                </>
            ),
        },
        {
            title: "Get Your Connection String",
            desc: (
                <>
                    Go to the connections tab and obtain your Connection String
                    with the copy button.
                </>
            ),
        },
        {
            title: "Send the Connection String",
            desc: (
                <>
                    Paste the previously acquired Connection String and send it
                    to the LCAS - SChedulePolice Line Bot.
                </>
            ),
        },
    ];

    return (
        <>
            <DialogHeader>
                <DialogTitle>How to Link Your Line Account</DialogTitle>
                <DialogDescription>
                    A brief step-by-step tutorial to connect your Line Account
                    with SchedulePolice.
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
                <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4 flex flex-col gap-4">
                        <h2 className="text-lg font-medium leading-none">
                            Instructions
                        </h2>

                        {instructions.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <p className="text-sm font-semibold">
                                    {idx + 1}. {item.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                        <Separator />
                        <LinkAccount />
                    </div>
                </ScrollArea>
            </div>

            <DialogFooter>
                Consult with ResMan (JB/NB) if you have any questions.
            </DialogFooter>
        </>
    );
}

export function LinkAccount() {
    const [connectionString, setConnectionString] = useState<string | null>(
        null
    );
    const [isFetched, setIsFetched] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchConnectionString() {
            try {
                if (user?.line_id)
                    toast.info(
                        "You have already linked your Line account. Contact ResMan if you want to re-link."
                    );
                setIsFetched(true);
                const response = await GetConnectionString();

                if (response.success && response.data) {
                    setConnectionString(response.data);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                toast.error("Failed to get Connection String!", {
                    description: "Error: " + error,
                });
            }
        }
        if (!isFetched) fetchConnectionString();
    }, [isFetched, user?.line_id]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Get Connection String</DialogTitle>
                <DialogDescription>
                    Press the copy icon to get your connection string.
                </DialogDescription>
            </DialogHeader>

            <div>
                <div className="text-sm text-muted-foreground mb-4">
                    {connectionString
                        ? "Connection String:"
                        : "Press the button below to fetch your UID."}
                </div>

                {
                    <div className="w-full flex justify-center">
                        <ScriptCopyBtn
                            codeLanguage="yaml"
                            lightTheme="laserwave"
                            darkTheme="laserwave"
                            commandMap={{
                                "": connectionString ?? "Loading...",
                            }}
                            disabled={!connectionString}
                        />
                    </div>
                }
            </div>
        </>
    );
}
