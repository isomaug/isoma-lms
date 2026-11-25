/**
 * CourseBadge -- Renders small pill badges (Bestseller, New, etc.)
 * Uses solid backgrounds with no glow effects.
 */
export default function CourseBadge({ label, variant = "bestseller" }) {
  const variants = {
    bestseller: "bg-amber-500/20 text-amber-400",
    new: "bg-emerald-500/20 text-emerald-400",
    popular: "bg-blue-500/20 text-blue-400",
  };

  const classes = variants[variant] || variants.bestseller;

  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${classes}`}
    >
      {label}
    </span>
  );
}
