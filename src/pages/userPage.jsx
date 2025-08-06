import React, { useEffect, useState } from "react";
import { generatePDF } from "../utils/pdfGenerator";
import Header from "../components/header";
import Loader from "../components/loader";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import TextField from "../components/textField";
import { validator } from "../utils/validator";

const servicesList = [
    "SatuBooster ERS",
    "ИИ ассистент",
    "VOIP",
    "Лендинг беттерін әзірлеу және орнату",
    "Веб-сайт құру және ассистентпен біріктіру",
    "Сату/маркетингтік автоворонка құру",
    "Ішкі процестерді автоматтандыру және кеңес беру"
];

const UserPage = () => {
    const [title, setTitle] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const [clientName, setClientName] = useState("");
    const [managerCount, setManagerCount] = useState(0);
    const [duration, setDuration] = useState(1);
    const [techSupportType, setTechSupportType] = useState("fixed");
    const [chatCount, setChatCount] = useState(1000);
    const [chatPrice, setChatPrice] = useState(30);
    const [voipMinutes, setVoipMinutes] = useState(1000);
    const [voipPrice, setVoipPrice] = useState(9);
    const [customServicePrices, setCustomServicePrices] = useState({});

    const [data, setData] = useState({ email: "" });
    const [errors, setErrors] = useState({ email: "" });
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) navigate("/login");
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        validate();
    }, [data]);

    const validate = () => {
        const errors = validator(data, {
            email: {
                isRequired: { message: "Введите email" },
                isEmail: { message: "Введите корректный email" },
            },
        });
        setErrors(errors);
        return Object.keys(errors).length === 0;
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

    const isERSSelected = selectedServices.includes("SatuBooster ERS");
    const isAISelected = selectedServices.includes("ИИ ассистент");
    const isVOIPSelected = selectedServices.includes("VOIP");

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const blob = await generatePDF({
                title,
                services: selectedServices,
                clientName,
                managerCount,
                techSupportType,
                chatCount,
                chatPrice,
                duration,
                voipMinutes,
                voipPrice,
                customServicePrices
            });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (e) {
            console.error("Ошибка PDF:", e.message);
        } finally {
            setIsGenerating(false);
        }
    };
    const handleCustomPriceChange = (service, value) => {
        setCustomServicePrices((prev) => ({
            ...prev,
            [service]: Number(value)
        }));
    };

    const handleSendEmail = async () => {
        if (!data.email) return;
        setIsSending(true);

        try {
            const blob = await generatePDF({
                title,
                services: selectedServices,
                clientName,
                managerCount,
                techSupportType,
                chatCount,
                chatPrice,
                duration,
                voipMinutes,
                voipPrice
            });

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
                            placeholder="Заголовок КП..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Имя заказчика..."
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />

                        <label className="form-label fw-bold">Выберите услуги:</label>
                        <div className="d-flex flex-column gap-2 mb-3">
                            {servicesList.map((service) => (
                                <div key={service} className="mb-3">
                                    <div className="form-check">
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

                                    {selectedServices.includes(service) &&
                                        [
                                            "Лендинг беттерін әзірлеу және орнату",
                                            "Веб-сайт құру және ассистентпен біріктіру",
                                            "Сату/маркетингтік автоворонка құру",
                                            "Ішкі процестерді автоматтандыру және кеңес беру"
                                        ].includes(service) && (
                                            <input
                                                type="text"
                                                className="form-control mt-2"
                                                placeholder="Қызмет бағасын енгізіңіз (₸)"
                                                value={customServicePrices[service] || ""}
                                                onChange={(e) =>
                                                    handleCustomPriceChange(service, e.target.value)
                                                }
                                            />
                                        )}
                                </div>
                            ))}

                        </div>

                        {isERSSelected && (
                            <div className="mb-3">
                                <label>Количество менеджеров:</label>
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    value={managerCount}
                                    onChange={(e) => setManagerCount(Number(e.target.value))}
                                />
                                <label>Мерзімі:</label>
                                <div className="d-flex gap-3 flex-wrap">
                                    {[1, 3, 6, 12].map((val) => (
                                        <div key={val} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="duration"
                                                id={`dur-${val}`}
                                                value={val}
                                                checked={duration === val}
                                                onChange={() => setDuration(val)}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`dur-${val}`}
                                            >
                                                {val} ай
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isAISelected && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">ИИ ассистент: способ оплаты</label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="aiPayment"
                                        id="fixed"
                                        value="fixed"
                                        checked={techSupportType === "fixed"}
                                        onChange={() => setTechSupportType("fixed")}
                                    />
                                    <label className="form-check-label" htmlFor="fixed">
                                        Фиксированная (150 000 ₸)
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="aiPayment"
                                        id="per_chat"
                                        value="per_chat"
                                        checked={techSupportType === "per_chat"}
                                        onChange={() => setTechSupportType("per_chat")}
                                    />
                                    <label className="form-check-label" htmlFor="per_chat">
                                        По чатам
                                    </label>
                                </div>
                            </div>
                        )}

                        {isAISelected && techSupportType === "per_chat" && (
                            <>
                                <label>Количество чатов:</label>
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    value={chatCount}
                                    onChange={(e) => setChatCount(Number(e.target.value))}
                                />
                                <label>Цена за чат:</label>
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    value={chatPrice}
                                    onChange={(e) => setChatPrice(Number(e.target.value))}
                                />
                            </>
                        )}

                        {isVOIPSelected && (
                            <>
                                <label>Количество минут (VOIP):</label>
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    value={voipMinutes}
                                    onChange={(e) => setVoipMinutes(Number(e.target.value))}
                                />
                                <label>Цена за минуту (VOIP):</label>
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    value={voipPrice}
                                    onChange={(e) => setVoipPrice(Number(e.target.value))}
                                />
                            </>
                        )}

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                📄 Сгенерировать PDF
                            </button>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <TextField
                            label="Email получателя"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleEmailChange}
                            error={errors.email}
                        />

                        <button
                            className="btn btn-primary w-100 mt-2"
                            onClick={handleSendEmail}
                            disabled={!data.email || isSending}
                        >
                            📧 Отправить PDF
                        </button>

                        {emailStatus === "success" && (
                            <div className="mt-3 alert alert-success">✅ Письмо успешно отправлено</div>
                        )}
                        {emailStatus === "error" && (
                            <div className="mt-3 alert alert-danger">❌ Не удалось отправить письмо</div>
                        )}
                    </div>
                </div>

                <Loader visible={isGenerating || isSending} />
            </main>
            <Footer />
        </>
    );
};

export default UserPage;
