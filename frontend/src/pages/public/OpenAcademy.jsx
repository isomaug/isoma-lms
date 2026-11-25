import React, { useEffect, useState } from "react";
import { BookOpen, Clock, Layers, ArrowRight } from "lucide-react";
import { customToast } from "../../components/GlobalPopup";

export default function OpenAcademy() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/courses/?public=true")
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => setCourses(data.results || []))
      .catch(() => customToast.error("Could not load courses from API."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="px-6 pt-8 pb-6 md:px-10 border-b border-gray-100">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
          learn.isomaug.com
        </p>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight mt-1">
          Public Open Academy
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enroll directly in self-paced courses, bootcamps, and syllabus mastery tracks.
        </p>
      </div>

      <div className="p-5 md:p-10">
        {loading ? (
          <p className="text-sm text-gray-400">Loading courses...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative rounded-xl border border-gray-200 bg-white/70 p-5 md:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    UGX {course.price_ugx.toLocaleString()}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {course.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    {course.level}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    {course.lessons_count} lessons
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {course.duration_weeks} weeks
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    customToast.success(`Selected "${course.title}" - checkout & player coming in Phase 1/2.`)
                  }
                  className="mt-5 w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-all text-sm active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  View Course
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
