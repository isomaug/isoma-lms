/**
 * CourseCurriculumAccordion -- Expandable list of modules and lessons.
 */
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import LessonItem from "@/components/courses/viewer/LessonItem";

export default function CourseCurriculumAccordion({
  modules = [],
  totalLessons,
  totalDurationMinutes,
  onPreviewLesson,
}) {
  const [expandedModules, setExpandedModules] = useState(() => {
    // Expand the first module by default if there are modules
    if (modules.length > 0) {
      return { [modules[0].id]: true };
    }
    return {};
  });

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    modules.forEach((m) => (allExpanded[m.id] = true));
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const allAreExpanded =
    modules.length > 0 && modules.every((m) => expandedModules[m.id]);

  const hours = Math.floor((totalDurationMinutes || 0) / 60);
  const mins = (totalDurationMinutes || 0) % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Course content
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground/60">
            {modules.length} sections • {totalLessons || 0} lectures •{" "}
            {durationLabel} total length
          </span>
          <button
            onClick={allAreExpanded ? collapseAll : expandAll}
            className="text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
          >
            {allAreExpanded ? "Collapse all sections" : "Expand all sections"}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-background">
        {modules.map((module, index) => {
          const isExpanded = !!expandedModules[module.id];

          return (
            <div
              key={module.id}
              className={index !== 0 ? "border-t border-border" : ""}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  {isExpanded ? (
                    <FaChevronUp
                      size={12}
                      className="text-foreground/60 shrink-0"
                    />
                  ) : (
                    <FaChevronDown
                      size={12}
                      className="text-foreground/60 shrink-0"
                    />
                  )}
                  <span className="font-semibold text-foreground text-[15px]">
                    {module.week ? `Week ${module.week}: ` : `Module ${module.order}: `}
                    {module.title}
                  </span>
                </div>
                <div className="text-xs text-foreground/50 whitespace-nowrap ml-4">
                  {module.lesson_count ||
                    (module.lessons && module.lessons.length) ||
                    0}{" "}
                  lectures • {module.module_duration || 0} min
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && module.lessons && module.lessons.length > 0 && (
                <div className="border-t border-border bg-background">
                  {module.lessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onClickPreview={onPreviewLesson}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {modules.length === 0 && (
          <div className="p-8 text-center text-foreground/50">
            Curriculum is empty.
          </div>
        )}
      </div>
    </div>
  );
}
