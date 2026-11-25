import React, { useState, useRef, useEffect } from "react";
import { Trash2,  createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPaperPlane,
  FaExpandAlt,
  FaCompressAlt,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import {
  CircleAlert,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogIn,
  MessageCircle,
  Pencil,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  Search,
  ChevronDown,
  Mic,
} from "lucide-react";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import EkebuAIProModal from "@/components/courses/interactive/EkebuAIProModal";
import { useAuth } from "@/context/AuthContext";

const myMarked = new Marked();

myMarked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 1) {
        return `<h1 class="text-base font-extrabold text-foreground border-b border-border/50 pb-1.5 mt-3 mb-2 tracking-tight">${text}</h1>`;
      }
      if (depth === 2) {
        return `<h2 class="text-sm font-bold text-foreground mt-2.5 mb-1.5 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0"></span><span>${text}</span></h2>`;
      }
      return `<h3 class="text-sm font-semibold text-primary mt-2 mb-1">${text}</h3>`;
    },
    paragraph(token) {
      const inner = this.parser.parseInline(token.tokens);
      return `<p class="text-sm leading-relaxed text-foreground/90 mb-2 last:mb-0">${inner}</p>`;
    },
    list(token) {
      const ordered = token.ordered;
      const tag = ordered ? "ol" : "ul";
      const cls = ordered
        ? "list-decimal list-outside space-y-1.5 my-2 pl-4 text-sm leading-relaxed text-foreground/90 font-normal"
        : "list-disc list-outside space-y-1.5 my-2 pl-4 text-sm leading-relaxed text-foreground/90 font-normal";
      
      let body = "";
      for (let i = 0; i < token.items.length; i++) {
        body += this.listitem(token.items[i]);
      }
      
      return `<${tag} class="${cls}">${body}</${tag}>`;
    },
    listitem(token) {
      const inner = this.parser.parse(token.tokens);
      return `<li class="text-sm leading-relaxed">${inner}</li>`;
    },
    strong({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<strong class="font-extrabold text-foreground">${text}</strong>`;
    },
    em({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<em class="italic text-foreground/90 font-medium">${text}</em>`;
    },
    codespan({ text }) {
      return `<code class="bg-muted/80 text-primary border border-border/50 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">${text}</code>`;
    },
    code({ text, lang }) {
      const cleanCode = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const language = (lang || "code").toUpperCase();
      const escapedForCopy = text
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/'/g, "\\'");
      return `
        <div class="my-3 rounded-xl overflow-hidden border border-border bg-muted/40 text-foreground dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 shadow-sm font-mono text-xs">
          <div class="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border text-foreground/80 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 font-sans text-[11px]">
            <span class="font-bold tracking-wider">${language}</span>
            <button onclick="navigator.clipboard.writeText(\`${escapedForCopy}\`); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);" class="px-2.5 py-0.5 rounded bg-background border border-border text-foreground hover:bg-muted font-bold text-[10px] cursor-pointer transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700">Copy</button>
          </div>
          <pre class="p-3 overflow-x-auto text-foreground dark:text-slate-100 leading-relaxed font-mono"><code>${cleanCode}</code></pre>
        </div>
      `;
    },
    blockquote(token) {
      const safeText = token.tokens && token.tokens.length > 0
        ? this.parser.parse(token.tokens)
        : (token.text || "");
      return `<blockquote class="border-l-3 border-primary bg-primary/5 pl-3 py-2 my-2.5 rounded-r-lg text-sm italic text-foreground/90 shadow-2xs">${safeText}</blockquote>`;
    },
    link(token) {
      const label = this.parser.parseInline(token.tokens);
      const isDownload =
        /download/i.test(label) ||
        /\.(?:docx?|xlsx?|pdf|csv)(?:\?|$)/i.test(token.href || "");
      const classes = isDownload
        ? "my-2 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white no-underline shadow-sm hover:bg-emerald-700"
        : "font-semibold text-primary underline underline-offset-2";
      return `<a href="${token.href || "#"}" ${token.title ? `title="${token.title}"` : ""} target="_blank" rel="noopener noreferrer" class="${classes}">${label || "Open link"}</a>`;
    },
    table(token) {
      const headHtml = token.header
        .map((cell) => {
          const inner = this.parser.parseInline(cell.tokens);
          return `<th class="px-3 py-2 text-left font-bold text-foreground">${inner}</th>`;
        })
        .join("");
      const bodyHtml = token.rows
        .map((row) => {
          const cells = row
            .map((cell) => {
              const inner = this.parser.parseInline(cell.tokens);
              return `<td class="px-3 py-2 text-foreground/90">${inner}</td>`;
            })
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `
        <div class="my-3 overflow-hidden rounded-lg border border-border shadow-2xs">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="bg-muted/70 text-foreground font-bold border-b border-border"><tr>${headHtml}</tr></thead>
            <tbody class="divide-y divide-border/40">${bodyHtml}</tbody>
          </table>
        </div>
      `;
    }
  }
});

