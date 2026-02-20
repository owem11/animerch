"use client";

import { useState } from "react";
import { Send, Mail, MessageSquare, User, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/api";

export default function SupportPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetchApi("/api/support/contact", {
                method: "POST",
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to send message");
            }

            setIsSuccess(true);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen cyber-grid py-12 md:py-20 px-6">
            <div className="container max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">24/7 Support</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">Contact Us</h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                        Have a question about your order or our merch? Drop us a message and our AI-powered support team will assist you instantly!
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-card border rounded-2xl p-12 text-center shadow-2xl">
                        <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Message Received!</h2>
                        <p className="text-muted-foreground text-sm mb-8 italic">
                            "Our AI-responder is already analyzing your query. Check your inbox for a response shortly!"
                        </p>
                        <Button
                            onClick={() => setIsSuccess(false)}
                            variant="outline"
                            className="font-black uppercase tracking-widest text-xs h-12 px-8"
                        >
                            Send Another Message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-destructive text-xs font-bold uppercase tracking-tight">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                <div className="relative">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Gojo Satoru"
                                        className="h-12 pl-10 bg-muted/20"
                                        required
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="satoru@jujutsu.com"
                                        className="h-12 pl-10 bg-muted/20"
                                        required
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                            <div className="relative">
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Order Status, Feedback, etc."
                                    className="h-12 pl-10 bg-muted/20"
                                    required
                                />
                                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us what's on your mind..."
                                className="min-h-[150px] bg-muted/20 p-4 resize-none"
                                required
                            />
                        </div>

                        <Button
                            disabled={isSubmitting}
                            className="w-full h-14 text-xs font-black tracking-widest uppercase flex gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Transmitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </form>
                )}

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm text-center">
                        <Mail className="h-6 w-6 mx-auto mb-3 text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Us</p>
                        <p className="text-xs font-bold">animerch.help@gmail.com</p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm text-center">
                        <MessageSquare className="h-6 w-6 mx-auto mb-3 text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Response Time</p>
                        <p className="text-xs font-bold">Instantly (AI Powered)</p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm text-center">
                        <Sparkles className="h-6 w-6 mx-auto mb-3 text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Available</p>
                        <p className="text-xs font-bold">24/7 Everywhere</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
