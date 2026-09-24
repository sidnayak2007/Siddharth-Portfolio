import { createContentId, resumeFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Resume from "../sections/Resume";
import { EditorPage, EditorSection, EntryCard, Field, MediaUploadField } from "./AdminEditorUI";

export default function AdminResume() {
  const editor = useAdminPortfolioDocument("resume", resumeFallback);
  const data = editor.value;
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => update("timeline", timeline.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const save = () => {
    const clean = {
      ...data,
      eyebrow: String(data.eyebrow || "").trim(),
      heading: String(data.heading || "").trim(),
      intro: String(data.intro || "").trim(),
      title: String(data.title || "").trim(),
      description: String(data.description || "").trim(),
      lastUpdated: String(data.lastUpdated || "").trim(),
      pdfUrl: data.pdfUrl || "",
      pdfPath: data.pdfPath || "",
      pdfName: data.pdfName || "",
      timeline: timeline.map((item) => ({ ...item, year: String(item.year || "").trim(), title: String(item.title || "").trim(), description: String(item.description || "").trim() })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    if (!clean.title) errors.push("Resume title is required.");
    clean.timeline.forEach((item, index) => {
      if (!item.year || !item.title) errors.push(`Timeline item ${index + 1} needs a date and title.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="resume" number="06" title="Resume" description="Manage the overview, timeline and latest published PDF." editor={editor} onSave={save} PreviewComponent={Resume}>
      <EditorSection number="01" title="Resume information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Page heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Page introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
          <Field label="Resume title" value={data.title} onChange={(value) => update("title", value)} required />
          <Field label="Last updated" value={data.lastUpdated} onChange={(value) => update("lastUpdated", value)} type="date" />
          <Field label="Resume description" value={data.description} onChange={(value) => update("description", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Published PDF" description="The existing public PDF stays live until you save a replacement.">
        <MediaUploadField sectionId="resume" itemId="resume" kind="pdf" label="Resume PDF" value={{ url: data.pdfUrl, path: data.pdfPath, name: data.pdfName }} onChange={(asset) => editor.setValue((current) => ({ ...current, pdfUrl: asset.url, pdfPath: asset.path, pdfName: asset.name }))} />
      </EditorSection>
      <EditorSection number="03" title="Timeline" meta={`${timeline.length} / 20`}>
        <div className="admin-card-list">
          {timeline.map((item, index) => (
            <EntryCard key={item.id || index} title={item.title} subtitle={item.year} index={index} first={index === 0} last={index === timeline.length - 1} onMoveUp={() => update("timeline", moveArrayItem(timeline, index, -1))} onMoveDown={() => update("timeline", moveArrayItem(timeline, index, 1))} onRemove={() => update("timeline", timeline.filter((_, itemIndex) => itemIndex !== index))}>
              <div className="admin-form-grid">
                <Field label="Year or date" value={item.year} onChange={(value) => updateItem(index, "year", value)} required />
                <Field label="Title" value={item.title} onChange={(value) => updateItem(index, "title", value)} required />
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full />
              </div>
            </EntryCard>
          ))}
        </div>
        {timeline.length < 20 && <button type="button" className="admin-add" onClick={() => update("timeline", [...timeline, { id: createContentId("resume-item"), year: "", title: "", description: "" }])}>+ Add milestone</button>}
      </EditorSection>
    </EditorPage>
  );
}
