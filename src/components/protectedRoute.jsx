import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../API/fake.api";

const ProtectedRoute = ({ children, role }) => {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;