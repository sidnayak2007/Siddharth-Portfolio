import { useId, useState } from "react";

import { uploadPortfolioFile } from "../../firebase/portfolioService";
import AdminShell from "./AdminShell";

export function EditorPage({
  sectionId,
  number,
  title,
  description,
  editor,
  onSave,
  children,
}) {
  const saving = editor.status === "saving";

  return (
    <AdminShell activeSection={sectionId}>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CONTENT / {number}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="admin-heading-actions">
          <div className={"admin-change-status " + (editor.dirty ? "dirty" : "clean")}>
            <i aria-hidden="true" />
            <span>{editor.dirty ? "Unsaved changes" : "All changes saved"}</span>
          </div>
          <button
            type="button"
            className="admin-save"
            onClick={onSave}
            disabled={editor.loading || Boolean(editor.loadError) || saving || !editor.dirty}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {editor.message && (
        <div
          className={"admin-message admin-message-" + (editor.status === "saved" ? "success" : editor.status === "error" ? "error" : "warning")}
          role={editor.status === "saved" ? "status" : "alert"}
        >
          <strong>{editor.status === "saved" ? title + " saved." : editor.status === "validation" ? "Check the editor." : "Save failed."}</strong>
          <span>{editor.message}</span>
        </div>
      )}

      {editor.loading ? (
        <div className="admin-loading"><span>Loading {title.toLowerCase()}…</span></div>
      ) : editor.loadError ? (
        <div className="admin-load-error">
          <span className="admin-eyebrow">FIREBASE UNAVAILABLE</span>
          <h2>Couldn’t load this editor.</h2>
          <p>{editor.loadError}</p>
          <button type="button" className="admin-primary-button" onClick={editor.retry}>Try again</button>
        </div>
      ) : (
        <div className="admin-editor">{children}</div>
      )}
    </AdminShell>
  );
}

export function EditorSection({ number, title, description, meta, children }) {
  return (
    <section className="admin-editor-section">
      <div className="admin-editor-title">
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {meta && <small>{meta}</small>}
      </div>
      <div className="admin-editor-section-content">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  full = false,
  rows = 4,
  required = false,
  placeholder = "",
  disabled = false,
  maxLength,
}) {
  const Component = multiline ? "textarea" : "input";
  return (
    <label className={"admin-field " + (full ? "admin-field-full" : "")}>
      <span>{label}{required ? " *" : ""}</span>
      <Component
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
      />
    </label>
  );
}

export function CheckboxField({ label, checked, onChange, description }) {
  return (
    <label className="admin-checkbox-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span className="admin-checkbox-ui" aria-hidden="true" />
      <span className="admin-checkbox-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}

export function ItemHeader({ title, subtitle, index, onMoveUp, onMoveDown, onRemove, first, last }) {
  return (
    <div className="admin-edit-card-head">
      <div>
        <span>ITEM {String(index + 1).padStart(2, "0")}</span>
        <strong>{title || "Untitled"}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="admin-item-actions">
        <button type="button" onClick={onMoveUp} disabled={first} aria-label="Move up">↑</button>
        <button type="button" onClick={onMoveDown} disabled={last} aria-label="Move down">↓</button>
        <button type="button" className="admin-danger-text" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

export function StringList({
  values,
  onChange,
  addLabel = "Add item",
  placeholder = "",
  max = 20,
}) {
  const update = (index, next) => onChange(values.map((item, itemIndex) => itemIndex === index ? next : item));
  const remove = (index) => onChange(values.filter((_, itemIndex) => itemIndex !== index));
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-repeat-list">
      {values.map((item, index) => (
        <div className="admin-repeat-row" key={index}>
          <span className="admin-repeat-index">{String(index + 1).padStart(2, "0")}</span>
          <input value={item} placeholder={placeholder} onChange={(event) => update(index, event.target.value)} />
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === values.length - 1} aria-label="Move down">↓</button>
          <button type="button" className="admin-remove" onClick={() => remove(index)} aria-label="Remove">×</button>
        </div>
      ))}
      {values.length < max && (
        <button type="button" className="admin-add" onClick={() => onChange([...values, ""])}>+ {addLabel}</button>
      )}
    </div>
  );
}

export function MediaUploadField({
  sectionId,
  itemId,
  kind = "image",
  value,
  onChange,
  queueDelete,
  label,
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadPortfolioFile({ sectionId, itemId, file, kind });
      if (value?.path) queueDelete(value.path);
      onChange(uploaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    if (value?.path) queueDelete(value.path);
    onChange({ url: "", path: "", name: "" });
  };

  return (
    <div className={"admin-media-field " + (kind === "pdf" ? "is-pdf" : "")}>
      <div className="admin-field-heading">
        <span>{label}</span>
        <small>{kind === "pdf" ? "PDF · max 15 MB" : "JPG, PNG, WebP or GIF · max 8 MB"}</small>
      </div>
      {value?.url ? (
        <div className="admin-media-preview">
          {kind === "image" ? (
            <img src={value.url} alt="" />
          ) : (
            <a href={value.url} target="_blank" rel="noreferrer">{value.name || "Open current PDF"}</a>
          )}
          <div>
            <label htmlFor={inputId} className="admin-secondary-button">{uploading ? "Uploading…" : "Replace"}</label>
            <button type="button" className="admin-danger-text" onClick={remove} disabled={uploading}>Remove</button>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className="admin-upload-drop">
          <strong>{uploading ? "Uploading…" : "Choose " + (kind === "pdf" ? "PDF" : "image")}</strong>
          <span>Upload directly from this computer</span>
        </label>
      )}
      <input
        id={inputId}
        className="admin-file-input"
        type="file"
        accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif"}
        onChange={chooseFile}
        disabled={uploading}
      />
      {error && <p className="admin-upload-error" role="alert">{error}</p>}
    </div>
  );
}
