"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, GraduationCap, Plus, Trash2, UserRound } from "lucide-react";
import ProfileImageEditor from "@/components/ProfileImageEditor";
import { apiRequest, uploadService } from "@/services/apiClient";

function TagsInput({ id, field, value = [], onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().replace(/,$/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((item) => item !== tag))} className="text-teal-700 hover:text-teal-950">
            &times;
          </button>
        </span>
      ))}
      <input
        id={id}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={value.length ? "" : field.placeholder}
        className="min-w-28 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function ProfileField({ field, id, value, onChange }) {
  const baseClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100";

  return (
    <div className={field.fullWidth ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {field.label}
      </label>
      {field.type === "tags" ? (
        <TagsInput id={id} field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />
      ) : field.type === "textarea" ? (
        <textarea
          id={id}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseClass} resize-y`}
        />
      ) : field.type === "select" ? (
        <select id={id} value={value || ""} onChange={(event) => onChange(event.target.value)} className={baseClass}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.type === "file" ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5">
          <input id={id} type="file" accept={field.accept} onChange={(event) => onChange(event.target.files?.[0] || null)} className="block w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:font-semibold file:text-teal-700 hover:file:bg-teal-100" />
          {value?.name && <p className="mt-1 truncate text-xs text-slate-500">{value.name}</p>}
        </div>
      ) : (
        <input
          id={id}
          type={field.type || "text"}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

export function ProfileSetup({ role, config }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [profileImageEditorFile, setProfileImageEditorFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [repeatableValues, setRepeatableValues] = useState(() =>
    Object.fromEntries(config.sections.filter((section) => section.repeatable).map((section) => [section.id, [{}]]))
  );
  const sections = config.sections.filter((section) => (section.step || 1) === step);
  const totalSteps = Math.max(...config.sections.map((section) => section.step || 1));

  const updateValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  useEffect(() => () => {
    if (profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
  }, [profileImagePreviewUrl]);

  const handleProfileImageApply = (file) => {
    if (profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
    setProfileImagePreviewUrl(URL.createObjectURL(file));
    updateValue("profileImage", file);
    setProfileImageEditorFile(null);
  };

  const updateRepeatedValue = (sectionId, index, name, value) => {
    setRepeatableValues((current) => ({
      ...current,
      [sectionId]: current[sectionId].map((item, itemIndex) => itemIndex === index ? { ...item, [name]: value } : item),
    }));
  };

  const addRepeatedItem = (sectionId) => {
    setRepeatableValues((current) => ({ ...current, [sectionId]: [...current[sectionId], {}] }));
  };

  const removeRepeatedItem = (sectionId, index) => {
    setRepeatableValues((current) => ({
      ...current,
      [sectionId]: current[sectionId].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      let profile = { ...values };
      if (values.profileImage instanceof File) {
        const uploadResult = await uploadService.uploadAvatar(values.profileImage);
        profile.profileIcon = uploadResult?.data?.url || uploadResult?.url || "";
      }
      delete profile.profileImage;
      await apiRequest("/auth/me", "PUT", {
        profile,
        sections: repeatableValues,
        role,
      });
      setSaveMessage("Profile setup saved successfully!");
    } catch (err) {
      setSaveMessage(err.message || "Failed to save profile. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-300 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 flex items-center gap-2 px-1 text-white sm:mb-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <GraduationCap className="h-5 w-5 text-teal-700" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight">ShowMySkills</Link>
        </header>

        <div className="rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 sm:rounded-3xl sm:p-7 md:p-10">
          <div className="relative mb-6 flex min-h-10 items-center justify-center sm:mb-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} aria-label="Go back" className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{config.title}</h1>
              {totalSteps > 1 && <p className="mt-1 text-xs text-slate-400">Step {step} of {totalSteps}</p>}
            </div>
          </div>

          <div className="relative mb-8 h-28 rounded-2xl bg-[#F7F9F9] sm:h-36">
            <label htmlFor="cover-image" className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl text-sm text-slate-400 hover:bg-amber-50/50">
              Add a cover image
              <input id="cover-image" type="file" accept="image/*" onChange={(event) => updateValue("coverImage", event.target.files?.[0] || null)} className="sr-only" />
            </label>
            {values.coverImage?.name && <span className="absolute right-3 top-3 max-w-48 truncate rounded bg-white/90 px-2 py-1 text-xs text-slate-600">{values.coverImage.name}</span>}
            <label htmlFor="profile-image" aria-label={config.avatarLabel} className="absolute -bottom-5 left-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow-sm sm:-bottom-7 sm:left-6 sm:h-24 sm:w-24">
              {profileImagePreviewUrl ? (
                <img src={profileImagePreviewUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : role === "student" ? (
                <UserRound className="h-12 w-12 sm:h-14 sm:w-14" />
              ) : (
                <span className="text-sm font-bold sm:text-base">LOGO</span>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-slate-700 shadow">
                <Camera className="h-4 w-4" />
              </span>
              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
                    setSaveMessage("Only JPEG, PNG, WebP, and SVG images are allowed.");
                    event.target.value = "";
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setSaveMessage("Profile image must be under 5MB.");
                    event.target.value = "";
                    return;
                  }
                  setSaveMessage("");
                  setProfileImageEditorFile(file);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
            {values.profileImage?.name && <span className="absolute -bottom-8 left-28 max-w-48 truncate text-xs text-slate-500 sm:left-36">{values.profileImage.name}</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 pt-3 sm:pt-4">
            {sections.map((section) => (
              <section key={section.id}>
                <div className="mb-3 flex items-center justify-center">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">{section.title}</h2>
                  {section.repeatable && (
                    <button type="button" onClick={() => addRepeatedItem(section.id)} aria-label={section.addLabel} title={section.addLabel} className="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-700">
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {section.repeatable ? (
                  <div className="space-y-4">
                    {repeatableValues[section.id].map((item, index) => (
                      <div key={`${section.id}-${index}`} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        {repeatableValues[section.id].length > 1 && (
                          <button type="button" onClick={() => removeRepeatedItem(section.id, index)} aria-label={`Remove ${section.title.toLowerCase()}`} className="absolute -right-1 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 shadow hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {section.fields.map((field) => (
                          <ProfileField
                            key={field.name}
                            id={`${section.id}-${index}-${field.name}`}
                            field={field}
                            value={item[field.name]}
                            onChange={(value) => updateRepeatedValue(section.id, index, field.name, value)}
                          />
                        ))}
                      </div>
                    ))}
                    <button type="button" onClick={() => addRepeatedItem(section.id)} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                      + {section.addLabel}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {section.fields.map((field) => (
                      <ProfileField
                        key={field.name}
                        id={`${section.id}-${field.name}`}
                        field={field}
                        value={values[field.name]}
                        onChange={(value) => updateValue(field.name, value)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button type="submit" className="w-full rounded-xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto sm:min-w-52">
                {step < totalSteps ? "Save & Next" : "Save"}
              </button>
            </div>
            {saveMessage && <p role="status" className="text-center text-sm text-amber-700">{saveMessage}</p>}
          </form>
        </div>
        {profileImageEditorFile && (
          <ProfileImageEditor
            file={profileImageEditorFile}
            onCancel={() => setProfileImageEditorFile(null)}
            onApply={handleProfileImageApply}
          />
        )}
      </div>
    </main>
  );
}
