import { createContentId, projectsFallback } from "../../data/portfolioDefaults";
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

const emptyProject = () => ({
  id: createContentId("project"),
  title: "",
  type: "",
  description: "",
  technologies: [],
  projectUrl: "",
  githubUrl: "",
  imageUrl: "",
  imagePath: "",
  featured: false,
});

export default function AdminProjects() {
  const editor = useAdminPortfolioDocument("projects", projectsFallback);
  const projects = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const replaceItem = (index, nextItem) => update("items", projects.items.map((item, itemIndex) => itemIndex === index ? nextItem : item));
  const updateItem = (index, field, value) => replaceItem(index, { ...projects.items[index], [field]: value });

  const remove = (index) => {
    const item = projects.items[index];
    if (!window.confirm("Remove " + (item.title || "this project") + "?")) return;
    if (item.imagePath) editor.queueDelete(item.imagePath);
    update("items", projects.items.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = () => {
    const clean = {
      eyebrow: projects.eyebrow.trim(),
      heading: projects.heading.trim(),
      intro: projects.intro.trim(),
      items: projects.items.map((item) => ({
        ...item,
        title: item.title.trim(),
        type: item.type.trim(),
        description: item.description.trim(),
        technologies: item.technologies.map((value) => value.trim()).filter(Boolean),
        projectUrl: item.projectUrl.trim(),
        githubUrl: item.githubUrl.trim(),
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.title) errors.push("Project " + (index + 1) + " needs a title.");
      if (!item.description) errors.push("Project " + (index + 1) + " needs a description.");
      [item.projectUrl, item.githubUrl].filter(Boolean).forEach((url) => {
        if (!/^https?:\/\//i.test(url)) errors.push("Project " + (index + 1) + " links must begin with http:// or https://.");
      });
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="projects" number="03" title="Projects" description="Manage project content, thumbnails, technologies and verified links." editor={editor} onSave={save}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={projects.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={projects.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={projects.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Project entries" meta={projects.items.length + " / 24"}>
        <div className="admin-card-list">
          {projects.items.map((item, index) => (
            <article className="admin-edit-card" key={item.id}>
              <ItemHeader
                index={index}
                title={item.title}
                subtitle={item.type}
                first={index === 0}
                last={index === projects.items.length - 1}
                onMoveUp={() => update("items", moveArrayItem(projects.items, index, -1))}
                onMoveDown={() => update("items", moveArrayItem(projects.items, index, 1))}
                onRemove={() => remove(index)}
              />
              <div className="admin-form-grid">
                <Field label="Project title" value={item.title} onChange={(value) => updateItem(index, "title", value)} required />
                <Field label="Type" value={item.type} onChange={(value) => updateItem(index, "type", value)} placeholder="Web app, game, platform…" />
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full rows={5} required />
                <Field label="Live project URL" value={item.projectUrl} onChange={(value) => updateItem(index, "projectUrl", value)} type="url" />
                <Field label="GitHub URL" value={item.githubUrl} onChange={(value) => updateItem(index, "githubUrl", value)} type="url" />
                <div className="admin-field-full">
                  <CheckboxField label="Featured project" checked={item.featured} onChange={(value) => updateItem(index, "featured", value)} description="Adds a Featured label on the public card." />
                </div>
              </div>
              <div className="admin-subeditor">
                <h3>Technologies</h3>
                <StringList values={item.technologies} onChange={(value) => updateItem(index, "technologies", value)} addLabel="Add technology" placeholder="React, Firebase…" max={16} />
              </div>
              <MediaUploadField
                sectionId="projects"
                itemId={item.id}
                label="Project thumbnail (optional)"
                value={{ url: item.imageUrl, path: item.imagePath }}
                queueDelete={editor.queueDelete}
                onChange={(asset) => replaceItem(index, { ...item, imageUrl: asset.url, imagePath: asset.path })}
              />
            </article>
          ))}
        </div>
        {projects.items.length < 24 && <button type="button" className="admin-add" onClick={() => update("items", [...projects.items, emptyProject()])}>+ Add project</button>}
      </EditorSection>
    </EditorPage>
  );
}
