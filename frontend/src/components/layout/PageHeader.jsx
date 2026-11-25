export default function PageHeader({ title, description, subtitle, className }) {
  const textDesc = description || subtitle;
  const containerClasses = className || "pb-5 mb-8 pt-6";
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border/60 ${containerClasses}`}>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-['Poppins'] text-left">
        {title}
      </h1>
      {textDesc && (
        <p className="text-[14px] text-muted-foreground mt-1.5 font-['Inter',sans-serif] text-left leading-relaxed">
          {textDesc}
        </p>
      )}
    </div>
  );
}
