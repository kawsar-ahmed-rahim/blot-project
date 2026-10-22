export default function Spinner({ className = 'py-24' }) {
  return (
    <div className={`flex justify-center ${className}`} role="status" aria-label="Loading">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  )
}
