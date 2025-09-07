'use client'

import { SessionProvider } from 'next-auth/react'

interface Props {
  children: React.ReactNode
  session?: any
}

export function AuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}