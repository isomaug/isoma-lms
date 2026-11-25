/**
 * Course Recommendation Engine
 * Filters and ranks available courses based on user's saved profile interests.
 */

export function recommendCourses(allCourses = [], userInterests = []) {
  if (!allCourses || allCourses.length === 0) return [];
  if (!userInterests || userInterests.length === 0) return allCourses;

  // Map interest IDs to course category keywords/slugs
  const interestMap = {
    "ai-robotics": ["ai", "robotics", "stage-1", "stage-2", "stage-3"],
    "scratch-blocks": ["scratch", "scratchjr", "block"],
    "microbit-hardware": ["microbit", "hardware", "electronics"],
    "arduino-wokwi": ["arduino", "esp32", "wokwi", "circuits"],
    "python-coding": ["python", "code"],
    "web-dev": ["web", "html", "javascript", "css"],
  };

  const activeKeywords = new Set();
  userInterests.forEach((interestId) => {
    const keywords = interestMap[interestId] || [interestId];
    keywords.forEach((kw) => activeKeywords.add(kw.toLowerCase()));
  });

  // Rank courses by matching keywords in title, description, or slug
  const scored = allCourses.map((course) => {
    let score = 0;
    const searchTarget = `${course.title || ""} ${course.description || ""} ${course.slug || ""}`.toLowerCase();

    activeKeywords.forEach((kw) => {
      if (searchTarget.includes(kw)) {
        score += 1;
      }
    });

    return { course, score };
  });

  // Sort highest score first, fallback to all courses
  const matching = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course);

  return matching.length > 0 ? matching : allCourses;
}
