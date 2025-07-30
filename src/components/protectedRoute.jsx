import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/login" />;

    return children;
};

export const RedirectIfLoggedIn = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) return <Navigate to={user.role === "admin" ? "/dashboard" : "/user"} />;
    return children;
};

export default ProtectedRoute;
