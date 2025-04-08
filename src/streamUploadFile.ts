import {ChatContextType} from "./types.ts";
import {updateFilesList} from "./files.ts";

export const streamUploadFile = (
  ctx: ChatContextType,
  file: File,
  apiUrl: string,
  apiKey: string,
  fileRole: string,
) => {
  const uploadUrl = `${apiUrl}/files/upload`;
  let aborted = false;

  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Create a new ongoing upload entry
  const newOngoing = {
    id: randomId,
    name: file.name,
    status: "in_progress",
    show_scope: "knowledge_documents",
    percent: 0
  };
  ctx.setOngoings([...ctx.ongoings, newOngoing]);

  // Create an XMLHttpRequest for better upload control
  const xhr = new XMLHttpRequest();
  xhr.open('POST', uploadUrl, true);

  // Set headers
  xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
  xhr.setRequestHeader('X-File-Role', fileRole);
  xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');

  // Track upload progress
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);

      const currentOngoings = ctx.ongoings;
      const ongoingIndex = currentOngoings.findIndex(o => o.id === randomId);

      if (ongoingIndex !== -1) {
        const updatedOngoing = {
          ...currentOngoings[ongoingIndex],
          status: "in_progress",
          percent
        };
        const updatedOngoings = [...currentOngoings];
        updatedOngoings[ongoingIndex] = updatedOngoing;
        ctx.setOngoings(updatedOngoings);
      }
    }
  };

  // Handle response
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Success
      try {
        const result = JSON.parse(xhr.responseText);

        // Remove ongoing entry
        const updatedOngoings = ctx.ongoings.filter(o => o.id !== randomId);
        ctx.setOngoings(updatedOngoings);

        updateFilesList(ctx);
      } catch (error) {
        console.error("Error parsing response:", error);
        handleUploadError("Failed to parse server response");
      }
    } else {
      // Error
      handleUploadError(`Upload failed: ${xhr.statusText}`);
    }
  };

  // Handle network errors
  xhr.onerror = () => {
    handleUploadError("Network error occurred");
  };

  // Handle abort
  xhr.onabort = () => {
    const updatedOngoings = ctx.ongoings.filter(o => o.id !== randomId);
    ctx.setOngoings(updatedOngoings);
  };

  // Helper function to handle upload errors
  const handleUploadError = (errorMessage) => {
    const currentOngoings = ctx.ongoings;
    const ongoingIndex = currentOngoings.findIndex(o => o.id === randomId);

    if (ongoingIndex !== -1) {
      const updatedOngoing = {
        ...currentOngoings[ongoingIndex],
        status: "failed",
        error_text: errorMessage
      };
      const updatedOngoings = [...currentOngoings];
      updatedOngoings[ongoingIndex] = updatedOngoing;
      ctx.setOngoings(updatedOngoings);
    }

    console.error(errorMessage);
  };

  // Send the file
  xhr.send(file);

  // Return abort function
  return () => {
    aborted = true;
    xhr.abort();
  };
};