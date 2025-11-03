'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const scrollViewRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const features = [
    {
      icon: '■',
      title: 'Comprehensive Dashboard',
      description: 'Manage service providers, create and assign job cards, track progress, and monitor performance—all from a single dashboard.',
    },
    {
      icon: '▲',
      title: 'Real-time Updates',
      description: 'Get instant notifications when service providers accept, update, or complete job cards. Never miss an important update.',
    },
    {
      icon: '●',
      title: 'Photo Documentation',
      description: 'Service providers can upload photos and detailed notes for complete job verification and transparency.',
    },
    {
      icon: '◆',
      title: 'Mobile App',
      description: 'Manage jobs on the go with our mobile app, available soon for iOS and Android devices.',
    },
    {
      icon: '◼',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with role-based access control and encrypted data storage.',
    },
    {
      icon: '◈',
      title: 'Advanced Reporting',
      description: 'Track performance metrics, generate detailed reports, and gain insights with comprehensive analytics tools.',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % features.length
      const scrollElement = scrollViewRef.current
      if (scrollElement && typeof window !== 'undefined') {
        const tileWidth = 380 + 48 // card width + gap
        scrollElement.scrollTo({
          left: currentIndexRef.current * tileWidth,
          behavior: 'smooth',
        })
      }
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      }}
    >
      {/* Blurred gradient overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(60, 60, 60, 0.6) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(40, 40, 40, 0.6) 0%, transparent 50%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Hero Section */}
      <div className="px-12 py-12 md:py-20 flex flex-col items-center justify-center gap-10 min-h-[85vh] w-full relative z-10">
        <div className="max-w-[1100px] w-full flex flex-col items-center px-4">
          <div className="flex flex-col gap-8 items-center max-w-[800px]">
            <div className="flex flex-col gap-5 items-center">
              <h1 className="text-6xl md:text-7xl font-extrabold text-center text-white tracking-tight leading-tight">
                Job Management
                <span className="text-white/70"> Made Simple</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 text-center max-w-[700px] font-normal leading-relaxed mt-2">
                Streamline your workflow with real-time tracking, instant notifications, and seamless collaboration between companies and service providers.
              </p>
            </div>

            <div className="flex gap-4 mt-2 flex-wrap justify-center">
              <button 
                className="px-10 py-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 active:scale-[0.97] transition-transform"
                style={{ transform: 'skewX(-10deg)' }}
                onClick={() => router.push('/auth')}
              >
                <span style={{ transform: 'skewX(10deg)', display: 'block' }}>Start Free Trial</span>
              </button>
              <button 
                className="px-10 py-6 border-2 border-gray-600 text-gray-300 font-medium rounded-lg bg-transparent hover:bg-gray-900 active:scale-[0.97] transition-transform"
                style={{ transform: 'skewX(-10deg)' }}
                onClick={() => router.push('/auth')}
              >
                <span style={{ transform: 'skewX(10deg)', display: 'block' }}>View Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-8 flex-wrap justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="text-5xl font-bold text-white">100%</div>
                <div className="text-sm text-white/60 font-normal">Transparency</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-5xl font-bold text-white">24/7</div>
                <div className="text-sm text-white/60 font-normal">Real-time Updates</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-5xl font-bold text-white">∞</div>
                <div className="text-sm text-white/60 font-normal">Scalable</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-14 py-14 w-full relative z-10">
        <div className="max-w-[1400px] w-full flex flex-col items-center px-4">
          <div className="flex flex-col items-center gap-4 mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-center text-white tracking-tight leading-tight">
              Everything You Need
            </h2>
            <p className="text-xl text-white/70 text-center max-w-[600px] font-normal leading-relaxed">
              Powerful features designed to streamline your job management process
            </p>
          </div>

          {/* Auto-scrolling Feature Tiles Carousel */}
          <div className="w-full relative overflow-hidden rounded-lg">
            <style jsx>{`
              .tiles-scroll-container::-webkit-scrollbar {
                display: none;
              }
              .tiles-scroll-container {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <div 
              ref={scrollViewRef}
              className="tiles-scroll-container w-full overflow-x-auto overflow-y-hidden"
              style={{ 
                scrollSnapType: 'x mandatory',
                display: 'flex',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="flex gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="w-[380px] min-w-[380px] max-w-[380px] p-6 bg-white/10 border border-white/20 rounded-lg shadow-lg backdrop-blur-[10px] flex-shrink-0"
                    style={{ 
                      transform: 'skewX(-10deg)',
                      scrollSnapAlign: 'start',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div 
                      className="flex flex-col gap-4 items-start"
                      style={{ transform: 'skewX(10deg)' }}
                    >
                      <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-3xl text-white font-bold">{feature.icon}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-base text-white/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-14 py-14 flex flex-col items-center w-full relative z-10">
        <div className="max-w-[900px] w-full flex flex-col items-center px-4">
          <div 
            className="w-full p-10 bg-white/95 rounded-2xl border border-white/20 shadow-2xl"
            style={{
              transform: 'skewX(-10deg)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            }}
          >
            <div 
              className="flex flex-col gap-6 items-center"
              style={{ transform: 'skewX(10deg)' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 tracking-tight">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-700 text-center max-w-[600px] leading-relaxed">
                Join companies that trust JobLink to manage their service providers and streamline their job card processes.
              </p>
              <button 
                className="px-10 py-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 active:scale-[0.97] transition-transform mt-2"
                onClick={() => router.push('/auth')}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-8 py-8 bg-black/30 flex flex-col items-center border-t border-white/10 w-full relative z-10"
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[1200px] w-full flex flex-col items-center gap-4">
          <div className="text-3xl font-bold text-white tracking-tight">
            JobLink
          </div>
          <div className="text-sm text-white/60 font-normal text-center">
            © 2024 JobLink. All rights reserved.
          </div>
          <div className="flex gap-6 mt-2 flex-wrap justify-center">
            <button className="text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Privacy
            </button>
            <button className="text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Terms
            </button>
            <button className="text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
