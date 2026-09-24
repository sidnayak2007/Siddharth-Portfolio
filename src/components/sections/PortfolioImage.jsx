import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function displayableImageUrl(value) {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : "";
}

function cloudinaryImageUrl(url, width) {
  const prefix = "https://res.cloudinary.com/zsvjuaee/image/upload/";
  if (!url.startsWith(prefix) || /\.pdf(?:[?#]|$)/i.test(url)) return "";
  return `${prefix}c_limit,w_${width}/q_auto/f_auto/${url.slice(prefix.length)}`;
}

export default function PortfolioImage({ src, alt = "Portfolio image", caption = "", className = "", imageClassName = "", compact = false }) {
  const [open, setOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState("");
  const triggerRef = useRef(null);
  const url = displayableImageUrl(src);
  const optimized = failedUrl === url ? "" : cloudinaryImageUrl(url, compact ? 192 : 900);
  const widths = compact ? [96, 192, 320] : [480, 900, 1400];
  const srcSet = optimized
    ? widths.map((width) => `${cloudinaryImageUrl(url, width)} ${width}w`).join(", ")
    : undefined;

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
      if (event.key === "Tab") {
        event.preventDefault();
        document.querySelector(".portfolio-image-dialog-close")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!url) return null;

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`portfolio-image-trigger ${className}`.trim()}
        onClick={() => setOpen(true)}
        aria-label={`See full picture: ${alt}`}
        title="See full picture"
      >
        <img
          className={imageClassName}
          src={optimized || url}
          srcSet={srcSet}
          sizes={compact ? "(max-width: 650px) 48px, 58px" : "(max-width: 650px) 90vw, 650px"}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => { if (optimized) setFailedUrl(url); }}
        />
        {!compact && <span className="portfolio-image-label">{caption || "See full picture"}</span>}
      </button>
      {open && createPortal(
        <div className="portfolio-image-dialog" role="dialog" aria-modal="true" aria-label={`Full picture: ${alt}`} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
          <button type="button" className="portfolio-image-dialog-close" onClick={close} autoFocus>Close picture ×</button>
          <img src={url} alt={alt} />
          {caption && <p>{caption}</p>}
        </div>,
        document.body,
      )}
    </>
  );
}
