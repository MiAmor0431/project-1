import {Routes, Route } from "react-router-dom";
import ProtectedRoute, { RedirectIfLoggedIn } from "./components/protectedRoute";
import LoginPage from "./components/loginForm";
import UserPage from "./pages/userPage";
import DashboardPage from "./pages/dashboardPage";
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
    return (
            <Routes>
                <Route
                    path="/login"
                    element={
                        <RedirectIfLoggedIn>
                            <LoginPage />
                        </RedirectIfLoggedIn>
                    }
                />
                <Route
                    path="/user"
                    element={
                        <ProtectedRoute role="manager">
                            <UserPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute role="admin">
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
    );
};

export default App;
