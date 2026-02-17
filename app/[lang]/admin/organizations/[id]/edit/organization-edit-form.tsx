"use client"

import { useState } from "react"
import { updateOrganization } from "@/app/actions/admin/organizations"

interface OrganizationEditFormProps {
  orgData: any
  dict: Record<string, any>
  lang: string
}

export default function OrganizationEditForm({ orgData, dict, lang }: OrganizationEditFormProps) {
  const [formData, setFormData] = useState({
    name: orgData.name,
    slug: orgData.slug,
    type: orgData.type,
    description: orgData.description || "",
    website: orgData.website || "",
    email: orgData.email || "",
    phone: orgData.phone || "",
    address: orgData.address || "",
    timezone: orgData.timezone,
    locale: orgData.locale,
    primaryColor: orgData.primaryColor,
    secondaryColor: orgData.secondaryColor,
    isActive: orgData.isActive,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateOrganization(orgData.id, formData)
      setSuccess(dict.admin?.organizations?.saveSuccess || "Organization saved successfully")
    } catch (err: any) {
      setError(err.message || dict.admin?.common?.error || "An error occurred")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const { name, value, type } = target as { name: string; value: string; type: string }
    const checked = (target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.name || "Name"}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.slug || "Slug"}
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.type || "Type"}
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        >
          <option value="LAWYER">{dict.admin?.organizationTypes?.LAWYER || "Lawyer"}</option>
          <option value="DOCTOR">{dict.admin?.organizationTypes?.DOCTOR || "Doctor"}</option>
          <option value="MARKET">{dict.admin?.organizationTypes?.MARKET || "Market"}</option>
          <option value="RESTAURANT">{dict.admin?.organizationTypes?.RESTAURANT || "Restaurant"}</option>
          <option value="SALON">{dict.admin?.organizationTypes?.SALON || "Salon"}</option>
          <option value="OTHER">{dict.admin?.organizationTypes?.OTHER || "Other"}</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.description || "Description"}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.website || "Website"}
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.email || "Email"}
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
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.phone || "Phone"}
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
        <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.address || "Address"}
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.timezone || "Timezone"}
        </label>
        <input
          type="text"
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="locale" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.locale || "Locale"}
        </label>
        <input
          type="text"
          id="locale"
          name="locale"
          value={formData.locale}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="primaryColor" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.primaryColor || "Primary Color"}
        </label>
        <input
          type="text"
          id="primaryColor"
          name="primaryColor"
          value={formData.primaryColor}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="#000000"
        />
      </div>

      <div>
        <label htmlFor="secondaryColor" className="block text-sm font-medium text-foreground mb-1">
          {dict.admin?.organizations?.secondaryColor || "Secondary Color"}
        </label>
        <input
          type="text"
          id="secondaryColor"
          name="secondaryColor"
          value={formData.secondaryColor}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="#000000"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm font-medium text-foreground">
            {dict.admin?.organizations?.status || "Active"}
          </span>
        </label>
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
              name: orgData.name,
              slug: orgData.slug,
              type: orgData.type,
              description: orgData.description || "",
              website: orgData.website || "",
              email: orgData.email || "",
              phone: orgData.phone || "",
              address: orgData.address || "",
              timezone: orgData.timezone,
              locale: orgData.locale,
              primaryColor: orgData.primaryColor,
              secondaryColor: orgData.secondaryColor,
              isActive: orgData.isActive,
            })
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
