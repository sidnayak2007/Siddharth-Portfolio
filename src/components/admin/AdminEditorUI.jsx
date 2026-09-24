import { useId, useState } from "react";
import { uploadPortfolioFile } from "../../cloudinary/portfolioUpload";
import { safeHref } from "../../utils/url";
import AdminShell from "./AdminShell";

export function EditorPage({ sectionId, number, title, description, editor, onSave, PreviewComponent, children }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const saving = editor.status === "saving";
  const status = editor.loading ? "Loading" : saving ? "Saving" : editor.dirty ? "Unsaved changes" : editor.status === "saved" ? "Saved" : "No unsaved changes";

  return (
    <AdminShell activeSection={sectionId} dirty={editor.dirty}>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CONTENT / {number}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      {editor.message && (
        <div className={`admin-message admin-message-${editor.status === "saved" ? "success" : editor.status === "error" ? "error" : "warning"}`} role={editor.status === "saved" ? "status" : "alert"}>
          <strong>{editor.status === "saved" ? `${title} saved.` : editor.status === "validation" ? "Check the editor." : "Save failed."}</strong>
          <span>{editor.message}</span>
        </div>
      )}

      {editor.loading ? (
        <div className="admin-loading" role="status">Loading {title.toLowerCase()}…</div>
      ) : editor.loadError ? (
        <div className="admin-load-error" role="alert">
          <h2>Couldn’t load this editor.</h2>
          <p>{editor.loadError}</p>
          <button type="button" className="admin-primary-button" onClick={editor.retry}>Try again</button>
        </div>
      ) : (
        <>
          <div className="admin-editor">{children}</div>
          <div className="admin-sticky-actions">
            <span className={`admin-save-state ${editor.dirty ? "dirty" : ""}`} role="status">{status}</span>
            <div>
              {PreviewComponent && <button type="button" className="admin-secondary-button" onClick={() => setPreviewOpen(true)}>Live preview</button>}
              <button type="button" className="admin-save" onClick={onSave} disabled={saving || !editor.dirty}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </>
      )}

      {previewOpen && PreviewComponent && (
        <div className="admin-preview-overlay" role="dialog" aria-modal="true" aria-label={`${title} live preview`}>
          <div className="admin-preview-toolbar">
            <div><strong>Live preview</strong><span>Unsaved changes are visible only here.</span></div>
            <button type="button" onClick={() => setPreviewOpen(false)} autoFocus>Close preview</button>
          </div>
          <div className="admin-preview-content"><PreviewComponent previewData={editor.value} onBack={() => setPreviewOpen(false)} /></div>
        </div>
      )}
    </AdminShell>
  );
}

export function EditorSection({ number, title, description, meta, children }) {
  return (
    <section className="admin-editor-section">
      <div className="admin-editor-title">
        <span>{number}</span>
        <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {meta && <small>{meta}</small>}
      </div>
      <div className="admin-editor-section-content">{children}</div>
    </section>
  );
}

export function Field({ label, value, onChange, type = "text", multiline = false, full = false, rows = 4, required = false, placeholder = "", disabled = false, maxLength, help, options }) {
  const actualType = type === "month" && value && !/^\d{4}-\d{2}$/.test(value) ? "text" : type;
  return (
    <label className={`admin-field ${full ? "admin-field-full" : ""}`}>
      <span>{label}{!required && <small>Optional</small>}</span>
      {options ? (
        <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} required={required}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>{typeof option === "string" ? option : option.label}</option>)}
        </select>
      ) : multiline ? (
        <textarea rows={rows} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} maxLength={maxLength} required={required} />
      ) : (
        <input type={actualType} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} maxLength={maxLength} required={required} />
      )}
      {help && <small className="admin-field-help">{help}</small>}
    </label>
  );
}

export function CheckboxField({ label, checked, onChange, description }) {
  return (
    <label className="admin-checkbox-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span className="admin-checkbox-ui" aria-hidden="true" />
      <span className="admin-checkbox-copy"><strong>{label}</strong>{description && <small>{description}</small>}</span>
    </label>
  );
}

export function EntryCard({ title, subtitle, index, first, last, onMoveUp, onMoveDown, onRemove, children }) {
  const [expanded, setExpanded] = useState(index === 0);
  const remove = () => {
    if (window.confirm(`Remove ${title || "this entry"}? This will take effect when you save.`)) onRemove();
  };
  return (
    <article className="admin-edit-card">
      <div className="admin-edit-card-head">
        <button type="button" className="admin-entry-toggle" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
          <span>ITEM {String(index + 1).padStart(2, "0")}</span>
          <strong>{title || "Untitled"}</strong>
          {subtitle && <small>{subtitle}</small>}
          <em>{expanded ? "Collapse" : "Edit details"}</em>
        </button>
        <div className="admin-item-actions">
          <button type="button" onClick={onMoveUp} disabled={first} aria-label={`Move ${title || "entry"} up`}>↑</button>
          <button type="button" onClick={onMoveDown} disabled={last} aria-label={`Move ${title || "entry"} down`}>↓</button>
          <button type="button" className="admin-danger-text" onClick={remove}>Remove</button>
        </div>
      </div>
      {expanded && <div className="admin-entry-body">{children}</div>}
    </article>
  );
}

