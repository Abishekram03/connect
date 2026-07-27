"use client";

import { useState } from "react";
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
  MessageSquare,
  ChevronRight,
  Globe,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
  articleCount: number;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
};

type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  published: boolean;
};

const defaultCategories: Category[] = [];

const defaultFAQs: FAQ[] = [];

const defaultArticles: Article[] = [];

export default function KnowledgePage() {
  const [tab, setTab] = useState<"faqs" | "articles">("faqs");
  const [categories] = useState<Category[]>(defaultCategories);
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "general" });
  const [articleForm, setArticleForm] = useState({ title: "", content: "", category: "general" });

  const filteredCategories = selectedCategory
    ? categories.filter((c) => c.id === selectedCategory)
    : categories;

  const filteredFaqs = faqs.filter(
    (f) =>
      (!selectedCategory || f.category === categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()) &&
      (f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredArticles = articles.filter(
    (a) =>
      (!selectedCategory || a.category === categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))
  );

  const saveFaq = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    if (editFaq) {
      setFaqs(faqs.map((f) => (f.id === editFaq.id ? { ...f, ...faqForm, updatedAt: new Date().toISOString().split("T")[0] } : f)));
    } else {
      setFaqs([{ id: `f${Date.now()}`, ...faqForm, updatedAt: new Date().toISOString().split("T")[0] }, ...faqs]);
    }
    setShowAddFaq(false);
    setEditFaq(null);
    setFaqForm({ question: "", answer: "", category: "general" });
  };

  const saveArticle = () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) return;
    if (editArticle) {
      setArticles(articles.map((a) => (a.id === editArticle.id ? { ...a, ...articleForm, updatedAt: new Date().toISOString().split("T")[0] } : a)));
    } else {
      setArticles([{ id: `a${Date.now()}`, ...articleForm, updatedAt: new Date().toISOString().split("T")[0], published: false }, ...articles]);
    }
    setShowAddArticle(false);
    setEditArticle(null);
    setArticleForm({ title: "", content: "", category: "general" });
  };

  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
    if (selectedFaq?.id === id) setSelectedFaq(null);
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
    if (selectedArticle?.id === id) setSelectedArticle(null);
  };

  const togglePublish = (id: string) => {
    setArticles(articles.map((a) => (a.id === id ? { ...a, published: !a.published } : a)));
  };

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm">
        <div className="flex w-full md:w-48 shrink-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-semibold text-ink">Categories</h2>
            </div>
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
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  selectedCategory === cat.id ? "bg-surface-2 font-medium text-ink" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5" />
                    {cat.name}
                  </div>
                  <span className="text-xs">{cat.articleCount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

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
                    setFaqForm({ question: "", answer: "", category: "general" });
                    setShowAddFaq(true);
                  } else {
                    setEditArticle(null);
                    setArticleForm({ title: "", content: "", category: "general" });
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
            <div className="flex w-full md:w-80 flex-col overflow-y-auto border-r border-border">
              {tab === "faqs" ? (
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
                          <span className="capitalize">{faq.category}</span>
                          <span>Updated {faq.updatedAt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                filteredArticles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                    <FileText className="mb-3 h-10 w-10 text-border" />
                    <p>No articles found</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1">
                    {filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
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
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{article.content}</p>
                        <div className="mt-1.5 flex items-center gap-2.5 text-xs text-muted-foreground">
                          <span className="capitalize">{article.category}</span>
                          <span>Updated {article.updatedAt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto">
              {tab === "faqs" && selectedFaq ? (
                <div className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink">{selectedFaq.question}</h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditFaq(selectedFaq);
                          setFaqForm({ question: selectedFaq.question, answer: selectedFaq.answer, category: selectedFaq.category });
                          setShowAddFaq(true);
                        }}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFaq(selectedFaq.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 capitalize text-accent">{selectedFaq.category}</span>
                    <span>Updated {selectedFaq.updatedAt}</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="text-sm text-ink leading-relaxed">{selectedFaq.answer}</p>
                  </div>
                </div>
              ) : tab === "articles" && selectedArticle ? (
                <div className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePublish(selectedArticle.id)}
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
                          setArticleForm({ title: selectedArticle.title, content: selectedArticle.content, category: selectedArticle.category });
                          setShowAddArticle(true);
                        }}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteArticle(selectedArticle.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 capitalize text-accent">{selectedArticle.category}</span>
                    <span className="flex items-center gap-0.5">
                      {selectedArticle.published ? <Globe className="h-3.5 w-3.5 text-green-600" /> : <Eye className="h-3.5 w-3.5 text-amber-600" />}
                      {selectedArticle.published ? "Published" : "Draft"}
                    </span>
                    <span>Updated {selectedArticle.updatedAt}</span>
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
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="general">General</option>
                  <option value="getting-started">Getting Started</option>
                  <option value="account">Account & Billing</option>
                  <option value="features">Features</option>
                  <option value="troubleshooting">Troubleshooting</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => { setShowAddFaq(false); setEditFaq(null); }} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={saveFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim()} className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40">
                {editFaq ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </div>
        </>
      )}

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
                  value={articleForm.category}
                  onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="general">General</option>
                  <option value="getting-started">Getting Started</option>
                  <option value="account">Account & Billing</option>
                  <option value="features">Features</option>
                  <option value="troubleshooting">Troubleshooting</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => { setShowAddArticle(false); setEditArticle(null); }} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={saveArticle} disabled={!articleForm.title.trim() || !articleForm.content.trim()} className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40">
                {editArticle ? "Save Changes" : "Add Article"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
