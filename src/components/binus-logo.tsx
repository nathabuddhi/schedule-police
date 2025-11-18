"use client";

import Image from "next/image";

export default function BinusLogo() {
    return (
        <>
            <Image
                src="/logo-lcas.png"
                alt="Logo"
                loading="lazy"
                width={210}
                height={100}
                unoptimized
                className="pt-2 dark:hidden"
            />
            <Image
                src="/logo-lcas-dark.png"
                alt="Logo"
                loading="lazy"
                width={210}
                height={100}
                unoptimized
                className="pt-2 hidden dark:block"
            />
        </>
    );
}

export function BinusLogoWithRibbon() {
    return (
        <div className="flex">
            <Image
                src="/strip.png"
                alt="ribbon"
                loading="lazy"
                width={35}
                height={30}
                unoptimized
            />
            <BinusLogo />
        </div>
    );
}
