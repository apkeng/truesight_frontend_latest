import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTshirt,
  faSearch,
  faStar,
  faHeart,
  faStore,
  faGift,
  faTrophy,
  faMedal,
  faCrown,
  faChartLine,
  faDragon,
  faMagicWandSparkles,
  faArrowRight,
  faBagShopping,
  faFire
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebase/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import clsx from "clsx";

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get icon from string
  const getIconFromString = (iconString) => {
    const iconMap = {
      heart: faHeart,
      dragon: faDragon,
      tshirt: faTshirt,
      "chart-line": faChartLine,
      gift: faGift,
      trophy: faTrophy,
      medal: faMedal,
      crown: faCrown,
      star: faStar
    };
    return iconMap[iconString] || faGift; // Default to gift icon if not found
  };

  // Fetch all rewards from backend API
  const generateProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const rewardsRef = collection(db, "rewards");
      const querySnapshot = await getDocs(rewardsRef);
        
        const rewards = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          rewards.push({
            id: data.id || doc.id,
            name: data.name,
            description: data.description || "",
            price: data.pointsRequired || data.points || 0,
            originalPrice: null,
            category: data.category?.toLowerCase() || "all",
            image: data.image || "/placeholder-reward.jpg",
            rating: 4.8,
            reviews: Math.floor(Math.random() * 100) + 24,
            inStock: true,
            featured: data.featured || false,
            icon: getIconFromString(data.icon),
            pointsRequired: data.pointsRequired || data.points || 0,
            hasDropdown: data.hasDropdown || false,
            dropdownOptions: data.dropdownOptions || [],
            productCategory: data.productCategory || null,
            accessible: data.accessible !== undefined ? data.accessible : true
          });
        });
        
        rewards.sort((a, b) => b.reviews - a.reviews);
        setProducts(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load global exchange hub.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateProducts();
  }, [generateProducts]);

  const getCategoryInfo = (category) => {
    const categories = {
      all: { name: "Universal", icon: faStore, color: "text-slate-600", bgColor: "bg-slate-100" },
      wellness: { name: "Vitality", icon: faHeart, color: "text-rose-600", bgColor: "bg-rose-50" },
      apparel: { name: "Identity", icon: faTshirt, color: "text-emerald-600", bgColor: "bg-emerald-50" },
      fantasy: { name: "Mystic", icon: faDragon, color: "text-indigo-600", bgColor: "bg-indigo-50" },
      trend: { name: "Vanguard", icon: faChartLine, color: "text-purple-600", bgColor: "bg-purple-50" }
    };
    return categories[category] || categories.all;
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  };

  const handleAddToCart = (product) => {
    toast.success(`Success! ${product.name} initialized for procurement.`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 font-['Inter']">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Hero Banner */}
      <div className="mb-8">
        <div className="relative bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 rounded-[2.5rem] p-4 sm:p-5 text-white shadow-2xl shadow-indigo-100 overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <FontAwesomeIcon icon={faBagShopping} className="text-[10rem] -rotate-12" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-3 backdrop-blur-md">
                 <FontAwesomeIcon icon={faMagicWandSparkles} className="text-[10px] text-purple-300" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-purple-50">Global Exchange Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight leading-none">Marketplace</h1>
              <p className="text-indigo-100/70 font-medium text-xs max-w-xl leading-relaxed italic opacity-90 truncate">
                 Exchange your academic prestige for elite physical and digital commodities.
              </p>
            </div>

            <div className="flex flex-col gap-4">
               <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 flex flex-col items-center shadow-inner group/stat hover:bg-white/15 transition-all">
                  <span className="text-3xl font-black group-hover:scale-110 transition-transform">{products.length}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mt-1">Active Commodities</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-md">
                  <FontAwesomeIcon icon={faFire} className="text-emerald-400 animate-pulse text-[10px]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-100">Marketplace Operational</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Advanced Search & Sort */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">System Search</h3>
              <div className="relative group">
                 <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Search hub..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all shadow-inner"
                 />
              </div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-10 mb-6 px-1">Sort Hierarchy</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Institutional Favor</option>
                  <option value="price-low">Prestige: Ascending</option>
                  <option value="price-high">Prestige: Descending</option>
              </select>
           </div>

           {/* Quick Fact Module */}
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100/50">
              <FontAwesomeIcon icon={faCrown} className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4 flex items-center gap-2">
                 <FontAwesomeIcon icon={faMedal} /> Vanguard Status
              </h4>
              <p className="text-xs font-bold text-indigo-50/80 leading-relaxed italic">
                 Elite items require specific achievement tokens. Ensure your Prestige Vault is fully synchronized before procurement calls.
              </p>
           </div>
        </div>

        {/* Categories & Product Grid */}
        <div className="lg:col-span-3">
           <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Commodity Archives</h2>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                {["all", "wellness", "apparel", "fantasy", "trend"].map((category) => {
                  const info = getCategoryInfo(category);
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        "flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                        isSelected 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      )}
                    >
                      <FontAwesomeIcon icon={info.icon} className={clsx("text-xs transition-transform duration-500", isSelected && "scale-125")} />
                      {info.name}
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Results Grid */}
           {loading ? (
             <div className="py-40 flex flex-col items-center gap-6 animate-pulse">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Accessing Synchronized Vaults...</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {getFilteredProducts().map((product) => (
                 <div
                   key={product.id}
                   className="group relative bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700"
                 >
                   {/* Product Preview */}
                   <div className="relative h-60 overflow-hidden bg-slate-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-8">
                         <button className="w-full py-4 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 transition-all">
                            Detailed Inspection
                         </button>
                      </div>
                      
                      {product.featured && (
                         <div className="absolute top-6 left-6 px-4 py-1.5 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-rose-200">
                            Vanguard Choice
                         </div>
                      )}

                      <div className="absolute top-6 right-6 flex flex-col gap-3">
                         <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors">
                            <FontAwesomeIcon icon={faHeart} className="text-sm" />
                         </button>
                      </div>
                   </div>

                   {/* Product Metadata */}
                   <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                         <span className={clsx(
                            "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border",
                            getCategoryInfo(product.category).bgColor,
                            getCategoryInfo(product.category).color,
                            `border-${product.category === 'all' ? 'slate' : product.category}-200`
                         )}>
                            {getCategoryInfo(product.category).name} Range
                         </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-6 italic min-h-[40px]">
                        {product.description}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Required Points</span>
                            <div className="flex items-center gap-2">
                               <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                               <span className="text-xl font-black text-slate-900 tracking-tight">{product.pointsRequired}</span>
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-end">
                             <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <FontAwesomeIcon
                                    key={i}
                                    icon={faStar}
                                    className={`text-[8px] ${i < 4 ? 'text-indigo-500' : 'text-slate-200'}`}
                                  />
                                ))}
                             </div>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{product.reviews} Evaluations</span>
                         </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="mt-8 w-full group/buy relative overflow-hidden bg-slate-950 text-white rounded-[1.8rem] py-5 font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200 hover:shadow-indigo-200"
                      >
                         <div className="relative z-10 flex items-center justify-center gap-3">
                            Procure Item
                            <FontAwesomeIcon icon={faArrowRight} className="group-hover/buy:translate-x-2 transition-transform" />
                         </div>
                      </button>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {!loading && getFilteredProducts().length === 0 && (
             <div className="py-40 text-center bg-white rounded-[3.5rem] border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-1000">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-inner">
                  <FontAwesomeIcon icon={faStore} className="text-4xl" />
               </div>
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-3">No Commodities Discovered</h3>
               <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto italic">
                  The current parameters yielded no synchronized results. Readjust your search coordinates.
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
