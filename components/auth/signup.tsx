"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getFirestore } from "firebase/firestore"

interface SignupProps {
  onSignup: (userData: any) => void
  onSwitchToLogin: () => void
  onClose: () => void
}

interface Message {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

export function Signup({ onSignup, onSwitchToLogin, onClose }: SignupProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const db = getFirestore()
  const googleProvider = new GoogleAuthProvider()

  const addMessage = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, type, text }])
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 5000)
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        phone: "",
        createdAt: new Date().toISOString(),
        provider: "google"
      })

      addMessage('success', 'Welcome! Your account has been created successfully.')
      
      onSignup({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        phone: ""
      })
    } catch (error: any) {
      console.error("Google signup error:", error)
      let errorMessage = 'Failed to sign up with Google. Please try again.'
      
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account with this email already exists with a different sign-in method.'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-up was cancelled.'
          break
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.'
          break
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-up was cancelled.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.'
          break
      }
      
      addMessage('error', errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const MessageIcon = ({ type }: { type: 'success' | 'error' | 'info' }) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'info':
        return <AlertCircle className="h-4 w-4 text-blue-400" />
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="glass-effect rounded-2xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Messages */}
        <div className="fixed top-4 right-4 z-[60] space-y-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ duration: 0.3, type: "spring" }}
                className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur-md border shadow-lg max-w-sm ${
                  message.type === 'success' 
                    ? 'bg-green-900/20 border-green-500/30 text-green-100' 
                    : message.type === 'error'
                    ? 'bg-red-900/20 border-red-500/30 text-red-100'
                    : 'bg-blue-900/20 border-blue-500/30 text-blue-100'
                }`}
              >
                <MessageIcon type={message.type} />
                <p className="text-sm font-medium flex-1">{message.text}</p>
                <button
                  onClick={() => removeMessage(message.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2"
          >
            <span className="text-white">vend</span>
            <span className="text-white font-black">ai</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm"
          >
            AI shopping assistant for premium FMCG at wholesale prices
          </motion.p>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Create Your Account</h2>
            <p className="text-gray-400 text-sm mb-6">
              Sign up with your Google account to get started
            </p>
          </motion.div>

          {/* Google Sign Up */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 py-3 font-medium rounded-xl"
            >
              {isGoogleLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-3 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-500 text-xs mb-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-white hover:text-gray-300 underline transition-colors">
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}