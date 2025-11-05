import ToastProvider from '@/components/ui/Toaster'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  )
}
