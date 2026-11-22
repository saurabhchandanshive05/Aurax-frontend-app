import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiEndpoint } from "../utils/getApiUrl";
import Icon from "../components/ui/Icon";
import styles from "./Messages.module.css";

// Messages with the AURAX team. Creators and brands see their own conversations and can start
// one (optionally about a campaign: /messages?campaign=<id>&subject=...). Admins see every
// conversation as the team inbox and reply as AURAX. New messages arrive by polling while the
// page is visible (the API host sleeps when idle, so no long-lived connection).

const POLL_MS = 5000;
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
  "Content-Type": "application/json",
});
const api = async (path, options = {}) => {
  const res = await fetch(getApiEndpoint(`/api/messages${path}`), { ...options, headers: authHeaders() });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const err = new Error(json?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
};

const timeLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const Messages = () => {
  const [params, setParams] = useSearchParams();
  const [team, setTeam] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [activeId, setActiveId] = useState(params.get("c") || null);
  const [thread, setThread] = useState({ conversation: null, messages: [] });
  const [threadStatus, setThreadStatus] = useState("idle");
  const [composing, setComposing] = useState(!!params.get("campaign") || params.get("new") === "1");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState(params.get("subject") || "");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [filter, setFilter] = useState("open");
  const listEnd = useRef(null);
  const campaignId = params.get("campaign");

  useEffect(() => {
    document.title = "Messages | AURAX";
  }, []);

  const loadList = useCallback(async () => {
    try {
      const json = await api("/conversations");
      setTeam(json.team);
      setConversations(json.conversations);
      setListStatus("ready");
    } catch {
      setListStatus((s) => (s === "ready" ? s : "error"));
    }
  }, []);

  const loadThread = useCallback(async (id, { quiet = false } = {}) => {
    if (!id) return;
    if (!quiet) setThreadStatus("loading");
    try {
      const json = await api(`/conversations/${id}/messages`);
      setThread({ conversation: json.conversation, messages: json.messages });
      setThreadStatus("ready");
      if (json.conversation.unread > 0) {
        await api(`/conversations/${id}/read`, { method: "POST" });
        setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
        window.dispatchEvent(new Event("ax:messages-read"));
      }
    } catch (e) {
      if (!quiet) setThreadStatus(e.status === 404 ? "missing" : "error");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  // Poll while the tab is visible
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      loadList();
      if (activeId) loadThread(activeId, { quiet: true });
    };
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadList, loadThread]);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [thread.messages.length]);

  const open = (id) => {
    setComposing(false);
    setActiveId(id);
    setSendError("");
    setParams({ c: id }, { replace: true });
  };

  const startNew = () => {
    setActiveId(null);
    setThread({ conversation: null, messages: [] });
    setComposing(true);
    setSendError("");
  };

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError("");
    try {
      if (composing) {
        const json = await api("/conversations", {
          method: "POST",
          body: JSON.stringify({ subject: subject.trim(), body, campaignId: campaignId || undefined }),
        });
        setDraft("");
        setSubject("");
        setComposing(false);
        setConversations((list) => [json.conversation, ...list]);
        setActiveId(json.conversation.id);
        setParams({ c: json.conversation.id }, { replace: true });
      } else {
        const json = await api(`/conversations/${activeId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
        setDraft("");
        setThread((t) => ({ conversation: { ...t.conversation, status: json.conversation.status }, messages: [...t.messages, json.message] }));
        loadList();
      }
    } catch (err) {
      setSendError(err.message || "Your message wasn't sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    try {
      await api(`/conversations/${activeId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setThread((t) => ({ ...t, conversation: { ...t.conversation, status } }));
      loadList();
    } catch (err) {
      setSendError(err.message);
    }
  };

  const visible = useMemo(
    () => (team && filter !== "all" ? conversations.filter((c) => c.status === filter) : conversations),
    [conversations, team, filter]
  );
  const conv = thread.conversation;
  const showThread = composing || !!activeId;

  return (
    <div className={styles.page}>
      <div className={`${styles.layout} ${showThread ? styles.threadOpen : ""}`}>
        {/* ---- conversation list ---- */}
        <aside className={styles.list} aria-label="Conversations">
          <div className={styles.listHead}>
            <h1 className={styles.title}>{team ? "Inbox" : "Messages"}</h1>
            {!team && (
              <button type="button" className="ax-btn ax-btn--primary" onClick={startNew}>
                <Icon name="plus" size={16} /> New message
              </button>
            )}
          </div>
          {team && (
            <div className={styles.filters} role="group" aria-label="Show">
              {["open", "closed", "all"].map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`} onClick={() => setFilter(f)}>
                  {f === "open" ? "Open" : f === "closed" ? "Closed" : "All"}
                </button>
              ))}
            </div>
          )}

          {listStatus === "loading" && <p className={styles.muted}>Loading conversations…</p>}
          {listStatus === "error" && (
            <div className={styles.state} role="alert">
              <p>Conversations couldn't load.</p>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={loadList}>Try again</button>
            </div>
          )}
          {listStatus === "ready" && visible.length === 0 && (
            <div className={styles.state}>
              <Icon name="inbox" size={28} />
              <p>
                {team
                  ? filter === "open" ? "No open conversations." : "Nothing here."
                  : "No messages yet. Ask the AURAX team anything about campaigns, your profile or working together."}
              </p>
            </div>
          )}
          <ul className={styles.items}>
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`${styles.item} ${c.id === activeId ? styles.itemActive : ""}`}
                  onClick={() => open(c.id)}
                  aria-current={c.id === activeId ? "true" : undefined}
                >
                  <span className={styles.itemTop}>
                    <span className={styles.itemSubject}>{c.subject}</span>
                    <span className={styles.itemTime}>{timeLabel(c.lastMessageAt)}</span>
                  </span>
                  {team && <span className={styles.itemWho}>{c.user?.name} · {c.user?.role}</span>}
                  <span className={styles.itemPreview}>
                    {c.lastMessageFromTeam ? (team ? "You: " : "AURAX: ") : team ? "" : "You: "}
                    {c.lastMessagePreview}
                  </span>
                  {c.unread > 0 && <span className={styles.unread}>{c.unread} new</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ---- thread / composer ---- */}
        <section className={styles.thread} aria-label="Conversation">
          {!showThread && (
            <div className={styles.empty}>
              <Icon name="chat" size={32} />
              <p>{team ? "Choose a conversation to read and reply." : "Choose a conversation, or start a new message."}</p>
            </div>
          )}

          {showThread && (
            <>
              <div className={styles.threadHead}>
                <button type="button" className={styles.back} onClick={() => { setActiveId(null); setComposing(false); setParams({}, { replace: true }); }}>
                  <Icon name="arrow-left" size={18} /> <span>Conversations</span>
                </button>
                {composing ? (
                  <h2 className={styles.threadTitle}>New message to the AURAX team</h2>
                ) : conv ? (
                  <div className={styles.threadMeta}>
                    <h2 className={styles.threadTitle}>{conv.subject}</h2>
                    <p className={styles.muted}>
                      {team ? `${conv.user?.name} (${conv.user?.role})` : "With the AURAX team"}
                      {conv.campaign && (
                        <>
                          {" · "}
                          <Link to={`/live/campaigns/${conv.campaign.id}`}>{conv.campaign.title || "Campaign"}</Link>
                        </>
                      )}
                      {conv.status === "closed" && " · Closed"}
                    </p>
                  </div>
                ) : null}
                {team && conv && (
                  <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setStatus(conv.status === "open" ? "closed" : "open")}>
                    {conv.status === "open" ? "Close" : "Reopen"}
                  </button>
                )}
              </div>

              <div className={styles.messages} aria-live="polite">
                {threadStatus === "loading" && !composing && <p className={styles.muted}>Loading…</p>}
                {threadStatus === "missing" && !composing && <p className={styles.muted}>This conversation doesn't exist or isn't yours.</p>}
                {threadStatus === "error" && !composing && (
                  <p className={styles.muted}>Messages couldn't load. <button type="button" className={styles.linkBtn} onClick={() => loadThread(activeId)}>Try again</button></p>
                )}
                {composing && (
                  <p className={styles.muted}>
                    {campaignId ? "This message will be linked to the campaign you were viewing. " : ""}
                    The AURAX team replies in this conversation, and you'll see the reply here.
                  </p>
                )}
                {!composing &&
                  thread.messages.map((m) => (
                    <div key={m.id} className={`${styles.bubbleRow} ${m.mine ? styles.mine : ""}`}>
                      <div className={`${styles.bubble} ${m.fromTeam ? styles.fromTeam : ""}`}>
                        <span className={styles.sender}>{m.mine ? "You" : m.fromTeam ? "AURAX team" : conv?.user?.name || "Member"}</span>
                        <p>{m.body}</p>
                        <time dateTime={m.createdAt}>{timeLabel(m.createdAt)}</time>
                      </div>
                    </div>
                  ))}
                <div ref={listEnd} />
              </div>

              {(composing || (conv && threadStatus === "ready")) && (
                <form className={styles.composer} onSubmit={send}>
                  {composing && (
                    <label className={styles.field}>
                      <span>Subject</span>
                      <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={140} required placeholder="What's this about?" />
                    </label>
                  )}
                  <label className={styles.field}>
                    <span className={composing ? undefined : styles.srOnly}>Message</span>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={2000}
                      rows={composing ? 5 : 3}
                      required
                      placeholder={team ? "Reply as the AURAX team…" : "Write a message…"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(e);
                      }}
                    />
                  </label>
                  {sendError && <p className={styles.error} role="alert">{sendError}</p>}
                  <div className={styles.composerFoot}>
                    <span className={styles.muted}>{draft.length}/2000 · Ctrl+Enter to send</span>
                    <button type="submit" className="ax-btn ax-btn--primary" disabled={sending || !draft.trim() || (composing && !subject.trim())}>
                      <Icon name="send" size={16} /> {sending ? "Sending…" : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
