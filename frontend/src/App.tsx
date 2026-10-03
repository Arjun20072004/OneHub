import { Navigate, Route, Routes } from "react-router-dom";

import AppInitializer from "./components/AppInitializer";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

import CustomerLayout from "./layouts/CustomerLayout";
import ProviderLayout from "./layouts/ProviderLayout";
import AdminLayout from "./layouts/AdminLayout";

import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BookingsPage from "./pages/BookingsPage";
import SearchPage from "./pages/SearchPage";
import DoctorPage from "./pages/DoctorPage";
import MechanicPage from "./pages/MechanicPage";
import ShoppingPage from "./pages/ShoppingPage";
import FoodPage from "./pages/FoodPage";
import TravelPage from "./pages/TravelPage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import FoodCheckoutPage from "./pages/FoodCheckoutPage";
import FoodPaymentPage from "./pages/FoodPaymentPage";
import NotificationsPage from "./pages/NotificationsPage";

import ProviderDashboardPage from "./pages/ProviderDashboardPage";
import ProviderStatusPage from "./pages/ProviderStatusPage";
import ProviderOrdersPage from "./pages/ProviderOrdersPage";
import ProviderRestaurantPage from "./pages/ProviderRestaurantPage";
import ProviderAnalyticsPage from "./pages/ProviderAnalyticsPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminProvidersPage from "./pages/AdminProvidersPage";
import AdminOperationsPage from "./pages/AdminOperationsPage";
import AdminProfilePage from "./pages/AdminProfilePage";

export default function App() {
  return (
    <>
      <AppInitializer />

      <Routes>
        {/* ================= AUTH ================= */}

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* ================= PROTECTED ================= */}

        <Route element={<ProtectedRoute />}>

          {/* ================= CUSTOMER ================= */}

          <Route
            element={
              <RoleRoute allowedRoles={["customer"]} />
            }
          >
            <Route element={<CustomerLayout />}>

              <Route
                path="/customer"
                element={<DashboardPage />}
              />

              <Route
                path="/customer/profile"
                element={<ProfilePage />}
              />

              <Route
                path="/customer/notifications"
                element={<NotificationsPage />}
              />

              <Route
                path="/customer/bookings"
                element={<BookingsPage />}
              />

              <Route
                path="/customer/search"
                element={<SearchPage />}
              />

              <Route
                path="/customer/doctor"
                element={<DoctorPage />}
              />

              <Route
                path="/customer/mechanic"
                element={<MechanicPage />}
              />

              <Route
                path="/customer/shopping"
                element={<ShoppingPage />}
              />

              <Route
                path="/customer/food"
                element={<FoodPage />}
              />

              <Route
                path="/customer/food/:restaurantId"
                element={<RestaurantMenuPage />}
              />

              <Route
                path="/customer/food/:restaurantId/checkout"
                element={<FoodCheckoutPage />}
              />

              <Route
                path="/customer/food/:restaurantId/payment"
                element={<FoodPaymentPage />}
              />

              <Route
                path="/customer/travel"
                element={<TravelPage />}
              />

              {/* Legacy customer routes */}

              <Route
                path="/dashboard"
                element={
                  <Navigate
                    to="/customer"
                    replace
                  />
                }
              />

              <Route
                path="/profile"
                element={
                  <Navigate
                    to="/customer/profile"
                    replace
                  />
                }
              />

              <Route
                path="/notifications"
                element={
                  <Navigate
                    to="/customer/notifications"
                    replace
                  />
                }
              />

              <Route
                path="/bookings"
                element={
                  <Navigate
                    to="/customer/bookings"
                    replace
                  />
                }
              />

              <Route
                path="/search"
                element={
                  <Navigate
                    to="/customer/search"
                    replace
                  />
                }
              />

              <Route
                path="/doctor"
                element={
                  <Navigate
                    to="/customer/doctor"
                    replace
                  />
                }
              />

              <Route
                path="/mechanic"
                element={
                  <Navigate
                    to="/customer/mechanic"
                    replace
                  />
                }
              />

              <Route
                path="/shopping"
                element={
                  <Navigate
                    to="/customer/shopping"
                    replace
                  />
                }
              />

              <Route
                path="/food"
                element={
                  <Navigate
                    to="/customer/food"
                    replace
                  />
                }
              />

              <Route
                path="/travel"
                element={
                  <Navigate
                    to="/customer/travel"
                    replace
                  />
                }
              />

            </Route>
          </Route>

          {/* ================= PROVIDER STATUS ================= */}

          <Route
            element={
              <RoleRoute allowedRoles={["provider"]} />
            }
          >
            <Route
              path="/provider/status"
              element={<ProviderStatusPage />}
            />
          </Route>

          {/* ================= APPROVED PROVIDER ================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={["provider"]}
                requireApprovedProvider
              />
            }
          >
            <Route element={<ProviderLayout />}>

              <Route
                path="/provider"
                element={<ProviderDashboardPage />}
              />

              <Route
                path="/provider/orders"
                element={<ProviderOrdersPage />}
              />

              <Route
                path="/provider/restaurant"
                element={<ProviderRestaurantPage />}
              />

              <Route
                path="/provider/analytics"
                element={<ProviderAnalyticsPage />}
              />

              <Route
                path="/provider/profile"
                element={<ProviderProfilePage />}
              />

              <Route
                path="/provider/notifications"
                element={<NotificationsPage />}
              />

            </Route>
          </Route>

          {/* ================= ADMIN ================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "admin"
                ]}
              />
            }
          >
            <Route element={<AdminLayout />}>

              <Route
                path="/admin"
                element={<AdminDashboardPage />}
              />

              <Route
                path="/admin/users"
                element={<AdminUsersPage />}
              />

              <Route
                path="/admin/providers"
                element={<AdminProvidersPage />}
              />

              <Route
                path="/admin/profile"
                element={<AdminProfilePage />}
              />

              <Route
                path="/admin/:section"
                element={<AdminOperationsPage />}
              />

            </Route>
          </Route>

        </Route>

        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}