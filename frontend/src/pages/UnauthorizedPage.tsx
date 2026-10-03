import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main>
      <h1>Access Denied</h1>

      <p>
        You don't have permission to access this
        page.
      </p>

      <Link to="/login">
        Go to login
      </Link>
    </main>
  );
}