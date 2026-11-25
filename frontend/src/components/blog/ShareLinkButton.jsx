import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function ShareLinkButton({
  title,
  text,
  url,
  label = "Share",
  className = "",
}) {
  const [isSharing, setIsSharing] = useState(false);

  const copyLink = async () => {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard access is unavailable");
    }
    await navigator.clipboard.writeText(url);
    toast.success("Course link copied");
  };

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    const shareData = { title, text, url };

    try {
      const canUseNativeShare =
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" || navigator.canShare(shareData));

      if (canUseNativeShare) {
        await navigator.share(shareData);
        return;
      }

      await copyLink();
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await copyLink();
      } catch {
        toast.error("Unable to share this course. Please copy the page URL manually.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isSharing}
      aria-busy={isSharing}
      aria-label="Share this course"
      className={`gap-2 ${className}`}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      {isSharing ? "Preparing..." : label}
    </Button>
  );
}
