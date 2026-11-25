import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ExternalLink, LoaderCircle, RotateCcw } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ResponsivePdfViewer({
  file,
  title,
  loading,
  error,
  onRetry,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const visibleError = error || renderError;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-[#d9dde3] shadow-sm"
      aria-label={title || "Past paper PDF"}
    >
      {(loading || (!pageCount && file && !visibleError)) && (
        <div className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-center bg-background/90">
          <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}

      {visibleError ? (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-md text-sm text-destructive">{visibleError}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"
            >
              <RotateCcw size={15} />
              Retry PDF
            </button>
            {file && (
              <a
                href={file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-bold"
              >
                <ExternalLink size={15} />
                Open full screen
              </a>
            )}
          </div>
        </div>
      ) : (
        file && (
          <Document
            key={file}
            file={file}
            loading={null}
            onLoadSuccess={({ numPages }) => {
              setRenderError("");
              setPageCount(numPages);
            }}
            onLoadError={(pdfError) =>
              setRenderError(
                pdfError?.message || "This PDF could not be displayed."
              )
            }
            className="space-y-3 overflow-y-auto p-2 sm:p-4"
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <Page
                key={`page-${index + 1}`}
                pageNumber={index + 1}
                width={Math.max(
                  280,
                  containerWidth - (containerWidth < 640 ? 16 : 32)
                )}
                renderAnnotationLayer
                renderTextLayer
                className="mx-auto overflow-hidden rounded-sm bg-white shadow"
                loading={
                  <div className="mx-auto flex h-48 items-center justify-center bg-white">
                    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                  </div>
                }
              />
            ))}
          </Document>
        )
      )}
    </section>
  );
}
