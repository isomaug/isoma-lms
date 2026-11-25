import React, { useState, useEffect } from "react";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { apiFetch } from "@/api/client/apiClient";
import { recommendCourses } from "@/utils/courseRecommender";
import CourseCard from "@/components/courses/catalog/CourseCard";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";

export default function RecommendedCourses({ maxDisplay = 3 }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      // 1. Fetch user profile interests
      let userInterests = [];
      const profileRes = await apiFetch("/api/courses/user/profile/");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        userInterests = profileData.interests || [];
        setInterests(userInterests);
      }

      // 2. Fetch published courses
      const coursesRes = await apiFetch("/api/courses/");
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const all = coursesData.results ? coursesData.results : coursesData;
        const recommended = recommendCourses(all, userInterests);
        setCourses(recommended.slice(0, maxDisplay));
      }
    } catch (err) {
      console.error("Failed to load course recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) return null;

  return (
    <div className="w-full space-y-4 font-['Inter',sans-serif]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <FaStar size={16} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground font-['Poppins']">
              Suggested Courses For You
            </h3>
            <p className="text-xs text-muted-foreground">
              {interests.length > 0
                ? "Tailored based on your saved learning preferences"
                : "Explore our top recommended robotics and coding tracks"}
            </p>
          </div>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All <FaArrowRight size={10} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
