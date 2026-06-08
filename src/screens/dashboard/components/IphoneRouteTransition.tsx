"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isDetailPath(pathname: string) {
  return pathname.startsWith("/dashboard/history/") || pathname.startsWith("/dashboard/orders/");
}

export default function IphoneRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const animationClass = isDetailPath(pathname) ? "iphone-push-enter" : "iphone-tab-enter";

  return (
    <div key={pathname} className={`iphone-screen ${animationClass}`}>
      {children}
    </div>
  );
}
