"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { MathText } from "@/app/components/MathText";
import { 
  Loader2, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Filter,
  BookOpen,
  CheckCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  Trash
} from "lucide-react";

interface Question {
  id: string;
  subject: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  imageURL?: string; 
  createdAt?: any;
  createdBy?: string;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 }
  },
  exit: { 
    opacity: 0, 
    y: -16, 
    scale: 0.97,
    transition: { duration: 0.18 }
  }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.18 } }
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Selection
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Edit Modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: ""
  });
  const [saving, setSaving] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    questionId: string | null;
    isBulk?: boolean;
  }>({
    isOpen: false,
    questionId: null,
    isBulk: false
  });

  // Fetch Questions & Subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const qQuery = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        const qSnap = await getDocs(qQuery);
        const qData = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        setQuestions(qData);

        const sSnap = await getDocs(collection(db, "subjects"));
        const sData = sSnap.docs.map(doc => doc.data());
        setSubjects(sData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset to page 1 on filter/search/page-size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSubject, itemsPerPage]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedQuestions(new Set());
  }, [searchTerm, filterSubject, currentPage, itemsPerPage]);

  // Filter Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIdx, startIdx + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = (): (number | "...")[] => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const left = safeCurrentPage - delta;
    const right = safeCurrentPage + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  // Selection handlers
  const toggleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.size === paginatedQuestions.length) {
      // Deselect all on current page
      setSelectedQuestions(prev => {
        const newSet = new Set(prev);
        paginatedQuestions.forEach(q => newSet.delete(q.id));
        return newSet;
      });
    } else {
      // Select all on current page
      setSelectedQuestions(prev => {
        const newSet = new Set(prev);
        paginatedQuestions.forEach(q => newSet.add(q.id));
        return newSet;
      });
    }
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  // Check if all questions on current page are selected
  const allCurrentPageSelected = paginatedQuestions.length > 0 && 
    paginatedQuestions.every(q => selectedQuestions.has(q.id));

  // Open Edit Modal
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditForm({
      questionText: question.questionText,
      options: [...question.options],
      correctOption: question.correctOption,
      explanation: question.explanation || ""
    });
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      const questionRef = doc(db, "questions", editingQuestion.id);
      await updateDoc(questionRef, {
        questionText: editForm.questionText,
        options: editForm.options,
        correctOption: editForm.correctOption,
        explanation: editForm.explanation,
        updatedAt: new Date().toISOString()
      });
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id ? { ...q, ...editForm } : q
      ));
      toast.success("Question updated successfully!");
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (questionId: string) => {
    setConfirmDialog({ isOpen: true, questionId, isBulk: false });
  };

  const handleBulkDeleteClick = () => {
    setConfirmDialog({ isOpen: true, questionId: null, isBulk: true });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.isBulk) {
      // Bulk delete
      await handleBulkDelete();
    } else {
      // Single delete
      const questionId = confirmDialog.questionId;
      if (!questionId) return;
      try {
        await deleteDoc(doc(db, "questions", questionId));
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast.success("Question deleted successfully!");
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
    setConfirmDialog({ isOpen: false, questionId: null, isBulk: false });
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    
    setBulkDeleteLoading(true);
    try {
      const batch = writeBatch(db);
      
      // Add all delete operations to batch
      selectedQuestions.forEach(questionId => {
        const questionRef = doc(db, "questions", questionId);
        batch.delete(questionRef);
      });

      // Commit batch
      await batch.commit();

      // Update local state
      setQuestions(prev => prev.filter(q => !selectedQuestions.has(q.id)));
      
      toast.success(`${selectedQuestions.size} question(s) deleted successfully!`);
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast.error("Failed to delete questions");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="text-emerald-600" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-500">View and manage all questions in the database.</p>
        </div>
        <motion.div 
          className="bg-slate-100 px-4 py-2 rounded-lg"
          key={filteredQuestions.length}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <p className="text-sm text-slate-600">
            Total: <strong className="text-slate-900">{questions.length}</strong> questions
            {filteredQuestions.length !== questions.length && (
              <span className="text-emerald-600 ml-1">({filteredQuestions.length} filtered)</span>
            )}
          </p>
        </motion.div>
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedQuestions.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="text-white" size={20} />
                <span className="text-white font-semibold">
                  {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSelection}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium"
                >
                  Clear Selection
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDeleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleteLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash size={18} />
                  )}
                  Delete Selected
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div 
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 capitalize appearance-none bg-white transition"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {filterSubject !== "all" && (
            <motion.div 
              className="mt-3 flex items-center gap-2"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs text-slate-500">Filtered by:</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded capitalize">
                {subjects.find(s => s.id === filterSubject)?.name || filterSubject}
              </span>
              <button
                onClick={() => setFilterSubject("all")}
                className="text-xs text-slate-400 hover:text-slate-600 ml-1"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <motion.div 
            className="bg-white p-12 rounded-2xl border border-slate-200 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">No questions found.</p>
          </motion.div>
        ) : (
          <>
            {/* Select All Checkbox */}
            {paginatedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  {allCurrentPageSelected ? (
                    <CheckSquare className="text-emerald-600" size={20} />
                  ) : (
                    <Square className="text-slate-400" size={20} />
                  )}
                  <span>
                    {allCurrentPageSelected ? 'Deselect' : 'Select'} all on this page
                  </span>
                </motion.button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${safeCurrentPage}-${filterSubject}-${searchTerm}-${itemsPerPage}`}
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {paginatedQuestions.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    variants={cardVariants}
                    className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                      selectedQuestions.has(q.id) 
                        ? 'border-emerald-500 ring-2 ring-emerald-200' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Checkbox */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSelectQuestion(q.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {selectedQuestions.has(q.id) ? (
                            <CheckSquare className="text-emerald-600" size={22} />
                          ) : (
                            <Square className="text-slate-400 hover:text-slate-600" size={22} />
                          )}
                        </motion.button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase">
                              {q.subject}
                            </span>
                            <span className="text-slate-400 text-xs">#{startIdx + idx + 1}</span>
                            {q.imageURL && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <ImageIcon size={12} />
                                Has Image
                              </span>
                            )}
                          </div>
                          <MathText text={q.questionText} className="text-lg font-medium text-slate-900" />
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Question"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(q.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Question"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Question Image */}
                    {q.imageURL && (
                      <div className="mb-4 ml-9">
                        <img 
                          src={q.imageURL} 
                          alt="Question diagram" 
                          className="max-w-md w-full h-auto rounded-lg border-2 border-slate-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 ml-9">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
                            optIdx === q.correctOption
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            optIdx === q.correctOption ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <MathText text={opt} className="flex-1" />
                          {optIdx === q.correctOption && <CheckCircle size={14} className="ml-auto text-emerald-600" />}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg ml-9">
                        <p className="text-xs font-bold text-blue-900 mb-1">Explanation:</p>
                        <MathText text={q.explanation} className="text-sm text-blue-800" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Pagination Bar */}
      {filteredQuestions.length > 0 && (
        <motion.div
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Items per page & info */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 font-medium"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>per page</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-slate-500">
                Showing <strong className="text-slate-700">{startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredQuestions.length)}</strong> of <strong className="text-slate-700">{filteredQuestions.length}</strong>
              </span>
            </div>

            {/* Page Controls */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => goToPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="First page"
              >
                <ChevronsLeft size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </motion.button>

              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400 select-none text-sm">…</span>
                ) : (
                  <motion.button
                    key={page}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => goToPage(page as number)}
                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition ${
                      safeCurrentPage === page
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </motion.button>
                )
              )}

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next page"
              >
                <ChevronRight size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => goToPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Last page"
              >
                <ChevronsRight size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Edit Question</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setEditingQuestion(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Edit Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={editingQuestion.subject}
                    disabled
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-500 capitalize"
                  />
                </div>

                {editingQuestion.imageURL && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Question Image</label>
                    <img 
                      src={editingQuestion.imageURL} 
                      alt="Question" 
                      className="max-w-md w-full rounded-lg border-2 border-slate-200"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Note: Image editing not available. Delete and recreate question to change image.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Question
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      Use $...$ for math: <code className="bg-slate-100 px-1 rounded">$x^2 + 5$</code>
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    value={editForm.questionText}
                    onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                  />
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Preview:</p>
                    <MathText text={editForm.questionText} className="text-sm text-slate-900" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editForm.options.map((opt, idx) => (
                      <div key={idx}>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <input
                            type="text"
                            className={`w-full pl-8 p-3 border rounded-xl outline-none font-mono text-sm ${
                              editForm.correctOption === idx
                                ? 'border-emerald-500 bg-emerald-50 focus:ring-2 focus:ring-emerald-500'
                                : 'border-slate-300 focus:ring-2 focus:ring-slate-400'
                            }`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...editForm.options];
                              newOpts[idx] = e.target.value;
                              setEditForm({ ...editForm, options: newOpts });
                            }}
                          />
                        </div>
                        <div className="mt-1 p-2 bg-slate-50 rounded text-xs">
                          <MathText text={opt} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
                  <div className="flex gap-2">
                    {editForm.options.map((_, idx) => (
                      <motion.button
                        key={idx}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditForm({ ...editForm, correctOption: idx })}
                        className={`flex-1 py-2 rounded-lg font-bold border transition ${
                          editForm.correctOption === idx
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Explanation (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    value={editForm.explanation}
                    onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                  />
                  {editForm.explanation && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Preview:</p>
                      <MathText text={editForm.explanation} className="text-sm text-slate-900" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.isBulk ? "Delete Multiple Questions?" : "Delete Question?"}
        message={
          confirmDialog.isBulk
            ? `Are you sure you want to delete ${selectedQuestions.size} question${selectedQuestions.size !== 1 ? 's' : ''}? This action cannot be undone.`
            : "Are you sure you want to delete this question? This action cannot be undone. Note: The associated image will remain in Cloudinary storage."
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, questionId: null, isBulk: false })}
      />
    </div>
  );
}