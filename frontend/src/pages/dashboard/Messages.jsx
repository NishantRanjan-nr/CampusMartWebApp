import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { PaperPlaneTilt, ChatCircle, ArrowLeft } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Messages() {
    const { userId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
        }
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API}/messages/conversations`);
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const response = await axios.get(`${API}/messages/conversation/${otherUserId}`);
            setMessages(response.data);
            
            // Find user info from conversations or messages
            const convo = conversations.find(c => c.user_id === otherUserId);
            if (convo) {
                setSelectedUser({ id: otherUserId, name: convo.user_name });
            } else if (response.data.length > 0) {
                const msg = response.data[0];
                const name = msg.sender_id === otherUserId ? msg.sender_name : msg.receiver_name;
                setSelectedUser({ id: otherUserId, name });
            }
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        setSending(true);
        try {
            const response = await axios.post(`${API}/messages`, {
                receiver_id: userId,
                content: newMessage.trim()
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
            fetchConversations(); // Refresh conversation list
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const ConversationList = () => (
        <div className="space-y-2">
            {conversations.map((convo) => (
                <Link
                    key={convo.user_id}
                    to={`/dashboard/messages/${convo.user_id}`}
                    data-testid={`conversation-${convo.user_id}`}
                >
                    <Card className={`card-hover ${userId === convo.user_id ? 'border-primary' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-primary-foreground">
                                        {convo.user_name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{convo.user_name}</span>
                                        {convo.unread_count > 0 && (
                                            <span className="w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                                                {convo.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {convo.last_message}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="h-[calc(100vh-10rem)]" data-testid="messages-page">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-bold tracking-tight">Messages</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 h-full">
                {/* Conversations List */}
                <Card className="md:col-span-1 overflow-hidden">
                    <CardContent className="p-4 h-full">
                        <h3 className="font-heading font-semibold mb-4">Conversations</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-muted rounded w-3/4" />
                                            <div className="h-2 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length > 0 ? (
                            <ScrollArea className="h-[calc(100%-2rem)]">
                                <ConversationList />
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8">
                                <ChatCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No conversations yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="md:col-span-2 overflow-hidden flex flex-col">
                    {userId && selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <Link to="/dashboard/messages" className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-foreground">
                                        {selectedUser.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="font-medium">{selectedUser.name}</span>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                            data-testid={`message-${msg.id}`}
                                        >
                                            <div className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {format(new Date(msg.created_at), 'h:mm a')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t border-border">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1"
                                        data-testid="message-input"
                                    />
                                    <Button type="submit" disabled={sending || !newMessage.trim()} data-testid="send-message-button">
                                        <PaperPlaneTilt className="w-5 h-5" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <ChatCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-heading font-semibold mb-2">Select a conversation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose from your existing conversations or start a new one from an item page
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
