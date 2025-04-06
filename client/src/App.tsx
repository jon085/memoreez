import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MemoriesPage from "@/pages/memories-page";
import MemoryDetailsPage from "@/pages/memory-details-page";
import AddMemoryPage from "@/pages/add-memory-page";
import ProfilePage from "@/pages/profile-page";
import CategoriesPage from "@/pages/categories-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute, AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/memories" component={MemoriesPage} />
      <ProtectedRoute path="/memories/add" component={AddMemoryPage} />
      <ProtectedRoute path="/memories/edit/:id" component={AddMemoryPage} />
      <Route path="/memories/:id" component={MemoryDetailsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/categories" component={CategoriesPage} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
