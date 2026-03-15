function PageHeader({ badge, title, subtitle, rightContent }) {
  return (
    <div className="page-header">
      <div>
        {badge ? <span className="soft-badge">{badge}</span> : null}
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      {rightContent ? <div>{rightContent}</div> : null}
    </div>
  );
}

export default PageHeader;