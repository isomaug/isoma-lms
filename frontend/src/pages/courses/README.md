# Courses Pages Architecture (`src/pages/courses/`)

This directory houses the routed pages for online learning, course discovery, textbook readers, and credential verification.

---

## 🏛️ Directory Structure

```
src/pages/courses/
├── README.md              # Domain overview & route matrix
│
├── catalog/               # Public discovery & course sales landing
│   ├── CoursesIndex.jsx         # /courses - Public catalog & topic search
│   └── CourseLanding.jsx        # /courses/:slug - Curriculum syllabus & sales page
│
├── learning/              # Student learning portal & immersive player
│   ├── CourseViewer.jsx         # /learn/:slug - Fullscreen learning player
│   ├── CourseLearningEntry.jsx  # /courses/:slug/learn - Learner gatekeeper & route redirector
│   └── MyLearning.jsx           # /my-learning - Enrolled student courses dashboard
│
├── materials/             # Academic reading & curriculum editing
│   ├── PastPaperReader.jsx      # /courses/past-papers/:id - Academic past paper reader
│   └── LessonPlanEditor.jsx     # Instructor lesson plan editor
│
└── verification/          # Public credential check
    └── VerifyCertificate.jsx   # /verify-certificate/:code - Certificate authenticity validator
```

---

## 🧭 Routes to Component Matrix

| Route | Page File | Primary Components Used |
|---|---|---|
| `/courses` | `catalog/CoursesIndex.jsx` | `components/courses/catalog/CourseCard.jsx` |
| `/courses/:slug` | `catalog/CourseLanding.jsx` | `CourseHeroMedia`, `CourseStickyPurchase`, `CourseCurriculumAccordion` |
| `/courses/:slug/learn` | `learning/CourseLearningEntry.jsx` | Entry gate redirecting to `CourseViewer` or cohort classroom |
| `/learn/:slug` | `learning/CourseViewer.jsx` | `viewer/LessonSidebar`, `interactive/QuizPlayer`, `interactive/CodingPlayground` |
| `/my-learning` | `learning/MyLearning.jsx` | `catalog/CourseCard`, `viewer/XPBadge` |
| `/courses/past-papers/:id` | `materials/PastPaperReader.jsx` | `materials/TextSolutionPager`, `materials/ResponsivePdfViewer` |
| `/verify-certificate/:code` | `verification/VerifyCertificate.jsx` | Certificate validation card |
