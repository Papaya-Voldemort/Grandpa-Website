import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableRow, TableHeader, TableCell, Table } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';

function ToolbarButton({
  active = false,
  children,
  onClick
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: active ? "is-active" : "",
      onClick: (event) => {
        event.preventDefault();
        onClick();
      },
      children
    }
  );
}
function RichTextEditor({ initialContent, onChange }) {
  const [mode, setMode] = useState("visual");
  const [value, setValue] = useState(initialContent);
  const fileInputRef = useRef(null);
  const genericFileInputRef = useRef(null);
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] }
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: "noreferrer noopener" }
      }),
      Image.configure({
        inline: false,
        allowBase64: true
      }),
      Placeholder.configure({
        placeholder: "Write the article content here..."
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      })
    ],
    []
  );
  const editor = useEditor({
    extensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: "editor-area"
      }
    },
    onUpdate({ editor: editor2 }) {
      const html = editor2.getHTML();
      setValue(html);
      onChange?.(html);
    }
  });
  useEffect(() => {
    setValue(initialContent);
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);
  useEffect(() => {
    if (!editor || mode !== "visual") {
      return;
    }
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, mode, value]);
  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const payload = await response.json();
    if (!payload.url) {
      throw new Error("Upload did not return a usable URL.");
    }
    return payload.url;
  }
  async function handleImageSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) {
      return;
    }
    try {
      const url = await uploadFile(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Image upload failed.");
    }
  }
  async function handleGenericFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) {
      return;
    }
    try {
      const url = await uploadFile(file);
      const fileName = file.name;
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank" rel="noreferrer noopener">${fileName}</a>`).run();
    } catch (error) {
      alert(error instanceof Error ? error.message : "File upload failed.");
    }
  }
  if (!editor) {
    return /* @__PURE__ */ jsx("div", { className: "editor-area", children: "Loading editor..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "editor-shell", children: [
    /* @__PURE__ */ jsxs("div", { className: "editor-toolbar editor-toolbar--modes", children: [
      /* @__PURE__ */ jsx(ToolbarButton, { active: mode === "visual", onClick: () => setMode("visual"), children: "Visual" }),
      /* @__PURE__ */ jsx(ToolbarButton, { active: mode === "html", onClick: () => setMode("html"), children: "HTML" }),
      /* @__PURE__ */ jsx(ToolbarButton, { active: mode === "preview", onClick: () => setMode("preview"), children: "Preview" })
    ] }),
    mode === "visual" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "editor-toolbar", children: [
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), children: /* @__PURE__ */ jsx("strong", { children: "B" }) }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), children: /* @__PURE__ */ jsx("em", { children: "I" }) }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run(), children: /* @__PURE__ */ jsx("u", { children: "U" }) }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run(), children: /* @__PURE__ */ jsx("s", { children: "S" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("heading", { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), children: "H1" }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), children: "H2" }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), children: "H3" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), children: "• List" }),
          /* @__PURE__ */ jsx(ToolbarButton, { active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), children: "1. List" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().setTextAlign("left").run(), children: "Left" }),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().setTextAlign("center").run(), children: "Center" }),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().setTextAlign("right").run(), children: "Right" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              onClick: () => {
                const url = window.prompt("Paste link URL");
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              },
              active: editor.isActive("link"),
              children: "🔗 Link"
            }
          ),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().unsetLink().run(), disabled: !editor.isActive("link"), children: "❌ Link" }),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().unsetAllMarks().run(), children: "🧹 Clear" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              onClick: () => {
                fileInputRef.current?.click();
              },
              children: "🖼️ Image"
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              onClick: () => {
                genericFileInputRef.current?.click();
              },
              children: "📁 File"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), children: '" Quote' }),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), children: "Code" }),
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().setHorizontalRule().run(), children: "Line" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "toolbar-group", children: [
          /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), children: "Table" }),
          editor.isActive("table") && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().addColumnAfter().run(), children: "Col+" }),
            /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().addRowAfter().run(), children: "Row+" }),
            /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => editor.chain().focus().deleteTable().run(), children: "Del Table" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(EditorContent, { editor })
    ] }) : null,
    mode === "html" ? /* @__PURE__ */ jsx(
      "textarea",
      {
        className: "editor-source",
        value,
        onChange: (event) => {
          const html = event.target.value;
          setValue(html);
          onChange?.(html);
        },
        "aria-label": "Raw HTML editor"
      }
    ) : null,
    mode === "preview" ? /* @__PURE__ */ jsx("div", { className: "editor-preview article-body", dangerouslySetInnerHTML: { __html: value } }) : null,
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileInputRef,
        style: { display: "none" },
        type: "file",
        accept: "image/*",
        onChange: handleImageSelect,
        "aria-label": "Upload image"
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: genericFileInputRef,
        style: { display: "none" },
        type: "file",
        onChange: handleGenericFileSelect,
        "aria-label": "Upload file"
      }
    ),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "contentHtml", value, readOnly: true })
  ] });
}

export { RichTextEditor as R };
