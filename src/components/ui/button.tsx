import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import Link from "next/link";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-none gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-none px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  title,
  titlePlace = "top",
  loadingText,
  loading = false,
  href,
  type,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    title?: string;
    titlePlace?: "top" | "right" | "bottom" | "left";
    loadingText?: string;
    loading?: boolean;
    href?: string;
    type?: "button" | "submit" | "reset";
  }) {
  const Comp = asChild ? Slot : "button";

  if (loading) {
    return (props.children = (
      <div className="flex items-center gap-2">
        <LoaderCircle className="animate-spin" />
        {loadingText !== undefined ? loadingText : "লোডিং..."}
      </div>
    ));
  }

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild slot="div">
          <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
            type={type || (href ? undefined : "button")}
          />
        </TooltipTrigger>
        <TooltipContent side={titlePlace}>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      type={type || (href ? undefined : "button")}
    />
  );
}

interface ButtonLinkProps
  extends React.ComponentProps<"a">, VariantProps<typeof buttonVariants> {
  title?: string;
  asChild?: boolean;
}

function ButtonLink({
  className,
  variant,
  size,
  title,
  ...props
}: ButtonLinkProps) {
  const Comp = Link as any;

  const buttonClass = cn(buttonVariants({ variant, size, className }));

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp className={buttonClass} {...props} />
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return <Comp className={buttonClass} {...props} />;
}

export { Button, buttonVariants, ButtonLink };
