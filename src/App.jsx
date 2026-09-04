import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar.jsx'
import ProjectList from './components/ProjectList.jsx'
import Scene from './components/scene/Scene.jsx'
import styles from './App.module.css'

export default function App() {
  const leftColRef = useRef(null)
  const [pages, setPages] = useState(4) // default minimum

  useEffect(() => {
    const el = leftColRef.current
    if (!el) return

    const measure = () => {
      const scrollHeight = el.scrollHeight
      const vh = window.innerHeight
      // Convert scroll height to page count (round up, minimum 2)
      const pageCount = Math.max(2, Math.ceil(scrollHeight / vh))
      setPages(pageCount)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.leftColumn} ref={leftColRef}>
          <ProjectList />
        </div>
        <div className={styles.rightColumn}>
          <Scene pages={pages} />
        </div>
      </div>
    </div>
  )
}
