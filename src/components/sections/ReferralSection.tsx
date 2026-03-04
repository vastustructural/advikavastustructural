"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight, Share2, Wallet } from "lucide-react";
import ReferAndEarn from "@/components/ReferAndEarn";
import { motion } from "framer-motion";

export default function ReferralSection() {
    const [open, setOpen] = useState(false);

    return (
        <section className="py-20 bg-dark-blue relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gold-accent rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-primary rounded-full translate-x-1/2 translate-y-1/2 blur-[120px]" />
            </div>

            <div className="container-wide relative z-10">
                <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden relative">
                    {/* Floating icons for visual flair */}
                    <div className="hidden md:block absolute -top-10 -right-10 opacity-10 animate-pulse">
                        <Gift size={200} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-gold-accent"
                            >
                                <Gift className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Referral Program</span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-5xl font-bold text-white leading-tight"
                            >
                                Refer & Earn <span className="text-gold-accent">10%</span> Commission
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-white/60 text-lg max-w-lg"
                            >
                                Share our professional architectural & Vastu services with your network. Earn rewards for every successful project closed through your link.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Button
                                    onClick={() => setOpen(true)}
                                    size="lg"
                                    className="gold-gradient text-navy-primary font-bold h-14 px-8 rounded-2xl hover:scale-[1.02] transition-transform"
                                >
                                    Get Referral Link <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <div className="flex -space-x-3 items-center ml-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-blue bg-navy-light flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                                        </div>
                                    ))}
                                    <div className="pl-6 text-sm text-white/40 italic">Joined by 200+ partners</div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FeatureCard
                                icon={<Share2 className="w-6 h-6" />}
                                title="Share Link"
                                desc="Send your unique link to friends & family"
                            />
                            <FeatureCard
                                icon={<ArrowRight className="w-6 h-6" />}
                                title="They Connect"
                                desc="They book our professional services"
                            />
                            <FeatureCard
                                icon={<Wallet className="w-6 h-6" />}
                                title="Earn 10%"
                                desc="Get paid 10% of the project value"
                            />
                            <FeatureCard
                                icon={<Gift className="w-6 h-6" />}
                                title="Scalable"
                                desc="No limits on how much you can earn"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ReferAndEarn open={open} onOpenChange={setOpen} />
        </section>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3"
        >
            <div className="w-12 h-12 rounded-xl bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                {icon}
            </div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h3>
            <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
        </motion.div>
    );
}
