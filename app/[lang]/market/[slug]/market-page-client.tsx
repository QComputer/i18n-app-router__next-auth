"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { MapPin, Phone, Mail, Globe, Store, Users, Clock, ShoppingCart, Plus, Minus, Trash2, Menu, X, ChevronDown, Edit, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { toPersianDigits } from "@/lib/utils"

interface ProductWithCategory {
  id: string
  name: string
  image: string | null
  coverImage: string | null
  avatarImage: string | null
  price: number | null
  currency: string
  isActive: boolean
  productCategory: { id: string; name: string; description: string | null }
}

interface Staff {
  id: string
  hierarchy: string
  user: { id: string; name: string | null; email: string | null; phone: string | null; image: string | null }
}

interface MarketOrg {
  id: string; name: string; slug: string; type: string
  coverImage: string | null; avatarImage: string | null; logo: string | null
  description: string | null; phone: string | null; email: string | null
  address: string | null; website: string | null; workingHours: string | null
  products: ProductWithCategory[]; staffs: Staff[]
}

interface CartItem { product: ProductWithCategory; quantity: number }

export function MarketPageClient({ organization, dictionary, lang, isOwner, followerCount }: {
  organization: MarketOrg
  dictionary: Record<string, unknown>
  lang: string
  isOwner: boolean
  followerCount: number
}) {
  const isRtl = lang === "fa" || lang === "ar"
  const [cart, setCart] = useState<CartItem[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const groupedProducts = organization.products.reduce((acc, p) => {
    const cat = p.productCategory.name
    if (!acc[cat]) acc[cat] = { id: p.productCategory.id, name: cat, products: [] }
    acc[cat].products.push(p)
    return acc
  }, {} as Record<string, { id: string; name: string; products: ProductWithCategory[] }>)

  const categories = Object.values(groupedProducts)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(categories.map(c => c.id)))

  const toggleCat = (id: string) => setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const getQty = (id: string) => cart.find(i => i.product.id === id)?.quantity || 0

  const addToCart = (p: ProductWithCategory) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id)
      if (ex) return prev.map(i => i.product.id === p.id ? {...i, quantity: i.quantity + 1} : i)
      return [...prev, { product: p, quantity: 1 }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id))
    else setCart(prev => prev.map(i => i.product.id === id ? {...i, quantity: qty} : i))
  }

  const handleFollow = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) { await unfollowTarget(organization.id, "ORGANIZATION"); setIsFollowing(false) }
      else { await followTarget(organization.id, "ORGANIZATION"); setIsFollowing(true) }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cart.reduce((s, i) => s + (i.product.price || 0) * i.quantity, 0)

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="relative">
        <div className="h-64 md:h-80 w-full bg-muted relative overflow-hidden">
          {organization.coverImage ? <Image src={organization.coverImage} alt={organization.name} fill className="object-cover" priority /> : <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="h-32 w-32 border-4 border-background shadow-lg rounded-xl overflow-hidden bg-background">
              {organization.logo || organization.avatarImage ? <Image src={(organization.logo || organization.avatarImage) as string} alt={organization.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-green-100"><Store className="h-16 w-16 text-green-600" /></div>}
            </div>
            <div className="flex-1 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{organization.name}</h1>
              {organization.description && <p className="text-white/80 max-w-2xl">{organization.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 pb-6 text-white/90">
            {organization.phone && <a href={`tel:${organization.phone}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4" /><span>{organization.phone}</span></a>}
            {organization.address && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{organization.address}</span></span>}
            {organization.workingHours && <span className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{organization.workingHours}</span></span>}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {isOwner && <div className="mb-6 flex justify-end"><Link href={`/${lang}/settings/organization`}><Button variant="outline"><Edit className="h-4 w-4 mr-2" />{lang === "fa" ? "ویرایش" : "Edit"}</Button></Link></div>}
        
        {!isOwner && <div className="mb-6 flex justify-between items-center">
          <span className="text-lg"><strong>{followerCount}</strong> {lang === "fa" ? "دنبال‌کننده" : "followers"}</span>
          <Button onClick={handleFollow} disabled={isLoading}>{isFollowing ? (lang === "fa" ? "دنبال می‌کنید" : "Following") : (lang === "fa" ? "دنبال کنید" : "Follow")}</Button>
        </div>}

        {/* Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="h-6 w-6" />{lang === "fa" ? "محصولات" : "Products"}</h2>
          <div className="space-y-6">
            {categories.map(cat => (
              <Card key={cat.id}>
                <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted">
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{lang === "fa" ? toPersianDigits(cat.products.length.toString()) : cat.products.length}</Badge>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expanded.has(cat.id) ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expanded.has(cat.id) && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cat.products.map(p => {
                        const qty = getQty(p.id)
                        return (
                          <div key={p.id} className={`border rounded-lg overflow-hidden ${!p.isActive ? "opacity-60" : ""}`}>
                            <div className="aspect-square relative bg-muted">
                              {p.image ? <Image src={p.image} alt={p.name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground" /></div>}
                              {!p.isActive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Badge variant="destructive">{lang === "fa" ? "ناموجود" : "Unavailable"}</Badge></div>}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold mb-1">{p.name}</h4>
                              {p.price !== null && <span className="text-lg font-bold text-primary">{lang === "fa" ? toPersianDigits(p.price.toLocaleString()) : p.price.toLocaleString()} {p.currency}</span>}
                              {p.isActive && (
                                <div className="mt-3">
                                  {qty > 0 ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <button onClick={() => updateQty(p.id, qty - 1)} className="flex-1 p-2 bg-muted rounded-lg"><Minus className="h-4 w-4 mx-auto" /></button>
                                      <span className="flex-1 text-center font-medium">{lang === "fa" ? toPersianDigits(qty.toString()) : qty}</span>
                                      <button onClick={() => addToCart(p)} className="flex-1 p-2 bg-primary text-primary-foreground rounded-lg"><Plus className="h-4 w-4 mx-auto" /></button>
                                    </div>
                                  ) : (
                                    <Button onClick={() => addToCart(p)} className="w-full" size="sm"><Plus className="h-4 w-4 mr-1" />{lang === "fa" ? "افزودن" : "Add"}</Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Staff */}
        {organization.staffs.length > 0 && (
          <section className="mt-12 py-12 bg-muted/30">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="h-6 w-6" />{lang === "fa" ? "تیم ما" : "Our Team"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {organization.staffs.map(s => (
                <Link key={s.id} href={`/${lang}/staff/${s.id}`} className="flex flex-col items-center text-center p-4 bg-background rounded-lg hover:shadow-md">
                  <Avatar className="h-16 w-16 mb-2">{s.user.image ? <AvatarImage src={s.user.image} /> : <AvatarFallback>{s.user.name?.charAt(0) || "?"}</AvatarFallback>}</Avatar>
                  <p className="font-medium text-sm">{s.user.name}</p>
                  <p className="text-xs text-muted-foreground">{s.hierarchy}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="mt-12">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />{lang === "fa" ? "اطلاعات تماس" : "Contact"}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organization.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{lang === "fa" ? "تلفن" : "Phone"}</p><a href={`tel:${organization.phone}`} className="text-muted-foreground">{organization.phone}</a></div></div>}
                {organization.email && <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{lang === "fa" ? "ایمیل" : "Email"}</p><a href={`mailto:${organization.email}`} className="text-muted-foreground">{organization.email}</a></div></div>}
                {organization.address && <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{lang === "fa" ? "آدرس" : "Address"}</p><p className="text-muted-foreground">{organization.address}</p></div></div>}
                {organization.website && <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{lang === "fa" ? "وب‌سایت" : "Website"}</p><a href={organization.website} target="_blank" className="text-muted-foreground">{organization.website}</a></div></div>}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Cart */}
      {totalItems > 0 && (
        <>
          <button onClick={() => setCartOpen(true)} className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg">
            <ShoppingCart className="h-5 w-5" /><span className="font-semibold">{lang === "fa" ? toPersianDigits(totalItems.toString()) : totalItems}</span>
          </button>
          {cartOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setCartOpen(false)} />
          )}
          <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-md bg-background shadow-2xl transform transition-transform ${cartOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">{lang === "fa" ? "سبد خرید" : "Cart"}</h2>
                <button onClick={() => setCartOpen(false)} className="p-2"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-3 border rounded-lg">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">{item.product.image ? <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="p-1"><Minus className="h-4 w-4" /></button>
                        <span>{lang === "fa" ? toPersianDigits(item.quantity.toString()) : item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="p-1"><Plus className="h-4 w-4" /></button>
                        <button onClick={() => updateQty(item.product.id, 0)} className="p-1 ml-auto text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t space-y-4">
                  <div className="flex justify-between text-lg font-bold"><span>{lang === "fa" ? "جمع:" : "Total:"}</span><span>{lang === "fa" ? toPersianDigits(totalPrice.toLocaleString()) : totalPrice.toLocaleString()}</span></div>
                  <Button className="w-full">{lang === "fa" ? "ثبت سفارش" : "Order"} <ArrowRight className="h-4 w-4 mr-2" /></Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
