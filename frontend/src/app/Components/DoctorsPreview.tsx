"use client"

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaStethoscope, FaStar, FaArrowRight, FaCalendarCheck } from 'react-icons/fa'
import { maleDoctor, femaleDoctor } from '../Data'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

const doctors = [
    {
        id: '1',
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiologist',
        rating: 4.9,
        reviews: 124,
        experience: '10+ yrs exp',
        image: femaleDoctor,
    },
    {
        id: '2',
        name: 'Dr. James Wilson',
        specialty: 'Neurologist',
        rating: 4.8,
        reviews: 98,
        experience: '8+ yrs exp',
        image: maleDoctor,
    },
    {
        id: '3',
        name: 'Dr. Aisha Khan',
        specialty: 'Pediatrician',
        rating: 4.9,
        reviews: 156,
        experience: '12+ yrs exp',
        image: femaleDoctor,
    },
    {
        id: '4',
        name: 'Dr. Michael Chen',
        specialty: 'Dermatologist',
        rating: 4.7,
        reviews: 87,
        experience: '7+ yrs exp',
        image: maleDoctor,
    },
]

export default function DoctorsPreview() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let isMounted = true;
        let ctx: gsap.Context | undefined;

        Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger')
        ]).then(([{ gsap }, { ScrollTrigger }]) => {
            if (!isMounted) return;
            gsap.registerPlugin(ScrollTrigger);

            const section = sectionRef.current;
            if (!section) return;

            const header = section.querySelector('.doctors-header');
            const cards = section.querySelectorAll('.doctor-card-item');

            ctx = gsap.context(() => {
                if (header) {
                    gsap.fromTo(header,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: header,
                                start: 'top 88%',
                                toggleActions: 'play none none none',
                            }
                        }
                    );
                }

                if (cards.length > 0) {
                    gsap.fromTo(cards,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                            stagger: 0.12,
                            scrollTrigger: {
                                trigger: cards[0],
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
        <section ref={sectionRef} className="w-full bg-slate-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="doctors-header opacity-0 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-3 shadow-sm">
                            <FaStethoscope className="text-primary text-xs" />
                            <span className="text-xs sm:text-sm font-semibold tracking-wider text-primary uppercase">
                                Expert Care
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Our Medical <span className="text-primary">Specialists</span>
                        </h2>
                        <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-xl">
                            Consult with top certified medical professionals available for instant online consultations.
                        </p>
                    </div>

                    <Link 
                        href="/doctors" 
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-primary text-gray-800 hover:text-primary font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-colors duration-200 text-sm w-fit group"
                    >
                        <span>See All Doctors</span>
                        <FaArrowRight className="text-xs text-primary group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="relative px-2 sm:px-8">
                    <Carousel
                        opts={{
                            align: 'start',
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {doctors.map((doc) => (
                                <CarouselItem 
                                    key={doc.id} 
                                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                                >
                                    <div className="doctor-card-item opacity-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 bg-slate-100">
                                                <Image
                                                    src={doc.image}
                                                    alt={doc.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                                                    {doc.experience}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                                                <FaStar />
                                                <span>{doc.rating}</span>
                                                <span className="text-gray-400 font-normal">({doc.reviews} reviews)</span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                {doc.name}
                                            </h3>
                                            <p className="text-sm font-medium text-primary mb-4">
                                                {doc.specialty}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <Link
                                                href={`/doctors/${doc.id}`}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-sm transition-colors duration-200"
                                            >
                                                <FaCalendarCheck className="text-xs" />
                                                <span>Book Consultation</span>
                                            </Link>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <div className="hidden sm:block">
                            <CarouselPrevious className="-left-4 sm:-left-6 border-slate-200 bg-white text-gray-800 hover:bg-primary hover:text-white" />
                            <CarouselNext className="-right-4 sm:-right-6 border-slate-200 bg-white text-gray-800 hover:bg-primary hover:text-white" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    )
}