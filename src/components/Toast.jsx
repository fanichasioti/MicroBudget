export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  return (
    <div
      className={`toast toast-${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <span aria-hidden="true">{type === "error" ? "!" : "✓"}</span>
      {message}
    </div>
  );
}
