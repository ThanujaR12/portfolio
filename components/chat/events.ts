// Any component can open the Ask AI panel (optionally with a question) without sharing state.
export const OPEN_CHAT_EVENT = "portfolio:open-chat";

export type OpenChatDetail = { question?: string };

export function openChat(question?: string) {
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { question } }),
  );
}
