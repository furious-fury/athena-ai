import * as React from "react"

import { cn } from "@/lib/utils"

// TextareaProps is empty, so we can just use the React.ComponentProps directly or ignore
export interface TextareaProps
    extends React.ComponentProps<"textarea"> {
    // Add a dummy prop to satisfy no-empty-object-type if strictly needed, or just leave as is if we disable the rule. 
    // But safer to just satisfy it:
    _dummy?: never;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
