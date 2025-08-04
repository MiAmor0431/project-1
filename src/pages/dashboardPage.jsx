import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("user");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/activity")
            .then((res) => res.json())
            .then((data) => {
                setLogs(data);
            })
            .catch((err) => {
                console.error("Ошибка при получении активности:", err);
            });
    }, []);

    useEffect(() => {
        const sorted = [...logs].sort((a, b) => {
            if (sortBy === "user") return (a.username || "").localeCompare(b.username || "");
            if (sortBy === "date") return new Date(b.date) - new Date(a.date);
            return 0;
        });

        const filtered = sorted.filter((log) =>
            (log.username || "").toLowerCase().includes(search.toLowerCase()) ||
            (log.email || "").toLowerCase().includes(search.toLowerCase())
        );

        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [logs, search, sortBy]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Поиск по имени или email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="user">Сортировка по имени</option>
                        <option value="date">Сортировка по дате</option>
                    </select>
                </div>
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
                {paginatedLogs.map((log, i) => (
                    <tr key={i}>
                        <td>{log.username}</td>
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

            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    ⬅ Назад
                </button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Вперёд ➡
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;
