"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, TrendingUp, Dumbbell, Scale, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { MOCK_AI_CONVERSATIONS } from "@/lib/mock-data";
import type { AiConversation } from "@/types";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { label: "Analyse ma progression", icon: TrendingUp },
  { label: "Optimise mon programme", icon: Dumbbell },
  { label: "Conseil nutrition", icon: Scale },
  { label: "Je stagne, aide-moi", icon: Sparkles },
];

const AI_REPLIES: Record<string, string> = {
  default: "Je suis là pour t'aider ! Pose-moi une question sur ton entraînement, ta progression ou ta nutrition.",
  "analyse ma progression": "📊 **Analyse de ta progression :**\n\nSur les 5 dernières semaines, ta progression est excellente :\n- **Poids corpo** : +3.5 kg (78 → 81.5 kg) — objectif 85 kg\n- **Bench** : +15 kg (90 → 105 kg) · nouveau PR cette semaine !\n- **Squat** : +27.5 kg · PR à 147.5 kg\n- **Deadlift** : +25 kg\n\n✅ Tu es sur la bonne trajectoire. Continue ainsi !",
  "optimise mon programme": "🏋️ **Recommandations pour ton PPL :**\n\n1. **Volume** : Légèrement augmenter les séries de dos (3 → 4)\n2. **Fréquence** : Le 6×/semaine est optimal pour toi\n3. **Points faibles** : Épaules à améliorer\n\n**Suggestion** : Ajouter des face pulls 3×15 en fin de Push pour l'équilibre musculaire.",
  "je stagne, aide-moi": "🔄 **Identifier et briser la stagnation :**\n\n**Causes possibles :**\n- Récupération insuffisante (dormir 7-9h ?)\n- Calories trop basses pour ton objectif masse\n- Manque de surcharge progressive\n\n**Solution immédiate :** Essaie une semaine de décharge (baisser les charges de 40%), puis reviens en force la semaine suivante.",
  "conseil nutrition": "🥗 **Nutrition pour prise de masse :**\n\nAvec ton objectif de 85 kg et ton programme actuel :\n- **Calories** : 3200 kcal (surplus de ~300)\n- **Protéines** : 180-200g/jour (2.2g/kg)\n- **Glucides** : 400-450g/jour\n- **Lipides** : 80-100g/jour\n\n⏰ **Timing** : Manger 1h avant et dans les 2h après l'entraînement.",
};

function getAIReply(message: string): string {
  const key = message.toLowerCase();
  for (const [prompt, reply] of Object.entries(AI_REPLIES)) {
    if (key.includes(prompt) || prompt.includes(key.substring(0, 10))) {
      return reply;
    }
  }
  return AI_REPLIES.default;
}

function MessageBubble({ msg }: { msg: AiConversation }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl gradient-violet flex items-center justify-center flex-shrink-0 glow-violet-sm mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "gradient-violet text-white rounded-tr-sm"
          : "bg-card border border-border/50 text-foreground rounded-tl-sm"
      )}>
        {msg.message.split("\n").map((line, i) => {
          const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
          return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine || "&nbsp;" }} />;
        })}
        <p className={cn("text-[10px] mt-1.5", isUser ? "text-white/60" : "text-muted-foreground")}>
          {format(parseISO(msg.created_at), "HH:mm", { locale: fr })}
        </p>
      </div>
    </motion.div>
  );
}

export default function AiCoachPage() {
  const [messages, setMessages] = useState<AiConversation[]>(MOCK_AI_CONVERSATIONS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: AiConversation = {
      id: `m${Date.now()}`,
      user_id: "mock-user-1",
      role: "user",
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const aiMsg: AiConversation = {
      id: `m${Date.now() + 1}`,
      user_id: "mock-user-1",
      role: "assistant",
      message: getAIReply(text),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header title="Coach IA" subtitle="Ton assistant fitness personnel" />

      {/* Flex grow chat area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4 scrollbar-thin pb-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-2xl p-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center mx-auto mb-2 glow-violet">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm">Coach IA — Project Mass</h3>
            <p className="text-xs text-muted-foreground mt-1">Propulsé par GPT-4o / Claude</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">En ligne</span>
            </div>
          </motion.div>

          {/* Messages */}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl gradient-violet flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input area */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 lg:px-6 py-4 pb-safe">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Quick prompts */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {QUICK_PROMPTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => sendMessage(label)}
                disabled={loading}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pose une question à ton coach..."
              className="flex-1 px-4 py-3 bg-secondary/50 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center glow-violet-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
