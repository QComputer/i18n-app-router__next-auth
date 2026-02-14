/**
 * Service Categories Management Page Client Component
 * 
 * Client-side component for managing service categories.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil, Trash2, ArrowRight, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/dialog"
import { 
  createServiceCategoryAction,
  updateServiceCategoryAction,
  deleteServiceCategoryAction
} from "@/app/actions/service-categories"

interface ServiceCategory {
  id: string
  name: string
  description: string | null
  organizationId: string
  _count: {
    services: number
  }
}

interface ServiceCategoriesPageClientProps {
  categories: ServiceCategory[]
  t: Record<string, string>
  locale: string
}

export default function ServiceCategoriesPageClient({ 
  categories, 
  t, 
  locale 
}: ServiceCategoriesPageClientProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingCategory) {
        await updateServiceCategoryAction(editingCategory.id, formData, locale)
      } else {
        await createServiceCategoryAction(formData, locale)
      }
      setIsOpen(false)
      setEditingCategory(null)
      router.refresh()
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteServiceCategoryAction(categoryId, locale)
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/settings/organization`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back} to Organization Settings
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.description}</p>
        </div>

        {/* New Category Button */}
        <Button onClick={() => {
          setEditingCategory(null)
          setIsOpen(true)
        }}>
          <Plus className="ml-2 h-4 w-4" />
          {t.newCategory}
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.noCategories}</h3>
            <p className="text-muted-foreground text-center">{t.noCategoriesDescription}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {category._count.services} {t.services}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
                        setIsOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    {category._count.services === 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setEditingCategory(null)
        }}
        title={editingCategory ? `${t.edit} ${editingCategory.name}` : t.newCategory}
        size="md"
      >
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t.namePlaceholder}
              defaultValue={editingCategory?.name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t.descriptionLabel}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t.descriptionPlaceholder}
              defaultValue={editingCategory?.description || ""}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit">
              {t.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
