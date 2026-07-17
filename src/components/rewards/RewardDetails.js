import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faStar,
  faGift,
  faCheckCircle,
  faInfoCircle,
  faTruckFast,
  faShieldHalved,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const RewardDetails = ({ reward, userPoints, onBack, onRedeem }) => {
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Original");
  const [activeImage, setActiveImage] = useState(0);

  // Mock additional images for carousel
  const images = [
    reward.imageUrl,
    "https://placehold.co/600x400/0f172a/ffffff?text=Product+View+2",
    "https://placehold.co/600x400/0f172a/ffffff?text=Product+View+3"
  ].filter(Boolean);

  const canRedeem = userPoints >= reward.pointsRequired;
  const isApparel = reward.category === "apparel";

  const specifications = {
    sizes: ["S", "M", "L", "XL"],
    colors: ["Original", "Stealth Black", "Titanium", "Midnight"]
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="p-8 lg:p-12 bg-slate-50 flex flex-col gap-6">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-200 relative group shadow-inner">
              <img 
                src={images[activeImage]} 
                alt={reward.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2 shadow-sm">
                <FontAwesomeIcon icon={faStar} className="text-amber-500 text-xs" />
                <span className="text-sm font-black text-slate-900">{reward.pointsRequired} Points</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === idx ? "border-indigo-500 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                {reward.category} Collection
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">{reward.name}</h2>
              <p className="text-slate-500 leading-relaxed text-sm lg:text-base font-medium">
                {reward.description || "This premium institutional reward represents a significant milestone in your academic journey. Crafted with excellence and reserved for the most dedicated achievers."}
              </p>
            </div>

            <div className="space-y-8 flex-1">
              {/* Specifications */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Select Specifications</h4>

                <div className="space-y-6">
                  {isApparel && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-2">SIZE</span>
                      <div className="flex gap-2">
                        {specifications.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-12 rounded-xl text-xs font-black transition-all ${
                              selectedSize === size
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-2">FINISH / COLOR</span>
                    <div className="flex flex-wrap gap-2">
                      {specifications.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 h-12 rounded-xl text-xs font-bold transition-all border ${
                            selectedColor === color
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                              : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Highlights */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <FontAwesomeIcon icon={faTruckFast} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Express Delivery</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Authenticity Guard</span>
                 </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Points Required</span>
                <div className="flex items-center gap-3">
                   <span className="text-3xl font-black text-slate-900">{reward.pointsRequired}</span>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black ${canRedeem ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {canRedeem ? "FUNDS AVAILABLE" : "INSUFFICIENT BALANCE"}
                   </div>
                </div>
              </div>

              <button
                disabled={!canRedeem}
                onClick={() => onRedeem(reward, { size: isApparel ? selectedSize : null, color: selectedColor })}
                className={`h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl ${
                  canRedeem 
                    ? "bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Proceed to Redemption
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardDetails;
