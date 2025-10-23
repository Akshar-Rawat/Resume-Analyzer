let pdfjsLib = null;
let isLoading = false;
let loadPromise = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib; // If library already loaded, return it
  if (loadPromise) return loadPromise; // If loading in progress, return same promise

  isLoading = true;

  // Dynamically import pdf.js core library
  loadPromise = import("pdfjs-dist").then((lib) => {
    // Set up the worker source (the worker handles parsing PDF in background)
      lib.GlobalWorkerOptions.workerSrc = 
        `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
       pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(file) {
  try {
    const lib = await loadPdfJs(); // Ensure pdf.js is loaded before using it

    const arrayBuffer = await file.arrayBuffer(); // Read file into binary data
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise; // Load PDF document
    const page = await pdf.getPage(1); // Get first page

    // Define viewport (scale = zoom level)
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Match canvas size to PDF page
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    // Render the page into the canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert the canvas into a Blob (PNG image)
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
              lastModified:new Date().getTime()
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
