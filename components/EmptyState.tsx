interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({
  title,
  description,
  icon = '🔍',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3 px-4">
      <span className="text-5xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-headline font-semibold text-primary text-lg">{title}</p>
      {description && (
        <p className="text-muted text-sm max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
