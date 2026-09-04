import useProjects from '../data/useProjects.js'
import ProjectCard from './ProjectCard.jsx'

export default function ProjectList() {
  const { projects, loading, error } = useProjects()

  if (loading) {
    return <div className="loading">Loading projects...</div>
  }

  if (error) {
    return <div className="error">Error loading projects: {error}</div>
  }

  return (
    <>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </>
  )
}
