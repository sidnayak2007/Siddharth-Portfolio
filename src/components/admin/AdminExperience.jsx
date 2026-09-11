import { createContentId, experienceFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  CheckboxField,
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
  StringList,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

const emptyExperience = () => ({
  id: createContentId("experience"),
  role: "",
  organization: "",
  type: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  summary: "",
  highlights: [],
});

export default function AdminExperience() {
  const editor = useAdminPortfolioDocument("experience", experienceFallback);
  const experience = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => update("items", experience.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const remove = (index) => {
    const item = experience.items[index];
    if (window.confirm("Remove " + (item.role || "this experience") + "?")) {
      update("items", experience.items.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  const save = () => {
    const clean = {
      eyebrow: experience.eyebrow.trim(),
      heading: experience.heading.trim(),
      intro: experience.intro.trim(),
      items: experience.items.map((item) => ({
        ...item,
        role: item.role.trim(),
        organization: item.organization.trim(),
        type: item.type.trim(),
        location: item.location.trim(),
        startDate: item.startDate.trim(),
        endDate: item.current ? "" : item.endDate.trim(),
        summary: item.summary.trim(),
        highlights: item.highlights.map((value) => value.trim()).filter(Boolean),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.role) errors.push("Experience " + (index + 1) + " needs a role.");
      if (!item.organization) errors.push("Experience " + (index + 1) + " needs an organisation.");
      if (!item.startDate) errors.push("Experience " + (index + 1) + " needs a start date.");
      if (!item.current && !item.endDate) errors.push("Experience " + (index + 1) + " needs an end date or must be current.");
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="experience" number="02" title="Experience" description="Manage internships, leadership roles and other experiences." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={experience.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={experience.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={experience.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Experience entries" meta={experience.items.length + " / 20"}>
        <div className="admin-card-list">
          {experience.items.map((item, index) => (
            <article className="admin-edit-card admin-experience-card" key={item.id}>
              <ItemHeader
                index={index}
                title={item.role}
                subtitle={item.organization}
                first={index === 0}
                last={index === experience.items.length - 1}
                onMoveUp={() => update("items", moveArrayItem(experience.items, index, -1))}
                onMoveDown={() => update("items", moveArrayItem(experience.items, index, 1))}
                onRemove={() => remove(index)}
              />
              <div className="admin-form-grid">
                <Field label="Role" value={item.role} onChange={(value) => updateItem(index, "role", value)} required />
                <Field label="Organisation" value={item.organization} onChange={(value) => updateItem(index, "organization", value)} required />
                <Field label="Type" value={item.type} onChange={(value) => updateItem(index, "type", value)} placeholder="Internship, Leadership…" />
                <Field label="Location" value={item.location} onChange={(value) => updateItem(index, "location", value)} />
                <Field label="Start date/year" value={item.startDate} onChange={(value) => updateItem(index, "startDate", value)} required />
                <Field label="End date/year" value={item.endDate} onChange={(value) => updateItem(index, "endDate", value)} disabled={item.current} />
                <div className="admin-field-full">
                  <CheckboxField label="Current role" checked={item.current} onChange={(value) => updateItem(index, "current", value)} description="Shows Present instead of an end date." />
                </div>
                <Field label="Summary" value={item.summary} onChange={(value) => updateItem(index, "summary", value)} multiline full rows={5} />
              </div>
              <div className="admin-subeditor">
                <h3>Highlights</h3>
                <StringList values={item.highlights} onChange={(value) => updateItem(index, "highlights", value)} addLabel="Add highlight" placeholder="Achievement or responsibility" />
              </div>
            </article>
          ))}
        </div>
        {experience.items.length < 20 && <button type="button" className="admin-add" onClick={() => update("items", [...experience.items, emptyExperience()])}>+ Add experience</button>}
      </EditorSection>
    </EditorPage>
  );
}
