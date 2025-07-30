
export function loadImageAsBase64(imagePath) {
    return fetch(imagePath)
        .then((res) => res.blob())
        .then((blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        });
}
