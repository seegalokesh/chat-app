/**
 * Generic badge / pill component.
 *
 * Props:
 *   variant  — 'default' | 'success' | 'warning' | 'danger' | 'info'  (default: 'default')
 *   size     — 'sm' | 'md'  (default: 'md')
 *   dot      — boolean: show a coloured dot before the label
 *   count    — number: if provided, renders as a numeric counter badge
 *   children — label text
 */
export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  count,
  children
}) {
  // If a raw count is passed, show it capped at 99+
  const label = count !== undefined
    ? (count > 99 ? '99+' : String(count))
    : children;

  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {label}
    </span>
  );
}