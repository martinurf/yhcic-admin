export default function AnnouncementPost({ announcement, imageUrl, authorName }) {
  return (
    <article className="post">
      <div className="post__head">
        <div className="post__avatar" aria-hidden="true">
          <span className="side__mark">YHCIC</span>
        </div>
        <div>
          <p className="post__byline">{authorName}</p>
          <p className="post__subline">
            <span className={`badge badge--${announcement.published ? "published" : "draft"}`}>
              {announcement.published ? "Published" : "Draft"}
            </span>
            {announcement.published_at ? ` · ${new Date(announcement.published_at).toLocaleDateString()}` : ""}
          </p>
        </div>
      </div>

      <div className="post__body">
        <h1 className="post__title">{announcement.title}</h1>
        <p className="post__text">{announcement.body}</p>
      </div>

      {imageUrl ? <img src={imageUrl} alt="" className="post__image" /> : null}
    </article>
  );
}
