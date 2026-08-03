"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  Search,
  FileText,
  HelpCircle,
  Edit3,
  Trash2,
  Eye,
  FolderOpen,
  BookOpen,
  ChevronRight,
  Globe,
  Loader2,
} from "lucide-react";
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchArticles,
  fetchArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  type Category,
  type Article,
  type FAQ,
} from "@/lib/knowledge-service";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";

export default function KnowledgePage() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [tab, setTab] = useState<"faqs" | "articles">("faqs");
  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category_id: "" });
  const [articleForm, setArticleForm] = useState({ title: "", content: "", excerpt: "", category_id: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, faqsData, articlesData] = await Promise.all([
        fetchCategories(),
        fetchFAQs(selectedCategory ? { category_id: selectedCategory } : undefined),
        fetchArticles(selectedCategory ? { category_id: selectedCategory } : undefined),
      ]);
      setCategories(cats);
      setFaqs(faqsData);
      setArticles(articlesData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) return;
    setSaving(true);
    try {
      await createCategory(categoryForm);
      setShowAddCategory(false);
      setCategoryForm({ name: "", description: "" });
      loadData();
      toast.success("Category created successfully");
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const ok = await confirm({
      title: "Delete Category",
      message: "Are you sure you want to delete this category? Items in this category will become uncategorized.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      loadData();
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const saveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setSaving(true);
    try {
      if (editFaq) {
        await updateFAQ(editFaq.id, {
          question: faqForm.question,
          answer: faqForm.answer,
          category_id: faqForm.category_id || null,
        });
        toast.success("FAQ updated successfully");
      } else {
        await createFAQ({
          question: faqForm.question,
          answer: faqForm.answer,
          category_id: faqForm.category_id || null,
        });
        toast.success("FAQ created successfully");
      }
      setShowAddFaq(false);
      setEditFaq(null);
      setFaqForm({ question: "", answer: "", category_id: "" });
      loadData();
    } catch {
      toast.error(editFaq ? "Failed to update FAQ" : "Failed to create FAQ");
    } finally {
      setSaving(false);
    }
  };

  const saveArticle = async () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) return;
    setSaving(true);
    try {
      if (editArticle) {
        await updateArticle(editArticle.id, {
          title: articleForm.title,
          content: articleForm.content,
          excerpt: articleForm.excerpt,
          category_id: articleForm.category_id || null,
        });
        toast.success("Article updated successfully");
      } else {
        await createArticle({
          title: articleForm.title,
          content: articleForm.content,
          excerpt: articleForm.excerpt,
          category_id: articleForm.category_id || null,
        });
        toast.success("Article created successfully");
      }
      setShowAddArticle(false);
      setEditArticle(null);
      setArticleForm({ title: "", content: "", excerpt: "", category_id: "" });
      loadData();
    } catch {
      toast.error(editArticle ? "Failed to update article" : "Failed to create article");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    const ok = await confirm({
      title: "Delete FAQ",
      message: "Are you sure you want to delete this FAQ? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteFAQ(id);
      if (selectedFaq?.id === id) setSelectedFaq(null);
      loadData();
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const ok = await confirm({
      title: "Delete Article",
      message: "Are you sure you want to delete this article? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteArticle(id);
      if (selectedArticle?.id === id) setSelectedArticle(null);
      loadData();
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const updated = await updateArticle(article.id, { published: !article.published });
      if (selectedArticle?.id === article.id) setSelectedArticle(updated);
      loadData();
      toast.success(article.published ? "Article unpublished" : "Article published");
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm">
        {/* Categories sidebar */}
        <div className="flex w-full md:w-48 shrink-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-semibold text-ink">Categories</h2>
            </div>
            <button
              onClick={() => { setCategoryForm({ name: "", description: "" }); setShowAddCategory(true); }}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              title="Add category"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                !selectedCategory ? "bg-surface-2 font-medium text-ink" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4" />
                All Categories
              </div>
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="group mt-1 flex items-center">
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-1 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    selectedCategory === cat.id ? "bg-surface-2 font-medium text-ink" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs shrink-0 ml-1">{cat.article_count + cat.faq_count}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="ml-1 shrink-0 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  title="Delete category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setTab("faqs")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  tab === "faqs" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setTab("articles")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  tab === "articles" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Articles
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "faqs" ? "Search FAQs..." : "Search articles..."}
                  className="w-48 rounded-md border border-border bg-surface py-2 pl-6 pr-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => {
                  if (tab === "faqs") {
                    setEditFaq(null);
                    setFaqForm({ question: "", answer: "", category_id: "" });
                    setShowAddFaq(true);
                  } else {
                    setEditArticle(null);
                    setArticleForm({ title: "", content: "", excerpt: "", category_id: "" });
                    setShowAddArticle(true);
                  }
                }}
                className="flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add {tab === "faqs" ? "FAQ" : "Article"}
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* List panel */}
            <div className="flex w-full md:w-80 shrink-0 flex-col overflow-y-auto border-r border-border">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : tab === "faqs" ? (
                filteredFaqs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                    <HelpCircle className="mb-3 h-10 w-10 text-border" />
                    <p>No FAQs found</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1">
                    {filteredFaqs.map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => setSelectedFaq(faq)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selectedFaq?.id === faq.id ? "bg-surface-2" : "hover:bg-surface-2"
                        }`}
                      >
                        <p className="text-sm font-medium text-ink">{faq.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{faq.answer}</p>
                        <div className="mt-1.5 flex items-center gap-2.5 text-xs text-muted-foreground">
                          {faq.category && <span className="capitalize">{faq.category.name}</span>}
                          <span>Updated {new Date(faq.updated_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <FileText className="mb-3 h-10 w-10 text-border" />
                  <p>No articles found</p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  {filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={async () => {
                        setLoadingArticle(true);
                        try {
                          const full = await fetchArticle(article.id);
                          setSelectedArticle(full);
                        } catch {
                          setSelectedArticle(article);
                        } finally {
                          setLoadingArticle(false);
                        }
                      }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                        selectedArticle?.id === article.id ? "bg-surface-2" : "hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{article.title}</p>
                        {article.published ? (
                          <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[11px] text-green-700">
                            <Globe className="h-3.5 w-3.5" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-700">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{article.excerpt || article.content}</p>
                      <div className="mt-1.5 flex items-center gap-2.5 text-xs text-muted-foreground">
                        {article.category && <span className="capitalize">{article.category.name}</span>}
                        <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className="flex flex-1 min-w-0 flex-col overflow-y-auto">
              {loadingArticle ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading article...</p>
                  </div>
                </div>
              ) : tab === "faqs" && selectedFaq ? (
                <div className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink">{selectedFaq.question}</h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditFaq(selectedFaq);
                          setFaqForm({
                            question: selectedFaq.question,
                            answer: selectedFaq.answer,
                            category_id: selectedFaq.category?.id || "",
                          });
                          setShowAddFaq(true);
                        }}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(selectedFaq.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {selectedFaq.category && (
                    <div className="mb-4 flex items-center gap-2.5 text-xs text-muted-foreground">
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 capitalize text-accent">{selectedFaq.category.name}</span>
                      <span>Updated {new Date(selectedFaq.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{selectedFaq.answer}</p>
                  </div>
                </div>
              ) : tab === "articles" && selectedArticle ? (
                <div className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(selectedArticle)}
                        className={`rounded-md border px-2.5 py-2 text-xs font-medium transition-colors ${
                          selectedArticle.published
                            ? "border-border text-muted-foreground hover:text-foreground"
                            : "border-accent text-accent hover:bg-accent/10"
                        }`}
                      >
                        {selectedArticle.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => {
                          setEditArticle(selectedArticle);
                          setArticleForm({
                            title: selectedArticle.title,
                            content: selectedArticle.content,
                            excerpt: selectedArticle.excerpt,
                            category_id: selectedArticle.category?.id || "",
                          });
                          setShowAddArticle(true);
                        }}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(selectedArticle.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2.5 text-xs text-muted-foreground">
                    {selectedArticle.category && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 capitalize text-accent">{selectedArticle.category.name}</span>
                    )}
                    <span className="flex items-center gap-0.5">
                      {selectedArticle.published ? <Globe className="h-3.5 w-3.5 text-green-600" /> : <Eye className="h-3.5 w-3.5 text-amber-600" />}
                      {selectedArticle.published ? "Published" : "Draft"}
                    </span>
                    <span>Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    {tab === "faqs" ? (
                      <HelpCircle className="mx-auto mb-3 h-12 w-12 text-border" />
                    ) : (
                      <FileText className="mx-auto mb-3 h-12 w-12 text-border" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      Select a {tab === "faqs" ? "FAQ" : "article"} to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowAddCategory(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Add Category</h3>
              <button onClick={() => setShowAddCategory(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Getting Started"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Optional description"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setShowAddCategory(false)} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={handleAddCategory} disabled={!categoryForm.name.trim() || saving} className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Category"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit FAQ Modal */}
      {showAddFaq && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => { setShowAddFaq(false); setEditFaq(null); }} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{editFaq ? "Edit FAQ" : "Add FAQ"}</h3>
              <button onClick={() => { setShowAddFaq(false); setEditFaq(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How do I reset my password?"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Write the answer..."
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={faqForm.category_id}
                  onChange={(e) => setFaqForm({ ...faqForm, category_id: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => { setShowAddFaq(false); setEditFaq(null); }} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={saveFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim() || saving} className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editFaq ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Article Modal */}
      {showAddArticle && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => { setShowAddArticle(false); setEditArticle(null); }} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{editArticle ? "Edit Article" : "Add Article"}</h3>
              <button onClick={() => { setShowAddArticle(false); setEditArticle(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Setting up your workspace"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
                <input
                  type="text"
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Short summary for previews (optional)"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Content</label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Write your article content here..."
                  rows={8}
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={articleForm.category_id}
                  onChange={(e) => setArticleForm({ ...articleForm, category_id: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => { setShowAddArticle(false); setEditArticle(null); }} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={saveArticle} disabled={!articleForm.title.trim() || !articleForm.content.trim() || saving} className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editArticle ? "Save Changes" : "Add Article"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
