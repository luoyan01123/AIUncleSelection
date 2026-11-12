import { DUAN_SYSTEM_PROMPT } from "@/lib/duan-prompt";
import { clientIp, takeRateLimit } from "@/lib/rate-limit";
import { UNCLE_SYSTEM_PROMPT } from "@/lib/system-prompt";
import type { ChatTurn } from "@/lib/uncle";

export const maxDuration = 60;

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function isTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const turn = value as { role?: unknown; content?: unknown };
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

function upstreamMessage(status: number, invalidKey: string) {
  if (status === 401) return invalidKey;
  if (status === 402) return "DeepSeek 余额不足。";
  if (status === 429) return "问的人太多了，稍后再来。";
  return "DeepSeek 这会儿没接上。";
}

function deepseekConfig(persona: unknown) {
  if (persona === "duan") {
    return {
      apiKey: process.env.DUAN_DEEPSEEK_API_KEY?.trim(),
      model:
        process.env.DUAN_DEEPSEEK_MODEL?.trim() ||
        process.env.DEEPSEEK_MODEL?.trim() ||
        "deepseek-chat",
      missing:
        "还没配置段永平这页的 DeepSeek。在 web/.env.local 写入 DUAN_DEEPSEEK_API_KEY 后，重启 npm run dev。",
      invalid:
        "段永平这页的 DeepSeek 密钥无效。检查 web/.env.local 里的 DUAN_DEEPSEEK_API_KEY。",
    };
  }
  return {
    apiKey: process.env.DEEPSEEK_API_KEY?.trim(),
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    missing:
      "还没配置 DeepSeek。在 web/.env.local 写入 DEEPSEEK_API_KEY 后，重启 npm run dev。",
    invalid: "DeepSeek 密钥无效。检查 web/.env.local 里的 DEEPSEEK_API_KEY。",
  };
}

function streamAnswer(upstream: ReadableStream<Uint8Array>, signal: AbortSignal) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";

      try {
        while (!signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const payload = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string | null } }>;
              };
              const piece = payload.choices?.[0]?.delta?.content;
              if (piece) controller.enqueue(encoder.encode(piece));
            } catch {
              // 半截 JSON 留到下一轮，解析失败的心跳直接丢掉。
            }
          }
        }
        controller.close();
      } catch (error) {
        if (signal.aborted) {
          controller.close();
          return;
        }
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: Request) {
  const limit = takeRateLimit(clientIp(request));
  if (!limit.ok) {
    return new Response("这个地址问得太勤了，等一分钟再来。", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("请求读不懂。", { status: 400 });
  }

  const body = payload as { messages?: unknown; persona?: unknown };
  const messages = body.messages;
  const system =
    body.persona === "duan" ? DUAN_SYSTEM_PROMPT : UNCLE_SYSTEM_PROMPT;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return new Response("先把问题说清楚。", { status: 400 });
  }
  if (!messages.every(isTurn)) {
    return new Response("对话格式不对。", { status: 400 });
  }
  if (messages.some((turn) => turn.content.length > 2000)) {
    return new Response("一句话太长了，拣要紧的说。", { status: 400 });
  }

  const config = deepseekConfig(body.persona);
  if (!config.apiKey) {
    return new Response(config.missing, { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: system },
          ...messages.map((turn) => ({
            role: turn.role,
            content: turn.content,
          })),
        ],
        stream: true,
        temperature: 0.7,
      }),
      signal: request.signal,
    });
  } catch (error) {
    if (request.signal.aborted || (error as Error).name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    return new Response("连不上 DeepSeek。", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(upstreamMessage(upstream.status, config.invalid), {
      status: 502,
    });
  }

  return new Response(streamAnswer(upstream.body, request.signal), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
