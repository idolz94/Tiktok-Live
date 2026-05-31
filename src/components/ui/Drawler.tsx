"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";

type DrawlerBaseProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  trigger?: ReactNode;

  title?: ReactNode;
  description?: ReactNode;

  children: ReactNode;
  footer?: ReactNode;

  height?: "auto" | "sm" | "md" | "lg" | "full";
  showCloseButton?: boolean;
  showHandle?: boolean;
  dismissible?: boolean;

  contentClassName?: string;
  bodyClassName?: string;
};

const HEIGHT_CLASS: Record<NonNullable<DrawlerBaseProps["height"]>, string> = {
  auto: "max-h-[90dvh]",
  sm: "h-[40dvh]",
  md: "h-[65dvh]",
  lg: "h-[82dvh]",
  full: "h-[96dvh]",
};

export function DrawlerBase({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  height = "auto",
  showCloseButton = true,
  showHandle = true,
  dismissible = true,
  contentClassName = "",
  bodyClassName = "",
}: DrawlerBaseProps) {
  const isControlled = typeof open === "boolean";

  return (
    <Drawer.Root
      open={isControlled ? open : undefined}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
    >
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />

        <Drawer.Content
          className={[
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] bg-white shadow-2xl outline-none",
            HEIGHT_CLASS[height],
            contentClassName,
          ].join(" ")}
        >
          {showHandle ? (
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />
          ) : null}

          {(title || description || showCloseButton) ? (
            <div className="shrink-0 border-b border-slate-100 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {title ? (
                    <Drawer.Title className="text-lg font-black text-slate-950">
                      {title}
                    </Drawer.Title>
                  ) : (
                    <Drawer.Title className="sr-only">Popup</Drawer.Title>
                  )}

                  {description ? (
                    <Drawer.Description className="mt-1 text-sm leading-5 text-slate-500">
                      {description}
                    </Drawer.Description>
                  ) : null}
                </div>

                {showCloseButton ? (
                  <Drawer.Close asChild>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 active:scale-95"
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                  </Drawer.Close>
                ) : null}
              </div>
            </div>
          ) : (
            <Drawer.Title className="sr-only">Popup</Drawer.Title>
          )}

          <div
            className={[
              "min-h-0 flex-1 overflow-y-auto px-5 py-4",
              footer ? "pb-4" : "pb-[calc(env(safe-area-inset-bottom)+24px)]",
              bodyClassName,
            ].join(" ")}
          >
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              {footer}
            </div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}