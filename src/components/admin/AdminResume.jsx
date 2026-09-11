import { createContentId, resumeFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
  MediaUploadField,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

export default function AdminResume() {
  const editor = useAdminPortfolioDocument("resume", resumeFallback);
  const resume = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => update("timeline", resume.timeline.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const save = () => {
    const clean = {
      eyebrow: resume.eyebrow.trim(),
      heading: resume.heading.trim(),
      intro: resume.intro.trim(),
      pdfUrl: resume.pdfUrl || "",
      pdfPath: resume.pdfPath || "",
      pdfName: resume.pdfName || "",
      timeline: resume.timeline.map((item) => ({
        ...item,
        year: item.year.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.timeline.forEach((item, index) => {
      if (!item.title) errors.push("Timeline item " + (index + 1) + " needs a title.");
      if (!item.year) errors.push("Timeline item " + (index + 1) + " needs a year.");
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="resume" number="06" title="Resume" description="Manage the resume overview, timeline and downloadable PDF." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={resume.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={resume.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={resume.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Resume PDF" description="Visitors see the download button only when a PDF is uploaded.">
        <MediaUploadField
          sectionId="resume"
          itemId="resume"
          kind="pdf"
          label="Downloadable resume"
          value={{ url: resume.pdfUrl, path: resume.pdfPath, name: resume.pdfName }}
          queueDelete={editor.queueDelete}
          onChange={(asset) => editor.setValue((current) => ({ ...current, pdfUrl: asset.url, pdfPath: asset.path, pdfName: asset.name }))}
        />
      </EditorSection>

      <EditorSection number="03" title="Timeline" meta={resume.timeline.length + " / 20"}>
        <div className="admin-card-list">
          {resume.timeline.map((item, index) => (
            <article className="admin-edit-card" key={item.id}>
              <ItemHeader
                index={index}
                title={item.title}
                subtitle={item.year}
                first={index === 0}
                last={index === resume.timeline.length - 1}
                onMoveUp={() => update("timeline", moveArrayItem(resume.timeline, index, -1))}
                onMoveDown={() => update("timeline", moveArrayItem(resume.timeline, index, 1))}
                onRemove={() => update("timeline", resume.timeline.filter((_, itemIndex) => itemIndex !== index))}
              />
              <div className="admin-form-grid">
                <Field label="Year / date" value={item.year} onChange={(value) => updateItem(index, "year", value)} required />
                <Field label="Title" value={item.title} onChange={(value) => updateItem(index, "title", value)} required />
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full />
              </div>
            </article>
          ))}
        </div>
        {resume.timeline.length < 20 && (
          <button type="button" className="admin-add" onClick={() => update("timeline", [...resume.timeline, { id: createContentId("resume-item"), year: "", title: "", description: "" }])}>
            + Add timeline item
          </button>
        )}
      </EditorSection>
    </EditorPage>
  );
}
