export const getMediaUrl = (
  fileName: string,
  type: "image" | "video" = "image"
): string => {
  console.log("getMediaUrl - Input fileName::: ", fileName);
  console.log("getMediaUrl - Input type::: ", type);

  let extractedFileName = fileName;

  if (fileName.includes("uploads\\\\")) {
    extractedFileName = fileName.replace(/.*uploads\\\\/, "");
  } else if (fileName.includes("uploads\\")) {
    extractedFileName = fileName.replace(/.*uploads\\/, "");
  } else if (fileName.includes("uploads/")) {
    extractedFileName = fileName.replace(/.*uploads\//, "");
  } else if (fileName.includes("\\")) {
    const parts = fileName.split("\\");
    extractedFileName = parts[parts.length - 1];
  } else if (fileName.includes("/")) {
    const parts = fileName.split("/");
    extractedFileName = parts[parts.length - 1];
  }

  extractedFileName = extractedFileName.replace(/^[\\\/]+/, "");

  const encodedFileName = encodeURIComponent(extractedFileName);
  console.log("getMediaUrl - Extracted fileName:", extractedFileName);
  console.log("getMediaUrl - Encoded fileName:", encodedFileName);

  const baseUrl = "http://localhost:3500/api";

  const finalUrl = `${baseUrl}/image/${encodedFileName}`;

  console.log("getMediaUrl - Final URL:", finalUrl);
  return finalUrl;
};
