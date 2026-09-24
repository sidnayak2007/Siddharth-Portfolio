import { createContentId, projectsFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import Projects from "../sections/Projects";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field, MediaListEditor, MediaUploadField, StringList } from "./AdminEditorUI";

const projectTypes = ["Website", "Web app", "Mobile app", "Game", "Research", "Campaign", "Digital experience", "Other"];
const emptyProject = () => ({ id: createContentId("project"), title: "", type: "", description: "", details: "", startDate: "", endDate: "", technologies: [], skills: [], contributors: [], projectUrl: "", githubUrl: "", imageUrl: "", imagePath: "", media: [], featured: false, visible: false });
const cleanList = (items) => (Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter(Boolean);
function validWebUrl(value) {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname); } catch { return false; }
}

export default function AdminProjects() {
  const editor = useAdminPortfolioDocument("projects", projectsFallback);
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
    const item = items[index];
    [item.imagePath, ...(item.media || []).map((asset) => asset.path)].filter(Boolean).forEach(editor.queueDelete);
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
        title: String(item.title || "").trim(),
        type: String(item.type || "").trim(),
        description: String(item.description || "").trim(),
        details: String(item.details || "").trim(),
        startDate: String(item.startDate || "").trim(),
        endDate: String(item.endDate || "").trim(),
        technologies: cleanList(item.technologies),
        skills: cleanList(item.skills),
        contributors: cleanList(item.contributors),
        projectUrl: String(item.projectUrl || "").trim(),
        githubUrl: String(item.githubUrl || "").trim(),
        media: Array.isArray(item.media) ? item.media.filter((asset) => asset?.url) : [],
        featured: Boolean(item.featured),
        visible: item.visible !== false,
      })),
    };
    const errors = [];
    if (!clean.heading) errors.push("Page heading is required.");
    clean.items.forEach((item, index) => {
      if (!item.title || !item.description) errors.push(`Project ${index + 1} needs a title and description.`);
      if (!validWebUrl(item.projectUrl) || !validWebUrl(item.githubUrl)) errors.push(`Project ${index + 1} needs valid http or https links.`);
      if (item.startDate && item.endDate && /^\d{4}-\d{2}$/.test(item.startDate) && /^\d{4}-\d{2}$/.test(item.endDate) && item.endDate < item.startDate) errors.push(`Project ${index + 1} ends before it starts.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="projects" number="03" title="Projects" description="Manage selected work, galleries and verified links." editor={editor} onSave={save} PreviewComponent={Projects}>
      <EditorSection number="01" title="Page information">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Heading" value={data.heading} onChange={(value) => update("heading", value)} multiline full required />
          <Field label="Introduction" value={data.intro} onChange={(value) => update("intro", value)} multiline full />
        </div>
      </EditorSection>
      <EditorSection number="02" title="Project entries" description="New projects start hidden until you choose to show them." meta={`${items.length} / 24`}>
        <div className="admin-card-list">
          {items.map((item, index) => (
            <EntryCard key={item.id || index} title={item.title} subtitle={item.type} index={index} first={index === 0} last={index === items.length - 1} onMoveUp={() => update("items", moveArrayItem(items, index, -1))} onMoveDown={() => update("items", moveArrayItem(items, index, 1))} onRemove={() => remove(index)}>
              <div className="admin-form-grid">
                <Field label="Project title" value={item.title} onChange={(value) => updateItem(index, "title", value)} required />
                <Field label="Project type" value={item.type} onChange={(value) => updateItem(index, "type", value)} options={[...new Set([...projectTypes, item.type].filter(Boolean))]} />
                <Field label="Description" value={item.description} onChange={(value) => updateItem(index, "description", value)} multiline full required />
                <Field label="Detailed overview" value={item.details} onChange={(value) => updateItem(index, "details", value)} multiline full rows={5} />
                <Field label="Start month" value={item.startDate} onChange={(value) => updateItem(index, "startDate", value)} type="month" />
                <Field label="End month" value={item.endDate} onChange={(value) => updateItem(index, "endDate", value)} type="month" />
                <Field label="Live website URL" value={item.projectUrl} onChange={(value) => updateItem(index, "projectUrl", value)} type="url" />
                <Field label="GitHub URL" value={item.githubUrl} onChange={(value) => updateItem(index, "githubUrl", value)} type="url" />
                <CheckboxField label="Featured project" checked={item.featured} onChange={(value) => updateItem(index, "featured", value)} />
                <CheckboxField label="Show on public portfolio" checked={item.visible !== false} onChange={(value) => updateItem(index, "visible", value)} />
              </div>
              <div className="admin-subeditor"><h3>Technologies</h3><StringList values={item.technologies || []} onChange={(value) => updateItem(index, "technologies", value)} addLabel="Add technology" placeholder="React, Firebase…" max={16} /></div>
              <div className="admin-subeditor"><h3>Associated skills</h3><StringList values={item.skills || []} onChange={(value) => updateItem(index, "skills", value)} addLabel="Add skill" placeholder="Product design, research…" max={16} /></div>
              <div className="admin-subeditor"><h3>Contributors</h3><StringList values={item.contributors || []} onChange={(value) => updateItem(index, "contributors", value)} addLabel="Add contributor" placeholder="Name or team" max={16} /></div>
              <MediaUploadField sectionId="projects" itemId={`${item.id || index}-thumbnail`} label="Project thumbnail" value={{ url: item.imageUrl, path: item.imagePath }} queueDelete={editor.queueDelete} registerUpload={editor.registerUpload} onChange={(asset) => editor.setValue((current) => ({ ...current, items: (current.items || []).map((entry, itemIndex) => (item.id ? entry.id === item.id : itemIndex === index) ? { ...entry, imageUrl: asset.url, imagePath: asset.path } : entry) }))} />
              <MediaListEditor sectionId="projects" itemId={item.id || String(index)} assets={item.media} onChange={(value) => updateItem(index, "media", value)} queueDelete={editor.queueDelete} registerUpload={editor.registerUpload} label="Gallery images" />
            </EntryCard>
          ))}
        </div>
        {items.length < 24 && <button type="button" className="admin-add" onClick={() => update("items", [...items, emptyProject()])}>+ Add project</button>}
      </EditorSection>
    </EditorPage>
  );
}
