import { resumeImageFallback } from "../../data/portfolioDefaults";
import { useAdminPortfolioDocument } from "../../hooks/useAdminPortfolioDocument";
import Resume from "../sections/Resume";
import { EditorPage, EditorSection, MediaUploadField } from "./AdminEditorUI";

export default function AdminResume() {
  const editor = useAdminPortfolioDocument("resume", resumeImageFallback);
  const data = editor.value;
  const previousImage = data.resumeImages?.[0];
  const currentImageUrl = data.imageUrl ?? (typeof previousImage === "string" ? previousImage : previousImage?.url);
  const updateImage = (asset) => editor.setValue((current) => ({
    ...current,
    imageUrl: asset.url,
    imagePath: asset.path,
    imageName: asset.name,
  }));
  const save = () => {
    const imageUrl = String(data.imageUrl || "").trim();
    const errors = imageUrl && !/^https:\/\//i.test(imageUrl)
      ? ["The resume image needs a full HTTPS URL."]
      : [];
    editor.save({
      ...data,
      imageUrl,
      imagePath: String(data.imagePath || ""),
      imageName: String(data.imageName || ""),
    }, errors);
  };

  return (
    <EditorPage
      sectionId="resume"
      number="CV"
      title="Resume image"
      description="Upload one image. The public shortcut displays the entire picture."
      editor={editor}
      onSave={save}
      PreviewComponent={Resume}
    >
      <EditorSection number="01" title="Resume picture" description="JPG, PNG or WebP. Uploading does not publish until you save changes.">
        <MediaUploadField
          label="Resume image"
          value={{ url: currentImageUrl, path: data.imagePath, name: data.imageName }}
          onChange={updateImage}
        />
      </EditorSection>
    </EditorPage>
  );
}
