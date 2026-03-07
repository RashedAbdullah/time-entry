"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { createContext, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogOptions {
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmDialogContextType = (
  options: ConfirmDialogOptions,
) => Promise<Boolean>;

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within a ConfirmDialogProvider",
    );
  }
  return context;
};

export const ConfirmDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({});
  const resolver = useRef<(result: boolean) => void>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const confirm = (optns?: ConfirmDialogOptions) => {
    setOptions(optns || {});
    clearTimeout(timeoutRef.current as NodeJS.Timeout);
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 1);

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  };

  const cancel = (result: boolean) => {
    setOpen(false);
    resolver.current?.(result);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <AlertDialog open={open} onOpenChange={() => setOpen(false)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {options.title || "আপনি কি শিউর?"}
                </AlertDialogTitle>
                {options.description && (
                  <div className="text-muted-foreground mt-2">
                    {options.description ||
                      "আপনি কি শিউর যে, আপনি উক্ত বিষয়টি ডিলিট করতে চান?"}
                  </div>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => cancel(false)}>
                  {options.cancelText || "Cancel"}
                </Button>
                <Button variant="destructive" onClick={() => cancel(true)}>
                  {options.confirmText || "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>,
          document.body,
        )}
    </ConfirmDialogContext.Provider>
  );
};
