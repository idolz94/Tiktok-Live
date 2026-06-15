"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function getAnimationClass(pathname: string) {
  if (pathname.startsWith("/dashboard/history/") || pathname.startsWith("/dashboard/orders/")) {
    return "iphone-push-enter";
  }

  return "iphone-tab-enter";
}

export default function IphoneRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={`iphone-screen ${getAnimationClass(pathname)}`}>
      {children}
    </div>
  );
}
