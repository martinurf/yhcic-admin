export default function AnnouncementPost({ announcement, imageUrl, authorName }) {
  return (
    <article className="post">
      {imageUrl ? <img src={imageUrl} alt="" className="post__image" /> : null}
      <div className="post__body">
        <div className="post__meta">
          <span className={`badge badge--${announcement.published ? "published" : "draft"}`}>
            {announcement.published ? "Published" : "Draft"}
          </span>
          <span className="post__byline">
            Posted by {authorName}
            {announcement.published_at ? ` · ${new Date(announcement.published_at).toLocaleDateString()}` : ""}
          </span>
        </div>
        <h1 className="post__title">{announcement.title}</h1>
        <p className="post__text">{announcement.body}</p>
      </div>
    </article>
  );
}
