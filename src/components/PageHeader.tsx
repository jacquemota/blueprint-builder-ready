interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
