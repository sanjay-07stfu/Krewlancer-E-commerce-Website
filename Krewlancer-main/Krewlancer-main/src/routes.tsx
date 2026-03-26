import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { RootLayout } from "@/src/root-layout"
import AdminLayout from "@/src/layouts/admin-layout"

const HomePage = lazy(() => import("@/src/pages"))
const AboutPage = lazy(() => import("@/src/pages/about"))
const AccountPage = lazy(() => import("@/src/pages/account"))
const AccountOrdersPage = lazy(() => import("@/src/pages/account/orders"))
const AccountOrderDetailPage = lazy(() => import("@/src/pages/account/orders/[id]"))
const AccountProfilePage = lazy(() => import("@/src/pages/account/profile"))
const AdminDashboardPage = lazy(() => import("@/src/pages/admin"))
const AdminAnalysisPage = lazy(() => import("@/src/pages/admin/analysis"))
const AdminCategoriesPage = lazy(() => import("@/src/pages/admin/categories"))
const AdminCustomersPage = lazy(() => import("@/src/pages/admin/customers"))
const AdminCustomerDetailPage = lazy(() => import("@/src/pages/admin/customers/[id]"))
const AdminHomepagePage = lazy(() => import("@/src/pages/admin/homepage"))
const AdminOrdersPage = lazy(() => import("@/src/pages/admin/orders"))
const AdminOrderDetailPage = lazy(() => import("@/src/pages/admin/orders/[id]"))
const AdminPaymentsPage = lazy(() => import("@/src/pages/admin/payments"))
const AdminProductsPage = lazy(() => import("@/src/pages/admin/products"))
const AuthCallbackPage = lazy(() => import("@/src/pages/auth/callback"))
const CartPage = lazy(() => import("@/src/pages/cart"))
const CheckoutPage = lazy(() => import("@/src/pages/checkout"))
const CheckoutConfirmationPage = lazy(() => import("@/src/pages/checkout/confirmation"))
const CollectionsPage = lazy(() => import("@/src/pages/collections"))
const CollectionDetailPage = lazy(() => import("@/src/pages/collections/[id]"))
const BestsellersCollectionPage = lazy(() => import("@/src/pages/collections/bestsellers"))
const FavouritesPage = lazy(() => import("@/src/pages/favourites"))
const HelpPage = lazy(() => import("@/src/pages/help"))
const LoginPage = lazy(() => import("@/src/pages/login"))
const NewArrivalsPage = lazy(() => import("@/src/pages/new-arrivals"))
const ProductDetailPage = lazy(() => import("@/src/pages/product/[id]"))
const SignupPage = lazy(() => import("@/src/pages/signup"))
const TermsPage = lazy(() => import("@/src/pages/terms&conditions"))
const ViewAllPage = lazy(() => import("@/src/pages/view-all"))
const NotFoundPage = lazy(() => import("@/src/pages/not-found"))

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#030303] text-[#e8e8e3]">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading...</p>
            </div>
          }
        >
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<AccountOrdersPage />} />
          <Route path="/account/orders/:id" element={<AccountOrderDetailPage />} />
          <Route path="/account/profile" element={<AccountProfilePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/confirmation" element={<CheckoutConfirmationPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/collections/bestsellers" element={<BestsellersCollectionPage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/terms&conditions" element={<TermsPage />} />
          <Route path="/view-all" element={<ViewAllPage />} />

          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/analysis"
            element={(
              <AdminRoute>
                <AdminAnalysisPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/categories"
            element={(
              <AdminRoute>
                <AdminCategoriesPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/customers"
            element={(
              <AdminRoute>
                <AdminCustomersPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/customers/:id"
            element={(
              <AdminRoute>
                <AdminCustomerDetailPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/homepage"
            element={(
              <AdminRoute>
                <AdminHomepagePage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/orders"
            element={(
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/orders/:id"
            element={(
              <AdminRoute>
                <AdminOrderDetailPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/payments"
            element={(
              <AdminRoute>
                <AdminPaymentsPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/products"
            element={(
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            )}
          />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </RootLayout>
    </BrowserRouter>
  )
}
