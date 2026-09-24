import { createContentId, experienceFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Experience from "../sections/experience";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field, MediaListEditor, MediaUploadField, StringList } from "./AdminEditorUI";

const roleTypes = ["Internship", "Full-time", "Part-time", "Contract", "Freelance", "Volunteering", "Leadership", "Other"];
const locationTypes = ["On-site", "Hybrid", "Remote"];
const emptyExperience = () => ({ id: createContentId("experience"), role: "", organization: "", type: "", location: "", locationType: "", startDate: "", endDate: "", current: false, summary: "", responsibilities: [], achievements: [], highlights: [], skills: [], logoUrl: "", logoPath: "", certificateUrl: "", certificatePath: "", certificateName: "", media: [] });
const cleanList = (items) => (Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter(Boolean);

export default function AdminExperience() {
  const editor = useAdminPortfolioDocument("experience", experienceFallback);
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
  const remove = (index) => {
    update("items", items.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = () => {
    const clean = {
      ...data,
      eyebrow: String(data.eyebrow || "").trim(),
      heading: String(data.heading || "").trim(),
      intro: String(data.intro || "").trim(),
      items: items.map((item) => ({
        ...item,
        role: String(item.role || "").trim(),
        organization: String(item.organization || "").trim(),
        type: String(item.type || "").trim(),
        location: String(item.location || "").trim(),
        locationType: String(item.locationType || "").trim(),
        startDate: String(item.startDate || "").trim(),
        endDate: item.current ? "" : String(item.endDate || "").trim(),
        summary: String(item.summary || "").trim(),
        responsibilities: cleanList(item.responsibilities),
        achievements: cleanList(item.achievements),
        highlights: cleanList(item.highlights),
        skills: cleanList(item.skills),
        media: Array.isArray(item.media) ? item.media.filter((asset) => asset?.url) : [],
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.role || !item.organization) errors.push(`Experience ${index + 1} needs a role and organisation.`);
      if (!item.startDate) errors.push(`Experience ${index + 1} needs a start date.`);
      if (!item.current && !item.endDate) errors.push(`Experience ${index + 1} needs an end date or Current role.`);
      if (item.endDate && item.startDate && /^\d{4}-\d{2}$/.test(item.startDate) && /^\d{4}-\d{2}$/.test(item.endDate) && item.endDate < item.startDate) errors.push(`Experience ${index + 1} ends before it starts.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="experience" number="02" title="Experience" description="Add roles, responsibilities, achievements and proof of work." editor={editor} onSave={save} PreviewComponent={Experience}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Roles" description="Keep the newest or most relevant roles first." meta={`${items.length} / 20`}>
        <div className="admin-card-list">
          {items.map((item, index) => (
            <EntryCard key={item.id || index} title={item.role} subtitle={item.organization} index={index} first={index === 0} last={index === items.length - 1} onMoveUp={() => update("items", moveArrayItem(items, index, -1))} onMoveDown={() => update("items", moveArrayItem(items, index, 1))} onRemove={() => remove(index)}>
              <div className="admin-form-grid">
                <Field label="Position title" value={item.role} onChange={(value) => updateItem(index, "role", value)} required />
                <Field label="Organisation" value={item.organization} onChange={(value) => updateItem(index, "organization", value)} required />
                <Field label="Employment type" value={item.type} onChange={(value) => updateItem(index, "type", value)} options={[...new Set([...roleTypes, item.type].filter(Boolean))]} />
                <Field label="Location type" value={item.locationType} onChange={(value) => updateItem(index, "locationType", value)} options={[...new Set([...locationTypes, item.locationType].filter(Boolean))]} />
                <Field label="Location" value={item.location} onChange={(value) => updateItem(index, "location", value)} />
                <Field label="Start month" value={item.startDate} onChange={(value) => updateItem(index, "startDate", value)} type="month" required />
                <Field label="End month" value={item.endDate} onChange={(value) => updateItem(index, "endDate", value)} type="month" disabled={item.current} />
                <CheckboxField label="Current role" checked={item.current} onChange={(value) => updateItem(index, "current", value)} description="The public page will show Present." />
                <Field label="Summary" value={item.summary} onChange={(value) => updateItem(index, "summary", value)} multiline full rows={4} />
              </div>
              <div className="admin-subeditor"><h3>Responsibilities</h3><StringList values={item.responsibilities || []} onChange={(value) => updateItem(index, "responsibilities", value)} addLabel="Add responsibility" placeholder="What you did" /></div>
              <div className="admin-subeditor"><h3>Achievements</h3><StringList values={item.achievements || []} onChange={(value) => updateItem(index, "achievements", value)} addLabel="Add achievement" placeholder="Outcome or result" /></div>
              <div className="admin-subeditor"><h3>Other highlights</h3><StringList values={item.highlights || []} onChange={(value) => updateItem(index, "highlights", value)} addLabel="Add highlight" placeholder="Additional detail" /></div>
              <div className="admin-subeditor"><h3>Associated skills</h3><StringList values={item.skills || []} onChange={(value) => updateItem(index, "skills", value)} addLabel="Add skill" placeholder="Skill or tool" /></div>
              <MediaUploadField sectionId="experience" itemId={`${item.id || index}-logo`} label="Organisation logo" value={{ url: item.logoUrl, path: item.logoPath }} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, logoUrl: asset.url, logoPath: asset.path } : entry) }))} />
              <MediaUploadField sectionId="experience" itemId={`${item.id || index}-certificate`} kind="pdf" label="Certificate" value={{ url: item.certificateUrl, path: item.certificatePath, name: item.certificateName }} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, certificateUrl: asset.url, certificatePath: asset.path, certificateName: asset.name } : entry) }))} />
              <MediaListEditor sectionId="experience" itemId={item.id || String(index)} assets={item.media} onChange={(value) => updateItem(index, "media", value)} label="Supporting images" />
            </EntryCard>
          ))}
        </div>
        {items.length < 20 && <button type="button" className="admin-add" onClick={() => update("items", [...items, emptyExperience()])}>+ Add experience</button>}
      </EditorSection>
    </EditorPage>
  );
}
