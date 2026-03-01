import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";

// Páginas
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import MapView from "../features/map/MapView";

// Componente para rutas protegidas (solo para funcionalidades específicas)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Componente para rutas públicas que redirigen si ya está autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MapView />, // Mapa público - accesible sin autenticación
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
      ),
    },
  ],
  {
    future: {
      v7_futurePersistProps: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
