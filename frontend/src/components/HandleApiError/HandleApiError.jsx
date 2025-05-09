import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContex/AuthContex";

export function useApiErrorHandler() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      logout();
      navigate("/login");
    } else {
      console.error("Error during API Call:", error);
    }
  };
}
