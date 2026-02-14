import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Check, Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { prebuiltWordPacks, type WordPack } from "@/data/prebuilt-word-packs";
import type { BannedWord } from "@/hooks/use-moderation";

interface WordPacksPanelProps {
  bannedWords: BannedWord[];
  onAddWords: (words: string[], category: string, severity: string) => Promise<void>;
}

const WordPacksPanel = ({ bannedWords, onAddWords }: WordPacksPanelProps) => {
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const getPackStatus = (pack: WordPack) => {
    const existing = new Set(bannedWords.map(w => w.word));
    const alreadyAdded = pack.words.filter(w => existing.has(w.toLowerCase()));
    const remaining = pack.words.filter(w => !existing.has(w.toLowerCase()));
    return { alreadyAdded: alreadyAdded.length, remaining: remaining.length, total: pack.words.length };
  };

  const handleEnablePack = async (pack: WordPack) => {
    const existing = new Set(bannedWords.map(w => w.word));
    const newWords = pack.words.filter(w => !existing.has(w.toLowerCase()));
    if (!newWords.length) return;

    setLoadingPack(pack.id);
    await onAddWords(newWords, pack.category, "block");
    setLoadingPack(null);
  };

  return (
    <div className="rounded-2xl p-[1px] mb-6" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
      <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
            <Package size={15} className="text-secondary" /> Pre-Built Word Packs
          </h3>
          <span className="text-[10px] text-muted-foreground/60">One-click enable per category</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {prebuiltWordPacks.map(pack => {
            const status = getPackStatus(pack);
            const isFullyAdded = status.remaining === 0;
            const isLoading = loadingPack === pack.id;
            const isExpanded = expandedPack === pack.id;

            return (
              <div key={pack.id} className="rounded-xl border border-border/30 overflow-hidden transition-all duration-200 hover:border-primary/20">
                <div className="p-3.5" style={{ background: "rgba(15,18,28,0.6)" }}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{pack.emoji}</span>
                      <div>
                        <p className={`text-xs font-heading font-bold ${pack.color}`}>{pack.label}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{pack.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/30">
                      {pack.words.length} words
                    </span>
                    {status.alreadyAdded > 0 && (
                      <span className="text-[10px] text-primary px-2 py-0.5 rounded bg-primary/10">
                        {status.alreadyAdded} added
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-muted/30 mb-3">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-500"
                      style={{ width: `${(status.alreadyAdded / status.total) * 100}%` }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEnablePack(pack)}
                      disabled={isFullyAdded || isLoading}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                        isFullyAdded
                          ? "bg-primary/10 text-primary cursor-default"
                          : isLoading
                          ? "bg-muted/40 text-muted-foreground cursor-wait"
                          : "bg-primary/20 text-primary hover:bg-primary/30"
                      }`}
                    >
                      {isLoading ? (
                        <><Loader2 size={12} className="animate-spin" /> Adding...</>
                      ) : isFullyAdded ? (
                        <><Check size={12} /> All Added</>
                      ) : (
                        <><Plus size={12} /> Enable {status.remaining} Words</>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                      className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expandable word list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-border/20">
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 mt-2">
                          {pack.words.map(word => {
                            const isAdded = bannedWords.some(bw => bw.word === word.toLowerCase());
                            return (
                              <span
                                key={word}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                  isAdded
                                    ? "bg-primary/10 text-primary/70 border-primary/15 line-through"
                                    : "bg-muted/20 text-muted-foreground border-border/20"
                                }`}
                              >
                                {word}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordPacksPanel;
