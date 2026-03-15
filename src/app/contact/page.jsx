import React from 'react'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/ContactForm'

const page = () => {
  return (
    <div className='pt-8 bg-black min-h-screen relative overflow-hidden'>
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <Navbar/>
      <div className="relative z-10">
        <ContactForm/>
      </div>
    </div>
  )
}

export default page