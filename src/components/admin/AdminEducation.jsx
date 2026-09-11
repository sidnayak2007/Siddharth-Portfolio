import { createContentId, educationFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  CheckboxField,
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
  MediaUploadField,
  StringList,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

const emptyEducation = () => ({
  id: createContentId("education"),
  institution: "",
  qualification: "",
  field: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  highlights: [],
  imageUrl: "",
  imagePath: "",
});

export default function AdminEducation() {
  const editor = useAdminPortfolioDocument("education", educationFallback);
  const education = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const replaceItem = (index, nextItem) => update("items", education.items.map((item, itemIndex) => itemIndex === index ? nextItem : item));
  const updateItem = (index, field, value) => replaceItem(index, { ...education.items[index], [field]: value });

  const remove = (index) => {
    const item = education.items[index];
    if (!window.confirm("Remove " + (item.institution || "this education entry") + "?")) return;
    if (item.imagePath) editor.queueDelete(item.imagePath);
    update("items", education.items.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = () => {
    const clean = {
      eyebrow: education.eyebrow.trim(),
      heading: education.heading.trim(),
      intro: education.intro.trim(),
      items: education.items.map((item) => ({
        ...item,
        institution: item.institution.trim(),
        qualification: item.qualification.trim(),
        field: item.field.trim(),
        location: item.location.trim(),
        startDate: item.startDate.trim(),
        endDate: item.current ? "" : item.endDate.trim(),
        description: item.description.trim(),
        highlights: item.highlights.map((value) => value.trim()).filter(Boolean),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.institution) errors.push("Education " + (index + 1) + " needs an institution.");
      if (!item.qualification) errors.push("Education " + (index + 1) + " needs a qualification.");
      if (!item.startDate) errors.push("Education " + (index + 1) + " needs a start date or year.");
      if (!item.current && !item.endDate) errors.push("Education " + (index + 1) + " needs an end date or must be current.");
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="education" number="05" title="Education" description="Manage institutions, qualifications, highlights and institution images." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={education.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={education.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={education.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Education entries" meta={education.items.length + " / 20"}>
        <div className="admin-card-list">
          {education.items.map((item, index) => (
            <article className="admin-edit-card" key={item.id}>
              <ItemHeader
                index={index}
                title={item.institution}
                subtitle={item.qualification}
                first={index === 0}
                last={index === education.items.length - 1}
                onMoveUp={() => update("items", moveArrayItem(education.items, index, -1))}
                onMoveDown={() => update("items", moveArrayItem(education.items, index, 1))}
                onRemove={() => remove(index)}
              />
              <div className="admin-form-grid">
                <Field label="Institution" value={item.institution} onChange={(value) => updateItem(index, "institution", value)} required />
                <Field label="Qualification" value={item.qualification} onChange={(value) => updateItem(index, "qualification", value)} required />
                <Field label="Field" value={item.field} onChange={(value) => updateItem(index, "field", value)} />
                <Field label="Location" value={item.location} onChange={(value) => updateItem(index, "location", value)} />
                <Field label="Start date/year" value={item.startDate} onChange={(value) => updateItem(index, "startDate", value)} required />
                <Field label="End date/year" value={item.endDate} onChange={(value) => updateItem(index, "endDate", value)} disabled={item.current} />
                <div className="admin-field-full">
                  <CheckboxField label="Currently studying here" checked={item.current} onChange={(value) => updateItem(index, "current", value)} description="Shows Present instead of an end date." />
                </div>
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full rows={5} />
              </div>

              <div className="admin-subeditor">
                <h3>Highlights</h3>
                <StringList values={item.highlights} onChange={(value) => updateItem(index, "highlights", value)} addLabel="Add highlight" placeholder="Achievement, result or activity" />
              </div>

              <MediaUploadField
                sectionId="education"
                itemId={item.id}
                label="Institution image (optional)"
                value={{ url: item.imageUrl, path: item.imagePath }}
                queueDelete={editor.queueDelete}
                onChange={(asset) => replaceItem(index, { ...item, imageUrl: asset.url, imagePath: asset.path })}
              />
            </article>
          ))}
        </div>
        {education.items.length < 20 && <button type="button" className="admin-add" onClick={() => update("items", [...education.items, emptyEducation()])}>+ Add education</button>}
      </EditorSection>
    </EditorPage>
  );
}
