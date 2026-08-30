import React from 'react'
import Hero from './Components/Hero'
import AppFeatures from './Components/AppFeatures'
import DoctorsPreview from './Components/DoctorsPreview'
import Footer from './Components/Footer'
export default function Page() {
  return (
    <div >
      <Hero />
      <AppFeatures></AppFeatures>
      <DoctorsPreview></DoctorsPreview>
      <Footer></Footer>
    </div>
  )
}