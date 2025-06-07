export const getMediaUrl = (
  fileId: string,
): string => {
  const encodedFileId = encodeURIComponent(fileId);
  const URL = process.env.NEXTAUTH_BACKEND_URL;
  const baseUrl = `${URL}/api`;
  const finalUrl = `${baseUrl}/files/${encodedFileId}`;
  return finalUrl;
};
