import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faStar,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const RewardDetails = ({ reward, userPoints, onBack, onRedeem }) => {
  const [activeImage, setActiveImage] = useState(0);

  // Mock additional images for carousel
  const images = [
    reward.imageUrl,
    "https://placehold.co/600x400/0f172a/ffffff?text=Product+View+2",
    "https://placehold.co/600x400/0f172a/ffffff?text=Product+View+3"
  ].filter(Boolean);

  const canRedeem = userPoints >= reward.pointsRequired;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-ink-muted hover:text-ink font-bold mb-8 transition-colors group"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <div className="bg-white    border border-line overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="p-8 lg:p-12 bg-parchment flex flex-col gap-6">
            <div className="aspect-square  overflow-hidden bg-slate-200 relative group ">
              <img 
                src={images[activeImage]} 
                alt={reward.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 bg-white/90  px-4 py-2  border border-line flex items-center gap-2 ">
                <FontAwesomeIcon icon={faStar} className="text-amber-500 text-xs" />
                <span className="text-sm font-semibold text-ink">{reward.pointsRequired} Points</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20  overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === idx ? "border-indigo-500 scale-95 " : "border-transparent opacity-60 hover:opacity-100"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy-wash text-navy rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] mb-4">
                {reward.category} Collection
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-ink tracking-tight mb-4 uppercase">{reward.name}</h2>
              <p className="text-ink-muted leading-relaxed text-sm lg:text-base font-medium">
                {reward.description || "This premium institutional reward represents a significant milestone in your academic journey. Crafted with excellence and reserved for the most dedicated achievers."}
              </p>
            </div>

            {/* Action Bar */}
            <div className="mt-auto pt-8 border-t border-line flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted block mb-1">Total Points Required</span>
                <div className="flex items-center gap-3">
                   <span className="text-3xl font-semibold text-ink">{reward.pointsRequired}</span>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-semibold ${canRedeem ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {canRedeem ? "FUNDS AVAILABLE" : "INSUFFICIENT BALANCE"}
                   </div>
                </div>
              </div>

              <button
                disabled={!canRedeem}
                onClick={() => onRedeem(reward)}
                className={`h-16 px-10  text-xs font-semibold uppercase tracking-[0.14em] transition-all active:scale-95 flex items-center gap-3  ${
                  canRedeem 
                    ? "bg-navy text-white hover:bg-navy " 
                    : "bg-parchment text-ink-muted cursor-not-allowed"
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
