"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Search, Package, ChevronsUpDown, ChevronUp, ChevronDown, Plus, Upload, Wand2, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
    id: number;
    title: string;
    category: string;
    description?: string;
    sellingPrice: string;
    costPrice?: string;
    stock: number;
    anime: string;
    imageUrl: string;
    sold: number;
    profit: number;
    availableSizes?: string;
    availableColors?: string;
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminProductsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'profitPerUnit' | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc'
    });

    // Edit Dialog State
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editSellingPrice, setEditSellingPrice] = useState("");
    const [editCostPrice, setEditCostPrice] = useState("");
    const [editStock, setEditStock] = useState("");
    const [editAvailableSizes, setEditAvailableSizes] = useState("");
    const [editAvailableColors, setEditAvailableColors] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            return;
        }

        if (selectedIds.length === 0) {
            setIsSelectionMode(false);
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

        try {
            // Sequential delete or bulk API (we only have single delete API for now)
            // Ideally we'd add a bulk delete endpoint. For now, Promise.all.
            await Promise.all(selectedIds.map(id => fetchApi(`/api/admin/products/${id}`, { method: "DELETE" })));

            const remaining = products.filter(p => !selectedIds.includes(p.id));
            setProducts(remaining);
            setFilteredProducts(remaining.filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.category.toLowerCase().includes(search.toLowerCase())
            ));
            setSelectedIds([]);
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Some items failed to delete");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetchApi(`/api/admin/products/${id}`, { method: "DELETE" });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                setFilteredProducts(filteredProducts.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                router.push("/login");
                return;
            }

            const loadProducts = async () => {
                try {
                    const res = await fetchApi("/api/admin/products");
                    if (res.ok) {
                        const data = await res.json();
                        setProducts(data);
                        setFilteredProducts(data);
                    }
                } catch (err) {
                    console.error("Failed to load products", err);
                } finally {
                    setLoading(false);
                }
            };

            loadProducts();
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(lowerSearch) ||
            p.category.toLowerCase().includes(lowerSearch) ||
            p.anime.toLowerCase().includes(lowerSearch)
        );
        setFilteredProducts(filtered);
    }, [search, products]);

    const handleSort = (key: keyof Product | 'profitPerUnit') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue: any = a[sortConfig.key as keyof Product];
        let bValue: any = b[sortConfig.key as keyof Product];

        // Handle calculated Profit Per Unit
        if (sortConfig.key === 'profitPerUnit') {
            aValue = Number(a.sellingPrice) - (a.costPrice ? Number(a.costPrice) : 0);
            bValue = Number(b.sellingPrice) - (b.costPrice ? Number(b.costPrice) : 0);
        } else {
            // Handle numeric conversions for proper sorting
            if (['sellingPrice', 'costPrice', 'stock', 'sold', 'profit', 'id'].includes(sortConfig.key)) {
                aValue = Number(aValue);
                bValue = Number(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const SortIcon = ({ columnKey }: { columnKey: keyof Product | 'profitPerUnit' }) => {
        if (sortConfig.key !== columnKey) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />;
    };

    const handleEditClick = (product: Product) => {
        setEditProduct(product);
        setEditTitle(product.title);
        setEditCategory(product.category);
        setEditAnime(product.anime || "");
        setEditDescription(product.description || "");
        setEditSellingPrice(product.sellingPrice);
        setEditCostPrice(product.costPrice || (Number(product.sellingPrice) * 0.7).toFixed(2));
        setEditStock(String(product.stock));
        setEditImageUrl(product.imageUrl);
        setEditAvailableSizes(product.availableSizes || "");
        setEditAvailableColors(product.availableColors || "");
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editProduct) return;
        setIsSaving(true);
        try {
            const res = await fetchApi(`/api/admin/products/${editProduct.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription, // Note: this might overwrite with empty if we didn't fetch full details.
                    category: editCategory,
                    anime: editAnime,
                    imageUrl: editImageUrl,
                    sellingPrice: editSellingPrice,
                    costPrice: editCostPrice,
                    stock: editStock,
                    availableSizes: editAvailableSizes,
                    availableColors: editAvailableColors,
                }),
            });

            if (res.ok) {
                // Update local state
                const updatedProducts = products.map(p =>
                    p.id === editProduct.id
                        ? {
                            ...p,
                            title: editTitle,
                            category: editCategory,
                            anime: editAnime,
                            imageUrl: editImageUrl,
                            sellingPrice: editSellingPrice,
                            costPrice: editCostPrice,
                            stock: Number(editStock),
                            availableSizes: editAvailableSizes,
                            availableColors: editAvailableColors,
                        }
                        : p
                );
                setProducts(updatedProducts);
                setIsDialogOpen(false);
            } else {
                alert("Failed to update product");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating product");
        } finally {
            setIsSaving(false);
        }
    };

    // Add Product State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [imageTab, setImageTab] = useState<'upload' | 'ai'>('upload');
    const [newProduct, setNewProduct] = useState({
        title: "",
        category: "",
        description: "",
        sellingPrice: "",
        costPrice: "",
        stock: "",
        imageUrl: "",
        anime: "",
        availableSizes: "",
        availableColors: "",
    });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Edit State Extended
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editAnime, setEditAnime] = useState("");
    const [editImageUrl, setEditImageUrl] = useState("");
    const [editImageTab, setEditImageTab] = useState<'upload' | 'ai'>('upload');

    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cat = e.target.value;
        let sizes = "";
        let colors = "";

        if (cat === "Anime T-Shirt" || cat === "Hoodies") {
            sizes = "S, M, L, XL, XXL";
            colors = "Black, White, Navy, Red";
        } else if (cat === "Shoes") {
            sizes = "UK 6, UK 7, UK 8, UK 9, UK 10";
            colors = "Standard";
        } else {
            sizes = "One Size";
            colors = "Standard";
        }

        setNewProduct(prev => ({ ...prev, category: cat, availableSizes: sizes, availableColors: colors }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadFile(file);

            // Auto upload on select for simplicity
            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await fetchApi("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isEdit) {
                        setEditImageUrl(data.imageUrl);
                    } else {
                        setNewProduct(prev => ({ ...prev, imageUrl: data.imageUrl }));
                    }
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Image upload failed");
            }
        }
    };

    const handleGenerateAI = async (title: string, description: string, isEdit = false) => {
        setIsGenerating(true);
        try {
            const res = await fetchApi("/api/admin/generate-image", {
                method: "POST",
                body: JSON.stringify({ title, description }),
            });
            const data = await res.json();
            if (res.ok && data.imageUrl) {
                if (isEdit) {
                    setEditImageUrl(data.imageUrl);
                } else {
                    setNewProduct(prev => ({ ...prev, imageUrl: data.imageUrl }));
                }
            } else {
                alert("Failed to generate image");
            }
        } catch (error) {
            console.error("AI Gen Error", error);
            alert("Error generating image");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProduct.title || !newProduct.sellingPrice) {
            alert("Title and Selling Price are required");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetchApi("/api/admin/products", {
                method: "POST",
                body: JSON.stringify(newProduct),
            });
            if (res.ok) {
                const data = await res.json();
                setIsAddDialogOpen(false);
                setNewProduct({
                    title: "",
                    category: "",
                    description: "",
                    sellingPrice: "",
                    costPrice: "",
                    stock: "",
                    imageUrl: "",
                    anime: "",
                    availableSizes: "",
                    availableColors: "",
                });
                setUploadFile(null);
                window.location.reload();
            } else {
                alert("Failed to create product");
            }
        } catch (error) {
            console.error("Create error", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="w-full max-w-[1600px] mx-auto px-8 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm flex items-center mb-2">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={isSelectionMode ? "destructive" : "default"}
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isSelectionMode ? (selectedIds.length > 0 ? `Delete Items (${selectedIds.length})` : "Cancel Selection") : "Delete"}
                        </Button>

                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 border-b flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Total Items: {filteredProducts.length}
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                <tr>
                                    {isSelectionMode && (
                                        <th className="px-6 py-3 font-medium">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                    )}
                                    <th className="px-6 py-3 font-medium">
                                        <Button variant="ghost" onClick={() => handleSort('title')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                            Product <SortIcon columnKey="title" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        <Button variant="ghost" onClick={() => handleSort('category')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                            Category / Anime <SortIcon columnKey="category" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        <Button variant="ghost" onClick={() => handleSort('sellingPrice')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                            Selling Price <SortIcon columnKey="sellingPrice" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        <Button variant="ghost" onClick={() => handleSort('costPrice')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                            Cost Price <SortIcon columnKey="costPrice" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-center">
                                        <div className="flex justify-center">
                                            <Button variant="ghost" onClick={() => handleSort('profitPerUnit')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                                Profit / Unit <SortIcon columnKey="profitPerUnit" />
                                            </Button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-center">
                                        <div className="flex justify-center">
                                            <Button variant="ghost" onClick={() => handleSort('sold')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                                Units Sold <SortIcon columnKey="sold" />
                                            </Button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-center">
                                        <div className="flex justify-center">
                                            <Button variant="ghost" onClick={() => handleSort('profit')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                                Total Profit <SortIcon columnKey="profit" />
                                            </Button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-center">
                                        <div className="flex justify-center">
                                            <Button variant="ghost" onClick={() => handleSort('stock')} className="hover:bg-transparent p-0 font-medium text-xs uppercase flex items-center">
                                                Stock Level <SortIcon columnKey="stock" />
                                            </Button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProducts.map((product) => (
                                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        {isSelectionMode && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    checked={selectedIds.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0 border">
                                                    {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />}
                                                </div>
                                                <span className="font-medium">{product.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {product.category}
                                            <div className="text-xs opacity-70">{product.anime}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            ₹{Number(product.sellingPrice).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            ₹{product.costPrice ? Number(product.costPrice).toFixed(2) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center text-green-600 font-medium">
                                            ₹{(Number(product.sellingPrice) - (product.costPrice ? Number(product.costPrice) : 0)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-muted-foreground font-medium">
                                            {product.sold}
                                        </td>
                                        <td className="px-6 py-4 text-center text-green-600 font-medium">
                                            ₹{Number(product.profit).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {product.stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product: {editProduct?.title}</DialogTitle>
                        <DialogDescription>
                            Update product details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Product Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {[
                                        "Anime T-Shirt", "Hoodies", "Toys", "Accessories",
                                        "Mugs", "Keychains", "Shoes", "Mouse Pads"
                                    ].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="edit-anime">Anime / Series</Label>
                                <Input
                                    id="edit-anime"
                                    value={editAnime}
                                    onChange={(e) => setEditAnime(e.target.value)}
                                    placeholder="e.g. Naruto, One Piece"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-desc">Description</Label>
                            <textarea
                                id="edit-desc"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Describe the product..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-selling">Selling Price (₹)</Label>
                                <Input
                                    id="edit-selling"
                                    type="number"
                                    value={editSellingPrice}
                                    onChange={(e) => setEditSellingPrice(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cost">Cost Price (₹)</Label>
                                <Input
                                    id="edit-cost"
                                    type="number"
                                    value={editCostPrice}
                                    onChange={(e) => setEditCostPrice(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-stock">Stock Level</Label>
                                <Input
                                    id="edit-stock"
                                    type="number"
                                    value={editStock}
                                    onChange={(e) => setEditStock(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-sizes">Available Sizes</Label>
                                <Input
                                    id="edit-sizes"
                                    value={editAvailableSizes}
                                    onChange={(e) => setEditAvailableSizes(e.target.value)}
                                    placeholder="e.g. S, M, L, XL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-colors">Available Colors</Label>
                                <Input
                                    id="edit-colors"
                                    value={editAvailableColors}
                                    onChange={(e) => setEditAvailableColors(e.target.value)}
                                    placeholder="e.g. Black, White, Red"
                                />
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <Label className="text-base font-semibold">Product Image</Label>

                            {/* Tabs (Custom) */}
                            <div className="flex items-center gap-2 mb-4">
                                <Button
                                    variant={editImageTab === 'upload' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setEditImageTab('upload')}
                                >
                                    <Upload className="h-4 w-4 mr-2" /> Upload
                                </Button>
                                <Button
                                    variant={editImageTab === 'ai' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setEditImageTab('ai')}
                                >
                                    <Wand2 className="h-4 w-4 mr-2" /> AI Generate
                                </Button>
                            </div>

                            {editImageTab === 'upload' ? (
                                <div className="space-y-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, true)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Generate an image using AI based on the product title and description.
                                    </p>
                                    <Button onClick={() => handleGenerateAI(editTitle, editDescription, true)} disabled={isGenerating} className="w-full">
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" /> Generate Image
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Preview */}
                            {editImageUrl && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium mb-2">Preview:</p>
                                    <div className="h-48 w-full rounded-md border flex items-center justify-center bg-white overflow-hidden relative">
                                        <img src={editImageUrl} alt="Preview" className="h-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
                        <Button variant="destructive" onClick={() => {
                            if (editProduct && confirm("Delete " + editProduct.title + "?")) {
                                handleDelete(editProduct.id);
                                setIsDialogOpen(false);
                            }
                        }}>Delete Item</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new product to the catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-title">Product Title</Label>
                                <Input
                                    id="new-title"
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    placeholder="e.g. Naruto Headband"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-category">Category</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newProduct.category}
                                    onChange={handleNewCategoryChange}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {[
                                        "Anime T-Shirt", "Hoodies", "Toys", "Accessories",
                                        "Mugs", "Keychains", "Shoes", "Mouse Pads"
                                    ].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="new-anime">Anime / Series</Label>
                                <Input
                                    id="new-anime"
                                    value={newProduct.anime}
                                    onChange={(e) => setNewProduct({ ...newProduct, anime: e.target.value })}
                                    placeholder="e.g. Naruto, One Piece"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-desc">Description</Label>
                            <textarea
                                id="new-desc"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Describe the product..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-selling">Selling Price (₹)</Label>
                                <Input
                                    id="new-selling"
                                    type="number"
                                    value={newProduct.sellingPrice}
                                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-cost">Cost Price (₹)</Label>
                                <Input
                                    id="new-cost"
                                    type="number"
                                    value={newProduct.costPrice}
                                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-stock">Stock Level</Label>
                                <Input
                                    id="new-stock"
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-sizes">Available Sizes</Label>
                                <Input
                                    id="new-sizes"
                                    value={newProduct.availableSizes}
                                    onChange={(e) => setNewProduct({ ...newProduct, availableSizes: e.target.value })}
                                    placeholder="e.g. S, M, L, XL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-colors">Available Colors</Label>
                                <Input
                                    id="new-colors"
                                    value={newProduct.availableColors}
                                    onChange={(e) => setNewProduct({ ...newProduct, availableColors: e.target.value })}
                                    placeholder="e.g. Black, White"
                                />
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <Label className="text-base font-semibold">Product Image</Label>

                            {/* Tabs (Custom) */}
                            <div className="flex items-center gap-2 mb-4">
                                <Button
                                    variant={imageTab === 'upload' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setImageTab('upload')}
                                >
                                    <Upload className="h-4 w-4 mr-2" /> Upload
                                </Button>
                                <Button
                                    variant={imageTab === 'ai' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setImageTab('ai')}
                                >
                                    <Wand2 className="h-4 w-4 mr-2" /> AI Generate
                                </Button>
                            </div>

                            {imageTab === 'upload' ? (
                                <div className="space-y-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    {uploadFile && <p className="text-xs text-muted-foreground">Selected: {uploadFile.name}</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Generate an image using AI based on the product title and description.
                                    </p>
                                    <Button onClick={() => handleGenerateAI(newProduct.title, newProduct.description)} disabled={isGenerating} className="w-full">
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" /> Generate Image
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Preview */}
                            {newProduct.imageUrl && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium mb-2">Preview:</p>
                                    <div className="h-48 w-full rounded-md border flex items-center justify-center bg-white overflow-hidden relative">
                                        <img src={newProduct.imageUrl} alt="Preview" className="h-full object-contain" />
                                    </div>
                                    <p className="text-xs text-green-600 mt-1 flex items-center">
                                        <ImageIcon className="h-3 w-3 mr-1" /> Image ready
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateProduct} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
