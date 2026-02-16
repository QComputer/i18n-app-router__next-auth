"use client"

import { useState, useEffect } from "react"
import { updateStaff } from "@/app/actions/admin/staff"
import { getOrganizationUsers } from "@/app/actions/organizations"
import { getOrganization } from "@/app/actions/organizations"
import { updateStaffProfileImage } from "@/app/actions/profile-image"
import { ImageUploadWithCrop } from "@/components/ui/image-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StaffEditFormProps {
  staffData: any
  dict: Record<string, any>
  lang: string
}

export default function StaffEditForm({ staffData, dict, lang }: StaffEditFormProps) {
  const [users, setUsers] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    userId: staffData.userId,
    organizationId: staffData.organizationId,
    hierarchy: staffData.hierarchy,
    bio: staffData.bio || "",
    isActive: staffData.isActive,
    isDefault: staffData.isDefault,
  })

  // Current user image
  const [currentImage, setCurrentImage] = useState(staffData.user?.image || "")
  const [imageUpdating, setImageUpdating] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get organization users for the current organization
        const orgUsers = await getOrganizationUsers(staffData.organizationId)
        setUsers(orgUsers)
        
        // Get the specific organization
        const org = await getOrganization(staffData.organizationId)
        if (org) {
          setOrganizations([org])
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError(dict.admin?.common?.error || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [staffData.organizationId, dict.admin?.common?.error])

  // Handle image upload
  const handleImageChange = async (imageUrl: string) => {
    setImageUpdating(true)
    try {
      await updateStaffProfileImage(staffData.id, imageUrl)
      setCurrentImage(imageUrl)
      setSuccess(dict.admin?.staff?.imageUpdated || "Profile image updated successfully")
    } catch (err: any) {
      setError(err.message || dict.admin?.common?.error || "Failed to update image")
    } finally {
      setImageUpdating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await updateStaff(staffData.id, formData)
      setSuccess(dict.admin?.staff?.saveSuccess || "Staff member saved successfully")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Image Section */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={currentImage} alt="Profile" className="object-cover" />
          <AvatarFallback className="text-2xl">
            {staffData.user?.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="font-medium text-lg">{staffData.user?.name || "Staff Member"}</h3>
          <p className="text-sm text-muted-foreground">{staffData.user?.email}</p>
        </div>

        <ImageUploadWithCrop
          value={currentImage}
          onChange={handleImageChange}
          aspectRatio={1}
          maxSize={300}
          label="Change Photo"
          disabled={imageUpdating}
        />
      </div>

      {/* Success/Error Messages */}
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

      {/* Staff Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-foreground mb-1">
            {dict.admin?.staff?.userId || "User"}
          </label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">{dict.admin?.common?.select || "Select a user"}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.username} ({user.email || "-"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="organizationId" className="block text-sm font-medium text-foreground mb-1">
            {dict.admin?.staff?.organizationId || "Organization"}
          </label>
          <select
            id="organizationId"
            name="organizationId"
            value={formData.organizationId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">{dict.admin?.common?.select || "Select an organization"}</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="hierarchy" className="block text-sm font-medium text-foreground mb-1">
            {dict.admin?.staff?.hierarchy || "Hierarchy"}
          </label>
          <select
            id="hierarchy"
            name="hierarchy"
            value={formData.hierarchy}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="OWNER">{dict.admin?.hierarchy?.OWNER || "Owner"}</option>
            <option value="MANAGER">{dict.admin?.hierarchy?.MANAGER || "Manager"}</option>
            <option value="MERCHANT">{dict.admin?.hierarchy?.MERCHANT || "Merchant"}</option>
          </select>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">
            {dict.admin?.staff?.bio || "Bio"}
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
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
              {dict.admin?.staff?.isActive || "Active"}
            </span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="rounded"
            />
            <span className="text-sm font-medium text-foreground">
              {dict.admin?.staff?.isDefault || "Default Staff"}
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
                userId: staffData.userId,
                organizationId: staffData.organizationId,
                hierarchy: staffData.hierarchy,
                bio: staffData.bio || "",
                isActive: staffData.isActive,
                isDefault: staffData.isDefault,
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
    </div>
  )
}
