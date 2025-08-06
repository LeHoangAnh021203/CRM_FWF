import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={`border rounded p-2 w-full focus:outline-none focus:ring ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";