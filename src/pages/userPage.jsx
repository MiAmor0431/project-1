import React, { useEffect, useState } from "react";
import { callOpenAI } from "../utils/callOpenAI";
import { generatePDF } from "../utils/pdfGenerator";
import Header from "../components/header";
import Loader from "../components/loader";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import TextField from "../components/textField";
import { validator } from "../utils/validator";

const servicesList = [
    "ИИ ассистент",
    "Bitrix24 интеграция",
    "CRM NF Group",
    "WhatsApp автоматизация",
    "Техническая поддержка"
];

const UserPage = () => {
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const navigate = useNavigate();

    const [data, setData] = useState({ email: "" });
    const [errors, setErrors] = useState({ email: "" });
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) navigate("/login");
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        setIsValid(text.trim().length >= 200);
    }, [text]);

    useEffect(() => {
        validate();
    }, [data]);

    const validConfigurator = {
        email: {
            isRequired: { message: "Please enter an email" },
            isEmail: { message: "Please enter a valid email address" },
        },
    };

    const validate = () => {
        const errors = validator(data, validConfigurator);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleEmailChange = ({ name, value }) => {
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service) => {
        setSelectedServices((prev) =>
            prev.includes(service)
                ? prev.filter((s) => s !== service)
                : [...prev, service]
        );
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleAIGenerate = async () => {
        setAiLoading(true);

        const titleText = title || "Коммерциялық ұсыныс";
        const serviceList = selectedServices.length > 0
            ? selectedServices.map(s => `• ${s}`).join("\n")
            : "Қызметтер таңдалмады";

        const priceConditions = `
💰 Қосымша шарттар:
•  До 5 менеджеров — по 3500 тг за каждого.
•  С 6-го до 40-го менеджера — за каждого нового добавляется 1600 тг.
•  Начиная с 41-го менеджера — за каждого дополнительного добавляется 1000 тг.
`;

        const prompt = `
):

🏥 [ЗАГОЛОВОК]
Орындаушы: SatuBooster.Ai
Сілтеме: https://satubooster.kz/nedzat/

🔹 Қызмет құрамына кіреді:
[УСЛУГИ]

${priceConditions}

📲 Байланыс:
https://satubooster.kz/nedzat/
WhatsApp: +7 707 965 2832

Подставь значения:
- [ЗАГОЛОВОК] = "${titleText}"
- [УСЛУГИ] = "${serviceList}"

Ответ строго на казахском языке. 
`;

        try {
            const aiText = await callOpenAI(prompt);
            setText(aiText);
        } catch (e) {
            setEmailStatus("error");
        } finally {
            setAiLoading(false);
        }
    };


    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const blob = await generatePDF(text);
            if (!blob || !(blob instanceof Blob)) throw new Error("Ошибка генерации PDF");
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (e) {
            console.error("Ошибка PDF:", e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = async () => {
        if (!data.email || !isValid) return;
        setIsSending(true);

        try {
            const blob = await generatePDF(text);
            const formData = new FormData();

            formData.append("email", data.email);
            formData.append("file", blob, "kp.pdf");
            formData.append("username", currentUser.name);

            const res = await fetch("http://localhost:8080/send-email", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Ошибка отправки письма");

            setEmailStatus("success");
            setData({ email: "" });
            setErrors({ email: "" });
            setTimeout(() => setEmailStatus(null), 5000);
        } catch (e) {
            setEmailStatus("error");
            setTimeout(() => setEmailStatus(null), 5000);
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    return (
        <>
            <Header />
            <main className="main-content px-3">
                <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        🚪 Выйти
                    </button>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-7 mb-4">
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Введите заголовок КП..."
                            value={title}
                            onChange={handleTitleChange}
                        />

                        <div className="mb-3">
                            <label className="form-label fw-bold">Выберите услуги:</label>
                            <div className="d-flex flex-wrap gap-3">
                                {servicesList.map((service) => (
                                    <div key={service} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={service}
                                            checked={selectedServices.includes(service)}
                                            onChange={() => handleServiceToggle(service)}
                                        />
                                        <label className="form-check-label" htmlFor={service}>
                                            {service}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <textarea
                            id="kpText"
                            className="form-control"
                            placeholder="Введите текст коммерческого предложения..."
                            value={text}
                            onChange={handleInputChange}
                            minLength={200}
                            style={{ minHeight: "250px", fontSize: "16px" }}
                        />

                        <div id="textInfo" className="mt-2 text-start text-secondary">
                            <p className="mb-1">
                                <span id="charCount">{text.trim().length}</span> / 200 символов
                            </p>
                            {!isValid && (
                                <p id="warning" className="text-danger">
                                    Минимум 200 символов для генерации PDF
                                </p>
                            )}
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <button className="btn btn-primary" onClick={handleAIGenerate} disabled={aiLoading}>
                                🤖 Сгенерировать черновик
                            </button>
                            <button className="btn btn-primary" onClick={handleGenerate} disabled={!isValid || isGenerating}>
                                📄 Сгенерировать PDF
                            </button>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="mb-3">
                            <TextField
                                label="Email получателя"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={handleEmailChange}
                                error={errors.email}
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100"
                            onClick={handleSendEmail}
                            disabled={!isValid || !data.email || isSending}
                        >
                            📧 Отправить PDF
                        </button>

                        {emailStatus === "success" && (
                            <div
                                className="mt-3 p-2 text-success border border-success rounded"
                                style={{ backgroundColor: "#d1e7dd", color: "#0f5132" }}
                            >
                                ✅ Письмо успешно отправлено
                            </div>
                        )}

                        {emailStatus === "error" && (
                            <div
                                className="mt-3 p-2 text-danger border border-danger rounded"
                                style={{ backgroundColor: "#f8d7da", color: "#842029" }}
                            >
                                ❌ Не удалось отправить письмо
                            </div>
                        )}
                    </div>
                </div>

                <Loader visible={isGenerating || aiLoading || isSending} />
            </main>
            <Footer />
        </>
    );
};

export default UserPage;
