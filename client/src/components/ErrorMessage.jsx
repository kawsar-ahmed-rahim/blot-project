export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div role="alert" className="alert alert-error alert-soft">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
