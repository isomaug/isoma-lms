# Courses Components Architecture (`src/components/courses/`)

This directory houses all specialized UI components supporting online education, video courses, interactive assignments, and student collaboration.

---

## 🏛️ Directory Structure

```
src/components/courses/
├── README.md              # Domain catalog and architecture overview
│
├── catalog/               # Course catalog, sales landing & public reviews
│   ├── CourseCard.jsx                  # Standard course card in grids
│   ├── CourseHeroMedia.jsx             # Course banner/video player in landing hero
│   ├── CourseIncludes.jsx              # "This course includes" feature list
│   ├── CourseMetaBar.jsx               # Metadata bar (rating, duration, student count)
│   ├── CourseRequirements.jsx          # Prerequisites and requirements list
│   ├── CourseWhatYouLearn.jsx          # Learning outcomes bullet grid
│   ├── CourseCurriculumAccordion.jsx   # Public syllabus preview accordion
│   ├── CourseStickyPurchase.jsx        # Floating desktop purchase sidebar
│   ├── CourseReviewCard.jsx            # Individual student review card
│   ├── CourseReviewSummary.jsx         # Review rating distribution bars
│   ├── ReviewModal.jsx                 # Student review submission dialog
│   ├── StarRating.jsx                  # Reusable star rating selector & display
│   ├── InstructorProfile.jsx           # Instructor bio, avatar & social handles
│   ├── RecommendedCourses.jsx          # Related/suggested course carousel
│   └── CourseBadge.jsx                 # Category/level tag badges
│
├── viewer/                # Active learning playback, progress & sidebar navigation
│   ├── LessonSidebar.jsx               # Learning player curriculum sidebar
│   ├── LessonItem.jsx                  # Individual lesson row (completion check, duration)
│   ├── LessonTextPanel.jsx             # Markdown lesson article reader
│   ├── VideoPlayer.jsx                 # Video playback player
│   ├── SessionTimer.jsx                # Study time tracker & session logger
│   ├── XPBadge.jsx                     # Gamification XP earned indicator
│   ├── CourseCompletionModal.jsx       # Congratulations & certificate unlock modal
│   ├── ResetProgressModal.jsx          # Reset student course progress confirmation
│   └── InstructorLessonEditButton.jsx  # Quick instructor edit shortcut
│
├── interactive/           # Interactive practice, AI tutor & collaborative tools
│   ├── CodingPlayground.jsx            # Live in-browser JavaScript code editor & runner
│   ├── QuizPlayer.jsx                  # Interactive quiz runner with score calculations
│   ├── CourseAssistant.jsx             # EkebuAI intelligent tutor chat panel
│   ├── EkebuAIProModal.jsx             # Pro AI subscription tier dialog
│   ├── ClassroomWhiteboardModal.jsx    # Collaborative canvas drawing board
│   ├── TeamSessionManager.jsx          # Peer study session coordination
│   └── ClassmatesTab.jsx               # Enrolled peers list and communication
│
├── materials/             # Textbooks, past paper readers & assignment docs
│   ├── CourseTextbookViewer.jsx        # Dual-page digital textbook viewer
│   ├── TextbookPager.jsx               # Page navigation & jump slider for textbooks
│   ├── TextSolutionPager.jsx           # Past paper questions and worked solutions pager
│   ├── LessonAssignmentDoc.jsx         # Assignment brief & student submission doc
│   ├── DocumentPreviewModal.jsx        # Fullscreen PDF/Word preview modal
│   └── ResponsivePdfViewer.jsx         # Mobile-responsive canvas PDF renderer
│
├── enrollment/            # Class rosters, student enrollment & attendance
│   ├── StudentEnrollmentModal.jsx      # Manual student enrollment modal
│   ├── EnrollmentManagementModal.jsx   # Batch enrollment & cohort access controls
│   ├── AttendanceModal.jsx             # Live lecture attendance tracking
│   └── CourseStudentsTable.jsx         # Enrolled student roster data table
│
└── instructors/           # Instructor staff administration & assignment workflows
    ├── useInstructorManagement.js      # Data fetching, assignment actions & sort/filter hook
    ├── InstructorTableRow.jsx          # Individual instructor table row with assignment chips
    └── InstructorAssignmentModal.jsx   # Multi-select course & cohort assignment modal
```

---

## 🔗 Related Layers
- **Backend App**: `backend/courses/` (Models: `Course`, `Module`, `Lesson`, `Enrollment`, `Quiz`)
- **Public Pages**: `src/pages/courses/catalog/` (`CoursesIndex.jsx`, `CourseLanding.jsx`)
- **Learning Player**: `src/pages/courses/learning/` (`CourseViewer.jsx`, `MyLearning.jsx`)
- **Instructor Dashboard**: `src/pages/dashboard/cohorts/` (`DashboardCourses.jsx`, `CurriculumEditor.jsx`)
