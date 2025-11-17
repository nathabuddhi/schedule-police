import { BinusLogoWithRibbon } from "@/components/binus-logo";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LogoutButton } from "@/components/logout-button";

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
                <div className="mx-4 flex justify-between border-b-2 pb-2">
                    <div className="w-full flex justify-between">
                        <BinusLogoWithRibbon />
                        <div className="flex items-center gap-4 text-sm font-medium text-foreground">
                            <p>
                                <TypingAnimation words={words} loop />{" "}
                                {user?.username}
                            </p>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
                <div></div>
            </div>
        </>
    );
}
