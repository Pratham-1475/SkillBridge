import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { getChatMessages, getChats, sendChatMessage } from '../services/api.js';

function getOtherParticipant(conversation, userId) {
  if (!conversation) {
    return null;
  }

  return conversation.clientUserId?._id === userId
    ? conversation.freelancerOwnerUserId
    : conversation.clientUserId;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function loadConversations() {
    setLoading(true);
    setError('');

    try {
      const data = await getChats();
      setConversations(data);

      const requestedId = searchParams.get('conversation');
      const nextSelected = data.find((conversation) => conversation._id === requestedId) || data[0] || null;
      setSelectedConversation(nextSelected);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation?._id) {
        setMessages([]);
        return;
      }

      try {
        const data = await getChatMessages(selectedConversation._id);
        setMessages(data.messages);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadMessages();
  }, [selectedConversation?._id]);

  function selectConversation(conversation) {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation._id });
  }

  async function handleSend(event) {
    event.preventDefault();

    if (!selectedConversation?._id) {
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const created = await sendChatMessage(selectedConversation._id, draft);
      setMessages((current) => [...current, created]);
      setDraft('');
      setStatus('idle');
      await loadConversations();
    } catch (sendError) {
      setStatus('error');
      setError(sendError.message);
    }
  }

  const otherParticipant = getOtherParticipant(selectedConversation, user?._id);

  return (
    <div className="space-y-8">
      <section className="fade-up rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Chats</p>
        <h1 className="mt-4 font-display text-5xl">SkillBridge inbox</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          Message clients and freelancer profile owners. New messages also trigger email notifications.
        </p>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
      ) : null}

      {loading ? (
        <div className="glass-panel flex min-h-60 items-center justify-center rounded-[2rem]">
          <div className="flex items-center gap-2">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        </div>
      ) : conversations.length ? (
        <section className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <aside className="glass-panel rounded-[2rem] p-4">
            <p className="px-2 text-xs uppercase tracking-[0.3em] text-accent/75">Conversations</p>
            <div className="mt-4 space-y-3">
              {conversations.map((conversation) => {
                const participant = getOtherParticipant(conversation, user?._id);
                const active = selectedConversation?._id === conversation._id;

                return (
                  <button
                    className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                      active
                        ? 'border-accent bg-accent/15'
                        : 'border-slate-800 bg-slate-950/60 hover:border-accent/50'
                    }`}
                    key={conversation._id}
                    onClick={() => selectConversation(conversation)}
                    type="button"
                  >
                    <p className="font-display text-lg text-ink">{participant?.name || 'SkillBridge user'}</p>
                    <p className="mt-1 text-sm text-slate-300">{conversation.freelancerId?.name}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                      {conversation.latestMessage?.body || 'No messages yet.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="glass-panel flex min-h-[34rem] flex-col rounded-[2rem] p-5">
            <div className="border-b border-slate-800 pb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-accent/75">Active chat</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{otherParticipant?.name || 'Conversation'}</h2>
              {selectedConversation?.freelancerId ? (
                <Link
                  className="mt-2 inline-flex text-sm font-semibold text-accent transition hover:text-indigo-300"
                  to={`/freelancer/${selectedConversation.freelancerId._id}`}
                >
                  View {selectedConversation.freelancerId.name}
                </Link>
              ) : null}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-5">
              {messages.map((message) => {
                const mine = message.senderUserId?._id === user?._id;

                return (
                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`} key={message._id}>
                    <div
                      className={`max-w-[80%] rounded-[1.25rem] px-4 py-3 ${
                        mine ? 'bg-accent text-white' : 'border border-slate-800 bg-slate-950 text-slate-100'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                        {mine ? 'You' : message.senderUserId?.name}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="border-t border-slate-800 pt-4" onSubmit={handleSend}>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
                Reply
                <textarea
                  className="input-shell min-h-24 rounded-[1.5rem] px-4 py-3 outline-none transition"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write your reply..."
                  value={draft}
                />
              </label>
              <button
                className="mt-4 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-70"
                disabled={status === 'loading'}
                type="submit"
              >
                {status === 'loading' ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="glass-panel rounded-[2rem] p-10 text-center">
          <h2 className="font-display text-3xl text-ink">No chats yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Open a freelancer profile and start a chat with an account-connected freelancer.
          </p>
          <Link className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" to="/browse">
            Browse freelancers
          </Link>
        </div>
      )}
    </div>
  );
}
