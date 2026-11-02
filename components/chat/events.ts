// Any component can open the Ask AI panel (optionally with a question) without sharing state.
export const OPEN_CHAT_EVENT = "portfolio:open-chat";

export type OpenChatDetail = { question?: string };

// Fired while a visitor types into an Ask AI box; the hero aurora brightens in response.
export const AI_ACTIVITY_EVENT = "portfolio:ai-activity";

export function signalAiActivity() {
  window.dispatchEvent(new Event(AI_ACTIVITY_EVENT));
}

export function openChat(question?: string) {
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { question } }),
  );
}
