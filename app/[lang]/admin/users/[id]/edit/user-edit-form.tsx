"use client"

import { useState } from "react"
import { updateUser } from "@/app/actions/admin/users"

interface UserEditFormProps {
  userData: any
  dict: Record<string, any>
  lang: string
}

export default function UserEditForm({ userData, dict, lang }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    username: userData.username,
    email: userData.email || "",
    name: userData.name || "",
    phone: userData.phone || "",
    role: userData.role,
  })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password && password !== confirmPassword) {
      setError(dict.auth?.passwordMismatch || "Passwords do not match")
      return
    }

    try {
      await updateUser(userData.id, {
        ...formData,
        password: password || undefined,
      })

      setSuccess(dict.admin?.users?.saveSuccess || "User saved successfully")
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || dict.admin?.common?.error || "An error occurred")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.username || "Username"}
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.email || "Email"}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.name || "Name"}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.phone || "Phone"}
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.role || "Role"}
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        >
          <option value="CLIENT">{dict.admin?.roles?.CLIENT || "Client"}</option>
          <option value="ADMIN">{dict.admin?.roles?.ADMIN || "Admin"}</option>
          <option value="OWNER">{dict.admin?.roles?.OWNER || "Owner"}</option>
          <option value="MERCHANt">{dict.admin?.roles?.MERCHANT || "Merchant"}</option>
          <option value="MANAGER">{dict.admin?.roles?.MANAGER || "Manager"}</option>
          <option value="STAFF">{dict.admin?.roles?.STAFF || "Staff"}</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.password || "New Password"}
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Leave empty to keep current password"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.users?.confirmPassword || "Confirm New Password"}
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Leave empty to keep current password"
        />
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.common?.save || "Save"}
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData({
              username: userData.username,
              email: userData.email || "",
              name: userData.name || "",
              phone: userData.phone || "",
              role: userData.role,
            })
            setPassword("")
            setConfirmPassword("")
            setError("")
            setSuccess("")
          }}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.reset || "Reset"}
        </button>
      </div>
    </form>
  )
}
