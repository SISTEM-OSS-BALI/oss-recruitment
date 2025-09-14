"use client"

import { useSession } from "next-auth/react"

export const useAuth = () => {
    const { data: session } = useSession()
    return {
        user_id : session?.user?.id,
        user_name: session?.user?.name,
        isAuthenticated: !!session,
        loading: !session,
    }
}