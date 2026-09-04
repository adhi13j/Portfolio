import styles from './ProjectCard.module.css'

export default function ProjectCard({ project }) {
  const { title, repoUrl, summary, stack, image } = project

  return (
    <article className={styles.card}>
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.title}
      >
        {title}
      </a>
      <p className={styles.summary}>{summary}</p>
      <div className={styles.stack}>
        {stack.map((tech) => (
          <span key={tech} className={styles.badge}>
            {tech}
          </span>
        ))}
      </div>
      <div className={styles.imageContainer}>
        <img src={image} alt={title} className={styles.image} />
      </div>
    </article>
  )
}
