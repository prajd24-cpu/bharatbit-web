import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    router.replace('/login')
  }
  
  return (
    <div className="container">
      <p>Redirecting to login...</p>
    </div>
  )
}
