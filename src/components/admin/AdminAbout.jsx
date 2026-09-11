import { aboutFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import {
  EditorPage,
  EditorSection,
  Field,
  ItemHeader,
  StringList,
} from "./AdminEditorUI";
import { moveArrayItem } from "../../utils/array";

export default function AdminAbout() {
  const editor = useAdminPortfolioDocument("about", aboutFallback);
  const about = editor.value;
  const update = (field, value) => editor.setValue((current) => ({ ...current, [field]: value }));

  const save = () => {
    const clean = {
      eyebrow: about.eyebrow.trim(),
      name: about.name.trim(),
      headline: about.headline.trim(),
      intro: about.intro.trim(),
      description: about.description.trim(),
      quote: about.quote.trim(),
      tags: about.tags.map((item) => item.trim()).filter(Boolean),
      stats: about.stats.map((item) => ({ value: item.value.trim(), label: item.label.trim() })).filter((item) => item.value || item.label),
      focus: about.focus.map((item, index) => ({
        number: item.number.trim() || String(index + 1).padStart(2, "0"),
        title: item.title.trim(),
        text: item.text.trim(),
      })).filter((item) => item.title || item.text),
    };
    const errors = [];
    if (!clean.name) errors.push("Name is required.");
    if (!clean.headline) errors.push("Headline is required.");
    editor.save(clean, errors);
  };

  const updateStat = (index, field, value) => update("stats", about.stats.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const updateFocus = (index, field, value) => update("focus", about.focus.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  return (
    <EditorPage sectionId="about" number="01" title="About" description="Edit the profile content shown on the public About page." editor={editor} onSave={save}>
      <EditorSection number="01" title="Main information" description="The introduction visitors see first.">
        <div className="admin-form-grid">
          <Field label="Eyebrow" value={about.eyebrow} onChange={(value) => update("eyebrow", value)} />
          <Field label="Name" value={about.name} onChange={(value) => update("name", value)} required />
          <Field label="Headline" value={about.headline} onChange={(value) => update("headline", value)} multiline full required />
          <Field label="Intro" value={about.intro} onChange={(value) => update("intro", value)} multiline full />
          <Field label="Description" value={about.description} onChange={(value) => update("description", value)} multiline full rows={6} />
          <Field label="Quote" value={about.quote} onChange={(value) => update("quote", value)} multiline full />
        </div>
      </EditorSection>

      <EditorSection number="02" title="Tags" meta={about.tags.length + " / 12"}>
        <StringList values={about.tags} onChange={(value) => update("tags", value)} addLabel="Add tag" placeholder="Tag" max={12} />
      </EditorSection>

      <EditorSection number="03" title="Statistics" meta={about.stats.length + " / 8"}>
        <div className="admin-card-list">
          {about.stats.map((item, index) => (
            <article className="admin-edit-card" key={index}>
              <ItemHeader
                index={index}
                title={item.label}
                first={index === 0}
                last={index === about.stats.length - 1}
                onMoveUp={() => update("stats", moveArrayItem(about.stats, index, -1))}
                onMoveDown={() => update("stats", moveArrayItem(about.stats, index, 1))}
                onRemove={() => update("stats", about.stats.filter((_, itemIndex) => itemIndex !== index))}
              />
              <div className="admin-form-grid">
                <Field label="Value" value={item.value} onChange={(value) => updateStat(index, "value", value)} />
                <Field label="Label" value={item.label} onChange={(value) => updateStat(index, "label", value)} />
              </div>
            </article>
          ))}
        </div>
        {about.stats.length < 8 && <button type="button" className="admin-add" onClick={() => update("stats", [...about.stats, { value: "", label: "" }])}>+ Add statistic</button>}
      </EditorSection>

      <EditorSection number="04" title="Focus areas" meta={about.focus.length + " / 8"}>
        <div className="admin-card-list">
          {about.focus.map((item, index) => (
            <article className="admin-edit-card" key={index}>
              <ItemHeader
                index={index}
                title={item.title}
                first={index === 0}
                last={index === about.focus.length - 1}
                onMoveUp={() => update("focus", moveArrayItem(about.focus, index, -1))}
                onMoveDown={() => update("focus", moveArrayItem(about.focus, index, 1))}
                onRemove={() => update("focus", about.focus.filter((_, itemIndex) => itemIndex !== index))}
              />
              <div className="admin-form-grid">
                <Field label="Number" value={item.number} onChange={(value) => updateFocus(index, "number", value)} />
                <Field label="Title" value={item.title} onChange={(value) => updateFocus(index, "title", value)} />
                <Field label="Text" value={item.text} onChange={(value) => updateFocus(index, "text", value)} multiline full />
              </div>
            </article>
          ))}
        </div>
        {about.focus.length < 8 && <button type="button" className="admin-add" onClick={() => update("focus", [...about.focus, { number: String(about.focus.length + 1).padStart(2, "0"), title: "", text: "" }])}>+ Add focus area</button>}
      </EditorSection>
    </EditorPage>
  );
}
