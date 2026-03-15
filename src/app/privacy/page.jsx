import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PrivacyPolicyHero from '@/components/PrivacyPolicyHero'
import React from 'react'

const page = () => {
  return (
    <div className='pt-8 bg-black min-h-screen relative overflow-hidden'>
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <Navbar/>
      <div className="relative z-10 pt-20 pb-10">
        <PrivacyPolicyHero/>
      </div>
    </div>
  )
}

export default page