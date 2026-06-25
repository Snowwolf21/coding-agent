
import Editor from "@monaco-editor/react";

interface Props {
  code: string;
  onChange: (value: string) => void;
}

export default function Edit({
  code,
  onChange,
}: Props) {
  return (
    <Editor
      height="90vh"
      defaultLanguage="typescript"
      value={code}
      onChange={(value) =>
        onChange(value || "")
      }
    />
  );
}