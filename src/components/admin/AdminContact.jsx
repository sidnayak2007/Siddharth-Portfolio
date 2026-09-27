import { contactFallback, createContentId } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Contact from "../sections/Contact";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field } from "./AdminEditorUI";

function validContactUrl(value) {
  try {
    const url = new URL(value);
    return (["https:", "http:"].includes(url.protocol) && Boolean(url.hostname))
      || (url.protocol === "mailto:" && /.+@.+\..+/.test(url.pathname))
      || (url.protocol === "tel:" && /^[+\d()\s-]{6,}$/.test(url.pathname));
  } catch { return false; }
}

export default function AdminContact() {
  const editor = useAdminPortfolioDocument("contact", contactFallback);
  const data = editor.value;
  const links = Array.isArray(data.links) ? data.links : [];
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateLink = (index, field, value) => update("links", links.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const save = () => {
    const clean = {
      ...data,
      eyebrow: String(data.eyebrow || "").trim(),
      heading: String(data.heading || "").trim(),
      intro: String(data.intro || "").trim(),
      availabilityHeading: String(data.availabilityHeading || "").trim(),
      availabilityText: String(data.availabilityText || "").trim(),
      links: links.map((item, index) => ({ ...item, order: index, label: String(item.label || "").trim(), value: String(item.value || "").trim(), url: String(item.url || "").trim(), visible: item.visible !== false })).filter((item) => item.label || item.value || item.url),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.links.forEach((item, index) => {
      if (!item.label || !validContactUrl(item.url)) errors.push(`Contact link ${index + 1} needs a label and a valid URL.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="contact" number="08" title="Contact" description="Choose which professional contact details are public." editor={editor} onSave={save} PreviewComponent={Contact}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
          <Field label="Availability heading" value={data.availabilityHeading} onChange={(value) => update("availabilityHeading", value)} />
          <Field label="Availability message" value={data.availabilityText} onChange={(value) => update("availabilityText", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Contact links" description="Hidden links are saved in an Admin-only document. New links start hidden." meta={`${links.length} / 12`}>
        <div className="admin-card-list">
          {links.map((item, index) => (
            <EntryCard key={item.id || index} title={item.label} subtitle={item.value} index={index} first={index === 0} last={index === links.length - 1} onMoveUp={() => update("links", moveArrayItem(links, index, -1))} onMoveDown={() => update("links", moveArrayItem(links, index, 1))} onRemove={() => update("links", links.filter((_, itemIndex) => itemIndex !== index))}>
              <div className="admin-form-grid">
                <Field label="Label" value={item.label} onChange={(value) => updateLink(index, "label", value)} placeholder="Email, LinkedIn, GitHub, portfolio…" required />
                <Field label="Displayed value" value={item.value} onChange={(value) => updateLink(index, "value", value)} placeholder="Your public name or handle" />
                <Field label="URL" value={item.url} onChange={(value) => updateLink(index, "url", value)} placeholder="https://, mailto: or tel:" required full help="Use a full web link, mailto: email address or tel: phone number." />
                <CheckboxField label="Publish this contact link" checked={item.visible !== false} onChange={(value) => updateLink(index, "visible", value)} description="Only published links appear in the public portfolio document." />
              </div>
            </EntryCard>
          ))}
        </div>
        {links.length < 12 && <button type="button" className="admin-add" onClick={() => update("links", [...links, { id: createContentId("contact-link"), label: "", value: "", url: "", visible: false }])}>+ Add contact link</button>}
      </EditorSection>
    </EditorPage>
  );
}
