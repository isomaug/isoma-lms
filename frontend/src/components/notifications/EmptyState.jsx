import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  title = "No content yet",
  message = "Check back soon for updates.",
  icon: Icon = FolderOpen,
  actionText = "Go back Home",
  actionUrl = "/",
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in duration-700">
      <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-2xl font-bold font-serif text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {message}
      </p>
      {actionUrl && (
        <Button asChild variant="outline" className="premium-hover">
          <Link to={actionUrl}>{actionText}</Link>
        </Button>
      )}
    </div>
  );
}
