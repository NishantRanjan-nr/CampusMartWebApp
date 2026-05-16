const CLOUDINARY_TRANSFORM = 'f_auto,q_auto,w_800';

export function optimizeCloudinaryImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return url || '';
    }

    if (!/^https?:\/\//i.test(url) || !/res\.cloudinary\.com/i.test(url)) {
        return url;
    }

    if (url.includes('f_auto') && url.includes('q_auto') && url.includes('w_800')) {
        return url;
    }

    try {
        const parsedUrl = new URL(url);
        const uploadMarker = '/upload/';
        const uploadIndex = parsedUrl.pathname.indexOf(uploadMarker);

        if (uploadIndex === -1) {
            return url;
        }

        const pathBeforeUpload = parsedUrl.pathname.slice(0, uploadIndex + uploadMarker.length);
        const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + uploadMarker.length);
        parsedUrl.pathname = `${pathBeforeUpload}${CLOUDINARY_TRANSFORM}/${pathAfterUpload}`;

        return parsedUrl.toString();
    } catch {
        return url;
    }
}