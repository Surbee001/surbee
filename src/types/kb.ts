export type KBCategory =
  | "PDF"
  | "Image"
  | "Audio"
  | "Video"
  | "Text"
  | "Spreadsheet"
  | "Presentation"
  | "Other";

export interface KBDocumentMeta {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  category: KBCategory;
  addedAt: number;
}

export interface KBDocument extends KBDocumentMeta {
  summary: string;
  keywords?: string[];
}

export interface KBState {
  docsByCategory: Record<KBCategory, KBDocument[]>;
  expandedCategory: KBCategory | null;
  searchQuery: string;
  typeFilter: KBCategory | "All";
}

export function inferCategory(file: File): KBCategory {
  const type = file.type;
  if (type === "application/pdf") return "PDF";
  if (type.startsWith("image/")) return "Image";
  if (type.startsWith("audio/")) return "Audio";
  if (type.startsWith("video/")) return "Video";
  if (type.startsWith("text/")) return "Text";
  if (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel"
  )
    return "Spreadsheet";
  if (
    type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    type === "application/vnd.ms-powerpoint"
  )
    return "Presentation";
  return "Other";
}


