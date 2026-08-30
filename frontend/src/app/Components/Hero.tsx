"use client"

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Navbar from './Navbar'
import { heroImages, cardBg1, cardBg2, cardBg3 } from '../Data'
import { FaArrowRight, FaCalendarAlt, FaUserMd, FaPhoneAlt } from 'react-icons/fa'
import { useAuth } from './../context/AuthContext'
export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const { openAuth } = useAuth();

    useEffect(() => {
        if (!heroImages || heroImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let isMounted = true;
        let ctx: gsap.Context | undefined;

        Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger')
        ]).then(([{ gsap }, { ScrollTrigger }]) => {
            if (!isMounted) return;
            gsap.registerPlugin(ScrollTrigger);

            const heroContent = heroContentRef.current;
            const cardsContainer = cardsContainerRef.current;

            ctx = gsap.context(() => {
                if (heroContent) {
                    const elements = heroContent.children;
                    gsap.fromTo(elements,
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power2.out',
                            stagger: 0.12,
                            delay: 0.1,
                        }
                    );
                }

                if (cardsContainer) {
                    const cards = cardsContainer.querySelectorAll('.hero-card');
                    gsap.fromTo(cards,
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                            stagger: 0.15,
                            scrollTrigger: {
                                trigger: cardsContainer,
                                start: 'top 88%',
                                toggleActions: 'play none none none',
                            }
                        }
                    );
                }
            });
        });

        return () => {
            isMounted = false;
            if (ctx) ctx.revert();
        };
    }, []);

    return (
        <div className="w-full">
            <div className="relative w-full min-h-[105vh] overflow-hidden bg-black">
                {heroImages && heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 h-full w-full transition-opacity duration-[2000ms] ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <div className={`absolute inset-0 h-full w-full transition-transform duration-[6000ms] ease-out ${index === currentIndex ? 'scale-110' : 'scale-100'
                            }`}>
                            <Image
                                src={image}
                                alt="Healthcare backdrop"
                                fill
                                priority={index === 0}
                                sizes="100vw"
                                className="object-cover object-center"
                            />
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-[25vh] bg-gradient-to-b from-black/60 to-transparent z-10" />
                        <div className="absolute inset-y-0 left-0 w-full md:w-[50%] bg-gradient-to-r from-black/60 to-transparent z-10" />
                    </div>
                ))}

                <div className="relative z-20 flex flex-col min-h-screen">
                    <Navbar />
                    <div
                        ref={heroContentRef}
                        className="absolute top-39 md:top-36 lg:top-48 left-4 md:left-8 lg:left-5 min-h-max w-[calc(100%-2rem)] md:w-3/4 lg:w-full flex flex-col gap-4 pr-4"
                    >
                        <div className="opacity-0 border-gray-50 border h-10 w-fit max-w-xs rounded-2xl px-4 flex items-center gap-3">
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                            <p className="text-white text-base md:text-lg">Welcome to Telemed AI</p>
                        </div>

                        <div className="opacity-0 w-full flex">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.2] lg:leading-[1.3] tracking-wide">
                                Advanced health care made <br className="hidden md:inline" /> personal
                            </h1>
                        </div>

                        <div className="opacity-0 max-w-xl">
                            <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed tracking-wide">
                                Healthcare is a concise and impactful title that emphasizes a combination of innovation and individualized attention in healthcare.
                            </p>
                        </div>

                        <div className="opacity-0 w-50 xs:w-60 md:w-56">
                            <button
                                onClick={() => openAuth('signup')}
                                className="group rounded-full px-2 py-1 bg-white hover:bg-secondary hover:text-white text-base md:text-lg text-black flex justify-between gap-3 items-center w-full h-12 md:h-14 transition-colors duration-300 cursor-pointer"
                            >
                                <span className="ml-3 font-medium">Get Started</span>
                                <div className="flex items-center justify-center text-primary bg-primary rounded-full w-10 md:w-12 h-10 md:h-12 transition-colors duration-300 group-hover:bg-white">
                                    <FaArrowRight className="text-white transition-colors duration-300 group-hover:text-primary" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="relative z-30 max-w-full mx-auto px-4 sm:px-6 md:px-8 -mt-10 sm:-mt-16 md:-mt-10 pb-16">
                <div ref={cardsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <div className="hero-card opacity-0 relative overflow-hidden bg-white/90 p-6 sm:p-8 py-10 rounded-3xl shadow-xl flex flex-col items-start w-full transition-shadow duration-300">
                        <Image
                            src={cardBg1}
                            alt="Background element"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center mix-blend-overlay pointer-events-none"
                        />
                        <div className="relative z-10 w-full flex flex-col items-start">
                            <div className="p-4 bg-primary text-primary rounded-2xl text-2xl mb-6">
                                <FaCalendarAlt className="text-primary text-3xl fill-white" />
                            </div>
                            <span className="text-xs uppercase font-semibold tracking-wider text-primary">Our Expertise</span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Experienced Doctors</h3>
                            <hr className="w-full border-black/20 my-5 mt-9" />
                            <ul className="space-y-3 text-sm opacity-95 w-full">
                                <li className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-2 text-primary gap-1 sm:gap-0">
                                    <span>Monday-Friday:</span>
                                    <span className="text-gray-500">8:00 AM - 8:00 PM</span>
                                </li>
                                <li className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-2 text-primary gap-1 sm:gap-0">
                                    <span>Saturday:</span>
                                    <span className="text-gray-500">9:00 AM - 5:00 PM</span>
                                </li>
                                <li className="flex flex-col sm:flex-row justify-between pt-1 text-primary gap-1 sm:gap-0">
                                    <span>Sunday:</span>
                                    <span className="font-medium text-gray-500">Emergency Open 24/7</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="hero-card opacity-0 relative overflow-hidden bg-primary text-gray-800 p-6 sm:p-8 py-10 rounded-3xl shadow-xl flex flex-col items-start w-full transition-shadow duration-300">
                        <Image
                            src={cardBg2}
                            alt="Background element"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center mix-blend-overlay opacity-40 pointer-events-none"
                        />
                        <div className="relative z-10 w-full flex flex-col items-start">
                            <div className="p-4 bg-primary rounded-2xl text-2xl text-white mb-6">
                                <FaUserMd className="fill-white" />
                            </div>
                            <span className="text-xs uppercase font-semibold tracking-wider text-white">Our Expertise</span>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Experienced Doctors</h3>
                            <hr className="w-full border-gray-200 my-5 mt-9" />
                            <p className="text-sm text-white font-bold leading-relaxed">
                                Our team of highly qualified and experienced doctors is dedicated to providing safe, effective, and compassionate care. With years of expertise across multiple specialties.
                            </p>
                        </div>
                    </div>

                    <div className="hero-card opacity-0 relative overflow-hidden bg-secondary text-white p-6 sm:p-8 py-10 rounded-3xl shadow-xl flex flex-col items-start w-full sm:col-span-2 lg:col-span-1 transition-shadow duration-300">
                        <Image
                            src={cardBg3}
                            alt="Background element"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center opacity-20 mix-blend-luminosity pointer-events-none"
                        />
                        <div className="relative z-10 w-full flex flex-col items-start">
                            <div className="p-4 bg-white/10 rounded-2xl text-2xl text-white mb-6 shadow-sm">
                                <FaPhoneAlt />
                            </div>
                            <span className="text-xs uppercase font-semibold tracking-wider opacity-90">Instant Care</span>
                            <h3 className="text-xl sm:text-2xl font-bold mt-1">Online Consultation</h3>
                            <hr className="w-full border-white/20 my-5 mt-9" />
                            <p className="text-sm text-gray-300 leading-relaxed mb-5">
                                Talk to a doctor online, get instant medical advice, and manage your health with ease.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 sm:gap-0">
                                <span className="text-xs opacity-80 uppercase font-semibold tracking-wider">Emergency Contact:</span>
                                <span className="text-lg font-bold tracking-wide text-white">1-800-555-500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}