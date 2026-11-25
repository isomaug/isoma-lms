import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaDownload,
  FaCertificate,
  FaPlay,
  FaGraduationCap,
  FaEye,
  FaUserPlus,
} from "react-icons/fa";
import { Folder, Users, Trash2 } from "lucide-react";
import { apiFetch } from "@/api/client/apiClient";
import PageHeader from "@/components/layout/PageHeader";
import SEO from "@/components/seo/SEO";
import CourseCard from "@/components/courses/catalog/CourseCard";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import StudentEnrollmentModal from "@/components/courses/enrollment/StudentEnrollmentModal";
import RecommendedCourses from "@/components/courses/catalog/RecommendedCourses";
import DashboardMyCohorts from "@/pages/dashboard/cohorts/DashboardMyCohorts";

import { useAuth } from "@/context/AuthContext";

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState("courses");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const { me } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [certsError, setCertsError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [rosterStudents, setRosterStudents] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const handleUnenroll = async (slug) => {
    if (!window.confirm("Are you sure you want to completely unenroll from this course? Your progress will be archived, but you will lose access.")) return;
    try {
      const res = await apiFetch(`/api/courses/${slug}/unenroll/`, { method: "POST" });
      if (res.ok) {
        setCourses(courses.filter((c) => c.slug !== slug));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to unenroll.");
      }
    } catch (err) {
      alert("Error unerolling: " + err.message);
    }
  };

  useEffect(() => {
    // Fetch Enrolled Courses
    const fetchCourses = async () => {
      try {
        const res = await apiFetch("/api/courses/?enrolled=true");
        if (!res.ok) throw new Error("Failed to load your courses");
        const data = await res.json();
        setCourses(data.results ? data.results : data);
      } catch (err) {
        setCoursesError(err.message);
      } finally {
        setLoadingCourses(false);
      }
    };

    // Fetch Certificates
    const fetchCerts = async () => {
      try {
        const res = await apiFetch("/api/courses/certificates/");
        if (!res.ok) throw new Error("Failed to load certificates");
        const data = await res.json();
        setCertificates(data);
      } catch (err) {
        setCertsError(err.message);
      } finally {
        setLoadingCerts(false);
      }
    };

    // Fetch Student Playground Projects
    const fetchProjects = async () => {
      try {
        const res = await apiFetch("/api/courses/my-projects/");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch my projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchCourses();
    fetchCerts();
    fetchProjects();
  }, []);

  useEffect(() => {
    // Fetch Instructor Roster if instructor
    const fetchRoster = async () => {
      if (me?.is_staff || me?.is_superuser || me?.is_instructor) {
        setLoadingRoster(true);
        try {
          const res = await apiFetch("/api/courses/instructor/students/");
          if (res.ok) {
            const data = await res.json();
            setRosterStudents(data);
          }
        } catch (err) {
          console.error("Failed to load student roster", err);
        } finally {
          setLoadingRoster(false);
        }
      }
    };

    fetchRoster();
  }, [me]);

  const uniqueRosterCourses = ["All", ...new Set(rosterStudents.map(st => st.course_title))];
  const displayedFilterCourses = uniqueRosterCourses.filter(c => c.toLowerCase().includes(filterSearchQuery.toLowerCase()));
  
  const filteredRoster = rosterStudents.filter(st => {
    const matchesCourse = selectedFilterCourse === "All" || st.course_title === selectedFilterCourse;
    const matchesStudent = studentSearchQuery === "" || 
      st.student_name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
      st.student_email?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      st.student_username?.toLowerCase().includes(studentSearchQuery.toLowerCase());
    return matchesCourse && matchesStudent;
  });

  return (
    <div className="bg-background min-h-screen pb-20">
      <SEO title="My Learning | Peter Gordon Ekebu" />
      <PageHeader
        title="My Learning Portal"
        description="Track your course progress, earned certificates, and student roster."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tabs */}
        <div className="flex w-full mb-10 border-b border-border/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 min-w-[130px] sm:min-w-0 h-11 sm:h-12 px-2 font-['Inter',sans-serif] text-[13px] sm:text-[14px] font-bold transition-colors flex items-center justify-center text-center cursor-pointer rounded-none border-b-2 select-none ${
              activeTab === "courses"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span>My Courses</span>
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex-1 min-w-[130px] sm:min-w-0 h-11 sm:h-12 px-2 font-['Inter',sans-serif] text-[13px] sm:text-[14px] font-bold transition-colors flex items-center justify-center text-center cursor-pointer rounded-none border-b-2 select-none ${
              activeTab === "certificates"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span>My Certificates</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 min-w-[130px] sm:min-w-0 h-11 sm:h-12 px-2 font-['Inter',sans-serif] text-[13px] sm:text-[14px] font-bold transition-colors flex items-center justify-center text-center cursor-pointer rounded-none border-b-2 select-none ${
              activeTab === "projects"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span>My Projects</span>
          </button>

          {(me?.is_staff || me?.is_superuser || me?.is_instructor) && (
            <button
              onClick={() => setActiveTab("instructor_roster")}
              className={`flex-1 min-w-[130px] sm:min-w-0 h-11 sm:h-12 px-2 font-['Inter',sans-serif] text-[13px] sm:text-[14px] font-bold transition-colors flex items-center justify-center text-center cursor-pointer rounded-none border-b-2 select-none ${
                activeTab === "instructor_roster"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <span>Student Roster</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("learning_cohorts")}
            className={`flex-1 min-w-[130px] sm:min-w-0 h-11 sm:h-12 px-2 font-['Inter',sans-serif] text-[13px] sm:text-[14px] font-bold transition-colors flex items-center justify-center text-center cursor-pointer rounded-none border-b-2 select-none ${
              activeTab === "learning_cohorts"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span>Cohorts I'm Learning In</span>
          </button>
        </div>

        {/* Courses Tab Content */}
        {activeTab === "courses" && (
          <div className="animate-in fade-in duration-500">
            {loadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : coursesError ? (
              <div className="text-center py-10 text-red-500 bg-red-500/10 rounded-xl">
                {coursesError}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 border border-border rounded-xl">
                <FaPlay className="mx-auto text-5xl text-muted-foreground/30 mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No Courses Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  You aren't enrolled in any courses. Explore the catalog to
                  start learning!
                </p>
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="relative group/wrapper">
                    <CourseCard
                      course={course}
                      isEnrolledOverride={true}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleUnenroll(course.slug);
                      }}
                      title="Unenroll from course"
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-2 rounded opacity-0 group-hover/wrapper:opacity-100 transition-opacity z-30 shadow"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 border-t border-border/60 pt-8">
              <RecommendedCourses />
            </div>
          </div>
        )}

        {/* Certificates Tab Content */}
        {activeTab === "certificates" && (
          <div className="animate-in fade-in duration-500">
            {loadingCerts ? (
              <DelayedSpinner fullScreen={false} message="Loading your certificates..." />
            ) : certsError ? (
              <div className="text-center py-10 text-red-500 bg-red-500/10 rounded-xl">
                {certsError}
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 border border-border rounded-xl">
                <FaCertificate className="mx-auto text-5xl text-muted-foreground/30 mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No Certificates Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Complete all lessons in a course to automatically earn your
                  certificate of completion.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.uuid}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <FaCertificate size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        ID: {cert.uuid.split("-")[0]}
                      </span>
                      {cert.pdf_url && (
                        <a
                          href={cert.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          <FaEye /> View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab Content */}
        {activeTab === "projects" && (
          <div className="animate-in fade-in duration-500 font-['Inter',sans-serif] text-[14px]">
            {loadingProjects ? (
              <div className="text-center text-muted-foreground py-12 text-sm">
                Loading your saved projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl p-8 w-full">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No Projects Saved Yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  When you work on coding lessons in Scratch, MakeCode, or Wokwi, click "Save My Project" inside the lesson playground to save your work here.
                </p>
                <Link
                  to="/courses"
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-1">
                        {proj.course_title}
                      </span>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{proj.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{proj.lesson_title}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                      {proj.file_url && (
                        <a
                          href={proj.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-secondary text-secondary-foreground font-semibold text-xs rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
                        >
                          <FaDownload size={11} /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructor Roster Tab Content */}
        {activeTab === "instructor_roster" && (me?.is_staff || me?.is_superuser || me?.is_instructor) && (
          <div className="animate-in fade-in duration-500 font-['Inter',sans-serif]">
            {loadingRoster ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rosterStudents.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl p-8 w-full">
                <FaGraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No Enrolled Students Yet</h3>
                <p className="text-xs text-muted-foreground">Students enrolled in your courses will appear here with their progress %, XP, and earned certificates.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
                <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-10 backdrop-blur-md">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg lg:text-xl text-foreground tracking-tight">
                      Enrolled Students ({filteredRoster.length})
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Instructor Dashboard View
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 w-full md:w-auto relative min-w-0">
                    <div className="relative flex-1 min-w-0 md:w-[160px]">
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border text-[11px] sm:text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary shadow-xs truncate"
                      />
                    </div>
                    <div className="relative shrink-0 max-w-[120px] sm:max-w-[180px]">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`w-full bg-background border border-border text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 focus:outline-none text-foreground shadow-xs flex items-center justify-between gap-1 ${isFilterOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
                      >
                        <span className="truncate">{selectedFilterCourse}</span>
                        <span className="text-[10px] opacity-60 shrink-0">▼</span>
                      </button>
                      
                      {isFilterOpen && (
                        <div className="absolute top-full left-0 w-[200px] sm:w-full bg-card border border-border border-t-0 rounded-b-2xl shadow-xl z-20 max-h-[250px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-2 border-b border-border/50 bg-muted/20">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search courses..."
                              value={filterSearchQuery}
                              onChange={(e) => setFilterSearchQuery(e.target.value)}
                              className="w-full bg-background border border-border text-xs rounded px-2 py-1 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="overflow-y-auto">
                            {displayedFilterCourses.length === 0 ? (
                              <div className="p-3 text-xs text-muted-foreground text-center">No courses found</div>
                            ) : (
                              displayedFilterCourses.map(course => (
                                <button
                                  key={course}
                                  onClick={() => {
                                    setSelectedFilterCourse(course);
                                    setIsFilterOpen(false);
                                    setFilterSearchQuery("");
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors ${selectedFilterCourse === course ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
                                >
                                  {course}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setIsEnrollModalOpen(true)}
                      className="shrink-0 px-2.5 sm:px-3.5 py-1.5 bg-primary text-primary-foreground font-bold text-[11px] sm:text-xs rounded-xl shadow-xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <FaUserPlus size={11} /> Enroll +
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[60vh] w-full min-w-0">
                  <table className="w-full text-left text-xs text-foreground whitespace-nowrap">
                    <thead className="bg-muted/50 border-b border-border uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                      <tr>
                        <th className="px-3 sm:px-4 py-2.5">Student</th>
                        <th className="px-3 sm:px-4 py-2.5">Course</th>
                        <th className="px-3 sm:px-4 py-2.5">Progress</th>
                        <th className="px-3 sm:px-4 py-2.5">XP Earned</th>
                        <th className="px-3 sm:px-4 py-2.5 text-center">Retakes</th>
                        <th className="px-3 sm:px-4 py-2.5">Enrolled Date</th>
                        <th className="px-3 sm:px-4 py-2.5">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredRoster.map((st) => (
                        <tr key={st.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-3 sm:px-4 py-2.5">
                            <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] sm:max-w-[260px]">
                              <span className="font-bold text-foreground truncate" title={st.student_name}>{st.student_name}</span>
                              <span className="text-[11px] text-muted-foreground truncate hidden sm:inline" title={st.student_email}>({st.student_email})</span>
                              {st.cohort_name ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0 truncate max-w-[90px]" title={`Cohort: ${st.cohort_name}`}>
                                  <Users size={9} className="shrink-0" />
                                  <span className="truncate">{st.cohort_name}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] text-muted-foreground bg-muted shrink-0">
                                  No Cohort
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 max-w-[160px] sm:max-w-[240px]">
                            <div className="truncate font-semibold text-primary" title={st.course_title}>
                              {st.course_title}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 sm:w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${st.progress_percent}%` }} />
                              </div>
                              <span className="font-bold text-[11px] tabular-nums">{st.progress_percent}%</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 font-bold text-amber-500 tabular-nums">⭐ {st.total_xp} XP</td>
                          <td className="px-3 sm:px-4 py-2.5 text-muted-foreground font-semibold text-center tabular-nums">{st.total_retakes || 0}</td>
                          <td className="px-3 sm:px-4 py-2.5 text-muted-foreground tabular-nums">{new Date(st.enrolled_at).toLocaleDateString()}</td>
                          <td className="px-3 sm:px-4 py-2.5">
                            {st.certificate_url ? (
                              <a
                                href={st.certificate_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                              >
                                <FaCertificate size={10} /> View PDF
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic whitespace-nowrap">In Progress</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cohorts I'm Learning In Tab Content */}
        {activeTab === "learning_cohorts" && (
          <div className="animate-in fade-in duration-500 min-h-[400px]">
            <DashboardMyCohorts type="learning" />
          </div>
        )}

        <StudentEnrollmentModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          courses={courses}
          onEnrollSuccess={() => {
            // Refetch roster
            const fetchRoster = async () => {
              try {
                const res = await apiFetch("/api/courses/instructor/students/");
                if (res.ok) {
                  const data = await res.json();
                  setRosterStudents(data);
                }
              } catch (err) {}
            };
            fetchRoster();
          }}
        />
      </div>
    </div>
  );
}



