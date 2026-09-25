import { certificationsFallback, createContentId } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Certifications from "../sections/Certifications";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field, MediaUploadField, StringList } from "./AdminEditorUI";

const emptyCertification = () => ({
  id: createContentId("certification"),
  title: "",
  issuer: "",
  issuedOn: "",
  expiresOn: "",
  credentialId: "",
  credentialUrl: "",
  description: "",
  skills: [],
  imageUrl: "",
  imagePath: "",
  imageName: "",
  visible: true,
});

const cleanList = (items) => (Array.isArray(items) ? items : [])
  .map((item) => String(item || "").trim())
  .filter(Boolean);

function validHttpsUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default function AdminCertifications() {
  const editor = useAdminPortfolioDocument("certifications", certificationsFallback);
  const data = editor.value;
  const items = Array.isArray(data.items) ? data.items : [];
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => {
    const targetId = items[index]?.id;
    editor.setValue((current) => ({
      ...current,
      items: (current.items || []).map((item, itemIndex) =>
        (targetId ? item.id === targetId : itemIndex === index)
          ? { ...item, [field]: typeof value === "function" ? value(item[field] || []) : value }
          : item),
    }));
  };

  const save = () => {
    const clean = {
      ...data,
      eyebrow: String(data.eyebrow || "").trim(),
      heading: String(data.heading || "").trim(),
      intro: String(data.intro || "").trim(),
      items: items.map((item) => ({
        ...item,
        title: String(item.title || "").trim(),
        issuer: String(item.issuer || "").trim(),
        issuedOn: String(item.issuedOn || "").trim(),
        expiresOn: String(item.expiresOn || "").trim(),
        credentialId: String(item.credentialId || "").trim(),
        credentialUrl: String(item.credentialUrl || "").trim(),
        description: String(item.description || "").trim(),
        skills: cleanList(item.skills).slice(0, 12),
        imageUrl: String(item.imageUrl || "").trim(),
        imagePath: String(item.imagePath || ""),
        imageName: String(item.imageName || ""),
        visible: Boolean(item.visible),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.title || !item.issuer) errors.push(`Certification ${index + 1} needs a title and issuer.`);
      if (item.expiresOn && item.issuedOn && item.expiresOn < item.issuedOn) errors.push(`Certification ${index + 1} expires before it was issued.`);
      if (![item.credentialUrl, item.imageUrl].every(validHttpsUrl)) errors.push(`Certification ${index + 1} needs full HTTPS image and verification links.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="certifications" number="06" title="Certifications" description="Publish credentials with proof, dates, skills and verification links." editor={editor} onSave={save} PreviewComponent={Certifications}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} maxLength={100} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required maxLength={300} />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full maxLength={1500} />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Credentials" description="New entries publish when you save. Turn off public visibility to keep an entry as a draft." meta={`${items.length} / 24`}>
        <div className="admin-card-list">
          {items.map((item, index) => (
            <EntryCard
              key={item.id || index}
              title={item.title}
              subtitle={item.issuer}
              index={index}
              first={index === 0}
              last={index === items.length - 1}
              onMoveUp={() => update("items", moveArrayItem(items, index, -1))}
              onMoveDown={() => update("items", moveArrayItem(items, index, 1))}
              onRemove={() => update("items", items.filter((_, itemIndex) => itemIndex !== index))}
            >
              <div className="admin-form-grid">
                <Field label="Certification title" value={item.title} onChange={(value) => updateItem(index, "title", value)} required maxLength={160} />
                <Field label="Issuing organization" value={item.issuer} onChange={(value) => updateItem(index, "issuer", value)} required maxLength={160} />
                <Field label="Issued month" value={item.issuedOn} onChange={(value) => updateItem(index, "issuedOn", value)} type="month" />
                <Field label="Expiry month" value={item.expiresOn} onChange={(value) => updateItem(index, "expiresOn", value)} type="month" />
                <Field label="Credential ID" value={item.credentialId} onChange={(value) => updateItem(index, "credentialId", value)} maxLength={200} />
                <Field label="Verification URL" value={item.credentialUrl} onChange={(value) => updateItem(index, "credentialUrl", value)} type="url" placeholder="https://..." full />
                <Field label="What this covers" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full rows={4} maxLength={2000} />
                <CheckboxField label="Show on public portfolio" checked={item.visible} onChange={(value) => updateItem(index, "visible", value)} description="Hidden entries remain editable in Admin." />
              </div>
              <div className="admin-subeditor"><h3>Skills covered</h3><StringList values={item.skills || []} onChange={(value) => updateItem(index, "skills", value)} addLabel="Add skill" placeholder="Skill or topic" max={12} /></div>
              <MediaUploadField kind="image" label="Certificate picture" value={{ url: item.imageUrl, path: item.imagePath, name: item.imageName }} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, imageUrl: asset.url, imagePath: asset.path, imageName: asset.name, visible: true } : entry) }))} />
            </EntryCard>
          ))}
        </div>
        {items.length < 24 && <button type="button" className="admin-add" onClick={() => update("items", [...items, emptyCertification()])}>+ Add certification</button>}
      </EditorSection>
    </EditorPage>
  );
}
