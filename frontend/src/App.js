import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "./components/ui/sonner";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import BrowsePage from "./pages/BrowsePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import AuthPage from "./pages/AuthPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";

// Dashboard Pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import MyListings from "./pages/dashboard/MyListings";
import MyRentals from "./pages/dashboard/MyRentals";
import AddItem from "./pages/dashboard/AddItem";
import EditItem from "./pages/dashboard/EditItem";
import Messages from "./pages/dashboard/Messages";
import Profile from "./pages/dashboard/Profile";
import SellerRequestsPage from "./pages/dashboard/SellerRequestsPage";

import "@/App.css";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/item/:id" element={<ItemDetailPage />} />

            </Route>
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<DashboardHome />} />
                <Route path="listings" element={<MyListings />} />
                <Route path="rentals" element={<MyRentals />} />
                <Route path="add-item" element={<AddItem />} />
                <Route path="edit-item/:id" element={<EditItem />} />
                <Route path="messages" element={<Messages />} />
                <Route path="messages/:userId" element={<Messages />} />
                <Route path="requests" element={<SellerRequestsPage />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                    <Toaster position="top-right" richColors />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
