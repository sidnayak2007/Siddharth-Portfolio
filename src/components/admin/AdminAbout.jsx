import profileImage from "../../assets/profile.png";
import { aboutFallback, createContentId } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import { moveArrayItem } from "../../utils/array";
import { safeHref } from "../../utils/url";
import About from "../sections/About";
import { CheckboxField, EditorPage, EditorSection, EntryCard, Field, MediaUploadField, StringList } from "./AdminEditorUI";

export default function AdminAbout() {
  const editor = useAdminPortfolioDocument("about", aboutFallback);
  const about = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));
  const updateItem = (field, index, key, value) => update(field, (about[field] || []).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const remove = (field, index) => update(field, about[field].filter((_, itemIndex) => itemIndex !== index));
  const move = (field, index, direction) => update(field, moveArrayItem(about[field], index, direction));

  const save = () => {
    const clean = {
      ...about,
      eyebrow: String(about.eyebrow || "").trim(),
      name: String(about.name || "").trim(),
      headline: String(about.headline || "").trim(),
      location: String(about.location || "").trim(),
      intro: String(about.intro || "").trim(),
      description: String(about.description || "").trim(),
      quote: String(about.quote || "").trim(),
      tags: (about.tags || []).map((item) => String(item).trim()).filter(Boolean),
      links: (about.links || []).map((item) => ({ ...item, label: String(item.label || "").trim(), url: String(item.url || "").trim(), visible: item.visible !== false })).filter((item) => item.label || item.url),
      stats: (about.stats || []).map((item) => ({ ...item, value: String(item.value || "").trim(), label: String(item.label || "").trim(), visible: item.visible !== false })).filter((item) => item.value || item.label),
      focus: (about.focus || []).map((item, index) => ({ ...item, number: String(item.number || "").trim() || String(index + 1).padStart(2, "0"), title: String(item.title || "").trim(), text: String(item.text || "").trim(), visible: item.visible !== false })).filter((item) => item.title || item.text),
    };
    const errors = [];
    if (!clean.name) errors.push("Name is required.");
    if (!clean.headline) errors.push("Headline is required.");
    clean.links.forEach((item, index) => {
      if (!item.label || !safeHref(item.url)) errors.push(`Professional link ${index + 1} needs a label and a valid URL.`);
    });
    editor.save(clean, errors);
  };

  return (
    <EditorPage sectionId="about" number="01" title="About" description="Edit your public profile and the details behind it." editor={editor} onSave={save} PreviewComponent={About}>
      <EditorSection number="01" title="Profile" description="Your name, photo and headline appear first.">
        <MediaUploadField sectionId="about" itemId="profile" label="Profile picture" fallbackUrl={profileImage} value={{ url: about.photoUrl, path: about.photoPath, name: about.photoName }} queueDelete={editor.queueDelete} registerUpload={editor.registerUpload} onChange={(asset) => editor.setValue((current) => ({ ...current, photoUrl: asset.url, photoPath: asset.path, photoName: asset.name }))} />
        <div className="admin-form-grid">
          <Field label="Full name" value={about.name} onChange={(value) => update("name", value)} required maxLength={120} />
          <Field label="Location" value={about.location} onChange={(value) => update("location", value)} placeholder="City, country" />
          <Field label="Professional headline" value={about.headline} onChange={(value) => update("headline", value)} multiline full required maxLength={300} />
          <Field label="Introduction" value={about.intro} onChange={(value) => update("intro", value)} multiline full rows={3} />
          <Field label="Detailed description" value={about.description} onChange={(value) => update("description", value)} multiline full rows={5} />
          <Field label="Personal quote" value={about.quote} onChange={(value) => update("quote", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Areas of interest" meta={`${(about.tags || []).length} / 12`}>
        <StringList values={about.tags || []} onChange={(value) => update("tags", value)} addLabel="Add area" placeholder="Business, product, technology…" max={12} />
      </EditorSection>

      <EditorSection number="03" title="Professional links" description="Only visible links appear on the public About page." meta={`${(about.links || []).length} / 12`}>
        <div className="admin-card-list">
          {(about.links || []).map((item, index) => (
            <EntryCard key={item.id || index} title={item.label} index={index} first={index === 0} last={index === about.links.length - 1} onMoveUp={() => move("links", index, -1)} onMoveDown={() => move("links", index, 1)} onRemove={() => remove("links", index)}>
              <div className="admin-form-grid">
                <Field label="Label" value={item.label} onChange={(value) => updateItem("links", index, "label", value)} required />
                <Field label="URL" value={item.url} onChange={(value) => updateItem("links", index, "url", value)} type="url" required />
                <CheckboxField label="Show on public profile" checked={item.visible !== false} onChange={(value) => updateItem("links", index, "visible", value)} />
              </div>
            </EntryCard>
          ))}
        </div>
        {(about.links || []).length < 12 && <button type="button" className="admin-add" onClick={() => update("links", [...(about.links || []), { id: createContentId("about-link"), label: "", url: "", visible: false }])}>+ Add professional link</button>}
      </EditorSection>

      <EditorSection number="04" title="Focus areas" meta={`${(about.focus || []).length} / 8`}>
        <div className="admin-card-list">
          {(about.focus || []).map((item, index) => (
            <EntryCard key={item.id || index} title={item.title} index={index} first={index === 0} last={index === about.focus.length - 1} onMoveUp={() => move("focus", index, -1)} onMoveDown={() => move("focus", index, 1)} onRemove={() => remove("focus", index)}>
              <div className="admin-form-grid">
                <Field label="Title" value={item.title} onChange={(value) => updateItem("focus", index, "title", value)} required />
                <Field label="Description" value={item.text} onChange={(value) => updateItem("focus", index, "text", value)} multiline full />
                <CheckboxField label="Show focus area" checked={item.visible !== false} onChange={(value) => updateItem("focus", index, "visible", value)} />
              </div>
            </EntryCard>
          ))}
        </div>
        {(about.focus || []).length < 8 && <button type="button" className="admin-add" onClick={() => update("focus", [...(about.focus || []), { id: createContentId("focus"), number: "", title: "", text: "", visible: false }])}>+ Add focus area</button>}
      </EditorSection>

      <EditorSection number="05" title="Selected highlights" description="Short facts are optional; keep only the ones that add useful context." meta={`${(about.stats || []).length} / 8`}>
        <div className="admin-card-list">
          {(about.stats || []).map((item, index) => (
            <EntryCard key={item.id || index} title={item.label || item.value} index={index} first={index === 0} last={index === about.stats.length - 1} onMoveUp={() => move("stats", index, -1)} onMoveDown={() => move("stats", index, 1)} onRemove={() => remove("stats", index)}>
              <div className="admin-form-grid">
                <Field label="Value" value={item.value} onChange={(value) => updateItem("stats", index, "value", value)} />
                <Field label="Label" value={item.label} onChange={(value) => updateItem("stats", index, "label", value)} />
                <CheckboxField label="Show highlight" checked={item.visible !== false} onChange={(value) => updateItem("stats", index, "visible", value)} />
              </div>
            </EntryCard>
          ))}
        </div>
        {(about.stats || []).length < 8 && <button type="button" className="admin-add" onClick={() => update("stats", [...(about.stats || []), { id: createContentId("highlight"), value: "", label: "", visible: false }])}>+ Add highlight</button>}
      </EditorSection>
    </EditorPage>
  );
}
