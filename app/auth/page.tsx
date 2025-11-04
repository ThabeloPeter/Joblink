'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Building2, Phone, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Log error details for debugging
        console.error('Login error:', {
          status: response.status,
          error: result.error,
          details: result.details,
          debug: result.debug,
        })

        if (result.requiresApproval) {
          toast.error('Your account is pending admin approval. Please contact support.')
        } else {
          toast.error(result.error || 'Login failed. Please try again.')
          
          // Also log to console for debugging
          if (result.debug) {
            console.error('Login debug info:', result.debug)
          }
        }
        return
      }

      // Store session token in localStorage (or better, use httpOnly cookies)
      if (result.session?.access_token) {
        localStorage.setItem('supabase_token', result.session.access_token)
      }

      toast.success('Login successful!')
      
      // Redirect based on role
      const role = result.user?.role
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'company') {
        router.push('/company')
      } else {
        router.push('/company') // Default for providers (mobile app)
      }
    } catch {
      toast.error('Login failed. Please try again.')
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed. Please try again.')
        return
      }

      toast.success('Registration successful! Your account is pending admin approval.')
      
      // Store session if available (for auto-login after approval)
      if (result.session?.access_token) {
        localStorage.setItem('supabase_token', result.session.access_token)
      }
      
      // Redirect to login page after registration
      setTimeout(() => {
        setIsLogin(true)
        registerForm.reset()
        toast.info('Please log in to access your account once approved.')
      }, 2000)
    } catch {
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding & Info (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(60,60,60,0.6)_0%,transparent_50%)] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                JobLink
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Streamline your workflow with real-time tracking, instant notifications, 
              and seamless collaboration between companies and service providers.
            </p>
            
            <div className="space-y-4 mt-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Company Dashboard</h3>
                  <p className="text-gray-400">Manage service providers and create job cards from one place.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                  <p className="text-gray-400">Enterprise-grade security with role-based access control.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-md">
          {/* Back to home */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to home</span>
          </button>

          {/* Toggle between Login/Register */}
          <div className="flex gap-2 mb-8 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Sliding Forms */}
          <div className="relative overflow-hidden min-h-[550px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  layout
                >
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="bg-white rounded-xl shadow-lg p-8 space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                      <p className="text-gray-600">Sign in to your account to continue</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...loginForm.register('email')}
                            type="email"
                            autoComplete="email"
                            placeholder="your@email.com"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...loginForm.register('password')}
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                          />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="mt-1 text-sm text-red-600">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  layout
                >
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="bg-white rounded-xl shadow-lg p-8 space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
                      <p className="text-gray-600">Register your company to get started</p>
                    </div>

                    <div className="space-y-4">
                      {/* Row 1: Company Name & Contact Person */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('companyName')}
                              type="text"
                              placeholder="Your Company Ltd"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.companyName && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.companyName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('contactPerson')}
                              type="text"
                              placeholder="John Doe"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.contactPerson && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.contactPerson.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Email & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('email')}
                              type="email"
                              autoComplete="email"
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('phone')}
                              type="tel"
                              placeholder="+1 234 567 8900"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Password & Confirm Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('password')}
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              {...registerForm.register('confirmPassword')}
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-500"
                            />
                          </div>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={registerForm.formState.isSubmitting}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

