"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Suspense } from "react";
import {
  User,
  Heart,
  Settings,
  LogOut,
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import SearchBar from "./SearchBar";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Alert from "./Alert";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [navAlertConfig, setNavAlertConfig] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);

  /**
   * Updates the count of user's favorite items
   * @async
   * @function updateFavoritesCount
   */
  const updateFavoritesCount = useCallback(async () => {
    if (session) {
      try {
        const response = await fetch("/api/favorites?action=count");
        const data = await response.json();
        setFavoritesCount(data.count);
      } catch (error) {
        console.error("Error fetching favorites count:", error);
      }
    } else {
      setFavoritesCount(0);
    }
  }, [session]);

  useEffect(() => {
    updateFavoritesCount();

    // Set up an event listener for favorites updates
    window.addEventListener("favoritesUpdated", updateFavoritesCount);

    return () => {
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
    };
  }, [updateFavoritesCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsSearchVisible(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      // Handle click outside mobile menu
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="toggle-mobile-menu"]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /**
   * Handles user logout process
   * @async
   * @function handleLogout
   */
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      const result = await signOut({ redirect: false, callbackUrl: "/" });
      if (result?.url) {
        setNavAlertConfig({
          isVisible: true,
          message: "Successfully signed out",
          type: "success",
        });
        setTimeout(() => router.push(result.url), 3000);
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      setNavAlertConfig({
        isVisible: true,
        message: "Error signing out",
        type: "error",
      });
    }
  };

  /**
   * User menu component with dropdown functionality
   * @component UserMenu
   */
  const UserMenu = () => {
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={toggleUserMenu}
          className="flex items-center space-x-2 p-2 rounded-full text-white hover:bg-teal-600/30 transition-colors duration-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={session ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 py-2 z-50 overflow-hidden">
            <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
              <p className="text-sm text-teal-800 font-medium truncate">
                {session?.user?.name || "Guest"}
              </p>
              <p className="text-xs text-teal-600 truncate">
                {session?.user?.email || "Not signed in"}
              </p>
            </div>
            <div className="py-1">
              {status === "authenticated" ? (
                <>
                  <div className="px-4 py-2 flex justify-end">
                    <ThemeToggle />
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/saved-recipes"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Recipes
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 flex justify-end">
                    <ThemeToggle />
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className="bg-teal-700 dark:bg-teal-900 dark:text-teal-100 shadow-md fixed z-50 w-full"
      ref={navbarRef}
    >
      <Alert
        isVisible={navAlertConfig.isVisible}
        message={navAlertConfig.message}
        type={navAlertConfig.type}
        onClose={() =>
          setNavAlertConfig((prev) => ({ ...prev, isVisible: false }))
        }
      />

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className={`flex items-center ${
              isSearchVisible ? "hidden sm:flex" : "flex"
            }`}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-lg">
                <Image
                  src="/logo.png"
                  width={100}
                  height={100}
                  alt="Logo"
                  className="h-10 w-12"
                />
              </div>
              <span className="text-xl font-serif text-white">
                Culinary Haven
              </span>
            </Link>
          </div>

          <div className="flex flex-grow space-x-10 items-center justify-end">
            <div
              className={`flex-grow max-w-md ${
                isSearchVisible ? "w-full" : "w-auto"
              }`}
            >
              <Suspense>
                <SearchBar
                  isVisible={isSearchVisible}
                  onToggle={toggleSearch}
                />
              </Suspense>
            </div>

            <div className="hidden md:flex items-center space-x-7">
              <Link
                href="/"
                className="text-white relative flex items-center hover:text-teal-200 transition-colors duration-200 text-sm font-medium"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Recipes
              </Link>

              <Link
                href="/favorites"
                className="text-white relative flex items-center hover:text-teal-200 transition-colors duration-200 text-sm font-medium"
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorites
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              <div className="flex justify-center">
                <Link
                  href="/shopping-list"
                  className="text-white relative flex items-center hover:text-teal-200 transition-colors duration-200 text-sm font-medium"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shopping List
                </Link>
              </div>
              <UserMenu />
            </div>
          </div>

          <button
            onClick={toggleMenu}
            aria-label="toggle-mobile-menu"
            className="md:hidden p-2 rounded-lg text-white hover:bg-teal-600/30 transition-colors duration-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-teal-700 border-t border-teal-600"
        >
          <div className="px-4 py-4 space-y-3">
            <div className="flex justify-end px-3 py-2">
              <ThemeToggle />
            </div>
            <Link
              href="/"
              className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
            >
              Recipes
            </Link>
            <div className="flex ml-3">
              <Link
                href="/favorites"
                className={"relative flex items-center text-white"}
              >
                Favorites
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            </div>
            <Link
              href="/shopping-list"
              className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
            >
              Shopping List
            </Link>
            {status === "authenticated" ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors flex items-center"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
