"use client"

import { useDistributorAuth } from "@/lib/auth-middleware"
import { DistributorDashboard } from "@/components/distributor/distributor-dashboard"
import { Button } from "@/components/ui/button"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function DistributorPage() {
  const { isAuthorized, loading, user } = useDistributorAuth()

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Distributor Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the distributor dashboard.</p>
          <Button onClick={handleSignIn}>Sign In with Google</Button>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have distributor permissions.</p>
          <p className="text-sm text-gray-500">Contact an administrator to get distributor access.</p>
        </div>
      </div>
    )
  }

  return <DistributorDashboard />
}
