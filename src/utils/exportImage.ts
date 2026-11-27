export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  filename: string
): Promise<void> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '1600');
  clone.setAttribute('height', '1200');

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not initialize canvas context');
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((pngBlob) => {
          URL.revokeObjectURL(url);
          if (!pngBlob) {
            reject(new Error('Failed to generate PNG'));
            return;
          }
          const downloadUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          resolve();
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into image'));
    };
    img.src = url;
  });
}
