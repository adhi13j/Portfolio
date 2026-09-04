import Navbar from './components/Navbar.jsx'
import ProjectList from './components/ProjectList.jsx'
import Scene from './components/scene/Scene.jsx'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.leftColumn}>
          <ProjectList />
        </div>
        <div className={styles.rightColumn}>
          <Scene />
        </div>
      </div>
    </div>
  )
}
