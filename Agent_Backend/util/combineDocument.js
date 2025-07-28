export function combineDocument(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
} // ek function hai, pipeline ka part nahi ban sakta directly.
