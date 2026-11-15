import { useEffect, useState } from 'react';
import { Check, MailOpen, Search, Trash2 } from 'lucide-react';
import {
  deleteAdminMessage,
  fetchAdminMessages,
  toggleMessageRead,
} from '../../lib/api';
import type { ContactMessage } from '../../types/portfolio';

export function MessagesInboxTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [errorMsg, setErrorMsg] = useState('');

  const loadMessages = async (q = search, f = filter) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await fetchAdminMessages({ search: q, filter: f });
      setMessages(list);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMessages(search, filter);
    }, 180);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      await toggleMessageRead(msg.id, !msg.isRead);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: !msg.isRead } : m))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update message.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete message.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F4F2ED]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F4F2ED]">Messages Inbox</h2>
          <p className="mt-1 text-sm text-[#F4F2ED]/60">
            Inquiries submitted via the public Get in Touch form.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F4F2ED]/40" />
            <input
              type="search"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60 border border-[#F4F2ED]/15 bg-[#161618] py-2 pl-9 pr-3 text-sm text-[#F4F2ED] placeholder:text-[#F4F2ED]/40 focus:border-[#E85D26] focus:outline-none"
            />
          </div>

          <div className="inline-flex border border-[#F4F2ED]/15 bg-[#161618] p-1">
            {(['all', 'unread', 'read'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                  filter === tab
                    ? 'bg-[#E85D26] text-[#121212]'
                    : 'text-[#F4F2ED]/70 hover:text-[#F4F2ED]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="border border-[#F4F2ED]/10 bg-[#161618] p-8 text-sm text-[#F4F2ED]/60">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="border border-[#F4F2ED]/10 bg-[#161618] p-12 text-center text-sm text-[#F4F2ED]/60">
          No messages match the current filter.
        </div>
      ) : (
        <div className="divide-y divide-[#F4F2ED]/10 border border-[#F4F2ED]/10 bg-[#161618]">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#F4F2ED]/60">
                    <span className={msg.isRead ? 'text-[#F4F2ED]/50' : 'font-semibold text-[#E85D26]'}>
                      {msg.isRead ? 'Read' : 'Unread'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{msg.createdAt}</span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-[#F4F2ED]">
                    {msg.subject}
                  </h4>
                  <div className="text-sm text-[#F4F2ED]/75">
                    {msg.name} <span aria-hidden="true">·</span>{' '}
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-[#E85D26] hover:underline"
                    >
                      {msg.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg)}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#F4F2ED]/15 px-3 text-xs text-[#F4F2ED]/80 hover:border-[#E85D26] cursor-pointer"
                  >
                    {msg.isRead ? (
                      <>
                        <MailOpen className="h-3.5 w-3.5" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    aria-label={`Delete message from ${msg.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-line border-t border-[#F4F2ED]/10 pt-3 text-sm leading-relaxed text-[#F4F2ED]/80">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
