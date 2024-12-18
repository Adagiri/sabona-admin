import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/Auth";

const ProtectedRoute = () => {
    const token = useAuthStore((state) => state.token);

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
