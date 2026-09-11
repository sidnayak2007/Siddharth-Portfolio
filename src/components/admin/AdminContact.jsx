import { contactFallback, createContentId } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

export default function AdminContact() {
  const editor = useAdminPortfolioDocument("contact", contactFallback);
  const contact = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateLink = (index, field, value) => update("links", contact.links.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const save = () => {
    const clean = {
      eyebrow: contact.eyebrow.trim(),
      heading: contact.heading.trim(),
      intro: contact.intro.trim(),
      availabilityHeading: contact.availabilityHeading.trim(),
      availabilityText: contact.availabilityText.trim(),
      links: contact.links.map((item) => ({
        ...item,
        label: item.label.trim(),
        value: item.value.trim(),
        url: item.url.trim(),
      })).filter((item) => item.label || item.value || item.url),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.links.forEach((item, index) => {
      if (!item.label) errors.push("Contact link " + (index + 1) + " needs a label.");
      if (!item.url) errors.push("Contact link " + (index + 1) + " needs a URL.");
      if (item.url && !/^(https?:\/\/|mailto:|tel:)/i.test(item.url)) {
        errors.push("Contact link " + (index + 1) + " must use https://, mailto: or tel:.");
      }
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="contact" number="07" title="Contact" description="Manage professional links and your current availability message." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={contact.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={contact.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={contact.intro} onChange={(value) => update("intro", value)} multiline full />
          <Field label="Availability heading" value={contact.availabilityHeading} onChange={(value) => update("availabilityHeading", value)} full />
          <Field label="Availability text" value={contact.availabilityText} onChange={(value) => update("availabilityText", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Contact links" meta={contact.links.length + " / 12"}>
        <div className="admin-card-list">
          {contact.links.map((item, index) => (
            <article className="admin-edit-card" key={item.id}>
              <ItemHeader
                index={index}
                title={item.label}
                subtitle={item.value}
                first={index === 0}
                last={index === contact.links.length - 1}
                onMoveUp={() => update("links", moveArrayItem(contact.links, index, -1))}
                onMoveDown={() => update("links", moveArrayItem(contact.links, index, 1))}
                onRemove={() => update("links", contact.links.filter((_, itemIndex) => itemIndex !== index))}
              />
              <div className="admin-form-grid">
                <Field label="Label" value={item.label} onChange={(value) => updateLink(index, "label", value)} placeholder="LinkedIn" required />
                <Field label="Displayed value" value={item.value} onChange={(value) => updateLink(index, "value", value)} placeholder="@siddharth…" />
                <Field label="URL" value={item.url} onChange={(value) => updateLink(index, "url", value)} placeholder="https://…" full required />
              </div>
            </article>
          ))}
        </div>
        {contact.links.length < 12 && (
          <button type="button" className="admin-add" onClick={() => update("links", [...contact.links, { id: createContentId("contact-link"), label: "", value: "", url: "" }])}>
            + Add contact link
          </button>
        )}
      </EditorSection>
    </EditorPage>
  );
}
