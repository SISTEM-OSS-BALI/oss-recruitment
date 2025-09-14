export function cropCenterAndResizeSquare(
  image: File,
  targetSize = 400 // default 400x400
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Context error"));

      // Hitung rasio
      const srcAspect = img.width / img.height;
      const targetAspect = 1; // square

      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;

      if (srcAspect > targetAspect) {
        // Gambar lebih lebar → crop kiri-kanan
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        // Gambar lebih tinggi → crop atas-bawah
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetSize, targetSize);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Blob error"));
        resolve(new File([blob], image.name, { type: image.type }));
      }, image.type);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(image);
  });
}
