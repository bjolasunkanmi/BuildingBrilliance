'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  UserCircleIcon,
  WalletIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useWeb3 } from '@/hooks/useWeb3'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { WalletConnectModal } from '@/components/web3/WalletConnectModal'
import { Logo } from '@/components/ui/Logo'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Explore', href: '/explore' },
  { name: 'Create', href: '/create' },
  { name: 'Learn', href: '/learn' },
  { name: 'Marketplace', href: '/marketplace' },
]

const userMenuItems = [
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Dashboard', href: '/dashboard', icon: CogIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { account, connect, disconnect, isConnecting } = useWeb3()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWalletConnect = () => {
    if (account) {
      disconnect()
    } else {
      setWalletModalOpen(true)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-200' 
          : 'bg-transparent'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">
                  BuildingBrilliance
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet Connection */}
              <Button
                variant={account ? 'outline' : 'primary'}
                size="sm"
                onClick={handleWalletConnect}
                loading={isConnecting}
                className="flex items-center space-x-2"
              >
                <WalletIcon className="h-4 w-4" />
                <span>
                  {account ? formatAddress(account) : 'Connect Wallet'}
                </span>
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                      <Avatar
                        src={user?.avatar}
                        alt={user?.username || 'User'}
                        size="sm"
                      />
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  }
                  items={[
                    ...userMenuItems.map(item => ({
                      label: item.name,
                      href: item.href,
                      icon: item.icon,
                    })),
                    { type: 'divider' },
                    {
                      label: 'Sign out',
                      onClick: logout,
                      icon: ArrowRightOnRectangleIcon,
                      variant: 'danger',
                    },
                  ]}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" href="/login">
                    Sign in
                  </Button>
                  <Button variant="primary" size="sm" href="/register">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Wallet Connection */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant={account ? 'outline' : 'primary'}
                    size="sm"
                    onClick={handleWalletConnect}
                    loading={isConnecting}
                    className="w-full justify-center"
                  >
                    <WalletIcon className="h-4 w-4 mr-2" />
                    {account ? formatAddress(account) : 'Connect Wallet'}
                  </Button>
                </div>

                {/* Auth Actions */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      href="/login"
                      className="w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      href="/register"
                      className="w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={(connector) => {
          connect(connector)
          setWalletModalOpen(false)
        }}
      />
    </>
  )
}