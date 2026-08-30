"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { logo } from './../Data'
import { FaSearch, FaUser, FaAngleDown, FaBars } from 'react-icons/fa'
import SearchModal from './SearchModal'
import { useAuth } from './../context/AuthContext'

export default function Navbar() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const { openAuth } = useAuth();

  return (
    <nav className='mx-3 my-6 flex items-center justify-between'>
      <div className='mx-5 drop-shadow-lg'>
        <Image src={logo} alt='logo' height={50} width={50} />
      </div>
      <div className='hidden md:flex items-center justify-evenly gap-8'>
        <Link href="/" className='text-white text-base hover:text-primary flex items-center justify-center gap-2 drop-shadow-lg font-bold'>Home <FaAngleDown /></Link>
        <Link href="/pages" className='text-white text-base hover:text-primary flex items-center justify-center gap-2 drop-shadow-lg font-bold'>Pages <FaAngleDown /></Link>
        <Link href="/services" className='text-white text-base hover:text-primary flex items-center justify-center gap-2 drop-shadow-lg font-bold'>Services <FaAngleDown /></Link>
        <Link href="/blog" className='text-white text-base hover:text-primary flex items-center justify-center gap-2 drop-shadow-lg font-bold'>Blog <FaAngleDown /></Link>
        <Link href="/contact" className='text-white text-base hover:text-primary flex items-center justify-center gap-2 drop-shadow-lg font-bold'>Contact <FaAngleDown /></Link>
      </div>
      <div className='flex justify-around items-center gap-5 mx-4'>
        <button onClick={() => setIsSearchModalOpen(true)}>
          <FaSearch className='text-white text-base hover:text-primary drop-shadow-lg font-bold' />
        </button>
        <FaBars className='text-white block md:hidden text-base hover:text-primary drop-shadow-lg font-bold' />
        
        {/* User Icon opens the Login Modal */}
        <button onClick={() => openAuth('login')} title="Account">
          <FaUser className='text-white text-base hover:text-primary drop-shadow-lg font-bold cursor-pointer' />
        </button>

        <button 
          onClick={() => openAuth('signup')}
          className='hidden lg:block text-white bg-primary border-0 rounded-3xl py-3 px-6 hover:bg-secondary transition-all'
        >
          Make Appointment
        </button>
      </div>
      {isSearchModalOpen && (
        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      )}
    </nav>
  )
}