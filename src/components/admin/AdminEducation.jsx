import { createContentId, educationFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Education from "../sections/Education";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field, MediaListEditor, MediaUploadField, StringList } from "./AdminEditorUI";

const emptyEducation = () => ({ id: createContentId("education"), institution: "", qualification: "", field: "", location: "", startDate: "", endDate: "", current: false, grade: "", description: "", activities: "", achievements: [], highlights: [], certifications: [], awards: [], logoUrl: "", logoPath: "", imageUrl: "", imagePath: "", media: [] });
const cleanList = (items) => (Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter(Boolean);

export default function AdminEducation() {
  const editor = useAdminPortfolioDocument("education", educationFallback);
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
        institution: String(item.institution || "").trim(),
        qualification: String(item.qualification || "").trim(),
        field: String(item.field || "").trim(),
        location: String(item.location || "").trim(),
        startDate: String(item.startDate || "").trim(),
        endDate: item.current ? "" : String(item.endDate || "").trim(),
        grade: String(item.grade || "").trim(),
        description: String(item.description || "").trim(),
        activities: String(item.activities || "").trim(),
        achievements: cleanList(item.achievements),
        highlights: cleanList(item.highlights),
        certifications: cleanList(item.certifications),
        awards: cleanList(item.awards),
        media: Array.isArray(item.media) ? item.media.filter((asset) => asset?.url) : [],
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.institution || !item.qualification) errors.push(`Education ${index + 1} needs an institution and qualification.`);
      if (!item.startDate) errors.push(`Education ${index + 1} needs a start date.`);
      if (!item.current && !item.endDate) errors.push(`Education ${index + 1} needs an end date or Current study.`);
      if (item.endDate && item.startDate && /^\d{4}-\d{2}$/.test(item.startDate) && /^\d{4}-\d{2}$/.test(item.endDate) && item.endDate < item.startDate) errors.push(`Education ${index + 1} ends before it starts.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="education" number="05" title="Education" description="Qualifications, activities, achievements and supporting documents." editor={editor} onSave={save} PreviewComponent={Education}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Education entries" meta={`${items.length} / 20`}>
        <div className="admin-card-list">
          {items.map((item, index) => (
            <EntryCard key={item.id || index} title={item.institution} subtitle={item.qualification} index={index} first={index === 0} last={index === items.length - 1} onMoveUp={() => update("items", moveArrayItem(items, index, -1))} onMoveDown={() => update("items", moveArrayItem(items, index, 1))} onRemove={() => remove(index)}>
              <div className="admin-form-grid">
                <Field label="Institution" value={item.institution} onChange={(value) => updateItem(index, "institution", value)} required />
                <Field label="Qualification" value={item.qualification} onChange={(value) => updateItem(index, "qualification", value)} required />
                <Field label="Field of study" value={item.field} onChange={(value) => updateItem(index, "field", value)} />
                <Field label="Location" value={item.location} onChange={(value) => updateItem(index, "location", value)} />
                <Field label="Start month" value={item.startDate} onChange={(value) => updateItem(index, "startDate", value)} type="month" required />
                <Field label="End month" value={item.endDate} onChange={(value) => updateItem(index, "endDate", value)} type="month" disabled={item.current} />
                <CheckboxField label="Currently studying here" checked={item.current} onChange={(value) => updateItem(index, "current", value)} />
                <Field label="Grade or CGPA" value={item.grade} onChange={(value) => updateItem(index, "grade", value)} />
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full rows={4} />
                <Field label="Activities" value={item.activities} onChange={(value) => updateItem(index, "activities", value)} multiline full />
              </div>
              <div className="admin-subeditor"><h3>Achievements</h3><StringList values={item.achievements || []} onChange={(value) => updateItem(index, "achievements", value)} addLabel="Add achievement" placeholder="Achievement" /></div>
              <div className="admin-subeditor"><h3>Highlights</h3><StringList values={item.highlights || []} onChange={(value) => updateItem(index, "highlights", value)} addLabel="Add highlight" placeholder="Highlight" /></div>
              <div className="admin-subeditor"><h3>Certifications</h3><StringList values={item.certifications || []} onChange={(value) => updateItem(index, "certifications", value)} addLabel="Add certification" placeholder="Certification" /></div>
              <div className="admin-subeditor"><h3>Awards</h3><StringList values={item.awards || []} onChange={(value) => updateItem(index, "awards", value)} addLabel="Add award" placeholder="Award" /></div>
              <MediaUploadField sectionId="education" itemId={`${item.id || index}-logo`} label="Institution logo" value={{ url: item.logoUrl, path: item.logoPath }} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, logoUrl: asset.url, logoPath: asset.path } : entry) }))} />
              <MediaUploadField sectionId="education" itemId={`${item.id || index}-image`} label="Education image" value={{ url: item.imageUrl, path: item.imagePath }} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, imageUrl: asset.url, imagePath: asset.path } : entry) }))} />
              <MediaListEditor sectionId="education" itemId={item.id || String(index)} assets={item.media} onChange={(value) => updateItem(index, "media", value)} kind="pdf" label="Certificates and documents" />
            </EntryCard>
          ))}
        </div>
        {items.length < 20 && <button type="button" className="admin-add" onClick={() => update("items", [...items, emptyEducation()])}>+ Add education</button>}
      </EditorSection>
    </EditorPage>
  );
}
