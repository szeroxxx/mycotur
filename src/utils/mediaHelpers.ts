export const getMediaUrl = (
  fileName: string,
  type: "image" | "video" = "image"
): string => {
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
  const URL = process.env.NEXTAUTH_BACKEND_URL;
  const baseUrl = `${URL}/api`;
  const finalUrl = `${baseUrl}/image/${encodedFileName}`;
  return finalUrl;
};
