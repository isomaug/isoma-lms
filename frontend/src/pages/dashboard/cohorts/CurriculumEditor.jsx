import { useState } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Edit, Trash, Save, X, BookOpen, Video, Radio, Users, FileText } from "lucide-react";
import { customToast as toast } from "@/components/notifications/GlobalPopup";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useNavigate } from "react-router-dom";
import { getEkebuLiveSSOUrl } from "@/utils/sso";

export default function CurriculumEditor({ course, onBack }) {
  const { data: modulesData, mutate: mutateModules, isLoading } = useSWR(`/api/admin/modules/?course=${course.id}`, swrFetcher);
  
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [managingPairsForLesson, setManagingPairsForLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const modules = Array.isArray(modulesData) ? modulesData : modulesData?.results || [];

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    const isNew = !editingModule.id;
    const url = isNew ? "/api/admin/modules/" : `/api/admin/modules/${editingModule.id}/`;
    const method = isNew ? "POST" : "PUT";

    try {
      await apiFetch(url, { method, body: { ...editingModule, course: course.id } });
      mutateModules();
      setEditingModule(null);
      toast.success(isNew ? "Module added!" : "Module updated!");
    } catch (err) {
      toast.error("Failed to save module.");
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure? This will delete all lessons inside.")) return;
    try {
      await apiFetch(`/api/admin/modules/${id}/`, { method: "DELETE" });
      mutateModules();
      toast.success("Module deleted.");
    } catch (err) {
      toast.error("Failed to delete module.");
    }
  };

  if (managingPairsForLesson) {
    return <LessonPairingManager lesson={managingPairsForLesson} courseId={course.id} onBack={() => setManagingPairsForLesson(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
          <p className="text-muted-foreground">Manage modules and lessons for <strong>{course.title}</strong></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onBack}>
            <X className="w-4 h-4 mr-2" /> Back to Courses
          </Button>
          {!editingModule && !editingLesson && !managingPairsForLesson && (
            <Button onClick={() => setEditingModule({ title: "", order: modules.length + 1, week: "" })}>
              <Plus className="w-4 h-4 mr-2" /> Add Module
            </Button>
          )}
        </div>
      </div>

      {editingModule && (
        <form onSubmit={handleSaveModule} className="bg-card p-6 border border-border rounded-xl space-y-4">
          <h3 className="font-bold">{editingModule.id ? "Edit Module" : "New Module"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input 
                value={editingModule.title} 
                onChange={e => setEditingModule({...editingModule, title: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Order (Number)</label>
              <Input 
                type="number"
                value={editingModule.order} 
                onChange={e => setEditingModule({...editingModule, order: parseInt(e.target.value)})} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Week (Optional)</label>
              <Input 
                type="number"
                value={editingModule.week || ""} 
                onChange={e => setEditingModule({...editingModule, week: e.target.value ? parseInt(e.target.value) : null})} 
                placeholder="e.g. 1"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditingModule(null)}>Cancel</Button>
            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save Module</Button>
          </div>
        </form>
      )}

      {isLoading ? <DelayedSpinner /> : (
        <div className="space-y-4">
          {modules.map(mod => (
            <div key={mod.id} className="border border-border rounded-xl overflow-hidden bg-card">
              <div 
                className="p-4 bg-secondary/30 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => toggleModule(mod.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedModules[mod.id] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  <h3 className="font-bold text-lg">
                    {mod.week ? `Week ${mod.week}: ` : `Module ${mod.order}: `}
                    {mod.title}
                  </h3>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => setEditingModule(mod)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDeleteModule(mod.id)}><Trash className="w-4 h-4" /></Button>
                </div>
              </div>

              {expandedModules[mod.id] && (
                <div className="p-4 border-t border-border">
                  <LessonList moduleId={mod.id} setManagingPairsForLesson={setManagingPairsForLesson} />
                </div>
              )}
            </div>
          ))}
          {modules.length === 0 && <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">No modules yet. Click "Add Module" to begin.</div>}
        </div>
      )}
    </div>
  );
}

function LessonList({ moduleId, setManagingPairsForLesson }) {
  const { data: lessonsData, mutate, isLoading } = useSWR(`/api/admin/lessons/?module=${moduleId}`, swrFetcher);
  const { data: orgsData } = useSWR(`/api/organizations/`, swrFetcher);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingDocsForLesson, setEditingDocsForLesson] = useState(null);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const navigate = useNavigate();

  const lessons = Array.isArray(lessonsData) ? lessonsData : lessonsData?.results || [];
  const organizations = Array.isArray(orgsData) ? orgsData : orgsData?.results || [];

  const handleStartLiveLesson = async (lesson) => {
    try {
      const res = await apiFetch(`/api/liverooms/rooms/`, {
        method: "POST",
        body: JSON.stringify({
          title: `Lesson: ${lesson.title}`,
          room_type: "COURSE",
          lesson: lesson.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        window.open(getEkebuLiveSSOUrl(`/live/${data.slug}`), "_blank", "noopener,noreferrer");
      } else {
        toast.error("Failed to start live lesson");
      }
    } catch (err) {
      toast.error("Error starting live lesson");
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    const isNew = !editingLesson.id;
    const url = isNew ? "/api/admin/lessons/" : `/api/admin/lessons/${editingLesson.id}/`;
    const method = isNew ? "POST" : "PUT";

    try {
      await apiFetch(url, { method, body: { ...editingLesson, module: moduleId } });
      mutate();
      setEditingLesson(null);
      toast.success(isNew ? "Lesson added!" : "Lesson updated!");
    } catch (err) {
      toast.error("Failed to save lesson.");
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await apiFetch(`/api/admin/lessons/${id}/`, { method: "DELETE" });
      mutate();
      toast.success("Lesson deleted.");
    } catch (err) {
      toast.error("Failed to delete lesson.");
    }
  };

  const handleProceedToEditDocs = () => {
    if (!selectedOrgId) {
      toast.error("Please select an organization first.");
      return;
    }
    navigate(`/courses/lessons/edit/${editingDocsForLesson.id}?orgId=${selectedOrgId}`);
  };

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading lessons...</div>;

  return (
    <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-primary/20 relative">
      {/* Docs Editor Organization Selection Modal */}
      {editingDocsForLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-xl shadow-xl border border-border p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold">Edit Lesson Plan</h3>
              <p className="text-sm text-muted-foreground mt-1">Select the Organization template to edit for "{editingDocsForLesson.title}".</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <SearchableSelect
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
                placeholder="Select an organization..."
                options={organizations.map(org => ({ label: org.name, value: org.id.toString() }))}
              >
                <option value="">Select an organization...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </SearchableSelect>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setEditingDocsForLesson(null); setSelectedOrgId(""); }}>Cancel</Button>
              <Button onClick={handleProceedToEditDocs} disabled={!selectedOrgId}>Proceed to Editor</Button>
            </div>
          </div>
        </div>
      )}

      {editingLesson ? (
        <form onSubmit={handleSaveLesson} className="bg-background p-4 rounded-xl border border-border space-y-4">
          <h4 className="font-bold">{editingLesson.id ? "Edit Lesson" : "New Lesson"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input 
                value={editingLesson.title} 
                onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Order</label>
              <Input 
                type="number"
                value={editingLesson.order} 
                onChange={e => setEditingLesson({...editingLesson, order: parseInt(e.target.value)})} 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Video URL (Optional)</label>
              <Input 
                value={editingLesson.video_url || ""} 
                onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})} 
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Overview (Objectives & Summary)</label>
              <Textarea 
                value={editingLesson.overview || ""} 
                onChange={e => setEditingLesson({...editingLesson, overview: e.target.value})} 
                placeholder="Lesson objectives, brief details, CBC alignment..."
                className="min-h-[80px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Text Version (Reading Notes & Images)</label>
              <Textarea 
                value={editingLesson.lesson_text || ""} 
                onChange={e => setEditingLesson({...editingLesson, lesson_text: e.target.value})} 
                placeholder="The detailed text version of the lesson with markdown and embedded images..."
                className="min-h-[150px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Video Script (Narration)</label>
              <Textarea 
                value={editingLesson.video_script || ""} 
                onChange={e => setEditingLesson({...editingLesson, video_script: e.target.value})} 
                placeholder="Video narration transcript..."
                className="min-h-[100px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Lesson Plan (Instructors Only)</label>
              <Textarea 
                value={editingLesson.content || ""} 
                onChange={e => setEditingLesson({...editingLesson, content: e.target.value})} 
                placeholder="The internal lesson plan (hidden from students)..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (mins)</label>
              <Input 
                type="number"
                value={editingLesson.duration_minutes || 0} 
                onChange={e => setEditingLesson({...editingLesson, duration_minutes: parseInt(e.target.value)})} 
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input 
                type="checkbox" 
                id={`preview-${editingLesson.id}`}
                checked={editingLesson.is_preview || false}
                onChange={e => setEditingLesson({...editingLesson, is_preview: e.target.checked})}
                className="rounded border-input"
              />
              <label htmlFor={`preview-${editingLesson.id}`} className="text-sm font-medium">Free Preview</label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingLesson(null)}>Cancel</Button>
            <Button type="submit" size="sm"><Save className="w-4 h-4 mr-2" /> Save Lesson</Button>
          </div>
        </form>
      ) : (
        <>
          {lessons.map(lesson => (
            <div key={lesson.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  {lesson.order}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{lesson.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {lesson.video_url ? <Video className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                    <span>{lesson.duration_minutes} mins</span>
                    {lesson.is_preview && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">Preview</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => setManagingPairsForLesson(lesson)} title="Manage Pairs"><Users className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" onClick={() => handleStartLiveLesson(lesson)} title="Start Online Lesson"><Radio className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10" onClick={() => setEditingDocsForLesson(lesson)} title="Edit Lesson Plan Template"><FileText className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingLesson(lesson)}><Edit className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDeleteLesson(lesson.id)}><Trash className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => setEditingLesson({ title: "", order: lessons.length + 1, duration_minutes: 0 })}>
            <Plus className="w-4 h-4 mr-2" /> Add Lesson
          </Button>
        </>
      )}
    </div>
  );
}

function LessonPairingManager({ lesson, courseId, onBack }) {
  const { data: pairingsData, mutate: mutatePairings } = useSWR(`/api/admin/lesson-pairings/?lesson_id=${lesson.id}`, swrFetcher);
  const { data: enrollmentsData } = useSWR(`/api/admin/enrollments/?course=${courseId}&in_cohort=true`, swrFetcher);
  
  const pairings = Array.isArray(pairingsData) ? pairingsData : pairingsData?.results || [];
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.results || [];
  const uniqueStudentsMap = new Map();
  enrollments.forEach(e => {
    uniqueStudentsMap.set(e.user, { id: e.user, name: e.user_name });
  });
  const students = Array.from(uniqueStudentsMap.values());

  const [hostStudent, setHostStudent] = useState("");
  const [partnerStudent, setPartnerStudent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAutoPair = async () => {
    if (!window.confirm("This will randomly pair all unassigned students. Continue?")) return;
    
    const assignedIds = new Set();
    pairings.forEach(p => {
      assignedIds.add(p.host_student);
      assignedIds.add(p.partner_student);
    });
    
    const unassigned = students.filter(s => !assignedIds.has(s.id));
    if (unassigned.length < 2) {
      toast.error("Not enough unassigned students to form pairs.");
      return;
    }
    
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
    
    setLoading(true);
    try {
      const promises = [];
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        promises.push(
          apiFetch("/api/admin/lesson-pairings/", {
            method: "POST",
            body: JSON.stringify({
              lesson: lesson.id,
              host_student: shuffled[i].id,
              partner_student: shuffled[i+1].id,
              instructor_assigned: true
            })
          })
        );
      }
      await Promise.all(promises);
      toast.success("Pairs generated successfully!");
      mutatePairings();
    } catch (err) {
      toast.error("Error auto-generating pairs.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePair = async (e) => {
    e.preventDefault();
    const hStudent = students.find(s => s.name === hostStudent || s.id.toString() === hostStudent);
    const pStudent = students.find(s => s.name === partnerStudent || s.id.toString() === partnerStudent);
    
    if (!hStudent || !pStudent) {
      toast.error("Please select valid students from the list.");
      return;
    }
    if (hStudent.id === pStudent.id) {
      toast.error("Host and partner cannot be the same student.");
      return;
    }
    
    setLoading(true);
    try {
      await apiFetch("/api/admin/lesson-pairings/", {
        method: "POST",
        body: JSON.stringify({
          lesson: lesson.id,
          host_student: hStudent.id,
          partner_student: pStudent.id,
          instructor_assigned: true
        })
      });
      toast.success("Pair created!");
      setHostStudent("");
      setPartnerStudent("");
      mutatePairings();
    } catch (err) {
      toast.error("Failed to create pair.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePair = async (id) => {
    if (!window.confirm("Remove this pair?")) return;
    try {
      await apiFetch(`/api/admin/lesson-pairings/${id}/`, { method: "DELETE" });
      mutatePairings();
      toast.success("Pair removed.");
    } catch (err) {
      toast.error("Failed to remove pair.");
    }
  };

  const handleApproveChange = async (id) => {
    try {
      await apiFetch(`/api/admin/lesson-pairings/${id}/approve-change/`, { method: "POST" });
      toast.success("Partner change approved! Students are now unpaired and free to match again.");
      mutatePairings();
    } catch (err) {
      toast.error(err.message || "Failed to approve partner change.");
    }
  };

  const handleRejectChange = async (id) => {
    try {
      await apiFetch(`/api/admin/lesson-pairings/${id}/reject-change/`, { method: "POST" });
      toast.info("Partner change request rejected.");
      mutatePairings();
    } catch (err) {
      toast.error(err.message || "Failed to reject partner change.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <X className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Manage Pairs</h2>
          <p className="text-muted-foreground">Lesson: <strong>{lesson.title}</strong></p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">Instructor Note:</span>
          <span>Paired students earn a +20% Collaboration XP bonus on passing quizzes, and completed lessons sync between partners.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-lg mb-4">Current Pairings ({pairings.length})</h3>
          <div className="border rounded-lg divide-y bg-card">
            {pairings.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No pairs assigned yet.</div>
            ) : (
              pairings.map(pair => (
                <div key={pair.id} className="flex justify-between items-center p-3 hover:bg-muted/30">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">Navigator:</span> {pair.host_student_details?.username}
                      <span className="mx-1 text-muted-foreground">•</span>
                      <span className="font-semibold text-primary">Driver:</span> {pair.partner_student_details?.username}
                      {pair.is_active === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
                      )}
                    </div>
                    {pair.change_status === "pending" && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20">
                          Partner Change Requested
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApproveChange(pair.id)}
                        >
                          Approve Change
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleRejectChange(pair.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleDeletePair(pair.id)}>Remove</Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="bg-muted/30 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Create New Pair</h4>
              <Button size="sm" variant="outline" onClick={handleAutoPair} disabled={loading} title="Randomly pair all unassigned students">
                Auto Pair
              </Button>
            </div>
            <form onSubmit={handleCreatePair} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Host (Navigator)</label>
                <Input 
                  list="students-datalist"
                  placeholder="Type or select student..."
                  value={hostStudent}
                  onChange={e => setHostStudent(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Partner (Driver)</label>
                <Input 
                  list="students-datalist"
                  placeholder="Type or select student..."
                  value={partnerStudent}
                  onChange={e => setPartnerStudent(e.target.value)}
                  required
                />
              </div>
              <datalist id="students-datalist">
                {students.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Pair"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              You can search for a student by typing their username or selecting from the dropdown. Both students must be enrolled in this course.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

