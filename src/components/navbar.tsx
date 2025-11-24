"use client";

import { BinusLogoWithRibbon } from "@/components/binus-logo";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LogoutButton } from "@/components/logout-button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import LinkAccountDialog from "@/components/link-account-dialog";

export default function Navbar() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

    const words = [
        "Hello!",
        "Halo!",
        "Hi!",
        "Hola!",
        "Bonjour!",
        "Ciao!",
        "こんにちは！",
        "안녕하세요!",
        "你好！",
        "Guten Tag!",
        "Olá!",
        "Здравствуйте!",
        "Merhaba!",
        "Sawubona!",
        "नमस्ते!",
        "Salam!",
        "Hej!",
        "Selamat!",
        "Shalom!",
    ];

    if (loading || !user) return null;
    return (
        <>
            <div className="flex flex-col">
                <div className="flex justify-between border-b-2 pb-2">
                    <div className="mx-24 w-full flex justify-between">
                        <BinusLogoWithRibbon />
                        <div className="flex items-center gap-4 text-xl font-medium text-foreground">
                            <p>
                                <TypingAnimation words={words} loop />{" "}
                                {user?.username}
                            </p>
                            <LogoutButton />
                            <ModeToggle />
                        </div>
                    </div>
                </div>
                <div className="px-30 py-2 gap-10">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <LinkAccountDialog />
                            </NavigationMenuItem>
                            {user?.role === "ADMIN" && (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>
                                        Admin
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="px-4 py-2 w-[200px]">
                                        <NavigationMenuLink
                                            asChild
                                            className="w-[200px]">
                                            <Link href="/admin/assistants">
                                                Manage Assistants List
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </>
    );
}