export function StringList({ values = [], onChange, addLabel = "Add item", placeholder = "", max = 20 }) {
  const update = (index, next) => onChange(values.map((item, itemIndex) => itemIndex === index ? next : item));
  const remove = (index) => { if (window.confirm("Remove this item?")) onChange(values.filter((_, itemIndex) => itemIndex !== index)); };
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div className="admin-repeat-list">
      {values.length === 0 && <p className="admin-inline-empty">No items yet.</p>}
      {values.map((item, index) => (
        <div className="admin-repeat-row" key={index}>
          <span className="admin-repeat-index">{String(index + 1).padStart(2, "0")}</span>
          <input value={item} aria-label={`${placeholder || "Item"} ${index + 1}`} placeholder={placeholder} onChange={(event) => update(index, event.target.value)} />
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === values.length - 1} aria-label="Move down">↓</button>
          <button type="button" className="admin-remove" onClick={() => remove(index)} aria-label="Remove">×</button>
        </div>
      ))}
      {values.length < max && <button type="button" className="admin-add" onClick={() => onChange([...values, ""])}>+ {addLabel}</button>}
    </div>
  );
}

export function MediaUploadField({ kind = "image", value, onChange, label, fallbackUrl }) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const uploaded = await uploadPortfolioFile({ file, kind });
      onChange(uploaded);
      setNotice("Uploaded to Cloudinary. Save changes to publish it.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const remove = () => {
    if (!window.confirm(`Remove ${label || "this file"} from the portfolio when you save?`)) return;
    onChange({ url: "", path: "", name: "", kind });
    setError("");
    setNotice("");
  };
  const editPdfUrl = (event) => {
    onChange({ url: event.target.value, path: "", name: "", kind: "pdf" });
    setError("");
    setNotice("");
  };
  const validatePdfUrl = () => {
    const rawUrl = String(value?.url || "").trim();
    if (!rawUrl) return;
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:" || !parsed.hostname) throw new Error();
      setError("");
    } catch {
      setError("Enter a full HTTPS link to a public PDF.");
    }
  };
  const url = /^https:\/\//i.test(value?.url || "") ? safeHref(value?.url) : "";
  return (
    <div className={`admin-media-field ${kind === "pdf" ? "is-pdf" : ""}`}>
      <div className="admin-field-heading"><span>{label}</span><small>{kind === "pdf" ? "PDF · max 15 MB" : "JPG, PNG, WebP or GIF · max 8 MB"}</small></div>
      {(url || fallbackUrl) && (
        <div className="admin-media-preview">
          {kind === "image" ? <img src={url || fallbackUrl} alt={label || "Current image"} /> : <div className="admin-pdf-preview"><a href={url} target="_blank" rel="noopener noreferrer">{value?.name || "Open current PDF"}</a><iframe src={url} title={`${label || "Document"} PDF preview`} /></div>}
          <div>
            <label htmlFor={inputId} className="admin-secondary-button">{uploading ? "Uploading…" : "Replace file"}</label>
            {url && <button type="button" className="admin-danger-text" onClick={remove} disabled={uploading}>Remove</button>}
          </div>
        </div>
      )}
      {!url && !fallbackUrl && <label htmlFor={inputId} className="admin-upload-drop"><strong>{uploading ? "Uploading…" : `Choose ${kind === "pdf" ? "PDF" : "image"}`}</strong><span>Upload to Cloudinary from this computer</span></label>}
      <input id={inputId} className="admin-file-input" type="file" accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif"} onChange={chooseFile} disabled={uploading} />
      {kind === "pdf" && (
        <label className="admin-media-url">
          <span>Or use a public PDF link</span>
          <input type="url" inputMode="url" value={value?.url || ""} placeholder="https://example.com/resume.pdf" onChange={editPdfUrl} onBlur={validatePdfUrl} disabled={uploading} />
        </label>
      )}
      {error && <p className="admin-upload-error" role="alert">{error}</p>}
      {notice && <p className="admin-upload-notice" role="status">{notice}</p>}
    </div>
  );
}

export function MediaListEditor({ itemId, assets = [], onChange, kind = "image", label = "Supporting media", max = 8 }) {
  const list = Array.isArray(assets) ? assets : [];
  const matches = (item, target, itemIndex, index) => target.id
    ? item.id === target.id
    : target.path || target.url
      ? (Boolean(target.path) && item.path === target.path) || (Boolean(target.url) && item.url === target.url)
      : itemIndex === index;
  const update = (index, asset) => {
    const target = list[index];
    onChange((current) => (Array.isArray(current) ? current : []).map((item, itemIndex) =>
      matches(item, target, itemIndex, index) ? { ...item, ...asset } : item));
  };
  const remove = (index) => {
    if (!window.confirm("Remove this attachment from the portfolio when you save?")) return;
    const target = list[index];
    onChange((current) => (Array.isArray(current) ? current : []).filter((item, itemIndex) => !matches(item, target, itemIndex, index)));
  };
  return (
    <div className="admin-subeditor">
      <h3>{label}</h3>
      {list.length === 0 && <p className="admin-inline-empty">No attachments yet.</p>}
      {list.map((asset, index) => (
        <div className="admin-media-list-item" key={asset.id || index}>
          <Field label="Attachment label" value={asset.label} onChange={(text) => update(index, { label: text })} full />
          <MediaUploadField kind={kind} value={asset} onChange={(next) => update(index, next)} label={`${label} ${index + 1}`} />
          <button type="button" className="admin-danger-text" onClick={() => remove(index)}>Remove attachment</button>
        </div>
      ))}
      {list.length < max && <button type="button" className="admin-add" onClick={() => onChange((current) => [...(Array.isArray(current) ? current : []), { id: `${itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: "", url: "", path: "", name: "" }])}>+ Add attachment</button>}
    </div>
  );
}
