import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCheckCircle,
  faCircleCheck,
  faBoxOpen,
  faCalendarCheck,
  faArrowRight,
  faTicket,
  faCreditCard,
  faReceipt,
  faTruckPlane
} from "@fortawesome/free-solid-svg-icons";
import { createRedemption } from "../../utils/apiServices";
import { toast } from "react-toastify";

const RedemptionFlow = ({ reward, userPoints, onBack, onComplete }) => {
  const [step, setStep] = useState(1); // 1: Preview, 2: Address, 3: Review, 4: Success
  const [coupon, setCoupon] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zipCode: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(() => `TRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleConfirmRedemption = async () => {
    setIsProcessing(true);
    try {
      const redemptionData = {
        rewardId: reward.docId || reward.id || reward._id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        phoneNumber: address.phone,
        email: address.email,
        deliveryAddress: `${address.fullName ? `${address.fullName}\n` : ''}${address.street}${address.city ? `, ${address.city}` : ''}${address.zipCode ? `, ${address.zipCode}` : ''}`,
      };

      const res = await createRedemption(redemptionData);
      
      const newOrderId = res?._id || res?.id || orderId;
      setOrderId(newOrderId);

      onComplete({
        ...address,
        rewardId: reward.docId || reward.id,
        orderId: newOrderId,
        redeemedAt: res?.redeemedAt || new Date().toISOString()
      });
      setStep(4);
    } catch (error) {
      console.error("Error confirming redemption:", error);
      toast.error(error.message || "Failed to process redemption.");
    } finally {
      setIsProcessing(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 max-w-xl mx-auto">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
              step >= s ? "bg-navy border-slate-900 text-white " : "bg-white border-line text-ink-muted"
            }`}>
              {step > s ? <FontAwesomeIcon icon={faCheckCircle} /> : s}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${step >= s ? "text-ink" : "text-ink-muted"}`}>
              {s === 1 ? "Preview" : s === 2 ? "Address" : "Review"}
            </span>
          </div>
          {s < 3 && (
            <div className={`flex-1 h-0.5 mx-4 transition-all ${step > s ? "bg-navy" : "bg-parchment"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {step < 4 && (
        <>
          <button 
            onClick={step === 1 ? onBack : prevStep}
            className="flex items-center gap-2 text-ink-muted hover:text-ink font-bold mb-8 transition-colors"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            {step === 1 ? "Back to Details" : "Previous Step"}
          </button>
          <StepIndicator />
        </>
      )}

      <div className="bg-white    border border-line overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Step 1: Preview */}
        {step === 1 && (
          <div className="p-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold text-ink uppercase tracking-tight mb-8">Redemption Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
              <div className="space-y-6">
                <div className="p-6 bg-parchment  border border-line">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16  bg-white  overflow-hidden p-2">
                       <img src={reward.imageUrl} className="w-full h-full object-cover " alt="" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink uppercase tracking-tight">{reward.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-line">
                    <div className="flex justify-between text-xs font-bold text-ink-muted">
                      <span>Base Points</span>
                      <span>{reward.pointsRequired}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-ink-muted">
                      <span>Processing Fee</span>
                      <span className="text-emerald-600 uppercase">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-ink pt-3 border-t border-dashed border-line">
                      <span>Total Deduction</span>
                      <span>{reward.pointsRequired} Mastery Points</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-navy-wash/50  border border-navy/15/50">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-400 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTicket} />
                    Apply Coupon Code
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code"
                      className="flex-1 h-12 bg-white border border-navy/15  px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button className="h-12 px-6 bg-navy text-white  text-xs font-semibold uppercase tracking-[0.14em]">Apply</button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-navy  p-6 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12">
                      <FontAwesomeIcon icon={faReceipt} className="text-6xl" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Post-Redemption Balance</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-semibold">{userPoints - reward.pointsRequired}</span>
                        <span className="text-xs font-bold opacity-60">Points</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-4 leading-relaxed font-medium">
                        Your points will be automatically deducted upon confirmation of the delivery address.
                      </p>
                    </div>
                 </div>
                 
                 <div className="p-6 border border-line  space-y-4">
                    <div className="flex items-center gap-3 text-ink-muted">
                       <FontAwesomeIcon icon={faCreditCard} className="text-xs" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Additional Payment Options Available</span>
                    </div>
                    <p className="text-[10px] text-ink-muted font-medium">
                       Would you like to combine points with cash? (Coming Soon)
                    </p>
                 </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={nextStep} className="h-16 px-10 bg-navy text-white  text-xs font-semibold uppercase tracking-[0.14em]  flex items-center gap-3">
                Continue to Shipping
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="p-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold text-ink uppercase tracking-tight mb-8">Shipping Coordinates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full h-14 bg-parchment border border-line  px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full h-14 bg-parchment border border-line  px-6 text-xs font-bold outline-none"
                      placeholder="john@example.com"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full h-14 bg-parchment border border-line  px-6 text-xs font-bold outline-none"
                      placeholder="+1 (555) 000"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Delivery Address</label>
                  <textarea 
                    className="w-full h-24 bg-parchment border border-line  p-6 text-xs font-bold outline-none resize-none"
                    placeholder="Street name, Apartment, Suite..."
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">City</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-parchment border border-line  px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">PIN / ZIP Code</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-parchment border border-line  px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                      placeholder="400001"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                </div>
                <div className="p-4 bg-amber-50  border border-amber-100 text-amber-700 text-[10px] font-bold leading-relaxed">
                  Make sure the delivery details are accurate as points will be deducted immediately after this step.
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button 
                onClick={nextStep}
                disabled={!address.fullName || !address.street}
                className="h-16 px-10 bg-navy text-white  text-xs font-semibold uppercase tracking-[0.14em]  flex items-center gap-3 disabled:opacity-50"
              >
                Review Order
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="p-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold text-ink uppercase tracking-tight mb-8">Final Verification</h2>
            <div className="space-y-8 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Acquisition Summary</h4>
                    <div className="p-6 bg-parchment  border border-line">
                       <div className="flex items-center gap-4 mb-4">
                          <img src={reward.imageUrl} className="w-12 h-12  object-cover" alt="" />
                          <div>
                            <p className="font-semibold text-ink text-sm">{reward.name}</p>
                          </div>
                       </div>
                       <div className="flex justify-between items-center py-3 border-t border-line">
                          <span className="text-xs font-bold text-ink-muted">Points to be Deducted</span>
                          <span className="text-sm font-semibold text-ink">-{reward.pointsRequired}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] ml-2">Logistics Center</h4>
                    <div className="p-6 bg-parchment  border border-line">
                       <p className="text-xs font-semibold text-ink mb-1 uppercase tracking-tight">{address.fullName}</p>
                       <p className="text-xs font-medium text-ink-muted leading-relaxed">{address.street}, {address.city || "Mumbai"}</p>
                       <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-ink-muted">
                          <span>{address.phone}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{address.email}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-navy  p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden  ">
                  <div className="absolute inset-0 bg-navy" />
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                     <FontAwesomeIcon icon={faCalendarCheck} className="text-8xl" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-lg font-semibold uppercase tracking-[0.14em] mb-1">Authorization Protocol</h3>
                     <p className="text-xs font-medium text-indigo-100 opacity-80">By confirming, you authorize the immediate deduction of {reward.pointsRequired} Mastery Points.</p>
                  </div>
                  <button 
                    disabled={isProcessing}
                    onClick={handleConfirmRedemption}
                    className="relative z-10 h-14 px-10 bg-white text-navy  text-xs font-semibold uppercase tracking-[0.14em]  active:scale-95 disabled:opacity-70 transition-all"
                  >
                    {isProcessing ? "Authorizing..." : "Confirm Acquisition"}
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">
               <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <h2 className="text-3xl font-semibold text-ink uppercase tracking-tight mb-4 leading-none">Order Secured</h2>
            <p className="text-ink-muted font-medium max-w-md mb-10">
               Congratulations achievement hunter! Your institutional reward has been logged and is moving through the logistics pipeline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mb-12">
               <div className="p-6 bg-parchment  border border-line">
                  <FontAwesomeIcon icon={faReceipt} className="text-ink-muted mb-3" />
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] block mb-1">Reference ID</span>
                  <p className="text-xs font-semibold text-ink">{orderId}</p>
               </div>
               <div className="p-6 bg-parchment  border border-line">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-ink-muted mb-3" />
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] block mb-1">Status</span>
                  <p className="text-xs font-semibold text-emerald-600 uppercase">Processing</p>
               </div>
               <div className="p-6 bg-parchment  border border-line">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-ink-muted mb-3" />
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] block mb-1">Est. Delivery</span>
                  <p className="text-xs font-semibold text-ink">May 15, 2026</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
               <button onClick={onBack} className="flex-1 h-14 bg-parchment text-ink-muted  text-xs font-semibold uppercase tracking-[0.14em] hover:bg-slate-200 transition-all">
                  Return to Vault
               </button>
               <button className="flex-1 h-14 bg-navy text-white  text-xs font-semibold uppercase tracking-[0.14em]  flex items-center justify-center gap-3">
                  <FontAwesomeIcon icon={faTruckPlane} />
                  Track Order
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedemptionFlow;
