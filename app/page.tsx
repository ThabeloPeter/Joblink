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
        const isMobile = window.innerWidth < 640
        // Mobile: full viewport width minus padding, Desktop: fixed card width + gap
        const tileWidth = isMobile ? window.innerWidth - 32 : 428 // 380px card + 48px gap
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
      <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-20 flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 min-h-[85vh] w-full relative z-10">
        <div className="max-w-[1100px] w-full flex flex-col items-center px-2 sm:px-4">
          <div className="flex flex-col gap-6 sm:gap-8 items-center max-w-[800px]">
            <div className="flex flex-col gap-4 sm:gap-5 items-center">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-center text-white tracking-tight leading-tight px-2">
                Job Management
                <span className="text-white/70 block sm:inline"> Made Simple</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 text-center max-w-[700px] font-normal leading-relaxed mt-2 px-2">
                Streamline your workflow with real-time tracking, instant notifications, and seamless collaboration between companies and service providers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto px-4 sm:px-0">
              <button 
                className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-6 bg-gray-900 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 active:scale-[0.97] transition-transform"
                onClick={() => router.push('/auth')}
              >
                Start Free Trial
              </button>
              <button 
                className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-6 border-2 border-gray-600 text-gray-300 text-sm sm:text-base font-medium rounded-lg bg-transparent hover:bg-gray-900 active:scale-[0.97] transition-transform"
                onClick={() => router.push('/auth')}
              >
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 flex-wrap justify-center w-full px-4">
              <div className="flex flex-col items-center gap-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-white/60 font-normal text-center">Transparency</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">24/7</div>
                <div className="text-xs sm:text-sm text-white/60 font-normal text-center">Real-time Updates</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">∞</div>
                <div className="text-xs sm:text-sm text-white/60 font-normal text-center">Scalable</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 sm:px-6 md:px-14 py-8 sm:py-12 md:py-14 w-full relative z-10">
        <div className="max-w-[1400px] w-full flex flex-col items-center px-2 sm:px-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white tracking-tight leading-tight px-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 text-center max-w-[600px] font-normal leading-relaxed px-4">
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
              className="tiles-scroll-container w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
              style={{ 
                scrollSnapType: 'x mandatory',
                display: 'flex',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="flex gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="w-[calc(100vw-32px)] sm:w-[380px] min-w-[calc(100vw-32px)] sm:min-w-[380px] max-w-[calc(100vw-32px)] sm:max-w-[380px] p-4 sm:p-6 bg-white/10 border border-white/20 rounded-lg shadow-lg backdrop-blur-[10px] flex-shrink-0"
                    style={{ 
                      scrollSnapAlign: 'start',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:gap-4 items-start">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl text-white font-bold">{feature.icon}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/70 leading-relaxed">
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
      <div className="px-4 sm:px-6 md:px-14 py-8 sm:py-12 md:py-14 flex flex-col items-center w-full relative z-10">
        <div className="max-w-[900px] w-full flex flex-col items-center px-2 sm:px-4">
          <div 
            className="w-full p-6 sm:p-8 md:p-10 bg-white/95 rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl"
            style={{
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            }}
          >
            <div className="flex flex-col gap-4 sm:gap-6 items-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 tracking-tight px-2">
                Ready to Get Started?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center max-w-[600px] leading-relaxed px-2">
                Join companies that trust JobLink to manage their service providers and streamline their job card processes.
              </p>
              <button 
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 bg-gray-900 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 active:scale-[0.97] transition-transform mt-2"
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
        className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-black/30 flex flex-col items-center border-t border-white/10 w-full relative z-10"
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[1200px] w-full flex flex-col items-center gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            JobLink
          </div>
          <div className="text-xs sm:text-sm text-white/60 font-normal text-center px-4">
            © 2024 JobLink. All rights reserved.
          </div>
          <div className="flex gap-4 sm:gap-6 mt-2 flex-wrap justify-center px-4">
            <button className="text-xs sm:text-sm text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Privacy
            </button>
            <button className="text-xs sm:text-sm text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Terms
            </button>
            <button className="text-xs sm:text-sm text-white/60 font-normal bg-transparent border-none hover:text-white/80 cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
