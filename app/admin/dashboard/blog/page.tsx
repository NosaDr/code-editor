"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, Trash2, Eye, EyeOff, Save, X, FileText, Tag, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

const CATEGORIES = ["Exam Strategy", "Subject Tips", "Study Skills", "News & Updates"];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }: { message: string; type: "success" | "error" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold ${
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`}
  >
    {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    {message}
  </motion.div>
);

// ─── Empty article template ───────────────────────────────────────────────────
const emptyForm = {
  title: "",
  excerpt: "",
  category: "Exam Strategy",
  readTime: 3,
  published: false,
  featured: false,
};

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "How to Manage Your Time in the JAMB CBT Exam Hall",
      excerpt: "Most students don't fail JAMB because they don't know the content. They fail because they run out of time.",
      category: "Exam Strategy",
      readTime: 5,
      published: false,
      featured: true,
      createdAt: "2026-03-19",
    },
    {
      id: "2",
      title: "The 5 WAEC English Topics That Appear Every Single Year",
      excerpt: "There are patterns in WAEC. We went through 10 years of past questions and found the topics you absolutely cannot skip.",
      category: "Subject Tips",
      readTime: 4,
      published: false,
      featured: false,
      createdAt: "2026-03-19",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (form.readTime < 1) e.readTime = 1;
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const newArticle: Article = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    // If this new one is featured, unfeature others
    if (form.featured) {
      setArticles(prev => prev.map(a => ({ ...a, featured: false })));
    }

    setArticles(prev => [newArticle, ...prev]);
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
    showToast("Article added successfully", "success");
  };

  const togglePublish = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));
    const article = articles.find(a => a.id === id);
    showToast(article?.published ? "Article unpublished" : "Article published", "success");
  };

  const toggleFeatured = (id: string) => {
    setArticles(prev => prev.map(a => ({
      ...a,
      featured: a.id === id ? !a.featured : false,
    })));
  };

  const handleDelete = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
    showToast("Article deleted", "error");
  };

  const categoryColors: Record<string, string> = {
    "Exam Strategy": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "Subject Tips":  "text-teal-400 bg-teal-500/10 border-teal-500/20",
    "Study Skills":  "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "News & Updates":"text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} /> Sure Prep
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono px-3 py-1 bg-slate-900 border border-white/5 rounded-full">
              Admin Panel
            </span>
            <Link href="/blog" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              View Blog →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-emerald-400 font-mono text-xs uppercase tracking-[0.2em] mb-3">— Blog Management</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Articles</h1>
            <p className="text-slate-400 text-sm mt-2">{articles.length} article{articles.length !== 1 ? 's' : ''} · {articles.filter(a => a.published).length} published</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm(true); setForm(emptyForm); setErrors({}); }}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 self-start md:self-auto"
          >
            <Plus size={18} /> New Article
          </motion.button>
        </div>

        {/* Add Article Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -16, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-slate-900 border border-white/10 rounded-[1.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText size={18} className="text-emerald-400" /> New Article
                  </h2>
                  <button onClick={() => setShowForm(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(e => ({ ...e, title: undefined })); }}
                      placeholder="e.g. How to Score 300+ in JAMB"
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors ${errors.title ? 'border-red-500/50' : 'border-white/10'}`}
                    />
                    {errors.title && <p className="text-red-400 text-xs mt-1.5">{errors.title}</p>}
                  </div>

                  {/* Excerpt */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Excerpt *</label>
                    <textarea
                      rows={3}
                      value={form.excerpt}
                      onChange={e => { setForm(f => ({ ...f, excerpt: e.target.value })); setErrors(e => ({ ...e, excerpt: undefined })); }}
                      placeholder="A short summary that appears on the blog listing page..."
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors resize-none ${errors.excerpt ? 'border-red-500/50' : 'border-white/10'}`}
                    />
                    {errors.excerpt && <p className="text-red-400 text-xs mt-1.5">{errors.excerpt}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1.5"><Tag size={11} /> Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Read time */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1.5"><Clock size={11} /> Read Time (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={form.readTime}
                      onChange={e => setForm(f => ({ ...f, readTime: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="md:col-span-2 flex flex-wrap gap-4">
                    {[
                      { key: "published" as const, label: "Publish immediately", desc: "Visible on the blog" },
                      { key: "featured" as const, label: "Set as featured", desc: "Shown at the top of the blog" },
                    ].map(({ key, label, desc }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                          form[key]
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${form[key] ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'}`}>
                          {form[key] && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold">{label}</div>
                          <div className="text-[10px] text-slate-500">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors"
                  >
                    <Save size={15} /> Save Article
                  </motion.button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-white/5 text-slate-400 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Articles Table */}
        <div className="bg-slate-900 border border-white/5 rounded-[1.5rem] overflow-hidden">
          {articles.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <FileText size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">No articles yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="col-span-5">Article</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-center">Read</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <AnimatePresence>
                {articles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Title + meta */}
                    <div className="md:col-span-5">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm text-white leading-snug">{article.title}</p>
                        {article.featured && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-1">{article.excerpt}</p>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryColors[article.category] ?? 'text-slate-400 bg-white/5 border-white/10'}`}>
                        {article.category}
                      </span>
                    </div>

                    {/* Read time */}
                    <div className="md:col-span-1 text-center">
                      <span className="text-slate-400 text-xs font-mono">{article.readTime}m</span>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex justify-start md:justify-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                        article.published
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                      {/* Toggle publish */}
                      <button
                        onClick={() => togglePublish(article.id)}
                        title={article.published ? "Unpublish" : "Publish"}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-400 transition-colors"
                      >
                        {article.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      {/* Toggle featured */}
                      <button
                        onClick={() => toggleFeatured(article.id)}
                        title={article.featured ? "Unfeature" : "Set as featured"}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors text-xs font-black ${
                          article.featured
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                        }`}
                      >
                        ★
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(article.id)}
                        title="Delete"
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><Eye size={12} /> Publish / Unpublish</span>
          <span className="flex items-center gap-1.5"><span className="text-xs">★</span> Set as featured (only one at a time)</span>
          <span className="flex items-center gap-1.5"><Trash2 size={12} /> Delete article</span>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full"
            >
              <div className="h-12 w-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-5">
                <Trash2 size={22} />
              </div>
              <h3 className="font-bold text-lg mb-2">Delete this article?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                This can't be undone. The article will be permanently removed from the blog.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-400 transition-colors"
                >
                  Yes, delete it
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-white/5 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}