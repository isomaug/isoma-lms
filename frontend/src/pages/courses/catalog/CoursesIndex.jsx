/**
 * CoursesIndex -- Listing page for all published courses.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { motion as Motion } from "framer-motion";
import CourseCard from "@/components/courses/catalog/CourseCard";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import { apiFetch } from "@/api/client/apiClient";
import PageHeader from "@/components/layout/PageHeader";

export default function CoursesIndex() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let nextUrl = "/api/courses/";
        const allCourses = [];
        while (nextUrl) {
          const response = await apiFetch(nextUrl);
          if (!response.ok) throw new Error("Failed to load courses");
          const data = await response.json();
          if (Array.isArray(data)) {
            allCourses.push(...data);
            nextUrl = null;
          } else {
            allCourses.push(...(data.results || []));
            nextUrl = data.next
              ? new URL(data.next, window.location.origin).pathname +
                new URL(data.next, window.location.origin).search
              : null;
          }
        }
        setCourses(allCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Extract unique categories and include future predefined ones
  const categories = useMemo(() => {
    const predefined = [
      "All",
      "AI Explorers",
      "RoboCreators",
      "AI Engineers",
      "Teachers & Educators",
      "Web Development",
      "Data Science",
      "Hardware & Robotics",
      "Mobile App Development",
      "Game Development",
    ];
    const dbCategories = courses.filter((c) => c.category).map((c) => c.category);
    return Array.from(new Set([...predefined, ...dbCategories]));
  }, [courses]);

  // Removed the 2-row logic so that tags overflow naturally on desktop and show the 3 dots.
  const p = useMemo(() => {
    return categories;
  }, [categories]);

  const containerRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
        setCanScrollRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 1);
        setCanScrollLeft(scrollLeft > 0);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkOverflow);
    }
    
    const timer = setTimeout(checkOverflow, 200);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      if (container) container.removeEventListener("scroll", checkOverflow);
      clearTimeout(timer);
    };
  }, [categories]);

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };
  
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-12 lg:pb-24 bg-background transition-colors duration-300 min-h-screen">
      <PageHeader
        title="Courses & Learning Tracks"
        description="Practical, hands-on robotics, AI, and software engineering courses."
        className="pb-3 mb-3 pt-4"
      />

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Filter Component (Matching Projects.jsx) */}
        <div className="w-full mb-3">
          <input
            type="text"
            placeholder="Search courses by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-md px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        
        {categories.length > 1 && (
          <div className="relative w-full border-b border-border pb-3 mb-6">
            <div
              ref={containerRef}
              className="flex flex-row gap-2 sm:gap-3 overflow-hidden flex-nowrap w-full pr-12 justify-start items-start"
            >
              {p.map((cat, idx) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer select-none text-center w-full min-w-max ${
                      isActive
                        ? "text-primary-foreground font-black z-10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/15"
                    }`}
                  >
                    {cat}
                    {isActive && (
                      <Motion.div
                        layoutId="activeCourseCategoryIndicator"
                        className="absolute inset-0 bg-primary -z-10 rounded-none"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            {canScrollLeft && (
              <div 
                className="absolute left-0 top-0 bottom-6 bg-gradient-to-r from-background via-background/90 to-transparent pr-6 flex items-center justify-start z-20"
              >
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="w-8 h-[calc(100%-8px)] bg-card border border-border shadow-md flex items-center justify-center text-primary font-extrabold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer rounded-none"
                  title="Scroll Left"
                >
                  <span className="text-sm font-bold select-none">←</span>
                </button>
              </div>
            )}
            
            {canScrollRight && (
              <div 
                className="absolute right-0 top-0 bottom-6 bg-gradient-to-l from-background via-background/90 to-transparent pl-6 flex items-center justify-end z-20"
              >
                <button
                  type="button"
                  onClick={scrollRight}
                  className="w-8 h-[calc(100%-8px)] bg-card border border-border shadow-md flex items-center justify-center text-primary font-extrabold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer rounded-none"
                  title="Scroll Right"
                >
                  <span className="text-xs font-bold tracking-widest select-none">...</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {(loading || error) && !courses.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error && !courses.length ? (
          <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-lg">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 bg-background rounded-lg border border-border">
            No courses found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {filteredCourses.map((course, idx) => (
              <Motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <CourseCard course={course} />
              </Motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
