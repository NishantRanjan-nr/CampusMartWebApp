import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, PaperPlaneTilt, ChatCircle, ShoppingBag } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatPage() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [thread, setThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!itemId) return;

        const fetchThread = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`${API}/messages/thread/${itemId}`);
                setThread(response.data);
                setMessages(response.data.messages || []);
            } catch (fetchError) {
                setError(fetchError.response?.data?.detail || 'Could not load this chat.');
            } finally {
                setLoading(false);
            }
        };

        fetchThread();
    }, [itemId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (event) => {
        event.preventDefault();
        const content = messageText.trim();
        if (!content || !itemId) return;

        setSending(true);
        try {
            const response = await axios.post(`${API}/messages/thread/${itemId}`, {
                content,
            });
            setMessages((prev) => [...prev, response.data]);
            setMessageText('');
        } catch (sendError) {
            setError(sendError.response?.data?.detail || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const sellerName = thread?.seller?.name || thread?.item?.owner_name || 'Seller';
    const sellerCollege = thread?.seller?.college || 'Not set';
    const sellerCourse = thread?.seller?.course || 'Not set';
    const sellerInitial = sellerName?.charAt?.(0)?.toUpperCase() || 'S';

    if (loading) {
        return (
            <div className="min-h-screen bg-background py-8 lg:py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <Card className="h-[70vh] overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="h-10 w-52 animate-pulse rounded bg-muted" />
                            <div className="h-[calc(70vh-12rem)] animate-pulse rounded-3xl bg-muted" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background py-8 lg:py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <Card className="mx-auto max-w-2xl p-8 text-center">
                        <h1 className="text-2xl font-heading font-semibold">{error}</h1>
                        <p className="mt-3 text-muted-foreground">
                            Go back to the item page and try again.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button onClick={() => navigate(-1)}>Go Back</Button>
                            <Button variant="outline" asChild>
                                <Link to="/browse">Browse Items</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 lg:py-12" data-testid="chat-page">
            <div className="container mx-auto px-4 lg:px-8">
                <Button variant="ghost" className="mb-6 gap-2 px-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                    <Card className="h-fit p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                {sellerInitial}
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-heading font-semibold">{sellerName}</h1>
                                <p className="text-sm text-muted-foreground truncate">{sellerCollege}</p>
                                <p className="text-sm text-muted-foreground truncate">{sellerCourse}</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-border p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Listing</div>
                                    <div className="text-sm text-muted-foreground">{thread?.item?.title}</div>
                                </div>
                            </div>
                            <Button className="mt-4 w-full" variant="outline" asChild>
                                <Link to={`/item/${itemId}`}>View Item</Link>
                            </Button>
                        </div>
                    </Card>

                    <Card className="flex h-[70vh] flex-col overflow-hidden">
                        <div className="border-b border-border p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                    {sellerInitial}
                                </div>
                                <div>
                                    <div className="font-medium">Chat with {sellerName}</div>
                                    <div className="text-sm text-muted-foreground">About {thread?.item?.title}</div>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((message) => {
                                        const isOwnMessage = message.sender_id === user?.id;
                                        return (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                                    <p className={`mt-2 text-xs ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                        {format(new Date(message.created_at), 'h:mm a, MMM d')}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="flex h-[45vh] items-center justify-center text-center">
                                        <div>
                                            <ChatCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                            <h3 className="font-heading text-lg font-semibold">No messages yet</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Start the conversation with the seller.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>
                        </ScrollArea>

                        <form onSubmit={handleSend} className="border-t border-border p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={messageText}
                                    onChange={(event) => setMessageText(event.target.value)}
                                    placeholder="Write a message..."
                                    className="h-11 flex-1"
                                />
                                <Button type="submit" disabled={sending || !messageText.trim()}>
                                    <PaperPlaneTilt className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}