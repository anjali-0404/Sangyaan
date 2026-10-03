import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main style={{ width: '100%', paddingTop: 72, background: 'var(--color-background)', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
