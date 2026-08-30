"use client"
import React, { useEffect, useRef } from 'react'
import { FaUserEdit, FaRobot, FaComments, FaArrowRight } from 'react-icons/fa'

export default function AppFeatures() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        let ctx: gsap.Context | undefined;

        Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger')
        ]).then(([{ gsap }, { ScrollTrigger }]) => {
            if (!isMounted) return;
            gsap.registerPlugin(ScrollTrigger);

            const container = sectionRef.current;
            if (!container) return;

            const cards = container.querySelectorAll('.step-card');

            ctx = gsap.context(() => {
                gsap.fromTo(cards,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: 'power2.out',
                        stagger: 0.15,
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        }
                    }
                );
            });
        });

        return () => {
            isMounted = false;
            if (ctx) ctx.revert();
        };
    }, []);

    return (
        <section ref={sectionRef} className="w-full bg-primary/10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs sm:text-sm font-semibold tracking-wider text-primary uppercase">
                            Simple Process
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-wide">
                        How <span className="text-primary">TeleMed AI</span> Works
                    </h2>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Get personalized medical care and instant AI analysis in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <div className="step-card opacity-0 relative bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-primary text-white rounded-2xl text-2xl shadow-md">
                                    <FaUserEdit />
                                </div>
                                <span className="text-4xl font-extrabold text-primary/50 group-hover:text-primary/70 transition-colors">
                                    01
                                </span>
                            </div>
                            <span className="text-xs uppercase font-bold tracking-wider text-primary">Step 1</span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 mb-3">
                                Medical Onboarding
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Fill out your health history, allergies, and emergency contact details securely in under two minutes.
                            </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center text-primary font-bold text-sm gap-2">
                            <span className="cursor-pointer">Get Started</span>
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    <div className="step-card opacity-0 relative bg-primary/95 backdrop-blur-md border border-primary/20 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-white/20 text-white backdrop-blur-md rounded-2xl text-2xl shadow-sm">
                                    <FaRobot />
                                </div>
                                <span className="text-4xl font-extrabold text-white/30 group-hover:text-white/50 transition-colors">
                                    02
                                </span>
                            </div>
                            <span className="text-xs uppercase font-bold tracking-wider text-white/90">Step 2</span>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                                AI Report Analysis
                            </h3>
                            <p className="text-sm text-teal-50 leading-relaxed font-medium">
                                Upload your medical PDFs to receive immediate, plain-English summaries powered by AI.
                            </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-white/20 flex items-center text-white font-bold text-sm gap-2">
                            <span className="cursor-pointer">Upload Reports</span>
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    <div className="step-card opacity-0 relative bg-secondary/95 backdrop-blur-md border border-secondary/20 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-white/10 text-white backdrop-blur-md rounded-2xl text-2xl shadow-sm">
                                    <FaComments />
                                </div>
                                <span className="text-4xl font-extrabold text-white/30 group-hover:text-white/50 transition-colors">
                                    03
                                </span>
                            </div>
                            <span className="text-xs uppercase font-bold tracking-wider text-white/90">Step 3</span>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                                Live Consultations
                            </h3>
                            <p className="text-sm text-sky-50 leading-relaxed font-medium">
                                Book an available time slot and chat in real-time with verified medical specialists.
                            </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-white/20 flex items-center text-white font-bold text-sm gap-2">
                            <span className="cursor-pointer">Book Consultation</span>
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}