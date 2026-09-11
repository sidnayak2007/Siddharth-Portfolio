import { createContentId, skillsFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
  StringList,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

export default function AdminSkills() {
  const editor = useAdminPortfolioDocument("skills", skillsFallback);
  const skills = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateCategory = (index, field, value) => update("categories", skills.categories.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const save = () => {
    const clean = {
      eyebrow: skills.eyebrow.trim(),
      heading: skills.heading.trim(),
      intro: skills.intro.trim(),
      categories: skills.categories.map((category) => ({
        ...category,
        title: category.title.trim(),
        skills: category.skills.map((value) => value.trim()).filter(Boolean),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.categories.forEach((category, index) => {
      if (!category.title) errors.push("Skill category " + (index + 1) + " needs a title.");
      if (!category.skills.length) errors.push("Skill category " + (index + 1) + " needs at least one skill.");
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="skills" number="04" title="Skills" description="Organise your tools and capabilities into clear categories." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={skills.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={skills.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={skills.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Skill categories" meta={skills.categories.length + " / 12"}>
        <div className="admin-card-list">
          {skills.categories.map((category, index) => (
            <article className="admin-edit-card" key={category.id}>
              <ItemHeader
                index={index}
                title={category.title}
                first={index === 0}
                last={index === skills.categories.length - 1}
                onMoveUp={() => update("categories", moveArrayItem(skills.categories, index, -1))}
                onMoveDown={() => update("categories", moveArrayItem(skills.categories, index, 1))}
                onRemove={() => update("categories", skills.categories.filter((_, itemIndex) => itemIndex !== index))}
              />
              <div className="admin-form-grid">
                <Field label="Category title" value={category.title} onChange={(value) => updateCategory(index, "title", value)} required full />
              </div>
              <div className="admin-subeditor">
                <h3>Skills</h3>
                <StringList values={category.skills} onChange={(value) => updateCategory(index, "skills", value)} addLabel="Add skill" placeholder="Skill or tool" max={24} />
              </div>
            </article>
          ))}
        </div>
        {skills.categories.length < 12 && (
          <button type="button" className="admin-add" onClick={() => update("categories", [...skills.categories, { id: createContentId("skill-category"), title: "", skills: [] }])}>
            + Add category
          </button>
        )}
      </EditorSection>
    </EditorPage>
  );
}
