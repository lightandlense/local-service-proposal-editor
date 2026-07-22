export interface UploadedFile {
  name: string;
  buffer: Buffer;
}

export async function extractText(file: UploadedFile): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop();

  switch (ext) {
    case "txt":
    case "md":
      return file.buffer.toString("utf-8").trim();

    case "pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: file.buffer });
      const { text } = await parser.getText();
      await parser.destroy();
      return text.trim();
    }

    case "docx": {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      return value.trim();
    }

    default:
      throw new Error(`extractText: unsupported file type ".${ext ?? ""}"`);
  }
}
