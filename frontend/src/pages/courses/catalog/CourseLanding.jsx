/**
 * CourseLanding -- Detailed view of a single course.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaChevronRight, FaTimes } from "react-icons/fa";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/api/client/apiClient";
import { toast } from "sonner";

import CourseMetaBar from "@/components/courses/catalog/CourseMetaBar";
import CourseStickyPurchase from "@/components/courses/catalog/CourseStickyPurchase";
import CourseHeroMedia from "@/components/courses/catalog/CourseHeroMedia";
import CourseWhatYouLearn from "@/components/courses/catalog/CourseWhatYouLearn";
import CourseCurriculumAccordion from "@/components/courses/catalog/CourseCurriculumAccordion";
import CourseRequirements from "@/components/courses/catalog/CourseRequirements";
import InstructorProfile from "@/components/courses/catalog/InstructorProfile";
import CourseReviewSummary from "@/components/courses/catalog/CourseReviewSummary";
import CourseReviewCard from "@/components/courses/catalog/CourseReviewCard";
import ReviewModal from "@/components/courses/catalog/ReviewModal";
import VideoPlayer from "@/components/courses/viewer/VideoPlayer";
import DetailSkeleton from "@/components/skeletons/DetailSkeleton";
import SEO from "@/components/seo/SEO";
import ShareLinkButton from "@/components/blog/ShareLinkButton";
import { motion as Motion } from "framer-motion";

export default function CourseLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [thumbnailLoadFailed, setThumbnailLoadFailed] = useState(false);
  const previewDialogRef = useRef(null);
  const previewCloseButtonRef = useRef(null);
  const previewReturnFocusRef = useRef(null);

  const { addToCart } = useCart();

  const closeCoursePreview = useCallback(() => {
    setShowPreviewModal(false);
    window.requestAnimationFrame(() => {
      previewReturnFocusRef.current?.focus();
    });
  }, []);

  const fetchCourseData = useCallback(async () => {
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        apiFetch(`/api/courses/${slug}/`),
        apiFetch(`/api/courses/${slug}/reviews/`),
      ]);

      if (!courseRes.ok) throw new Error("Course not found");

      const courseData = await courseRes.json();
      setCourse(courseData);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const list = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.results || []);
        setReviews(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    setThumbnailLoadFailed(false);
  }, [course?.thumbnail]);

  useEffect(() => {
    if (!showPreviewModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      previewCloseButtonRef.current?.focus();
    });

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCoursePreview();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        previewDialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, iframe, video[controls], audio[controls], [tabindex]:not([tabindex="-1"])'
        ) || []
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        previewDialogRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeCoursePreview, showPreviewModal]);

  const handleEnroll = async () => {
    if (course.is_enrolled) {
      navigate(
        course.is_past_paper
          ? `/courses/${slug}/paper`
          : `/courses/${slug}/learn`,
      );
      return;
    }

    // Free courses are still handled instantly here, which requires login
    if (Number(course.price_ugx) === 0) {
      if (!isAuthenticated) {
        toast.info("Please login to enroll in this course.");
        openAuthModal("login");
        return;
      }
      try {
        const res = await apiFetch(`/api/courses/checkout/`, {
          method: "POST",
          body: JSON.stringify({
            course_ids: [course.id],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Enrollment failed");
        navigate(
          course.is_past_paper
            ? `/courses/${slug}/paper`
            : `/courses/${slug}/learn`,
        );
      } catch (err) {
        alert(err.message);
      }
      return;
    }

    // Paid courses are added to the cart anonymously!
    addToCart(course);
    navigate("/cart");
  };

  const openCoursePreview = (videoUrl) => {
    if (!videoUrl) return;

    previewReturnFocusRef.current = document.activeElement;
    setPreviewVideoUrl(videoUrl);
    setShowPreviewModal(true);
  };

  const handlePreviewLesson = (lesson) => {
    if (!lesson.video_url) {
      alert("No preview video available for this lesson.");
      return;
    }

    openCoursePreview(lesson.video_url);
  };

  const handleCoursePreview = () => {
    openCoursePreview(course?.preview_video_url);
  };

  if (loading) {
    return (
      <div className="pt-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Course not found
        </h1>
        <Link
          to="/courses"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Browse all courses
        </Link>
      </div>
    );
  }

  const canonicalUrl = `https://petergordonekebu.com/courses/${course.slug}`;
  const socialImage = thumbnailLoadFailed
    ? "https://petergordonekebu.com/icon-512.png"
    : course.thumbnail || "https://petergordonekebu.com/icon-512.png";
  const summarySource = course.subtitle || course.description || "";
  const cleanSummary = summarySource
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>~]/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replaceAll("(", " ")
    .replaceAll(")", " ")
    .replace(/\s+/g, " ")
    .trim();
  const courseDescription = [
    `Study ${course.title} online with ${course.instructor_name || "Peter Gordon Ekebu"}.`,
    cleanSummary,
    "Build practical skills and learn at your own pace.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 200);
  const totalDurationMinutes = Number(course.total_duration_minutes) || 0;
  const durationStat =
    totalDurationMinutes <= 0
      ? "Self-paced"
      : totalDurationMinutes < 60
        ? `${totalDurationMinutes}m`
        : `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background min-h-screen pb-24 transition-colors duration-300"
    >
      <SEO
        title={`${course.title} | Online Course`}
        description={courseDescription}
        url={canonicalUrl}
        image={socialImage}
        type="website"
        keywords={[
          course.category,
          course.level,
          "online course",
          "Peter Gordon Ekebu",
        ].filter(Boolean)}
      />

      {/* Course hero */}
      <section className="mb-6 w-full border-b border-border bg-[#112841]">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_18.5rem] lg:grid-cols-[minmax(0,1fr)_19.5rem] items-stretch">
            {/* Left Column: Breadcrumbs, Title, Subtitle, Meta, Media */}
            <div className="flex flex-col justify-between min-w-0 space-y-3 text-left">
              <div className="space-y-2 text-left min-w-0">
                <nav
                  aria-label="Course breadcrumb"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-400"
                >
                  <Link to="/courses" className="hover:text-blue-300">
                    Courses
                  </Link>
                  <FaChevronRight
                    size={9}
                    className="text-white/40"
                    aria-hidden="true"
                  />
                  <span className="text-white/80">{course.category}</span>
                </nav>

                <h1 className="font-sans text-lg sm:text-xl lg:text-2xl font-bold leading-snug text-white">
                  {course.title}
                </h1>

                {course.subtitle && (
                  <p className="text-xs sm:text-sm leading-relaxed text-white/80">
                    {course.subtitle}
                  </p>
                )}

                <div className="pt-0.5">
                  <CourseMetaBar
                    avg_rating={course.avg_rating}
                    total_reviews={course.total_reviews}
                    enrollment_count={course.enrollment_count}
                    instructor_name={course.instructor_name}
                    updated_at={course.updated_at}
                    language={course.language}
                    level={course.level}
                  />
                </div>

                <div className="pt-4 flex items-center gap-2 w-full">
                  <ShareLinkButton
                    title={`${course.title} | Online Course`}
                    text={courseDescription}
                    url={canonicalUrl}
                    label="Share course"
                    className="flex-1 justify-center rounded-md border border-white/20 bg-white/5 text-white text-xs py-2 px-2.5 hover:bg-white/10 hover:text-white focus-visible:ring-white/70 transition-colors"
                  />
                  <Link
                    to="/courses"
                    className="flex-1 rounded-md border border-white/20 bg-white/5 text-white text-xs py-2 px-2.5 text-center hover:bg-white/10 hover:text-white focus-visible:ring-white/70 transition-colors"
                  >
                    Back to courses
                  </Link>
                </div>
              </div>

              {/* Left Media maintaining strict 16:9 aspect ratio - hidden on mobile */}
              <div className="pt-2 w-full hidden md:block">
                <CourseHeroMedia
                  course={course}
                  imageLoadFailed={thumbnailLoadFailed}
                  onImageError={() => setThumbnailLoadFailed(true)}
                  onPreview={handleCoursePreview}
                />
              </div>
            </div>

            {/* Right Column: Top-aligned Purchase Panel */}
            <div className="h-full">
              <CourseStickyPurchase
                course={course}
                onEnroll={handleEnroll}
                onPreview={handleCoursePreview}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-background border border-border p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <BookOpen className="text-foreground shrink-0" size={28} />
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">
                {course.total_lessons || 0}
              </p>
              <p className="text-[15px] text-foreground/70">Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="text-foreground shrink-0" size={28} />
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">
                {durationStat}
              </p>
              <p className="text-[15px] text-foreground/70">Duration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Star className="text-foreground shrink-0" size={28} />
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">
                {course.avg_rating > 0 ? course.avg_rating.toFixed(1) : "New"}
              </p>
              <p className="text-[15px] text-foreground/70">Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Users className="text-foreground shrink-0" size={28} />
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">
                {(course.enrollment_count || 0).toLocaleString()}
              </p>
              <p className="text-[15px] text-foreground/70">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <div className="w-full">
          {/* Content (Full Width) */}
          <div className="w-full space-y-16">
            {/* What you'll learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <CourseWhatYouLearn items={course.what_you_learn} />
            )}

            {course.is_past_paper && (
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Past paper workspace
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is not a lesson-by-lesson course. After you enrol you open the
                  paper reader with the authorised question paper, mark scheme, and
                  any approved step-by-step worked solutions.
                </p>
                {course.past_paper_summary && (
                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Component</dt>
                      <dd className="font-medium text-foreground">
                        {course.past_paper_summary.component_code || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Series</dt>
                      <dd className="font-medium text-foreground">
                        {course.past_paper_summary.series} {course.past_paper_summary.year}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Questions</dt>
                      <dd className="font-medium text-foreground">
                        {course.past_paper_summary.question_count || 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Solutions</dt>
                      <dd className="font-medium text-foreground">
                        {course.past_paper_summary.solution_ready
                          ? "Ready"
                          : "Pending review"}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            )}

            {/* Curriculum Accordion */}
            {!course.is_past_paper && course.modules && (
              <CourseCurriculumAccordion
                modules={course.modules}
                totalLessons={course.total_lessons}
                totalDurationMinutes={course.total_duration_minutes}
                onPreviewLesson={handlePreviewLesson}
              />
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <CourseRequirements requirements={course.requirements} />
            )}

            {/* Description */}
            {course.description && (
              <div className="space-y-4 relative pb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Description
                </h2>
                <div className="relative">
                  <div
                    className={`prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed font-sans overflow-hidden transition-all duration-500 ${!isDescriptionExpanded ? "max-h-[250px]" : "max-h-[5000px]"}`}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked(course.description)),
                    }}
                  />
                  {!isDescriptionExpanded && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  )}
                </div>
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isDescriptionExpanded ? "Show less" : "Show more"}
                </button>
              </div>
            )}

            {/* Instructor */}
            <div id="instructor">
              <InstructorProfile
                name={course.instructor_name}
                bio={course.instructor_bio}
                avatarUrl={course.instructor_avatar}
                rating={course.avg_rating} // Usually instructor rating is global, using course rating for now
                numStudents={course.enrollment_count} // Same here
              />
            </div>

            {/* Reviews */}
            <div className="space-y-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  Student feedback
                </h2>
                {(course.is_enrolled || isAuthenticated) && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal();
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Star size={14} className="fill-current text-yellow-300" />
                    Leave a Review
                  </button>
                )}
              </div>

              <CourseReviewSummary
                avgRating={course.avg_rating}
                totalReviews={course.total_reviews}
                distribution={course.rating_distribution}
              />

              <div className="mt-8">
                {reviews.length > 0 ? (
                  <div className="space-y-2">
                    {reviews.map((review) => (
                      <CourseReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/50">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        courseSlug={slug}
        onSuccess={fetchCourseData}
      />

      {/* Preview Modal */}
      {showPreviewModal &&
        previewVideoUrl &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <div
              ref={previewDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-preview-title"
              tabIndex={-1}
              className="w-full max-w-4xl bg-background rounded-lg overflow-hidden border border-border shadow-2xl relative"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
                <h3
                  id="course-preview-title"
                  className="font-semibold text-foreground"
                >
                  Course Preview
                </h3>
                <button
                  ref={previewCloseButtonRef}
                  type="button"
                  onClick={closeCoursePreview}
                  aria-label="Close course preview"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="w-full bg-black">
                <VideoPlayer url={previewVideoUrl} title="Course Preview" />
              </div>
            </div>
          </div>,
          document.body
        )}
    </Motion.div>
  );
}
