export default function LoadingOverlay({ message = "Processing...", visible = false }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10, 10, 15, 0.85)", backdropFilter: "blur(8px)" }}>
      <div className="glass-card p-8 flex flex-col items-center gap-4 animate-bounce-in max-w-sm text-center">
        <div className="loading-spinner" />
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>
    </div>
  );
}
