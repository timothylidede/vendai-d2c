"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./auth-context"

// Hardcoded admin emails
const ADMIN_EMAILS = ["timothyliidede@gmail.com"]

// Hardcoded distributor emails
const DISTRIBUTOR_EMAILS = ["timothyliidede@gmail.com"]

export function useAdminAuth() {
  const { user, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      const isAdmin = ADMIN_EMAILS.includes(user.email || "")
      setIsAuthorized(isAdmin)
    } else {
      setIsAuthorized(false)
    }
  }, [user, loading])

  return { isAuthorized, loading, user }
}

export function useDistributorAuth() {
  const { user, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      const isDistributor = DISTRIBUTOR_EMAILS.includes(user.email || "")
      setIsAuthorized(isDistributor)
    } else {
      setIsAuthorized(false)
    }
  }, [user, loading])

  return { isAuthorized, loading, user }
}
