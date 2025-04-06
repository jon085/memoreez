import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus, User } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/memories" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
  ];

  const userMenuItems = [
    { name: "Your Profile", path: "/profile" },
    { name: "My Memories", path: "/memories" },
    { name: "Settings", path: "/settings" },
  ];

  // Add admin dashboard link if user is admin
  if (user?.role === "admin") {
    userMenuItems.push({ name: "Admin Dashboard", path: "/admin" });
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg
                className="h-8 w-auto text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Remember Your Memory
              </span>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    location === item.path
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!user ? (
              <div>
                <Link href="/auth">
                  <Button variant="outline" className="mr-2">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button>Sign up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center">
                <Link href="/memories/add">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Add new memory</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.profilePicture || ""}
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {userMenuItems.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <DropdownMenuItem>{item.name}</DropdownMenuItem>
                      </Link>
                    ))}
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    <nav className="mt-5 px-2 space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={closeMobileMenu}
                        >
                          <Button
                            variant={location === item.path ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            {item.name}
                          </Button>
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      {user ? (
                        <>
                          <div className="px-4 py-2 flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage
                                src={user.profilePicture || ""}
                                alt={user.username}
                              />
                              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-base font-medium text-gray-800">
                                {user.username}
                              </div>
                              <div className="text-sm font-medium text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 px-2 space-y-1">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.path}
                                href={item.path}
                                onClick={closeMobileMenu}
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                >
                                  {item.name}
                                </Button>
                              </Link>
                            ))}
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                              }}
                            >
                              Sign out
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="px-2 space-y-2">
                          <Link href="/auth" onClick={closeMobileMenu}>
                            <Button className="w-full">Sign in</Button>
                          </Link>
                          <Link href="/auth" onClick={closeMobileMenu}>
                            <Button
                              variant="outline"
                              className="w-full"
                            >
                              Sign up
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
