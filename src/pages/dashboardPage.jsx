import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/activity")
            .then((res) => res.json())
            .then((data) => {
                const sortedLogs = data.sort((a, b) => a.user.localeCompare(b.user));
                setLogs(sortedLogs);
            })
            .catch((err) => {
                console.error("Ошибка при получении активности:", err);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-3">
                <h2>Активность пользователей</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    🚪 Выйти
                </button>
            </div>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>Пользователь</th>
                    <th>Email</th>
                    <th>Дата</th>
                    <th>PDF</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((log, i) => (
                    <tr key={i}>
                        <td>{log.user}</td>
                        <td>{log.email}</td>
                        <td>{log.date}</td>
                        <td>
                            <a
                                href={`http://localhost:8080${log.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                📄 Открыть
                            </a>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardPage;