const formatMarkdownHtml = (rawText) => {
  const normalized = String(rawText || "")
    .replace(
      /(^|[\s>])(undefined|null|\[object Object\])(?=$|[\s<.,;:!?])/gi,
      "$1"
    )
    .replace(
      /(^|\n)\s*(?:undefined|null|none|\[object Object\])\s*(?=\n|$)/gi,
      "$1"
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const rawHtml = myMarked.parse(
    normalized || "EkebuAI could not display this response."
  );
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["button", "u"],
    ADD_ATTR: ["onclick", "target", "rel", "class", "style"],
  });
};

export default function CourseAssistant({
  courseSlug,
  activeLessonId,
  currentVideoTimestamp,
  activeQuizId,
  compact = false,
}) {
  const { openAuthModal, isAuthenticated, me } = useAuth();
  const storageKey = `ekebuai:${courseSlug}`;
  const [isOpen, setIsOpen] = useState(
    () => localStorage.getItem(`${storageKey}:open`) === "true"
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [quizFunnyNotice, setQuizFunnyNotice] = useState(false);

  const handleSessionSignIn = () => {
    setIsOpen(false);
    setTimeout(() => {
      openAuthModal("login");
    }, 250);
  };
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey there! I'm EkebuAI, Peter's digital teaching assistant. Ask me anything about this course or video lesson!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(
    () => localStorage.getItem(`${storageKey}:conversation`) || ""
  );
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsLanguage, setTtsLanguage] = useState("eng");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [isTranslatingId, setIsTranslatingId] = useState(null);
  const audioPlayerRef = useRef(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const studentFirstName = me?.first_name || me?.full_name?.split(' ')[0] || me?.username || "";

  const WAITING_QUOTES = [
    studentFirstName ? `Thinking through your question, ${studentFirstName}...` : "Thinking through your question carefully...",
    studentFirstName ? `I love your progress in this lesson, ${studentFirstName}! Reviewing the best way to explain this...` : "Reviewing the lesson concepts to give you a clear, practical answer...",
    studentFirstName ? `Connecting the key concepts for you, ${studentFirstName}...` : "Connecting concepts to provide a clear step-by-step explanation...",
    "Every great coder takes a moment to think carefully before solving a challenge...",
    studentFirstName ? `Formulating helpful examples and tips for you, ${studentFirstName}...` : "Formulating helpful examples and tips for you...",
    "Great curiosity! Putting together a clear, detailed answer..."
  ];

  useEffect(() => {
    if (!isTyping) {
      setQuoteIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % WAITING_QUOTES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isTyping, WAITING_QUOTES.length]);

  const SUNBIRD_LANGUAGES = [
    { code: "eng", name: "English" },
    { code: "lug", name: "Luganda" },
    { code: "swa", name: "Swahili" },
    { code: "ach", name: "Acholi" },
    { code: "nyn", name: "Runyankole" },
    { code: "teo", name: "Ateso" },
    { code: "lgg", name: "Lugbara" },
    { code: "kum", name: "Kumam" },
    { code: "lsm", name: "Lumasaaba" },
    { code: "xog", name: "Lusoga" },
  ];

  const handleLanguageSelect = (langCode) => {
    if (langCode !== "eng" && !me?.profile?.is_pro) {
      setIsProModalOpen(true);
      return;
    }
    setTtsLanguage(langCode);
    setIsLangDropdownOpen(false);
    setLangSearch("");
  };

  const handleSpeak = async (messageText, messageIndex) => {
    if (playingAudioId === messageIndex) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    setIsTranslatingId(messageIndex);
    try {
      let finalLanguage = ttsLanguage;
      // Convert standard english to sunbird english code if needed
      if (finalLanguage === "eng") finalLanguage = "eng";

      const response = await fetch("/api/ekebu-ai/sunbird/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "tts",
          text: messageText,
          language: finalLanguage,
        }),
      });
      const data = await response.json();
      if (data.audio_base64) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        const snd = new Audio("data:audio/wav;base64," + data.audio_base64);
        audioPlayerRef.current = snd;
        snd.play();
        setPlayingAudioId(messageIndex);
        snd.onended = () => setPlayingAudioId(null);
      } else {
        console.error("TTS returned no audio data");
      }
    } catch (err) {
      console.error("TTS Error:", err);
    } finally {
      setIsTranslatingId(null);
    }
  };
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsSessionExpired(false);
      setMessages((prev) => prev.filter((m) => !m.isSessionExpired));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:open`, String(isOpen));
  }, [isOpen, storageKey]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Send to transcribe_audio API
          setIsTyping(true);
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          // Use the currently selected language
          formData.append("language", ttsLanguage);
          
          try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("/api/courses/assistant/transcribe/", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            if (response.ok) {
              const data = await response.json();
              if (data.text) {
                // Drop transcribed text into the chat box
                setInput(prev => (prev ? prev + " " + data.text : data.text));
              }
            } else {
              console.error("Transcription failed", await response.text());
            }
          } catch (error) {
            console.error("Transcription error:", error);
          } finally {
            setIsTyping(false);
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Could not access your microphone. Please check permissions.");
      }
    }
  };

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(`${storageKey}:conversation`, conversationId);
    } else {
      localStorage.removeItem(`${storageKey}:conversation`);
    }
  }, [conversationId, storageKey]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;
    const token = localStorage.getItem("access_token");
    fetch(`/api/courses/${courseSlug}/assistant/conversations/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then(async (items) => {
        setConversations(items);
        if (conversationId === "new") return;
        const selected =
          items.find((item) => item.id === conversationId) || (conversationId === "" ? items[0] : null);
        if (!selected) return;
        const response = await fetch(
          `/api/courses/${courseSlug}/assistant/conversations/${selected.id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) return;
        const detail = await response.json();
        setConversationId(detail.id);
        setMessages([
          {
            role: "assistant",
            text: "Welcome back. Continue where you left off or start a new conversation.",
          },
          ...detail.messages.map((message) => ({
            role: message.role,
            text: message.text,
            type: message.type,
            image: message.artifact?.image || null,
          })),
        ]);
      })
      .catch(() => {});
  }, [courseSlug, conversationId, isAuthenticated, isOpen]);

  const deleteConversation = async (id) => {
    const token = localStorage.getItem("access_token");
    await fetch(`/api/courses/${courseSlug}/assistant/conversations/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (id === conversationId) {
      startNewConversation();
    }
  };

  const startNewConversation = () => {
    setConversationId("new");
    setShowHistory(false);
    setMessages([
      {
        role: "assistant",
        text: "New conversation started. What would you like to work on?",
      },
    ]);
  };

  const openConversation = async (id) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `/api/courses/${courseSlug}/assistant/conversations/${id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return;
    const detail = await response.json();
    setConversationId(detail.id);
    setMessages(
      detail.messages.map((message) => ({
        role: message.role,
        text: message.text,
        type: message.type,
        image: message.artifact?.image || null,
      }))
    );
    setShowHistory(false);
  };

  const handleToggleClick = () => {
    if (activeQuizId) {
      setQuizFunnyNotice(true);
      setTimeout(() => setQuizFunnyNotice(false), 4500);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSessionExpired) return;

    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsSessionExpired(true);
        setIsTyping(false);
        return;
      }

      const history = messages
        .slice(1)
        .filter((m) => m.text)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: String(m.text || ""),
        }));

      const res = await fetch(`/api/courses/${courseSlug}/assistant/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          lesson_id: activeLessonId,
          video_timestamp: currentVideoTimestamp,
          history,
          conversation_id: conversationId || null,
          language: ttsLanguage,
        }),
      });
      const data = await res.json();

      if (
        res.status === 401 ||
        (data.error &&
          (data.error.includes("timed out") ||
            data.error.includes("token not valid") ||
            data.error.includes("not authenticated")))
      ) {
        setIsSessionExpired(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            isSessionExpired: true,
            text: "Your session has expired. Please sign in again to continue chatting with EkebuAI.",
          },
        ]);
      } else if (res.ok) {
        if (data.conversation_id) setConversationId(data.conversation_id);
        let finalReply =
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "EkebuAI could not form a complete response. Please try again.";

        const isProLocked = data.type === "pro_required" || data.limit_reached;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: data.type || "text",
            text: finalReply,
            image: data.image || null,
            isProLocked: isProLocked,
          },
        ]);
      } else {
        console.error("AI Assistant API Error:", res.status, data);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "error",
            text:
              typeof data.reply === "string"
                ? data.reply
                : "EkebuAI could not complete that request. Please try again.",
          },
        ]);
      }
    } catch (err) {
      console.error("AI Assistant Network Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, a network error occurred." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageEdit = async (image) => {
    const instruction = editInstruction.trim();
    if (!instruction || isEditingImage) return;
    setIsEditingImage(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/courses/ekebu-ai/images/${image.id}/edit/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ instruction }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.image) {
        throw new Error(data.reply || "Image editing failed.");
      }
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          type: "image",
          text: data.reply || "Your edited image is ready.",
          image: data.image,
        },
      ]);
      setEditingImageId(null);
      setEditInstruction("");
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          type: "error",
          text:
            error.message || "I could not edit that image. Please try again.",
        },
      ]);
    } finally {
      setIsEditingImage(false);
    }
  };

  const handleImageDownload = async (image) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(image.download_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `ekebuai-image-${image.id}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          type: "error",
          text: "The image could not be downloaded. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="relative flex items-center z-[100]">
      {!isOpen && (
        <button
          onClick={handleToggleClick}
          title="Ask EkebuAI"
          className={`flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-bold transition-all border border-primary/25 shadow-sm shrink-0 whitespace-nowrap ${
            compact ? "h-7 w-7 justify-center p-0" : "px-2.5 sm:px-3 py-1.5"
          } ${activeQuizId ? "opacity-75 cursor-pointer" : ""}`}
        >
          <img
            src="/ekebu-profile-pic.png"
            alt="EkebuAI"
            className={`rounded-full object-cover object-[center_10%] shrink-0 ${
              compact ? "h-4 w-4" : "w-4 h-4 sm:w-5 sm:h-5"
            }`}
          />
          {!compact && (
            <span className="inline whitespace-nowrap">Ask EkebuAI ✨</span>
          )}
        </button>
      )}

      <AnimatePresence>
        {quizFunnyNotice && (
          <Motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-11 right-0 z-[999999] bg-card/95 backdrop-blur-md border border-primary/35 p-3.5 rounded-2xl shadow-2xl w-[260px] xs:w-[280px] text-center font-['Inter',sans-serif]"
          >
            <div className="flex justify-center mb-1 text-2xl animate-pulse">
              😄
            </div>
            <p className="text-sm font-bold text-foreground leading-relaxed">
              Nice try! EkebuAI is taking a quick nap while you solve this quiz.
              Show us what you've got!
            </p>
          </Motion.div>
        )}
      </AnimatePresence>

      {typeof document !== "undefined" &&
        createPortal(
          <>
            <AnimatePresence>
              {isOpen && (
                <Motion.div
                  initial={{ x: "100%", opacity: 0.8 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className={`fixed ${isExpanded ? "top-[55px] bottom-0 inset-x-0 mx-auto w-full md:max-w-7xl" : "top-[55px] bottom-0 right-0 w-full sm:w-[380px] lg:w-[420px]"} z-[99999] bg-card border-l border-border shadow-2xl flex flex-col transition-all duration-300`}
                >
                  <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3 font-bold">
                      <img
                        src="/ekebu-profile-pic.png"
                        alt="EkebuAI"
                        className="w-10 h-10 rounded-full border-2 border-primary-foreground/30 object-cover"
                      />
                      <div>
                        <div className="text-[15px] leading-none font-bold tracking-wide">
                          EkebuAI
                        </div>
                        <div className="text-xs opacity-80 font-medium mt-0.5">
                          AI Assistant
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                          className="flex items-center bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors rounded-full px-2 py-1.5 sm:px-2.5 sm:mr-1 cursor-pointer"
                          title="Assistant Spoken Language"
                        >
                          <Globe size={14} className={isExpanded || ttsLanguage !== "eng" ? "mr-1.5 opacity-90" : "opacity-90"} />
                          {(isExpanded || ttsLanguage !== "eng") && (
                            <span className="text-xs font-bold mr-1">
                              {SUNBIRD_LANGUAGES.find(l => l.code === ttsLanguage)?.name || "Language"}
                            </span>
                          )}
                          {(isExpanded || ttsLanguage !== "eng") && (
                            <ChevronDown size={14} className="opacity-70" />
                          )}
                        </button>
                        
                        {isLangDropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="p-2 border-b border-border flex items-center bg-muted/30">
                              <Search size={14} className="text-muted-foreground mr-2" />
                              <input 
                                type="text"
                                placeholder="Search language..."
                                value={langSearch}
                                onChange={(e) => setLangSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                              {SUNBIRD_LANGUAGES.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase())).map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={() => handleLanguageSelect(lang.code)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${ttsLanguage === lang.code ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                                >
                                  <span>{lang.name}</span>
                                  {lang.code !== "eng" && !me?.profile?.is_pro && (
                                    <Sparkles size={11} className="text-amber-500 shrink-0" />
                                  )}
                                </button>
                              ))}
                              {SUNBIRD_LANGUAGES.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase())).length === 0 && (
                                <div className="p-3 text-sm text-muted-foreground text-center">No languages found.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowHistory((visible) => !visible)}
                        className="p-1.5 transition-colors hover:text-primary-foreground/70"
                        title="Conversation history"
                      >
                        <History size={16} />
                      </button>
                      {me?.profile?.is_pro ? (
                        <span
                          className="bg-[#a3e635] text-black px-2 sm:px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-[#a3e635]/20 cursor-default border border-[#84cc16]/30 uppercase tracking-tight whitespace-nowrap"
                          title="You have an active EkebuAI Pro Pass"
                        >
                          <Sparkles
                            size={12}
                            className="text-black/80 shrink-0"
                          />{" "}
                          {isExpanded && "Active Pro"}
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsProModalOpen(true)}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                        >
                          <Sparkles size={11} className="shrink-0" /> {isExpanded && "Upgrade to Pro"}
                        </button>
                      )}
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hover:text-primary-foreground/70 transition-colors p-1.5"
                        title={isExpanded ? "Minimize" : "Expand"}
                      >
                        {isExpanded ? (
                          <FaCompressAlt size={15} />
                        ) : (
                          <FaExpandAlt size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="hover:text-primary-foreground/70 transition-colors p-1.5"
                        title="Close"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </div>

                  {showHistory && (
                    <div className="border-b border-border bg-card p-3 shadow-sm">
                      <button
                        type="button"
                        onClick={startNewConversation}
                        className="mb-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground"
                      >
                        <Plus size={14} />
                        New conversation
                      </button>
                      <div className="max-h-48 space-y-1 overflow-y-auto">
                        {conversations.length ? (
                          conversations.map((conversation) => (
                            <button
                              key={conversation.id}
                              type="button"
                              onClick={() => openConversation(conversation.id)}
                              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                                conversation.id === conversationId
                                  ? "bg-primary/10 font-bold text-primary"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <span className="block truncate">
                                {conversation.title}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                {new Date(
                                  conversation.updated_at
                                ).toLocaleDateString()}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="py-3 text-center text-sm text-muted-foreground">
                            No saved conversations yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar chatbot-area"
                  >
                    {messages.map((m, i) => {
                      const isProLockedMessage =
                        m.isProLocked || m.type === "pro_required";
                      const isImageMessage = m.type === "image" && m.image?.url;

                      return (
                        <div
                          key={i}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={
                              isImageMessage
                                ? "w-full max-w-[94%]"
                                : `max-w-[90%] rounded-2xl px-4 py-3 ${
                                    m.role === "user"
                                      ? "bg-blue-600 text-white rounded-br-none"
                                      : "bg-muted text-foreground rounded-bl-none border border-border"
                                  }`
                            }
                          >
                            {isImageMessage ? (
                              <div>
                                <img
                                  src={m.image.url}
                                  alt={
                                    m.image.prompt || "Image created by EkebuAI"
                                  }
                                  className="block h-auto max-h-[65vh] w-full rounded-lg object-contain"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingImageId(
                                        editingImageId === m.image.id
                                          ? null
                                          : m.image.id
                                      );
                                      setEditInstruction("");
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleImageDownload(m.image)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                  </button>
                                </div>
                                {editingImageId === m.image.id && (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      value={editInstruction}
                                      onChange={(event) =>
                                        setEditInstruction(event.target.value)
                                      }
                                      placeholder="Describe what to change..."
                                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                    <button
                                      type="button"
                                      disabled={
                                        !editInstruction.trim() ||
                                        isEditingImage
                                      }
                                      onClick={() => handleImageEdit(m.image)}
                                      className="rounded-lg bg-black px-3 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                                    >
                                      {isEditingImage ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Apply"
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : m.type === "error" ? (
                              <div className="flex items-start gap-2.5">
                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-black dark:text-white" />
                                <div>
                                  <p className="text-base font-extrabold">
                                    Request not completed
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                                    {m.text}
                                  </p>
                                </div>
                              </div>
                            ) : m.isSessionExpired ? (
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-red-500 flex items-center gap-1.5">
                                  <Lock size={14} /> Session Expired
                                </p>
                                <p className="text-sm text-foreground/80">
                                  {m.text}
                                </p>
                                <button
                                  onClick={handleSessionSignIn}
                                  className="w-full py-2 px-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                                >
                                  <LogIn size={13} /> Sign In to Continue
                                </button>
                              </div>
                            ) : isProLockedMessage ? (
                              <div>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: formatMarkdownHtml(m.text),
                                  }}
                                />
                                <div className="mt-3 pt-3 border-t border-border">
                                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />{" "}
                                    EkebuAI Pro capabilities
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <MessageCircle className="w-3.5 h-3.5 text-black dark:text-white" />{" "}
                                      Unlimited chats
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-black dark:text-white" />{" "}
                                      Word exports
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <FileSpreadsheet className="w-3.5 h-3.5 text-black dark:text-white" />{" "}
                                      Excel exports
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <ImageIcon className="w-3.5 h-3.5 text-black dark:text-white" />{" "}
                                      AI images
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setIsProModalOpen(true)}
                                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" /> Unlock
                                    EkebuAI Pro Pass (From 15,000 UGX)
                                  </button>
                                </div>
                              </div>
                            ) : m.role === "assistant" ? (
                              <div>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: formatMarkdownHtml(m.text),
                                  }}
                                />
                                <div className="mt-2 flex items-center justify-end">
                                  <button
                                    onClick={() => handleSpeak(m.text, i)}
                                    disabled={isTranslatingId === i}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/60 hover:text-primary transition-colors disabled:opacity-50"
                                  >
                                    {isTranslatingId === i ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : playingAudioId === i ? (
                                      <VolumeX size={13} />
                                    ) : (
                                      <Volume2 size={13} />
                                    )}
                                    {isTranslatingId === i
                                      ? "Generating voice..."
                                      : playingAudioId === i
                                      ? "Stop Audio"
                                      : "Speak"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              m.text
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-muted/90 text-foreground border border-border/80 rounded-2xl rounded-bl-none px-4 py-3 max-w-[88%] shadow-sm flex items-center gap-3">
                          <div className="relative flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                          </div>
                          <div className="text-xs text-foreground/90 font-medium leading-relaxed min-h-[1.2rem] flex items-center">
                            <span key={quoteIndex} className="animate-in fade-in duration-300">
                              {WAITING_QUOTES[quoteIndex]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isSessionExpired ? (
                    <div className="p-3 border-t border-border bg-card flex flex-col items-center gap-2 text-center">
                      <p className="text-sm text-muted-foreground font-medium">
                        Session expired. Please log in again to chat with
                        EkebuAI.
                      </p>
                      <button
                        onClick={handleSessionSignIn}
                        className="px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <LogIn size={13} /> Sign In
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSend}
                      className="p-3 border-t border-border bg-background flex flex-col gap-1.5"
                    >
                      <div className="flex gap-2 items-center w-full">
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-muted/50 border border-border rounded-full pl-4 pr-10 py-2 outline-none text-[15px] focus:ring-1 focus:ring-primary focus:bg-background transition-colors font-[Inter,system-ui,sans-serif]"
                          />
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute right-1.5 p-1.5 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                            title={isListening ? "Stop listening" : "Dictate message"}
                          >
                            <Mic size={16} />
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={isTyping || !input.trim()}
                          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex justify-center items-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <FaPaperPlane size={14} className="ml-[-2px]" />
                        </button>
                      </div>
                      {ttsLanguage !== "eng" && (
                        <div className="text-[11px] text-muted-foreground/70 text-center w-full font-medium px-1 pb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300 tracking-tight">
                          EkebuAI is now responding in {SUNBIRD_LANGUAGES.find(l => l.code === ttsLanguage)?.name || ttsLanguage} via Sunbird AI
                        </div>
                      )}
                    </form>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>

            <EkebuAIProModal
              isOpen={isProModalOpen}
              onClose={() => setIsProModalOpen(false)}
            />
          </>,
          document.body
        )}
    </div>
  );
}
