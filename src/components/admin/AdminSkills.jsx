import { createContentId, experienceFallback, projectsFallback, skillsFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Skills from "../sections/Skills";
import { EditorPage, EditorSection, EntryCard, Field } from "./AdminEditorUI";

const asSkill = (value) => typeof value === "string"
  ? { name: value, experienceIds: [], projectIds: [] }
  : { ...value, name: String(value?.name || ""), experienceIds: Array.isArray(value?.experienceIds) ? value.experienceIds : [], projectIds: Array.isArray(value?.projectIds) ? value.projectIds : [] };

function AssociationPicker({ label, items, selected, onChange, nameOf }) {
  if (!items.length) return <p className="admin-inline-empty">No {label.toLowerCase()} have been saved yet.</p>;
  return (
    <fieldset className="admin-association-list">
      <legend>{label}</legend>
      {items.filter((item) => item?.id).map((item) => (
        <label key={item.id}>
          <input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => onChange(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} />
          <span>{nameOf(item)}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default function AdminSkills() {
  const editor = useAdminPortfolioDocument("skills", skillsFallback);
  const { data: experience } = usePublicPortfolioDocument("experience", experienceFallback);
  const { data: projects } = usePublicPortfolioDocument("projects", projectsFallback);
  const data = editor.value;
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateCategory = (index, patch) => update("categories", categories.map((category, itemIndex) => itemIndex === index ? { ...category, ...patch } : category));
  const updateSkill = (categoryIndex, skillIndex, patch) => {
    const skills = (categories[categoryIndex].skills || []).map(asSkill);
    updateCategory(categoryIndex, { skills: skills.map((skill, index) => index === skillIndex ? { ...skill, ...patch } : skill) });
  };
  const save = () => {
    const clean = {
      ...data,
      eyebrow: String(data.eyebrow || "").trim(),
      heading: String(data.heading || "").trim(),
      intro: String(data.intro || "").trim(),
      categories: categories.map((category) => ({
        ...category,
        title: String(category.title || "").trim(),
        skills: (Array.isArray(category.skills) ? category.skills : []).map(asSkill).map((skill) => ({ ...skill, name: skill.name.trim(), experienceIds: skill.experienceIds, projectIds: skill.projectIds })),
      })),
    };
    const errors = [];
    const names = new Set();
    if (!clean.heading) errors.push("Page heading is required.");
    clean.categories.forEach((category, index) => {
      if (!category.title) errors.push(`Category ${index + 1} needs a title.`);
      category.skills.forEach((skill) => {
        if (!skill.name) errors.push(`A skill in ${category.title || `category ${index + 1}`} needs a name.`);
        const name = skill.name.toLocaleLowerCase();
        if (name && names.has(name)) errors.push(`Duplicate skill: ${skill.name}.`);
        names.add(name);
      });
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="skills" number="04" title="Skills" description="Group skills and connect them to work you have done." editor={editor} onSave={save} PreviewComponent={Skills}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Categories" description="Business, finance, marketing, technical and custom groups are all welcome." meta={`${categories.length} / 12`}>
        <div className="admin-card-list">
          {categories.map((category, categoryIndex) => {
            const skills = (Array.isArray(category.skills) ? category.skills : []).map(asSkill);
            return (
              <EntryCard key={category.id || categoryIndex} title={category.title} subtitle={`${skills.length} skills`} index={categoryIndex} first={categoryIndex === 0} last={categoryIndex === categories.length - 1} onMoveUp={() => update("categories", moveArrayItem(categories, categoryIndex, -1))} onMoveDown={() => update("categories", moveArrayItem(categories, categoryIndex, 1))} onRemove={() => update("categories", categories.filter((_, index) => index !== categoryIndex))}>
                <div className="admin-form-grid"><Field label="Category name" value={category.title} onChange={(value) => updateCategory(categoryIndex, { title: value })} required full /></div>
                <div className="admin-subeditor">
                  <h3>Skills</h3>
                  {skills.length === 0 && <p className="admin-inline-empty">Add the first skill to this category.</p>}
                  {skills.map((skill, skillIndex) => (
                    <div className="admin-skill-entry" key={skill.id || skillIndex}>
                      <div className="admin-skill-row">
                        <Field label="Skill name" value={skill.name} onChange={(value) => updateSkill(categoryIndex, skillIndex, { name: value })} required />
                        <button type="button" onClick={() => updateCategory(categoryIndex, { skills: moveArrayItem(skills, skillIndex, -1) })} disabled={skillIndex === 0} aria-label="Move skill up">↑</button>
                        <button type="button" onClick={() => updateCategory(categoryIndex, { skills: moveArrayItem(skills, skillIndex, 1) })} disabled={skillIndex === skills.length - 1} aria-label="Move skill down">↓</button>
                        <button type="button" className="admin-danger-text" onClick={() => { if (window.confirm(`Remove ${skill.name || "this skill"}?`)) updateCategory(categoryIndex, { skills: skills.filter((_, index) => index !== skillIndex) }); }}>Remove</button>
                      </div>
                      <div className="admin-associations">
                        <AssociationPicker label="Related experience" items={Array.isArray(experience.items) ? experience.items : []} selected={skill.experienceIds} onChange={(ids) => updateSkill(categoryIndex, skillIndex, { experienceIds: ids })} nameOf={(item) => [item.role, item.organization].filter(Boolean).join(" at ")} />
                        <AssociationPicker label="Related projects" items={Array.isArray(projects.items) ? projects.items : []} selected={skill.projectIds} onChange={(ids) => updateSkill(categoryIndex, skillIndex, { projectIds: ids })} nameOf={(item) => item.title || "Project"} />
                      </div>
                    </div>
                  ))}
                  {skills.length < 24 && <button type="button" className="admin-add" onClick={() => updateCategory(categoryIndex, { skills: [...skills, { id: createContentId("skill"), name: "", experienceIds: [], projectIds: [] }] })}>+ Add skill</button>}
                </div>
              </EntryCard>
            );
          })}
        </div>
        {categories.length < 12 && <button type="button" className="admin-add" onClick={() => update("categories", [...categories, { id: createContentId("skill-category"), title: "", skills: [] }])}>+ Add category</button>}
      </EditorSection>
    </EditorPage>
  );
}
