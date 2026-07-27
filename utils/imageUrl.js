// utils/imageUrl.js
// Görselleri gösterildikleri boyutta indirmek için URL'e genişlik parametresi basar.
// Grid kartları ~173pt genişliğinde; 800px görsel indirmek 4 kat gereksiz veri demek
// (20 kartlık bir sayfa ~1.9 MB → ~0.6 MB).
//
// Desteklenen kaynaklar: Pexels ve Unsplash (?w= parametresi), Cloudinary (w_ dönüşümü).
// Tanınmayan URL'ler olduğu gibi döner.

export function sizedImageUrl(url, width = 400) {
  if (!url || typeof url !== 'string') return url;

  // Pexels / Unsplash: mevcut w= değerini değiştir, yoksa ekle
  if (url.includes('images.pexels.com') || url.includes('images.unsplash.com')) {
    if (/[?&]w=\d+/.test(url)) return url.replace(/([?&])w=\d+/, `$1w=${width}`);
    return url + (url.includes('?') ? '&' : '?') + `w=${width}`;
  }

  // Cloudinary: /upload/ sonrasına dönüşüm ekle (zaten varsa dokunma)
  if (url.includes('/res.cloudinary.com/') && url.includes('/image/upload/')) {
    if (/\/image\/upload\/[^/]*[wq]_\d+/.test(url)) return url;
    return url.replace('/image/upload/', `/image/upload/w_${width},q_auto,f_auto/`);
  }

  return url;
}
