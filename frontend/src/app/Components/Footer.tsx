"use client"

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
    FaStethoscope, 
    FaPhoneAlt, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaFacebookF, 
    FaTwitter, 
    FaLinkedinIn, 
    FaInstagram, 
    FaPaperPlane 
} from 'react-icons/fa'

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let isMounted = true;
        let ctx: gsap.Context | undefined;

        Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger')
        ]).then(([{ gsap }, { ScrollTrigger }]) => {
            if (!isMounted) return;
            gsap.registerPlugin(ScrollTrigger);

            const footerEl = footerRef.current;
            if (!footerEl) return;

            const columns = footerEl.querySelectorAll('.footer-col');

            ctx = gsap.context(() => {
                gsap.fromTo(columns,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: 'power2.out',
                        stagger: 0.12,
                        scrollTrigger: {
                            trigger: footerEl,
                            start: 'top 88%',
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
        <footer ref={footerRef} className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
                    
                    <div className="footer-col opacity-0 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-2.5 rounded-xl text-white">
                                <FaStethoscope className="text-xl" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                Telemed <span className="text-primary">AI</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Connecting patients with certified medical specialists instantly. Modern, secure, and personalized telehealth services at your fingertips.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <Link href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                                <FaFacebookF className="text-sm" />
                            </Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                                <FaTwitter className="text-sm" />
                            </Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                                <FaLinkedinIn className="text-sm" />
                            </Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                                <FaInstagram className="text-sm" />
                            </Link>
                        </div>
                    </div>

                    <div className="footer-col opacity-0 flex flex-col gap-4">
                        <h4 className="text-lg font-semibold text-white tracking-wide">Quick Links</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/doctors" className="hover:text-primary transition-colors">Our Doctors</Link>
                            </li>
                            <li>
                                <Link href="/services" className="hover:text-primary transition-colors">Specialties</Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">Book Appointment</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col opacity-0 flex flex-col gap-4">
                        <h4 className="text-lg font-semibold text-white tracking-wide">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-primary mt-1 shrink-0" />
                                <span className="text-slate-400">123 Healthway Plaza, Suite 400, New York, NY</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhoneAlt className="text-primary shrink-0" />
                                <span className="text-slate-400">+1 (800) 555-500</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-primary shrink-0" />
                                <span className="text-slate-400">support@telemedai.com</span>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col opacity-0 flex flex-col gap-4">
                        <h4 className="text-lg font-semibold text-white tracking-wide">Newsletter</h4>
                        <p className="text-sm text-slate-400">
                            Subscribe to receive healthcare insights and platform updates.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5">
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-primary transition-colors"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white px-3.5 rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <FaPaperPlane className="text-xs" />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Telemed AI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
                        <Link href="/security" className="hover:text-slate-400 transition-colors">HIPAA Compliance</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}