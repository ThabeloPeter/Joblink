'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { Settings, Save, Bell, Database, Mail, Shield } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

export default function AdminSettingsPage() {
  const notify = useNotify()
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // General Settings
  const [platformName, setPlatformName] = useState('JobLink')
  const [supportEmail, setSupportEmail] = useState('support@joblink.com')
  const [maxJobCardsPerCompany, setMaxJobCardsPerCompany] = useState('1000')

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [adminAlerts, setAdminAlerts] = useState(true)
  const [companyApprovals, setCompanyApprovals] = useState(true)
  const [systemAlerts, setSystemAlerts] = useState(true)

  // Security Settings
  const [require2FA, setRequire2FA] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordMinLength, setPasswordMinLength] = useState('8')

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [enableAnalytics, setEnableAnalytics] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        // Set support email from user email if available
        if (user?.email) {
          const emailDomain = user.email.split('@')[1]
          setSupportEmail(`support@${emailDomain}`)
        }
      } catch (error) {
        console.error('Error loading admin data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load settings'
        notify.showError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [notify])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with Supabase mutation for platform settings
      // For now, we'll just save locally or in a settings table if it exists
      await new Promise((resolve) => setTimeout(resolve, 1000))
      notify.showSuccess('Settings saved successfully!', 'Success')
    } catch {
      notify.showError('Failed to save settings. Please try again.', 'Error')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        title="Settings"
        user={{
          name: currentUser?.email?.split('@')[0] || 'Admin User',
          email: currentUser?.email || 'admin@joblink.com',
          role: 'Administrator',
        }}
      />

      <main className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Platform Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure platform-wide settings and preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  General Settings
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure basic platform information and limits
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Support Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Job Cards Per Company
                </label>
                <input
                  type="number"
                  value={maxJobCardsPerCompany}
                  onChange={(e) => setMaxJobCardsPerCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notification Settings
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure notification preferences for administrators
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email notifications for important events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Admin Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive alerts for administrative actions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminAlerts}
                    onChange={(e) => setAdminAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Company Approval Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when new companies register
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={companyApprovals}
                    onChange={(e) => setCompanyApprovals(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">System Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive alerts for system-level events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemAlerts}
                    onChange={(e) => setSystemAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Security Settings
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure security policies and authentication requirements
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Require Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Force all users to enable 2FA
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={require2FA}
                    onChange={(e) => setRequire2FA(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  System Settings
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure system-wide settings and maintenance options
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Maintenance Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable maintenance mode to restrict platform access
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Enable Analytics</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track platform usage and performance metrics
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAnalytics}
                    onChange={(e) => setEnableAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Auto Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically backup database daily
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

