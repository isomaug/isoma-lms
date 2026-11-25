import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Layers, ArrowRight, Copy, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { customToast } from "../../components/GlobalPopup";
import { UniversalSelect } from "../../components/ui/UniversalSelect";

export default function CurriculumTemplatesPage() {
  const { tenant, tenantSlug } = useAuth();
  const navigate = useNavigate();
  const slug =
    tenant?.subdomain && tenant.subdomain !== "root"
      ? tenant.subdomain
      : tenantSlug || "stmarys";

  const [templates, setTemplates] = useState([]);
  const [allowedCurricula, setAllowedCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tenant/curriculum-templates/?tenant=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : { results: [], allowed_curricula: [] }))
      .then((data) => {
        setTemplates(data.results || []);
        setAllowedCurricula(data.allowed_curricula || []);
      })
      .catch(() => customToast.error("Could not load curriculum templates."))
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((item) => {
      const matchCurr =
        curriculumFilter === "ALL" || item.curriculum === curriculumFilter;
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.curriculum_label.toLowerCase().includes(q);
      return matchCurr && matchSearch;
    });
  }, [templates, search, curriculumFilter]);

  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary shrink-0" />

      {/* Header & Strict Curriculum Scope Indicator */}
      <div className="px-5 py-5 md:px-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            {allowedCurricula.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wide"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                {code.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">
            Curriculum Lesson Templates
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Strictly scoped to curricula assigned to {tenant?.name || slug}. Teachers can open or clone any template into their class lessons.
          </p>
        </div>

        {/* Search & Curriculum Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full sm:w-56 rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          {allowedCurricula.length > 1 && (
            <div className="w-full sm:w-56">
              <UniversalSelect
                value={curriculumFilter}
                onChange={setCurriculumFilter}
                options={[
                  { value: "ALL", label: "All Assigned Curricula" },
                  ...allowedCurricula.map((c) => ({
                    value: c,
                    label: c.replace(/_/g, " "),
                  })),
                ]}
                searchPlaceholder="Filter curriculum..."
                align="end"
              />
            </div>
          )}
        </div>
      </div>

      {/* Screen-Adapting Table (Desktop Table on md+, Stacked Cards on <768px) */}
      <div className="flex-1 p-4 sm:p-6 md:px-8">
        {loading ? (
          <p className="text-xs text-gray-400 py-8 text-center">
            Loading curriculum templates...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <Lock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              No templates found for your assigned curriculum
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ask the platform administrator to assign additional curricula from the Landlord ERP if needed.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Responsive Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                    <th className="py-3 px-4 font-semibold">Template / Subject</th>
                    <th className="py-3 px-4 font-semibold">Curriculum</th>
                    <th className="py-3 px-4 font-semibold">Level</th>
                    <th className="py-3 px-4 font-semibold text-center">Modules</th>
                    <th className="py-3 px-4 font-semibold text-center">Lessons</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.map((tpl) => (
                    <tr
                      key={tpl.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-bold text-gray-900 text-xs">{tpl.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {tpl.subtitle}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-primary text-[11px]">
                          <BookOpen className="w-3.5 h-3.5" />
                          {tpl.curriculum_label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 font-medium">
                        {tpl.level}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                        {tpl.modules_count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                        {tpl.lessons_count}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              customToast.success(
                                `Cloned "${tpl.title}" as a customizable class lesson template.`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Use Template
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/courses/${tpl.slug}/learn`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-hover transition-colors"
                          >
                            Open
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Adaptive Card List (<768px) */}
            <div className="md:hidden space-y-3">
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                        <BookOpen className="w-3 h-3" />
                        {tpl.curriculum_label}
                      </span>
                      <h2 className="text-sm font-bold text-gray-900 mt-0.5">
                        {tpl.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {tpl.subtitle}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-600 font-medium pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {tpl.level}
                    </span>
                    <span>{tpl.modules_count} Modules</span>
                    <span>{tpl.lessons_count} Lessons</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        customToast.success(
                          `Cloned "${tpl.title}" as a customizable class lesson template.`
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Use Template
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${tpl.slug}/learn`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
