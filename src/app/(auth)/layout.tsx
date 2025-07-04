import { Toaster } from 'react-hot-toast'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  )
} 