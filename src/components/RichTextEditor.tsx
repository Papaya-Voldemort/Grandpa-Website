import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
  initialContent: string;
  onChange?: (html: string) => void;
};

type EditorMode = "visual" | "html" | "preview";

function ToolbarButton({
  active = false,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "is-active" : ""}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ initialContent, onChange }: Props) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [value, setValue] = useState(initialContent);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genericFileInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: "noreferrer noopener" },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Write the article content here...",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: "editor-area",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setValue(html);
      onChange?.(html);
    },
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

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      throw new Error("Upload did not return a usable URL.");
    }

    return payload.url;
  }

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
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

  async function handleGenericFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) {
      return;
    }

    try {
      const url = await uploadFile(file);
      const fileName = file.name;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noreferrer noopener">${fileName}</a>`)
        .run();
    } catch (error) {
      alert(error instanceof Error ? error.message : "File upload failed.");
    }
  }

  if (!editor) {
    return <div className="editor-area">Loading editor...</div>;
  }

  return (
    <div className="editor-shell">
      <div className="editor-toolbar editor-toolbar--modes">
        <ToolbarButton active={mode === "visual"} onClick={() => setMode("visual")}>
          Visual
        </ToolbarButton>
        <ToolbarButton active={mode === "html"} onClick={() => setMode("html")}>
          HTML
        </ToolbarButton>
        <ToolbarButton active={mode === "preview"} onClick={() => setMode("preview")}>
          Preview
        </ToolbarButton>
      </div>

      {mode === "visual" ? (
        <>
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <u>U</u>
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                <s>S</s>
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                H1
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                H2
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                H3
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                • List
              </ToolbarButton>
              <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                1. List
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                Left
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                Center
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                Right
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Paste link URL");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                active={editor.isActive("link")}
              >
                🔗 Link
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
                ❌ Link
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                🧹 Clear
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                🖼️ Image
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  genericFileInputRef.current?.click();
                }}
              >
                📁 File
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
                " Quote
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
                Code
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                Line
              </ToolbarButton>
            </div>

            <div className="toolbar-group">
              <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                Table
              </ToolbarButton>
              {editor.isActive("table") && (
                <>
                  <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()}>Col+</ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()}>Row+</ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()}>Del Table</ToolbarButton>
                </>
              )}
            </div>
          </div>

          <EditorContent editor={editor} />
        </>
      ) : null}

      {mode === "html" ? (
        <textarea
          className="editor-source"
          value={value}
          onChange={(event) => {
            const html = event.target.value;
            setValue(html);
            onChange?.(html);
          }}
          aria-label="Raw HTML editor"
        />
      ) : null}

      {mode === "preview" ? (
        <div className="editor-preview article-body" dangerouslySetInnerHTML={{ __html: value }} />
      ) : null}

      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        aria-label="Upload image"
      />
      <input
        ref={genericFileInputRef}
        style={{ display: "none" }}
        type="file"
        onChange={handleGenericFileSelect}
        aria-label="Upload file"
      />
      <input type="hidden" name="contentHtml" value={value} readOnly />
    </div>
  );
}
