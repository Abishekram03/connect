"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";
import {
  screenAtom,
  widgetConfigAtom,
  footerVisibleAtom,
  articleOpenAtom,
} from "../../atoms/widget-atoms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HelpCollection {
  id: string;
  name: string;
  description?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
}

interface Props {
  mode?: "preview" | "production";
}

export const WidgetHelpScreen = ({
  mode = "production",
}: Props) => {
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const setScreen = useSetAtom(screenAtom);
  const setFooterVisible = useSetAtom(footerVisibleAtom);
  const setArticleOpen = useSetAtom(articleOpenAtom);

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const collections: HelpCollection[] = [];
  const articles: HelpArticle[] = [];

  const selectedCollection = collections.find((c) => c.id === activeCollectionId) || null;
  const selectedArticle = articles.find((a) => a.id === activeArticleId) || null;

  const filteredCollections = useMemo(() => {
    if (!searchTerm.trim()) return collections;
    const term = searchTerm.toLowerCase();
    return collections.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term),
    );
  }, [collections, searchTerm]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;
    const term = searchTerm.toLowerCase();
    return articles.filter(
      (a) => a.title.toLowerCase().includes(term) || (a.excerpt || "").toLowerCase().includes(term),
    );
  }, [articles, searchTerm]);

  const accentColor = widgetConfig.primaryColor || "#2563eb";

  const showCollections = !activeCollectionId;
  const isArticlePage = !!activeArticleId && !!selectedArticle;

  useEffect(() => {
    setArticleOpen(isArticlePage);
  }, [isArticlePage, setArticleOpen]);

  const headerTitle = showCollections
    ? "Help Center"
    : isArticlePage
      ? selectedCollection?.name || "Article"
      : selectedCollection?.name || "Help Center";

  const handleHeaderBack = () => {
    if (isArticlePage) {
      setActiveArticleId(null);
      setSearchTerm("");
      return;
    }
    if (!showCollections) {
      setActiveCollectionId(null);
      setSearchTerm("");
      return;
    }
    setScreen("selection");
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="flex flex-col border-b border-neutral-200 px-3 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleHeaderBack}
            className="rounded p-1 text-neutral-700 transition-colors hover:bg-neutral-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-neutral-900">{headerTitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        {!isArticlePage && (
          <div className="rounded-full bg-neutral-100 px-3 py-2 text-sm text-neutral-500 border border-neutral-200">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-neutral-800"
              aria-label="Search help"
            />
          </div>
        )}

        {showCollections && (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_6px_rgb(0_0_0_/_0.06)]">
            <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-500" />
                <p className="text-sm font-semibold text-neutral-900">Collections</p>
              </div>
              <span className="text-[11px] text-neutral-500">{collections.length} items</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {filteredCollections.length === 0 ? (
                <div className="p-4 text-sm text-neutral-500">No collections available.</div>
              ) : (
                filteredCollections.map((collection) => (
                  <button
                    key={collection.id}
                    className="flex w-full items-start justify-between gap-2 px-3 py-3 text-left transition-colors hover:bg-neutral-50"
                    onClick={() => {
                      setActiveCollectionId(collection.id);
                      setActiveArticleId(null);
                    }}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-neutral-900">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-neutral-600">{collection.description}</p>
                      )}
                    </div>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
                    >
                      Open
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {!showCollections && !isArticlePage && (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_6px_rgb(0_0_0_/_0.06)]">
            <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveArticleId(null); setActiveCollectionId(null); }}
                  className="rounded p-1 text-neutral-700 transition-colors hover:bg-neutral-100"
                  aria-label="Back to collections"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-neutral-900">{selectedCollection?.name}</p>
                  <p className="text-[11px] text-neutral-500">{selectedCollection?.description || `${articles.length} articles`}</p>
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">{articles.length} articles</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {filteredArticles.length === 0 ? (
                <div className="p-4 text-sm text-neutral-500">No articles yet.</div>
              ) : (
                filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-neutral-50"
                    onClick={() => setActiveArticleId(article.id)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-neutral-900">{article.title}</p>
                      {article.excerpt && (
                        <p className="text-xs text-neutral-600 line-clamp-2">{article.excerpt}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {isArticlePage && selectedArticle && (
          <div className="space-y-3 pt-1">
            <h2 className="text-lg font-semibold text-neutral-900">{selectedArticle.title}</h2>
            <div className="prose prose-sm max-w-none text-neutral-800 prose-headings:text-neutral-900 prose-strong:text-neutral-900 prose-a:text-blue-600">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedArticle.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
