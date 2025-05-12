import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContex/AuthContex";

export function useApiErrorHandler() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  return (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      logout();

      const currentLocation = location.pathname;

      navigate("/login", { state: { from: currentLocation } });
    } else {
      console.error("Error during API Call:", error);
    }
  };
}
