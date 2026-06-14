import { Link } from 'react-router-dom';
import './MangaCard.css';

export default function MangaCard({ manga, size = 'md' }) {
  if (!manga) return null;
  return (
    <Link to={`/manga/${manga.slug}`} className={`manga-card manga-card--${size}`}>
      <div className="manga-card__cover">
        {manga.coverImage
          ? <img src={manga.coverImage} alt={manga.title} loading="lazy" />
          : <div className="manga-card__cover-placeholder">{manga.title?.[0]}</div>
        }
        {manga.featured && <span className="badge badge-featured manga-card__badge">Featured</span>}
        {manga.status === 'completed' && <span className="badge badge-completed manga-card__badge">Done</span>}
        <div className="manga-card__overlay">
          <span className="manga-card__ch">Ch.{manga.latestChapter || '?'}</span>
        </div>
      </div>
      <div className="manga-card__info">
        <h3 className="manga-card__title">{manga.title}</h3>
        <p className="manga-card__meta">
          <span className={`status-${manga.status}`}>●</span>
          {manga.type} · {manga.chapterCount || 0} ch
        </p>
      </div>
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="manga-card">
      <div className="manga-card__cover skeleton" style={{aspectRatio:'2/3'}} />
      <div className="manga-card__info">
        <div className="skeleton" style={{height:14,borderRadius:4,marginBottom:6}} />
        <div className="skeleton" style={{height:11,width:'60%',borderRadius:4}} />
      </div>
    </div>
  );
}
