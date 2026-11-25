import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/api/client/apiClient";
import CourseViewer from "@/pages/courses/learning/CourseViewer";
import PastPaperReader from "@/pages/courses/materials/PastPaperReader";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";

export default function CourseLearningEntry() {
  const { slug } = useParams();
  const [courseType, setCourseType] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/courses/${slug}/`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Course unavailable");
        return response.json();
      })
      .then((course) => {
        if (!cancelled) {
          setCourseType(course.is_past_paper ? "past-paper" : "course");
        }
      })
      .catch(() => {
        if (!cancelled) setCourseType("course");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (courseType === "past-paper") return <PastPaperReader />;
  if (courseType === "course") return <CourseViewer />;

  return <DelayedSpinner message="Loading course..." />;
}
