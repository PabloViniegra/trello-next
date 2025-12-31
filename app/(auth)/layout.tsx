import type { JSX, ReactNode } from 'react'

type TAuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({
  children,
}: TAuthLayoutProps): JSX.Element {
  // Auth pages use a minimal layout without footer or navigation
  // The footer is excluded via RootLayoutWrapper's route checking
  return <>{children}</>
}
