import { cn } from "@/lib/utils";

function Input({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors",
        "placeholder:text-muted-foreground",
        "focus:ring-2 focus:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
