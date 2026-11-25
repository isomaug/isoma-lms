import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { toast } from "sonner";

import { apiFetch } from '@/api/client/apiClient';
import { useAuth } from '@/context/AuthContext';

export default function ReviewModal({ isOpen, onClose, courseSlug, existingReview = null, onSuccess }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { accessToken } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
    }
  }, [isOpen, existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/courses/${courseSlug}/review/`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit review");
      }
      toast.success(existingReview ? "Review updated successfully!" : "Review submitted successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingReview ? "Edit Review" : "Leave a Review"}</DialogTitle>
          <DialogDescription>
            Share your experience with this course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">How would you rate this course?</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="comment" className="text-sm font-medium">Your feedback (optional)</label>
            <Textarea
              id="comment"
              placeholder="Tell us what you liked or what could be improved..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : (existingReview ? "Submit Edit" : "Submit Review")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
