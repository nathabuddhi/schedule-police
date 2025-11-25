"use client";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function Page() {
    const { user, loading } = useAuthGuard({ requireAuth: true });

    if (loading) return <Loading />;
    else if (!user) return null;

    return (
        <div>
            <Navbar />
            <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center">
                <h1 className="text-xl">
                    Well unfortunately, there&apos;s nothing here yet...
                </h1>
                <p>
                    But perhaps, in the meantime, go ahead and connect your line
                    account in the navbar!
                </p>
            </div>
        </div>
    );
}
