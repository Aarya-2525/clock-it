import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="form-page">
      <section className="form-card">
        <h1>Page not found</h1>
        <p className="form-card-intro">That link doesn’t lead anywhere. Head back home and try again.</p>
        <p className="form-card-footer">
          <Link to="/">Go to the home page</Link>
        </p>
      </section>
    </div>
  );
}
