import { useState, useMemo } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { customToast as toast } from "@/components/notifications/GlobalPopup";

export function useInstructorManagement() {
  const { data: instructorsData, error, isLoading, mutate } = useSWR("/api/admin/instructors/", swrFetcher);
  const { data: coursesData } = useSWR("/api/courses/", swrFetcher);
  const { data: cohortsData } = useSWR("/api/admin/cohorts/", swrFetcher);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "first_name", direction: "asc" });
  const [assigningModalInstructor, setAssigningModalInstructor] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const rawInstructors = Array.isArray(instructorsData) ? instructorsData : instructorsData?.results || [];
  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.results || [];
  const cohorts = Array.isArray(cohortsData) ? cohortsData : cohortsData?.results || [];

  const handleRemoveRole = async (id) => {
    if (!window.confirm("Are you sure you want to remove the instructor role from this user?")) return;
    try {
      const res = await apiFetch(`/api/admin/instructors/${id}/remove_instructor/`, { method: "POST" });
      if (res.ok) {
        toast.success("Instructor role removed successfully");
        mutate();
      } else {
        toast.error("Failed to remove role");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleMessage = async (id) => {
    const msg = window.prompt("Enter your message to this instructor:");
    if (!msg) return;

    try {
      const res = await apiFetch(`/api/admin/instructors/${id}/message/`, {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        toast.success("Message sent successfully");
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleAssignCourse = async (instructorId, courseId) => {
    if (!courseId) return;
    setIsAssigning(true);
    try {
      const res = await apiFetch(`/api/admin/instructors/${instructorId}/assign-course/`, {
        method: "POST",
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        toast.success("Course assigned successfully");
        setSelectedCourseId("");
        mutate();
        if (assigningModalInstructor && assigningModalInstructor.id === instructorId) {
          const updatedInst = await (await apiFetch(`/api/admin/instructors/${instructorId}/`)).json().catch(() => null);
          if (updatedInst) setAssigningModalInstructor(updatedInst);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to assign course");
      }
    } catch {
      toast.error("An error occurred while assigning course");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveCourse = async (instructorId, courseId) => {
    try {
      const res = await apiFetch(`/api/admin/instructors/${instructorId}/remove-course/`, {
        method: "POST",
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        toast.success("Course unassigned successfully");
        mutate();
        if (assigningModalInstructor && assigningModalInstructor.id === instructorId) {
          const updatedInst = await (await apiFetch(`/api/admin/instructors/${instructorId}/`)).json().catch(() => null);
          if (updatedInst) setAssigningModalInstructor(updatedInst);
        }
      } else {
        toast.error("Failed to unassign course");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleAssignCohort = async (instructorId, cohortId) => {
    if (!cohortId) return;
    setIsAssigning(true);
    try {
      const res = await apiFetch(`/api/admin/instructors/${instructorId}/assign-cohort/`, {
        method: "POST",
        body: JSON.stringify({ cohort_id: cohortId }),
      });
      if (res.ok) {
        toast.success("Cohort assigned successfully");
        setSelectedCohortId("");
        mutate();
        if (assigningModalInstructor && assigningModalInstructor.id === instructorId) {
          const updatedInst = await (await apiFetch(`/api/admin/instructors/${instructorId}/`)).json().catch(() => null);
          if (updatedInst) setAssigningModalInstructor(updatedInst);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to assign cohort");
      }
    } catch {
      toast.error("An error occurred while assigning cohort");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveCohort = async (instructorId, cohortId) => {
    try {
      const res = await apiFetch(`/api/admin/instructors/${instructorId}/remove-cohort/`, {
        method: "POST",
        body: JSON.stringify({ cohort_id: cohortId }),
      });
      if (res.ok) {
        toast.success("Cohort unassigned successfully");
        mutate();
        if (assigningModalInstructor && assigningModalInstructor.id === instructorId) {
          const updatedInst = await (await apiFetch(`/api/admin/instructors/${instructorId}/`)).json().catch(() => null);
          if (updatedInst) setAssigningModalInstructor(updatedInst);
        }
      } else {
        toast.error("Failed to unassign cohort");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const displayInstructors = useMemo(() => {
    let result = rawInstructors.filter((inst) => {
      const q = searchQuery.toLowerCase();
      const nameMatch = (inst.first_name || "").toLowerCase().includes(q) || (inst.last_name || "").toLowerCase().includes(q);
      const emailMatch = (inst.email || "").toLowerCase().includes(q);
      return nameMatch || emailMatch;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawInstructors, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return {
    rawInstructors,
    courses,
    cohorts,
    displayInstructors,
    isLoading,
    error,
    mutate,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    assigningModalInstructor,
    setAssigningModalInstructor,
    selectedCourseId,
    setSelectedCourseId,
    selectedCohortId,
    setSelectedCohortId,
    isAssigning,
    handleRemoveRole,
    handleMessage,
    handleAssignCourse,
    handleRemoveCourse,
    handleAssignCohort,
    handleRemoveCohort,
  };
}
