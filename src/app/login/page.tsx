"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import Loading from "@/components/loading";
import { BinusLogoWithRibbon } from "@/components/binus-logo";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { user, loading } = useAuthGuard({ requireAuth: false });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const loginResponse = await login(username, password);
        if (loginResponse.success) router.push("/home");
        else toast.error(loginResponse.message);
    };

    if (loading) return <Loading />;
    else if (user) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-sm shadow-lg pt-0">
                <CardHeader className="text-center">
                    <div className="pl-5">
                        <BinusLogoWithRibbon />
                    </div>
                    <CardTitle className="mt-2 text-lg font-semibold text-card-foreground">
                        LCAS - SChedule Police
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-3">
                        <Input
                            placeholder="Initial"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            className="w-full bg-[#0090d1] hover:bg-[#0070a3] hover:cursor-pointer"
                            type="submit">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <div className="absolute bottom-4 right-4">
                <ModeToggle />
            </div>
        </div>
    );
}
