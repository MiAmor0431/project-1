import { loadImageAsBase64 } from "./loadImageBase64";
import headerImg from "../assets/header.jpeg";
import footerImg from "../assets/footer.jpeg";
import pdfMake from "pdfmake/build/pdfmake";
import vfsFonts from "pdfmake/build/vfs_fonts";
import MO from "../assets/MO.jpg"; // PNG версия
import sign from "../assets/sign.jpg"; // PNG версия

pdfMake.vfs = vfsFonts.vfs;

export async function generatePDF({
                                      title = "",
                                      services = [],
                                      clientName = "Тапсырыс беруші",
                                      managerCount = 0,
                                      techSupportType = "fixed",
                                      chatCount = 1000,
                                      chatPrice = 30,
                                      duration = 1,
                                      voipMinutes = 1000,
                                      voipPricePerMinute = 9,
                                  }) {
    // Загрузка изображений
    const headerBase64 = await loadImageAsBase64(headerImg);
    const footerBase64 = await loadImageAsBase64(footerImg);
    const moBase64 = await loadImageAsBase64(MO);
    const signBase64 = await loadImageAsBase64(sign);

    // Цена за менеджеров
    let managerPrice = 0;
    if (managerCount > 40) managerPrice = managerCount * 1000;
    else if (managerCount > 5) managerPrice = managerCount * 1600;
    else if (managerCount > 0) managerPrice = managerCount * 3500;

    // Цена ERS (группами)
    function calculateERSPrice(count) {
        let total = 0, breakdown = [], remaining = count;

        if (remaining > 0) {
            const first = Math.min(remaining, 5);
            total += first * 3500;
            breakdown.push(`${first} × 3 500`);
            remaining -= first;
        }
        if (remaining > 0) {
            const second = Math.min(remaining, 35);
            total += second * 1600;
            breakdown.push(`${second} × 1 600`);
            remaining -= second;
        }
        if (remaining > 0) {
            total += remaining * 1000;
            breakdown.push(`${remaining} × 1 000`);
        }

        return { total, breakdown: breakdown.join(" + ") };
    }

    // AI
    const hasAI = services.some(s => s.toLowerCase().includes("ии") || s.toLowerCase().includes("ai"));
    const aiPrice = hasAI
        ? (techSupportType === "fixed" ? 150000 : chatCount * chatPrice)
        : 0;

    // VOIP

    // Статические услуги
    const servicePrices = services.reduce((sum, s) => {
        const l = s.toLowerCase();
        if (l.includes("bitrix")) return sum + 200000;
        if (l.includes("crm")) return sum + 150000;
        if (l.includes("whatsapp")) return sum + 100000;
        return sum;
    }, 0);

    // ERS
    const isERS = services.some(s => s.toLowerCase().includes("ers"));
    let ersPrice = 0;
    if (isERS && managerCount > 0) {
        const result = calculateERSPrice(managerCount);
        ersPrice = result.total;
    }

    // Скидка только на ERS
    let ersDiscount = 0;
    if (isERS && ersPrice > 0) {
        if (duration === 3) ersDiscount = ersPrice * 0.05;
        else if (duration === 6) ersDiscount = ersPrice * 0.10;
        else if (duration === 12) ersDiscount = ersPrice * 0.15;
    }
    const voip = services.some(s => s.toLowerCase().includes("voip"));
    const voipPrice = voip ? voipMinutes * voipPricePerMinute : 0;

    const totalBeforeDiscount = servicePrices + (isERS ? ersPrice : managerPrice) + aiPrice + voipPrice;
    const finalTotal = totalBeforeDiscount - ersDiscount;

    // Таблица
    const tableBody = [
        [{ text: "Қызмет атауы", style: "boldBlackText" }, { text: "Құны", style: "boldBlackText" }],
        ...services.map(service => {
            const lower = service.toLowerCase();
            if (lower.includes("bitrix")) return [{ text: service, style: "boldBlackText" }, { text: "200 000 ₸", style: "boldBlackText" }];
            if (lower.includes("crm")) return [{ text: service, style: "boldBlackText" }, { text: "150 000 ₸", style: "boldBlackText" }];
            if (lower.includes("whatsapp")) return [{ text: service, style: "boldBlackText" }, { text: "100 000 ₸", style: "boldBlackText" }];
            if (lower.includes("техподдержка") || lower.includes("техническая")) return null;
            if (lower.includes("ии") || lower.includes("ai")) return null;
            if (lower.includes("ers")) return null;
            if (lower.includes("VOIP")) return null;
            return [{ text: service, style: "boldBlackText" }, { text: "—", style: "boldBlackText" }];
        }).filter(Boolean),

        ...(hasAI ? [[
            { text: techSupportType === "fixed" ? "ИИ ассистент (тұрақты тариф)" : `ИИ ассистент (${chatCount} чат × ${chatPrice} ₸)`, style: "boldBlackText" },
            { text: techSupportType === "fixed" ? "150 000 ₸" : `${(chatCount * chatPrice).toLocaleString()} ₸`, style: "boldBlackText" }
        ]] : []),

        ...(voip ? [[
            { text: `VOIP (${voipMinutes} мин × ${voipPricePerMinute} ₸)`, style: "boldBlackText" },
            { text: `${voipPrice.toLocaleString()} ₸`, style: "boldBlackText" }
        ]] : []),

        ...(isERS ? [[
            { text: `SatuBooster ERS`, style: "boldBlackText" },
            { text: `${ersPrice.toLocaleString()} ₸`, style: "boldBlackText" }
        ]] : managerCount > 0 ? [[
            { text: `Менеджерлер (${managerCount} × ${managerCount > 40 ? 1000 : managerCount > 5 ? 1600 : 3500} ₸)`, style: "boldBlackText" },
            { text: `${managerPrice.toLocaleString()} ₸`, style: "boldBlackText" }
        ]] : []),

        ...(ersDiscount > 0 ? [[
            { text: `Жеңілдік (${duration} ай ERS)`, style: "boldBlackText" },
            { text: `–${ersDiscount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₸`, style: "boldBlackText" }
        ]] : []),

        [{ text: "Жалпы сома", style: "boldBlackText" }, { text: `${finalTotal.toLocaleString()} ₸`, style: "boldBlackText" }]
    ];

    const docDefinition = {
        content: [
            { text: "КОММЕРЦИЯЛЫҚ ҰСЫНЫС", style: "header" },
            { text: `${title || "Коммерциялық ұсыныс"} қызметі бойынша`, style: "subheader" },

            {
                columns: [
                    {
                        width: "50%",
                        stack: [
                            { text: "Орындаушы:", style: "sectionTitle" },
                            {
                                text: `ЖК Акимбаев\nБИН: 020305550556\nСайт: www.satubooster.kz\nEmail: office@satubooster.kz\nТелефон: +7 707 965 2832`,
                                margin: [0, 0, 0, 10]
                            }
                        ]
                    },
                    {
                        width: "50%",
                        stack: [
                            { text: "Тапсырыс беруші:", style: "sectionTitle" },
                            {
                                text: clientName || "__________________",
                                style: "highlightText",
                                margin: [0, 0, 0, 10]
                            }
                        ]
                    }
                ]
            },

            {
                text: `Қымбатты Мырзалар! SatuBooster компаниясы тұтынушыларға қызмет көрсету сапасын жақсарту үшін кәсіби шешімді ұсынады — заманауи жасанды интеллект технологияларын пайдалана отырып, AI чат-ботын енгізу.`,
                style: "boldBlackText",
                margin: [0, 0, 0, 10]
            },

            { text: "Артықшылықтар:", style: "sectionTitle" },
            {
                ul: [
                    "Барлығы бір платформа ішінде жұмыс істейді",
                    "WhatsApp, Instagram және сайттан келген сұраныстарды бір жерде жинақтайды",
                    "Клиентпен толық байланыс пен сатылымды автоматтандырады",
                    "ИИ ассистенті арқылы сатылым, дожим және төлемді автоматты түрде орындайды",
                    "Бақылау панелі арқылы кім не жазды, қанша чат өңделді — бәрін көре аласыз",
                    "Жүйе өзі жұмыс істейді, менеджер тек нақты клиентпен жұмыс істейді"
                ],
                margin: [0, 0, 0, 10],
                style: "boldBlackText"
            },


            { text: "Құны және шарттары:", style: "sectionTitle" },
            {
                table: { widths: ["*", "*"], body: tableBody },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 10]
            },

            { text: "", pageBreak: "before" },

            { text: "Қондыру уақыты:", style: "sectionTitle" },
            {
                table: {
                    widths: ["*", "*"],
                    body: [
                        [
                            { text: "Қадам", style: "boldBlackText" },
                            { text: "Орындалу уақыты", style: "boldBlackText" }
                        ],
                        ["Анализ и согласование требований", "2 жұмыс күні"],
                        ["Разработка сценариев и интеграция", "5 жұмыс күні"],
                        ["Тестирование и доработка", "2 жұмыс күні"],
                        ["Обучение персонала и запуск", "1 жұмыс күні"]
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 10]
            },

            {
                text: "Общий срок внедрения: 5–7 жұмыс күні",
                style: "boldBlackText",
                margin: [0, 0, 0, 10]
            },

            {
                text: `Құрметпен,\nБас директор Акимбаев Е.Т\nКомпания SatuBooster\n${new Date().toLocaleDateString("kk-KZ", {
                    day: "numeric", month: "long", year: "numeric"
                })}`,
                style: "boldBlackText",
                margin: [0, 20, 0, 10]
            },

            {
                columns: [
                    {
                        width: "auto",
                        stack: [
                            { image: moBase64, width: 140, absolutePosition: { x: 65, y: 340 } },
                            { text: "М.О", absolutePosition: { x: 110, y: 380 }, style: "boldBlackText" },

                        ]
                    },
                    {
                        width: "*",
                        stack: [
                            { image: signBase64, width: 140, absolutePosition: { x: 390, y: 370 } },
                            { text: "Қолы __________________", absolutePosition: { x: 360, y: 380 }, style: "boldBlackText" },
                        ]
                    }
                ],
                margin: [0, 20, 0, 0]
            },


            {
                absolutePosition: { x: 40, y: 680 },
                style: "boldBlackText",
                stack: [
                    {
                        text: [
                            "Осы коммерциялық ұсынысқа төлем жасау, жазбаша келісім беру немесе чатта растау арқылы, сіз ",
                            {
                                text: "оферта шарттарын",
                                link: "https://satubooster.kz/oferta",
                                color: "#0d6efd",
                                decoration: "underline"
                            },
                            " толықтай қабылдайсыз."
                        ]
                    },
                    {
                        text: "Қызмет көрсету сол офертаға сәйкес заңды негізде жүзеге асады.",
                        margin: [0, 5, 0, 0]
                    }
                ]
            }
        ],

        pageMargins: [40, 100, 40, 100],
        header: () => ({
            image: headerBase64,
            width: 560,
            margin: [20, 0, 0, 0]
        }),
        footer: () => ({
            image: footerBase64,
            width: 560,
            alignment: "center",
            margin: [0, 0, 0, 0]
        }),
        styles: {
            header: {
                fontSize: 20,
                bold: true,
                color: "#0d6efd",
                alignment: "center",
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                color: "#003366",
                alignment: "center",
                margin: [0, 0, 0, 20]
            },
            sectionTitle: {
                bold: true,
                fontSize: 14,
                color: "#003366",
                margin: [0, 10, 0, 5]
            },
            highlightText: {
                color: "#212529",
                bold: true
            },
            boldBlackText: {
                bold: true,
                color: "#000000"
            }
        }
    };

    return new Promise((resolve, reject) => {
        pdfMake.createPdf(docDefinition).getBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("PDF generation failed"));
        });
    });
}
