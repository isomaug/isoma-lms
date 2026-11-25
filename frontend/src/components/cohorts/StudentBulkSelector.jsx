import React, { useState, useRef, useEffect } from "react";
import { X, Upload, ClipboardPaste, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function StudentBulkSelector({ users, selectedIds, onChange }) {
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    !selectedIds.includes(u.id) &&
    (u.email?.toLowerCase().includes(search.toLowerCase()) || 
     (u.first_name && u.first_name.toLowerCase().includes(search.toLowerCase())) ||
     (u.last_name && u.last_name.toLowerCase().includes(search.toLowerCase())) ||
     (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
     (u.username && u.username.toLowerCase().includes(search.toLowerCase())))
  ).slice(0, 25); // show top 25 matches

  const handleSelect = (user) => {
    onChange([...selectedIds, user.id]);
    setSearch("");
    setIsDropdownOpen(false);
  };

  const handleRemove = (id) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  const processEmails = (emailsRaw) => {
    // Extract all emails from string
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const foundEmailsMatch = emailsRaw.match(emailRegex) || [];
    
    // Normalize and deduplicate
    const extractedEmails = [...new Set(foundEmailsMatch.map(e => e.toLowerCase()))];
    
    if (extractedEmails.length === 0) {
      toast.error("No valid emails found.");
      return;
    }

    const newSelectedIds = [...selectedIds];
    const missingEmails = [];
    let addedCount = 0;

    extractedEmails.forEach(email => {
      const match = users.find(u => u.email?.toLowerCase() === email);
      if (match) {
        if (!newSelectedIds.includes(match.id)) {
          newSelectedIds.push(match.id);
          addedCount++;
        }
      } else {
        missingEmails.push(email);
      }
    });

    onChange(newSelectedIds);

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} student(s).`);
    }
    
    if (missingEmails.length > 0) {
      toast.warning(`Could not find ${missingEmails.length} email(s) in the system.`, {
        description: missingEmails.join(", ")
      });
    }

    setPasteMode(false);
    setPasteText("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      processEmails(text);
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const selectedUsers = selectedIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Pills Container */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20 max-h-[150px] overflow-y-auto">
          {selectedUsers.map(user => (
            <div key={user.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium border border-primary/20">
              <User className="w-3 h-3" />
              <span>{user.email}</span>
              <button 
                type="button" 
                onClick={() => handleRemove(user.id)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input & Actions */}
      {pasteMode ? (
        <div className="space-y-2 border p-3 rounded-md bg-muted/10 shadow-sm">
          <textarea
            className="w-full h-24 p-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Paste emails separated by commas, spaces, or newlines..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPasteMode(false)}>Cancel</Button>
            <Button type="button" size="sm" onClick={() => processEmails(pasteText)}>Process Emails</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 relative">
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>
            
            {/* Dropdown */}
            {isDropdownOpen && search && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">No matching students found.</div>
                ) : (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelect(user)}
                    >
                      <div>
                        <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <PlusIcon />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <Button type="button" variant="outline" onClick={() => setPasteMode(true)} title="Paste Emails">
            <ClipboardPaste className="w-4 h-4 mr-2" /> Paste
          </Button>
          
          <label className="cursor-pointer">
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <Upload className="w-4 h-4 mr-2" /> CSV
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <div className="bg-primary/10 p-1 rounded-full text-primary">
      <X className="w-3 h-3 rotate-45" />
    </div>
  );
}
