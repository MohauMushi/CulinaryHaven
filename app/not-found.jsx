import { ErrorLayout, Button } from "@/components/ErrorShared";

/**
 * NotFoundPage Component
 *
 * @description This component renders a custom 404 error page to inform users that the requested page was not found.
 * It uses the `ErrorLayout` component to display an error code, title, message, and a button to navigate back to the home page.
 *
 * @returns {JSX.Element} The rendered 404 error page.
 *
 * @example
 * // Example usage in a Next.js app's custom 404 page:
 * export default NotFoundPage;
 */
export default function NotFoundPage() {
  return (
    <ErrorLayout
      code="404"
      title="Page Not Found"
      message="Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."
      buttons={
        <Button href="/">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Return Home
        </Button>
      }
    />
  );
}
