import pdfMake from "pdfmake/build/pdfmake";
import headerImg from "../assets/header.jpeg";
import footerImg from "../assets/footer.jpeg";
import { loadImageAsBase64 } from "./loadImageBase64";

export async function generatePDF(text, options = { open: false }) {
    const headerBase64 = await loadImageAsBase64(headerImg);
    const footerBase64 = await loadImageAsBase64(footerImg);

    const docDefinition = {
        content: [
            {
                text: text.trim(),
                fontSize: 12,
                margin: [0, 0, 0, 100],
            },
        ],
        pageMargins: [40, 100, 40, 100],
        header: () => ({
            image: headerBase64,
            width: 560,
            margin: [20, 0, 0, 0],
        }),
        footer: (currentPage, pageCount) =>
            currentPage === pageCount
                ? {
                    image: footerBase64,
                    width: 560,
                    margin: [20, 10, 0, 0],
                }
                : "",
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);

    if (options.open) {
        pdfDoc.open();
        return null;
    }

    return new Promise((resolve, reject) => {
        pdfDoc.getBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("PDF не был сгенерирован"));
        });
    });
}
