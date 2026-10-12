"use client";

import { ArrowUp, Flame, RotateCcw, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ALL_PROMPTS, PRIMARY_PROMPTS, SECONDARY_PROMPTS } from "@/lib/prompts";
import { MarkdownView } from "@/components/markdown-view";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

export function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const targetRef = useRef("");
  const shownRef = useRef("");
  const doneRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function stopReveal() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function ensureReveal(id: string) {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const target = targetRef.current;
      const shown = shownRef.current;
      if (shown.length >= target.length) {
        if (doneRef.current) {
          stopReveal();
          setStreamingId(null);
        }
        return;
      }
      const next = target.slice(
        0,
        reduce ? target.length : Math.min(shown.length + 2, target.length),
      );
      shownRef.current = next;
      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, content: next } : message,
        ),
      );
    }, 16);
  }

  function resetChat() {
    abortRef.current?.abort();
    stopReveal();
    targetRef.current = "";
    shownRef.current = "";
    doneRef.current = true;
    activeIdRef.current = null;
    setStreamingId(null);
    setMessages([]);
    setInput("");
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || streamingId) return;

    const history = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content: text },
    ];
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const assistantId = crypto.randomUUID();
    activeIdRef.current = assistantId;
    targetRef.current = "";
    shownRef.current = "";
    doneRef.current = false;
    stickRef.current = true;
    setInput("");
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreamingId(assistantId);
    ensureReveal(assistantId);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const reason = await response.text();
        throw new Error(reason || "大叔这会儿没接上。");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        targetRef.current += decoder.decode(value, { stream: true });
      }
      targetRef.current += decoder.decode();
    } catch (error) {
      const err = error as Error;
      if (err.name !== "AbortError") {
        const note =
          err.message && err.message !== "Failed to fetch"
            ? err.message
            : "网络抖了一下。你把刚才那句再发一遍，我接着说。";
        targetRef.current = targetRef.current
          ? `${targetRef.current}\n\n${note}`
          : note;
      } else if (!targetRef.current) {
        setMessages((current) => current.filter((message) => message.id !== assistantId));
      }
    } finally {
      doneRef.current = true;
      if (activeIdRef.current === assistantId && shownRef.current.length >= targetRef.current.length) {
        stopReveal();
        setStreamingId(null);
      }
    }
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  const streaming = streamingId !== null;
  const hasMessages = messages.length > 0;

  return (
    <section aria-label="咨询对话" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="chat-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 md:px-8"
      >
        {hasMessages ? (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-cinnabar px-4 py-3 text-sm leading-7 text-white">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="flex items-start gap-3">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-cinnabar text-white">
                    <Flame className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 max-w-[min(100%,40rem)] flex-1 rounded-2xl rounded-tl-md border border-white/8 bg-panel px-4 py-3 text-sm text-paper">
                    {message.content ? <MarkdownView text={message.content} /> : null}
                    {streamingId === message.id ? (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-gold align-middle motion-safe:animate-pulse"
                        aria-hidden
                      />
                    ) : null}
                    <span className="sr-only">
                      {streamingId === message.id ? "正在回复" : "回复结束"}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
            <p className="font-display text-[1.7rem] leading-snug text-paper md:text-4xl">
              分数和省份没说清，
              <br />
              我不会帮你填志愿。
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-mist">
              点一个问题，或者把位次、选科、家里有没有行业资源直接发过来。
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {PRIMARY_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-2xl border border-gold/25 bg-panel/80 px-4 py-4 text-left transition hover:border-gold/70 hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span className="text-[11px] tracking-[0.18em] text-gold">快捷提问</span>
                  <span className="mt-2 block font-display text-lg leading-snug text-paper">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SECONDARY_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-left text-sm text-mist transition hover:border-gold/40 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/8 bg-ink/90 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
        <div className="mx-auto w-full max-w-2xl">
          {hasMessages ? (
            <div className="chat-scroll mb-2 flex gap-2 overflow-x-auto pb-1">
              {ALL_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={streaming}
                  onClick={() => send(prompt)}
                  className="shrink-0 rounded-full border border-gold/20 px-3 py-1.5 text-xs text-gold transition hover:bg-gold/10 disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
              <button
                type="button"
                onClick={resetChat}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:text-paper"
              >
                <RotateCcw className="size-3" aria-hidden />
                重新开始
              </button>
            </div>
          ) : null}
          <form
            className="flex items-end gap-2 rounded-[1.6rem] border border-white/10 bg-panel px-3 py-2 focus-within:border-gold/45"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="question">
              你的问题
            </label>
            <textarea
              id="question"
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="说说分数、省份、选科，或者你卡在哪"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-paper outline-none placeholder:text-mist/80"
              onChange={(event) => setInput(event.target.value)}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={() => {
                composingRef.current = false;
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !composingRef.current) {
                  event.preventDefault();
                  void send(input);
                }
              }}
            />
            {streaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                aria-label="停止回复"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cinnabar text-white transition hover:bg-cinnabar/90"
              >
                <Square className="size-3.5 fill-current" aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="发送"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cinnabar text-white transition hover:bg-cinnabar/90 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] leading-5 text-mist">
            <span className="hidden sm:inline">Enter 发送，Shift+Enter 换行 · </span>
            仅供参考，录取以省考试院当年公布为准
          </p>
        </div>
      </div>
    </section>
  );
}
