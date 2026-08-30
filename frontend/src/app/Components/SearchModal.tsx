"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import { smileBg } from './../Data'
import { FaSearch, FaTimesCircle } from 'react-icons/fa'

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgSrc = typeof smileBg === 'string' ? smileBg : (smileBg as { src: string }).src;

  return (
    <div 
      onClick={onClose}
      className='fixed inset-0 z-50 bg-white/10 flex items-center justify-center w-full h-40 md:h-70 lg:h-75 flex-col gap-4 drop-shadow-lg backdrop-blur-sm border border-white/20 shadow-2xl drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]'
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className='w-full h-full flex flex-col items-center justify-center gap-4 relative'
      >
        <FaTimesCircle 
          className='text-black text-2xl absolute top-4 right-4 hover:cursor-pointer drop-shadow-lg drop-shadow-gray-600' 
          onClick={onClose} 
        />
        
        <div className='opacity-100 pointer-events-none w-28 h-28 hidden md:block relative'>
          <div className='w-full h-full rounded-full flex items-center justify-center brightness-95 contrast-150 saturate-120 absolute inset-0 overflow-hidden'>
            <Image 
              src={smileBg} 
              alt="Smiley background" 
              fill 
              sizes="112px"
              className="object-cover object-center"
            />
          </div>
          <div className='relative w-full h-full flex items-center justify-center'>
            <div className='w-26 h-26 bg-white/10 backdrop-blur-lg border-white/20 rounded-full flex items-center justify-center flex-col gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'>
              <div className='flex items-center justify-between bg-transparent gap-5'>
                {/* Left Eye with intense White Glow */}
                <div className='w-4 h-4 rounded-full animate-blink relative overflow-hidden filter drop-shadow-[0_0_6px_#ffffff] drop-shadow-[0_0_12px_#ffffff]'>
                  <Image 
                    src={smileBg} 
                    alt="Eye left" 
                    fill 
                    sizes="16px"
                    className="object-cover object-center"
                  />
                </div>
                {/* Right Eye with intense White Glow */}
                <div className='w-4 h-4 rounded-full animate-blink relative overflow-hidden filter drop-shadow-[0_0_6px_#ffffff] drop-shadow-[0_0_12px_#ffffff]'>
                  <Image 
                    src={smileBg} 
                    alt="Eye right" 
                    fill 
                    sizes="16px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
              <div className='flex items-center justify-center bg-transparent'>
                {/* Slightly increased width from 75 to 85 */}
                <svg width="85" height="30" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="smilePattern" width="100%" height="100%" patternContentUnits="objectBoundingBox">
                      <image width="1" height="1" preserveAspectRatio="xMidYMid slice" href={bgSrc} />
                    </pattern>
                    <linearGradient id="smileGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {/* Smile path with White Glow */}
                  <path 
                    d="M5 2C5 15 35 15 35 2" 
                    stroke="url(#smilePattern)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none"
                    className="filter drop-shadow-[0_0_5px_#ffffff] drop-shadow-[0_0_10px_#ffffff]"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <h1 className='text-black text-2xl font-bold drop-shadow-lg drop-shadow-gray-600'>Search Doctors</h1>
        <div className='w-[40%] md:w-[35%] h-11 rounded-2xl text-secondary flex items-center gap-5 p-3 justify-between bg-white/25 backdrop-blur-sm border border-primary/30 focus-within:border-primary focus-within:shadow-[0_0_20px_rgba(38,198,218,0.6)] transition-all duration-300'>
          <input type="text" placeholder='Search...' className='text-secondary outline-none border-none rounded-2xl bg-transparent h-full text-left px-1 w-3/4 placeholder:text-secondary font-bold' />
          <FaSearch className='text-secondary' />
        </div>
      </div>
    </div>
  )
}