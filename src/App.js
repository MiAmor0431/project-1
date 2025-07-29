// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/loginForm";
import UserPage from "./pages/userPage";
import DashboardPage from "./pages/dashboardPage";
import ProtectedRoute from "./components/protectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Только для менеджера */}
            <Route
                path="/user"
                element={
                    <ProtectedRoute role="manager">
                        <UserPage />
                    </ProtectedRoute>
                }
            />

            {/* Только для админа */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute role="admin">
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<h2>404 — Страница не найдена</h2>} />
        </Routes>
    );
}

export default App;
