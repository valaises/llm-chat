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
  const chunkSize = 1024 * 1024;
  let aborted = false;

  const headers = {
    'Content-Type': 'application/octet-stream',
    'X-File-Name': encodeURIComponent(file.name),
    'X-File-Role': fileRole,
    'Authorization': `Bearer ${apiKey}`
  };

  const controller = new AbortController();
  const { signal } = controller;

  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const uploadWithChunks = async () => {
    try {
      // Create a ReadableStream that reads the file in chunks
      const fileStream = new ReadableStream({
        async start(controller) {
          let offset = 0;
          let bytesSent = 0;

          while (offset < file.size && !aborted) {
            // Calculate the end position for this chunk
            const end = Math.min(offset + chunkSize, file.size);

            // Slice the file to get the chunk
            const chunk = file.slice(offset, end);

            // Convert the chunk to ArrayBuffer
            const arrayBuffer = await chunk.arrayBuffer();

            // Enqueue the chunk to the stream
            controller.enqueue(new Uint8Array(arrayBuffer));

            // Update offset and bytes sent
            offset = end;
            bytesSent += arrayBuffer.byteLength;

            // Calculate and report progress
            const percent = (bytesSent / file.size) * 100;

            const currentOngoings = ctx.ongoings;
            const ongoingIndex = currentOngoings.findIndex(o => o.id === randomId);

            if (ongoingIndex !== -1) {
              const updatedOngoing = {
                ...currentOngoings[ongoingIndex],
                status: "in_progress",
                percent: Math.round(percent)
              };
              const updatedOngoings = [...currentOngoings];
              updatedOngoings[ongoingIndex] = updatedOngoing;
              ctx.setOngoings(updatedOngoings);
            } else {
              const newOngoing = {
                id: randomId,
                name: file.name,
                status: "in_progress",
                show_scope: "knowledge_documents",
                percent: Math.round(percent)
              };
              ctx.setOngoings([...currentOngoings, newOngoing]);
            }

            // Small delay to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 0));
          }

          // Close the stream when done
          controller.close();
        },
        cancel() {
          aborted = true;
        }
      });

      // Use fetch with the stream as the body
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: fileStream,
        signal,
        duplex: 'half' // Add this line to specify the duplex option
      });

      if (!response.ok) {
        const ongoing = ctx.ongoings.find(o => o.id === randomId);
        if (ongoing) {
          ongoing.status = "failed";
          ongoing.error_text = response.statusText;
        }

        throw new Error(`Upload failed: ${response.statusText}`);

      }
      const result = await response.json();

      // ongoing complete -> remove
      const updatedOngoings = ctx.ongoings.filter(o => o.id !== randomId);
      ctx.setOngoings(updatedOngoings);

      updateFilesList(ctx);
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  // Start the upload and return the abort function
  uploadWithChunks();

  return () => {
    aborted = true;
    controller.abort();
  };
};
