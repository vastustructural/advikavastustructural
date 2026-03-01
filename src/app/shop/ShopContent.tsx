"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Eye, ShoppingBag, IndianRupee, ArrowRight, MapPin, Loader2, SortAsc, X, ChevronDown, Check, Tag } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner"; // Added for toast notifications

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string | null;
    originalPrice: string | null;
    imageUrl: string | null;
    category: string | null;
    area: string | null;
    budget: string | null;
    floors: number | null;
    direction: string | null;
    width: number | null;
    depth: number | null;
    bhk: string | null;
    vastu: string | null;
    code: string | null;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type SortOption = "newest" | "price-low" | "price-high" | "name";

export default function ShopContent({ products }: { products: Product[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "newest");
    const { checkout, loading } = useRazorpay();

    // Checkout dialog state
    const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
    const [buyerName, setBuyerName] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    // Advanced Filter State initialized from URL
    const [filters, setFilters] = useState({
        categories: searchParams.get("cat")?.split(",").filter(Boolean) || [],
        plotAreas: searchParams.get("area")?.split(",").filter(Boolean) || [],
        floors: searchParams.get("floors")?.split(",").filter(Boolean) || [],
        directions: searchParams.get("dir")?.split(",").filter(Boolean) || [],
        unitTypes: searchParams.get("unit")?.split(",").filter(Boolean) || [],
        vastu: searchParams.get("vastu") || "Doesn't Matter",
        widthMin: searchParams.get("wmin") || "",
        widthMax: searchParams.get("wmax") || "",
        depthMin: searchParams.get("dmin") || "",
        depthMax: searchParams.get("dmax") || "",
        designCode: searchParams.get("code") || "",
        standardSize: "",
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Sync state to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("q", debouncedSearch);
        if (sortBy !== "newest") params.set("sort", sortBy);
        if (filters.categories.length) params.set("cat", filters.categories.join(","));
        if (filters.plotAreas.length) params.set("area", filters.plotAreas.join(","));
        if (filters.floors.length) params.set("floors", filters.floors.join(","));
        if (filters.directions.length) params.set("dir", filters.directions.join(","));
        if (filters.unitTypes.length) params.set("unit", filters.unitTypes.join(","));
        if (filters.vastu !== "Doesn't Matter") params.set("vastu", filters.vastu);
        if (filters.widthMin) params.set("wmin", filters.widthMin);
        if (filters.widthMax) params.set("wmax", filters.widthMax);
        if (filters.depthMin) params.set("dmin", filters.depthMin);
        if (filters.depthMax) params.set("dmax", filters.depthMax);
        if (filters.designCode) params.set("code", filters.designCode);

        const query = params.toString();
        // Always replace URL to ensure empty state removes old query params cleanly
        if (query) {
            router.replace(`${pathname}?${query}`, { scroll: false });
        } else {
            router.replace(pathname, { scroll: false });
        }
    }, [debouncedSearch, sortBy, filters, pathname, router]);

    const allCategories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]) as string[];

    const formatPrice = (price: string | null) => {
        if (!price || price === "Contact") return "Contact for price";
        if (price.includes("₹")) return price;
        return `₹${Number(price).toLocaleString("en-IN")}`;
    };

    const parsePrice = (price: string | null): number => {
        if (!price || price === "Contact" || price === "Contact for price") return Infinity;
        return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
    };

    const filteredAndSorted = useMemo(() => {
        return products
            .filter((p) => {
                const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    (p.description?.toLowerCase().includes(debouncedSearch.toLowerCase()));

                const matchCategory = filters.categories.length === 0 || (p.category && filters.categories.includes(p.category));

                let matchArea = true;
                if (filters.plotAreas.length > 0 && p.area) {
                    const areaVal = parseInt(p.area.replace(/[^0-9]/g, ""));
                    matchArea = filters.plotAreas.some(range => {
                        if (range === "Upto 1000sqft") return areaVal <= 1000;
                        if (range === "1000-2000sqft") return areaVal > 1000 && areaVal <= 2000;
                        if (range === "2000-3000sqft") return areaVal > 2000 && areaVal <= 3000;
                        if (range === "3000-4000sqft") return areaVal > 3000 && areaVal <= 4000;
                        if (range === "4000-6000sqft") return areaVal > 4000 && areaVal <= 6000;
                        return true;
                    });
                }

                const matchFloors = filters.floors.length === 0 || (p.floors && filters.floors.includes(p.floors.toString()));
                const matchDirections = filters.directions.length === 0 || (p.direction && filters.directions.includes(p.direction));

                const pWidth = p.width || 0;
                const pDepth = p.depth || 0;
                const matchWidth = (!filters.widthMin || pWidth >= parseFloat(filters.widthMin)) && (!filters.widthMax || pWidth <= parseFloat(filters.widthMax));
                const matchDepth = (!filters.depthMin || pDepth >= parseFloat(filters.depthMin)) && (!filters.depthMax || pDepth <= parseFloat(filters.depthMax));

                const matchBhk = filters.unitTypes.length === 0 || (p.bhk && filters.unitTypes.includes(p.bhk));
                const matchVastu = filters.vastu === "Doesn't Matter" || p.vastu === filters.vastu;
                const matchCode = !filters.designCode || (p.code && p.code.toLowerCase().includes(filters.designCode.toLowerCase()));

                return matchSearch && matchCategory && matchArea && matchFloors && matchDirections && matchWidth && matchDepth && matchBhk && matchVastu && matchCode;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "price-low": {
                        const pa = parsePrice(a.price);
                        const pb = parsePrice(b.price);
                        if (pa === pb) return 0;
                        return pa < pb ? -1 : 1;
                    }
                    case "price-high": {
                        const pa = parsePrice(a.price);
                        const pb = parsePrice(b.price);
                        // Treat Infinity ("Contact") as always at the bottom if high-to-low
                        if (pa === Infinity && pb === Infinity) return 0;
                        if (pa === Infinity) return 1;
                        if (pb === Infinity) return -1;
                        if (pa === pb) return 0;
                        return pa > pb ? -1 : 1;
                    }
                    case "name":
                        return a.name.localeCompare(b.name);
                    default:
                        return 0;
                }
            });
    }, [products, debouncedSearch, filters, sortBy]);

    const toggleFilter = (key: keyof typeof filters, value: string) => {
        setFilters(prev => {
            const current = (prev[key] as string[]);
            const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const clearFilters = () => {
        setFilters({
            categories: [], plotAreas: [], floors: [], directions: [], unitTypes: [],
            vastu: "Doesn't Matter", widthMin: "", widthMax: "", depthMin: "", depthMax: "", designCode: "", standardSize: "",
        });
        setSearch("");
        setDebouncedSearch("");
        router.replace(pathname, { scroll: false });
    };

    const handlePurchase = (product: Product) => {
        if (!product.price || product.price === "Contact for price" || product.price === "Contact") {
            window.location.href = "/contact";
            return;
        }
        setCheckoutProduct(product);
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
        setCheckoutOpen(true);
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutProduct) return;
        setCheckoutOpen(false);
        await checkout({
            amount: checkoutProduct.price!,
            productId: checkoutProduct.id,
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
            description: `Purchase for ${checkoutProduct.name}`,
            onSuccess: (response: any) => {
                toast.success("Payment Received Successfully!");
                router.push(`/thank-you?order_id=${response.razorpay_order_id || "ADV-SHP"}`);
            },
        });
        setCheckoutProduct(null);
    };

    const renderFilterContent = () => (
        <div className="space-y-8">
            {/* Categories */}
            <div className="space-y-4">
                <Label className="text-[10px] items-start uppercase font-bold text-navy-primary/40 tracking-widest block">Design Category</Label>
                <div className="space-y-2">
                    {allCategories.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                                id={cat}
                                checked={filters.categories.includes(cat)}
                                onCheckedChange={() => toggleFilter("categories", cat)}
                                className="border-navy-primary/10 data-[state=checked]:bg-gold-accent data-[state=checked]:border-gold-accent"
                            />
                            <label htmlFor={cat} className="text-sm font-medium text-navy-dark w-full cursor-pointer">{cat}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plot Area */}
            <div className="space-y-4">
                <Label className="text-[10px] items-start uppercase font-bold text-navy-primary/40 tracking-widest block">Plot Area</Label>
                <div className="space-y-2">
                    {["Upto 1000sqft", "1000-2000sqft", "2000-3000sqft", "3000-4000sqft", "4000-6000sqft"].map(area => (
                        <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                                id={area}
                                checked={filters.plotAreas.includes(area)}
                                onCheckedChange={() => toggleFilter("plotAreas", area)}
                                className="border-navy-primary/10 data-[state=checked]:bg-gold-accent data-[state=checked]:border-gold-accent"
                            />
                            <label htmlFor={area} className="text-sm font-medium text-navy-dark w-full cursor-pointer">{area}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* No of Floors */}
            <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-navy-primary/40 tracking-widest block">No. of Floors</Label>
                <div className="flex flex-wrap gap-2">
                    {["1", "2", "3", "4", "4+"].map(floor => (
                        <button
                            key={floor}
                            onClick={() => toggleFilter("floors", floor)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.floors.includes(floor)
                                ? "bg-navy-dark text-white"
                                : "bg-cream-bg/50 text-navy-dark hover:bg-cream-bg"
                                }`}
                        >
                            {floor}
                        </button>
                    ))}
                </div>
            </div>

            {/* Direction */}
            <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-navy-primary/40 tracking-widest block">Direction</Label>
                <div className="grid grid-cols-2 gap-2">
                    {["East", "West", "North", "South", "North-East", "North-West", "South-West", "South-East"].map(dir => (
                        <div key={dir} className="flex items-center space-x-2">
                            <Checkbox
                                id={dir}
                                checked={filters.directions.includes(dir)}
                                onCheckedChange={() => toggleFilter("directions", dir)}
                                className="border-navy-primary/10 data-[state=checked]:bg-gold-accent data-[state=checked]:border-gold-accent"
                            />
                            <label htmlFor={dir} className="text-xs font-medium text-navy-dark/70 w-full cursor-pointer">{dir}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-navy-primary/40 tracking-widest block">Plot Dimensions</Label>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-navy-primary/40 italic">Width (Feet)</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Min" value={filters.widthMin} onChange={(e) => setFilters(prev => ({ ...prev, widthMin: e.target.value }))} className="h-10 rounded-xl" />
                            <Input placeholder="Max" value={filters.widthMax} onChange={(e) => setFilters(prev => ({ ...prev, widthMax: e.target.value }))} className="h-10 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-navy-primary/40 italic">Depth (Feet)</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Min" value={filters.depthMin} onChange={(e) => setFilters(prev => ({ ...prev, depthMin: e.target.value }))} className="h-10 rounded-xl" />
                            <Input placeholder="Max" value={filters.depthMax} onChange={(e) => setFilters(prev => ({ ...prev, depthMax: e.target.value }))} className="h-10 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Unit Type */}
            <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-navy-primary/40 tracking-widest block">Unit Type</Label>
                <div className="flex flex-wrap gap-2">
                    {["1BHK", "2BHK", "3BHK", "4BHK", "4BHK+"].map(type => (
                        <button
                            key={type}
                            onClick={() => toggleFilter("unitTypes", type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.unitTypes.includes(type)
                                ? "bg-gold-accent text-navy-primary"
                                : "bg-cream-bg/50 text-navy-dark hover:bg-cream-bg"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vastu */}
            <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-navy-primary/40 tracking-widest block">Vastu Compliance</Label>
                <div className="flex p-1 bg-cream-bg/50 rounded-xl">
                    {["Yes", "No", "Doesn't Matter"].map(v => (
                        <button
                            key={v}
                            onClick={() => setFilters(prev => ({ ...prev, vastu: v }))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.vastu === v
                                ? "bg-white text-navy-primary shadow-sm"
                                : "text-navy-primary/40 hover:text-navy-primary"
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const getActiveFiltersCount = () => {
        return filters.categories.length + filters.plotAreas.length + filters.floors.length +
            filters.directions.length + filters.unitTypes.length +
            (filters.vastu !== "Doesn't Matter" ? 1 : 0) +
            (filters.widthMin || filters.widthMax ? 1 : 0) +
            (filters.depthMin || filters.depthMax ? 1 : 0) +
            (filters.designCode ? 1 : 0);
    };

    return (
        <div className="min-h-screen bg-cream-bg/30 pb-20">
            <section className="brand-gradient text-white section-padding !pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
                </div>
                <div className="container-wide relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
                        <Badge variant="outline" className="text-white/80 border-white/20 mb-4 px-4 py-1">Premium Plan Shop</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading tracking-tight">Vastu Compliant <span className="text-gold-accent">Design Shop</span></h1>
                        <p className="text-white/70 text-lg md:text-xl font-light">Explore a curated collection of architectural masterpieces, ready for your dream home.</p>
                    </motion.div>
                </div>
            </section>

            <div className="container-wide py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-80 shrink-0 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-navy-dark flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gold-accent" /> Filters
                            </h2>
                            {getActiveFiltersCount() > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 text-gold-accent hover:text-gold-accent font-bold">
                                    Clear All
                                </Button>
                            )}
                        </div>
                        <div className="bg-white rounded-3xl border border-navy-primary/5 shadow-sm overflow-hidden p-6">
                            {renderFilterContent()}
                        </div>
                    </aside>

                    {/* Mobile Filter Trigger */}
                    <div className="lg:hidden flex justify-between items-center mb-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="flex-1 mr-4 h-12 rounded-2xl border-navy-primary/10 bg-white font-bold text-navy-dark shadow-sm">
                                    <Filter className="w-4 h-4 mr-2 text-gold-accent" /> Show Filters
                                    {getActiveFiltersCount() > 0 && <Badge className="ml-2 bg-gold-accent text-navy-primary h-5 min-w-5 flex items-center justify-center p-0">{getActiveFiltersCount()}</Badge>}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto rounded-r-3xl">
                                <SheetHeader className="mb-6">
                                    <SheetTitle className="text-2xl font-bold text-navy-dark flex items-center gap-2">
                                        <Filter className="w-6 h-6 text-gold-accent" /> Advanced Filters
                                    </SheetTitle>
                                    <SheetDescription>Refine your search to find the perfect architectural plan.</SheetDescription>
                                </SheetHeader>
                                {renderFilterContent()}
                                <div className="mt-8 pt-6 border-t">
                                    <Button onClick={clearFilters} className="w-full h-12 rounded-2xl bg-navy-dark text-white font-bold">Clear All Filters</Button>
                                    <SheetTrigger asChild>
                                        <Button className="w-full mt-3 h-12 rounded-2xl gold-gradient text-navy-primary font-bold shadow-lg">Apply Filters</Button>
                                    </SheetTrigger>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
                            <SelectTrigger className="w-[140px] h-12 rounded-2xl border-navy-primary/10 bg-white font-bold text-navy-dark shadow-sm">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-navy-primary/10">
                                <SelectItem value="newest">Latest</SelectItem>
                                <SelectItem value="price-low">Price ↑</SelectItem>
                                <SelectItem value="price-high">Price ↓</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <main className="flex-1 space-y-8">
                        {/* Search Bar & Stats */}
                        <div className="bg-white rounded-[2.5rem] border border-navy-primary/5 shadow-sm p-2 flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-primary/30" />
                                <Input
                                    placeholder="Search by name, area, or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-14 h-14 border-0 bg-transparent text-lg focus-visible:ring-0 text-navy-dark font-medium w-full"
                                />
                            </div>
                            <div className="hidden md:flex items-center px-6 border-l border-navy-primary/10">
                                <Badge className="bg-gold-accent/10 text-gold-accent border-0 font-bold px-3 py-1">{filteredAndSorted.length} Designs Found</Badge>
                            </div>
                        </div>

                        {/* Active Filter Badges */}
                        {getActiveFiltersCount() > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-[10px] uppercase font-black text-navy-primary/30 tracking-widest mr-2">Active:</span>
                                {filters.categories.map(cat => (
                                    <Badge key={cat} variant="secondary" className="bg-navy-primary/5 text-navy-primary rounded-full px-3 py-1 flex items-center gap-1">
                                        {cat} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter("categories", cat)} />
                                    </Badge>
                                ))}
                                {filters.plotAreas.map(area => (
                                    <Badge key={area} variant="secondary" className="bg-navy-primary/5 text-navy-primary rounded-full px-3 py-1 flex items-center gap-1">
                                        {area} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter("plotAreas", area)} />
                                    </Badge>
                                ))}
                                {filters.floors.map(f => (
                                    <Badge key={f} variant="secondary" className="bg-navy-primary/5 text-navy-primary rounded-full px-3 py-1 flex items-center gap-1">
                                        {f} Floors <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter("floors", f)} />
                                    </Badge>
                                ))}
                                {filters.vastu !== "Doesn't Matter" && (
                                    <Badge variant="secondary" className="bg-navy-primary/5 text-navy-primary rounded-full px-3 py-1 flex items-center gap-1">
                                        Vastu: {filters.vastu} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(p => ({ ...p, vastu: "Doesn't Matter" }))} />
                                    </Badge>
                                )}
                                <Button variant="link" size="sm" onClick={clearFilters} className="text-xs text-red-500 font-bold h-6 p-0 hover:no-underline underline">Clear All</Button>
                            </div>
                        )}

                        <div className="min-h-[600px]">
                            {filteredAndSorted.length > 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {filteredAndSorted.map((product) => (
                                        <div key={product.id}>
                                            <Card className="group h-full border border-navy-primary/5 shadow-md hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden rounded-[2.5rem] flex flex-col relative">
                                                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                                    <div className="absolute top-6 right-6 z-10">
                                                        <Badge className="bg-red-500 text-white border-0 shadow-lg px-3 py-1 font-bold animate-pulse">SALE</Badge>
                                                    </div>
                                                )}

                                                <div className="relative h-64 bg-slate-50 flex items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-navy-primary/5 to-gold-accent/5" />
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                    ) : (
                                                        <span className="text-8xl group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-2xl opacity-30">🏠</span>
                                                    )}
                                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                        <Badge className="bg-navy-dark/90 text-white backdrop-blur-md px-3 py-1 border-0">{product.category}</Badge>
                                                        {product.bhk && <Badge className="bg-gold-accent text-navy-primary font-bold px-3 py-1 border-0">{product.bhk}</Badge>}
                                                    </div>

                                                    <div className="absolute inset-0 bg-navy-dark/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                                                        <Link href={`/shop/${product.id}`}>
                                                            <Button size="lg" className="gold-gradient text-navy-primary font-bold rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 h-12">
                                                                <Eye className="w-5 h-5 mr-3" /> View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>

                                                <CardContent className="p-8 flex flex-col flex-1 relative z-10 bg-white">
                                                    <div className="flex justify-between items-start mb-2 gap-4">
                                                        <h3 className="text-xl font-black text-navy-dark leading-tight line-clamp-2 group-hover:text-gold-accent transition-colors">{product.name}</h3>
                                                        <span className="text-[10px] font-bold text-navy-primary/20 bg-navy-primary/5 px-1.5 py-0.5 rounded uppercase">{product.code}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-4 mb-6">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-navy-primary/60">
                                                            <MapPin className="w-3.5 h-3.5 text-gold-accent" /> {product.area}
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-navy-primary/10" />
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-navy-primary/60">
                                                            <Tag className="w-3.5 h-3.5 text-gold-accent" /> {product.bhk}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-navy-primary/5">
                                                        <div className="flex flex-col">
                                                            <p className="text-[10px] uppercase font-bold text-navy-primary/30 tracking-widest mb-1">Offer Price</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-black text-navy-primary tracking-tight">{formatPrice(product.price)}</span>
                                                                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                                                    <span className="text-sm font-medium text-navy-primary/30 line-through">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button onClick={() => handlePurchase(product)} disabled={loading} size="icon" className="h-12 w-12 rounded-2xl gold-gradient shadow-lg group-hover:scale-110 transition-transform">
                                                            <ArrowRight className="w-5 h-5 text-navy-primary" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white rounded-[4rem] shadow-sm border border-navy-primary/5">
                                    <div className="w-24 h-24 bg-cream-bg/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-gold-accent/20" />
                                    </div>
                                    <h3 className="text-3xl font-black text-navy-dark mb-4">No Designs Match</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed text-lg">We couldn't find any designs with those filters. Try broading your search or clear all filters.</p>
                                    <Button size="lg" onClick={clearFilters} className="rounded-2xl px-12 bg-navy-dark text-white font-bold h-14 shadow-xl">Reset All Filters</Button>
                                </motion.div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Checkout Details Dialog */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black text-navy-dark">Complete Your Purchase</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Please provide your details to proceed with the payment.
                            </DialogDescription>
                        </DialogHeader>

                        {checkoutProduct && (
                            <div className="bg-cream-bg/50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                                <span className="text-4xl">{checkoutProduct.imageUrl ? <img src={checkoutProduct.imageUrl} alt={checkoutProduct.name} className="w-12 h-12 rounded-lg object-cover" /> : "🏠"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-navy-dark truncate">{checkoutProduct.name}</p>
                                    <p className="text-xs text-navy-primary/50">{checkoutProduct.code}</p>
                                </div>
                                <span className="text-xl font-black text-navy-primary">{formatPrice(checkoutProduct.price)}</span>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buyer-name" className="text-sm font-bold text-navy-dark">Full Name *</Label>
                                <Input
                                    id="buyer-name"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="h-12 rounded-xl border-navy-primary/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyer-email" className="text-sm font-bold text-navy-dark">Email Address *</Label>
                                <Input
                                    id="buyer-email"
                                    type="email"
                                    value={buyerEmail}
                                    onChange={(e) => setBuyerEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="h-12 rounded-xl border-navy-primary/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyer-phone" className="text-sm font-bold text-navy-dark">Phone Number *</Label>
                                <Input
                                    id="buyer-phone"
                                    type="tel"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    required
                                    className="h-12 rounded-xl border-navy-primary/10"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl gold-gradient text-navy-primary font-bold text-base shadow-lg mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
                                Proceed to Pay {checkoutProduct ? formatPrice(checkoutProduct.price) : ""}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
