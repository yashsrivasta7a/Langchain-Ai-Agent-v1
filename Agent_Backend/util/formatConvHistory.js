export function formatConvHistory(history) {
  if (!history || !Array.isArray(history)) return "";

  return history
    .map((msg) => {
      const speaker = msg.role === "user" ? "User" : "AI";
      return `${speaker}: ${msg.text}`;
    })
    .join("\n");
}
