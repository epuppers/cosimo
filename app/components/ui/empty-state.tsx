import { cn } from "~/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-10 px-5", className)}>
      {icon && <div className="text-taupe-2 mb-4">{icon}</div>}
      <div className="font-pixel text-base text-taupe-5 tracking-[0.5px] mb-2.5">{title}</div>
      {description && <div className="font-sans text-xs text-taupe-3 leading-[1.6]">{description}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
