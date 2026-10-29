import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ArrowLeft, ShieldAlert, CheckCheck, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { ReportDialog } from '../components/safety/ReportDialog';
import { BlockUserDialog } from '../components/safety/BlockUserDialog';
import type { Conversation, Message, Profile } from '../types/database';
import { ChatService } from '../lib/services/chatService';
import { useAuth } from '../context/AuthContext';

interface ChatPageProps {
  initialConversationId?: string;
  onNavigate: (path: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialConversationId,
  onNavigate,
}) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConversationId || null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety dialog states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoadingConvs(true);
      try {
        const list = await ChatService.getConversations(user.id);
        setConversations(list);

        // If an initial id is requested or none selected yet, default to first
        if (initialConversationId) {
          setSelectedConvId(initialConversationId);
        } else if (list.length > 0 && !selectedConvId) {
          setSelectedConvId(list[0].id);
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to load conversations');
      } finally {
        setIsLoadingConvs(false);
      }
    }
    load();
  }, [user, initialConversationId]);

  // Load active conversation & messages when selectedConvId changes
  useEffect(() => {
    if (!selectedConvId || !user) return;

    async function loadConvMessages() {
      setIsLoadingMessages(true);
      setError(null);
      try {
        const conv = await ChatService.getConversationById(selectedConvId!, user!.id);
        setActiveConv(conv);

        const msgs = await ChatService.getMessages(selectedConvId!);
        setMessages(msgs);

        // Mark as read
        await ChatService.markMessagesAsRead(selectedConvId!, user!.id);
      } catch (err) {
        setError((err as Error).message || 'Failed to load messages');
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadConvMessages();

    // Setup realtime subscription
    const unsubscribe = ChatService.subscribeToMessages(selectedConvId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      ChatService.markMessagesAsRead(selectedConvId, user!.id);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedConvId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !user || !newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage('');

    try {
      const sent = await ChatService.sendMessage({
        conversationId: selectedConvId,
        senderId: user.id,
        senderProfile: profile || undefined,
        content,
      });

      setMessages((prev) => [...prev, sent]);

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? { ...c, last_message_at: sent.created_at, last_message: sent }
            : c
        )
      );
    } catch (err) {
      setError((err as Error).message || 'Failed to send message');
      setNewMessage(content); // restore content
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation): Profile | undefined => {
    if (!user) return undefined;
    return conv.participant_one_id === user.id ? conv.participant_two : conv.participant_one;
  };

  const otherParticipant = activeConv ? getOtherParticipant(activeConv) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex h-[750px] max-h-[85vh]">
        {/* Left: Conversation List */}
        <div className={`w-full md:w-80 border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC] ${
          selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
            <h2 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#4B3F72]" />
              <span>Messages</span>
            </h2>
            <span className="text-xs text-[#64748B] font-mono">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
            {isLoadingConvs ? (
              <div className="p-4 space-y-3">
                <div className="h-14 bg-slate-200/60 rounded-xl animate-pulse" />
                <div className="h-14 bg-slate-200/60 rounded-xl animate-pulse" />
                <div className="h-14 bg-slate-200/60 rounded-xl animate-pulse" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const peer = getOtherParticipant(conv);
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-purple-50/70 border-r-2 border-r-[#4B3F72]'
                        : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    <Avatar
                      src={peer?.avatar_url}
                      fallback={peer?.display_name || 'Peer'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1F2937] truncate">
                          {peer?.display_name || 'Community Peer'}
                        </h4>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">
                            {new Date(conv.last_message_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {conv.last_message ? conv.last_message.content : 'New conversation connected'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#64748B]">
                <p>No active conversations yet.</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Accept incoming requests or propose collaboration to begin chatting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          {selectedConvId && activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-1.5 -ml-1 text-[#64748B] hover:text-[#1F2937] rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    src={otherParticipant?.avatar_url}
                    fallback={otherParticipant?.display_name || 'Peer'}
                    size="md"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937] leading-tight">
                      {otherParticipant?.display_name || 'Peer'}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {otherParticipant?.username ? `@${otherParticipant.username} • ` : ''}
                      <span className="capitalize">{otherParticipant?.account_type || 'Student'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {otherParticipant?.username && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate(`/profile/${otherParticipant.username}`)}
                      className="text-xs border-[#CBD5E1] hidden sm:flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportDialog(true)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    title="Report or Block"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs flex items-center gap-2 border-b border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                {isLoadingMessages ? (
                  <div className="space-y-4 pt-8">
                    <div className="h-10 w-2/3 bg-slate-200/70 rounded-2xl animate-pulse mr-auto" />
                    <div className="h-14 w-1/2 bg-purple-100 rounded-2xl animate-pulse ml-auto" />
                    <div className="h-10 w-3/4 bg-slate-200/70 rounded-2xl animate-pulse mr-auto" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                            isMine
                              ? 'bg-[#4B3F72] text-white rounded-br-none'
                              : 'bg-white text-[#1F2937] border border-[#E2E8F0] rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#94A3B8] font-mono px-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span>
                              {msg.read_at ? (
                                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-[#047857]" /></span>
                              ) : (
                                <span title="Sent"><Clock className="w-3.5 h-3.5 text-[#94A3B8]" /></span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-xs text-[#64748B] p-6">
                    <div>
                      <p className="font-semibold text-[#1F2937]">This is the beginning of your chat.</p>
                      <p className="text-[#94A3B8] mt-1">
                        Say hello and schedule your first skill exchange session!
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={3000}
                    placeholder={`Message ${otherParticipant?.display_name || 'peer'}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-[#1F2937] bg-white"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-[#4B3F72] hover:bg-[#3d335d] text-white px-4 h-10 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-1 px-1">
                  <span>Press Enter to send</span>
                  <span>{newMessage.length}/3000</span>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a Conversation"
                description="Pick a chat from the sidebar or accept a connection request to begin exchanging knowledge."
                actionLabel="View Requests"
                onAction={() => onNavigate('/requests')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Safety Dialogs */}
      {otherParticipant && (
        <>
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            reportedUser={otherParticipant}
            onSuccess={() => setShowReportDialog(false)}
          />
          <BlockUserDialog
            isOpen={showBlockDialog}
            onClose={() => setShowBlockDialog(false)}
            userToBlock={otherParticipant}
            onSuccess={() => {
              setShowBlockDialog(false);
              onNavigate('/requests');
            }}
          />
        </>
      )}
    </div>
  );
};
