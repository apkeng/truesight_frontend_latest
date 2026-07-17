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

const RedemptionFlow = ({ reward, specifications, userPoints, onBack, onComplete }) => {
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
        specifications,
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              step >= s ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-300"
            }`}>
              {step > s ? <FontAwesomeIcon icon={faCheckCircle} /> : s}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? "text-slate-900" : "text-slate-300"}`}>
              {s === 1 ? "Preview" : s === 2 ? "Address" : "Review"}
            </span>
          </div>
          {s < 3 && (
            <div className={`flex-1 h-0.5 mx-4 transition-all ${step > s ? "bg-slate-900" : "bg-slate-100"}`} />
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
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            {step === 1 ? "Back to Details" : "Previous Step"}
          </button>
          <StepIndicator />
        </>
      )}

      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Step 1: Preview */}
        {step === 1 && (
          <div className="p-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Redemption Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden p-2">
                       <img src={reward.imageUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight">{reward.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {specifications.color}{specifications.size ? ` • Size ${specifications.size}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Base Points</span>
                      <span>{reward.pointsRequired}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Processing Fee</span>
                      <span className="text-emerald-600 uppercase">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-dashed border-slate-200">
                      <span>Total Deduction</span>
                      <span>{reward.pointsRequired} Mastery Points</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTicket} />
                    Apply Coupon Code
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code"
                      className="flex-1 h-12 bg-white border border-indigo-100 rounded-xl px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button className="h-12 px-6 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Apply</button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12">
                      <FontAwesomeIcon icon={faReceipt} className="text-6xl" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Post-Redemption Balance</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black">{userPoints - reward.pointsRequired}</span>
                        <span className="text-xs font-bold opacity-60">Points</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-4 leading-relaxed font-medium">
                        Your points will be automatically deducted upon confirmation of the delivery address.
                      </p>
                    </div>
                 </div>
                 
                 <div className="p-6 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                       <FontAwesomeIcon icon={faCreditCard} className="text-xs" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Additional Payment Options Available</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                       Would you like to combine points with cash? (Coming Soon)
                    </p>
                 </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={nextStep} className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
                Continue to Shipping
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="p-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Shipping Coordinates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold outline-none"
                      placeholder="john@example.com"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold outline-none"
                      placeholder="+1 (555) 000"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Delivery Address</label>
                  <textarea 
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs font-bold outline-none resize-none"
                    placeholder="Street name, Apartment, Suite..."
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">City</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">PIN / ZIP Code</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                      placeholder="400001"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-[10px] font-bold leading-relaxed">
                  Make sure the delivery details are accurate as points will be deducted immediately after this step.
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button 
                onClick={nextStep}
                disabled={!address.fullName || !address.street}
                className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-3 disabled:opacity-50"
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
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Final Verification</h2>
            <div className="space-y-8 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Acquisition Summary</h4>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex items-center gap-4 mb-4">
                          <img src={reward.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="font-black text-slate-900 text-sm">{reward.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{specifications.color}{specifications.size ? ` • ${specifications.size}` : ""}</p>
                          </div>
                       </div>
                       <div className="flex justify-between items-center py-3 border-t border-slate-200">
                          <span className="text-xs font-bold text-slate-500">Points to be Deducted</span>
                          <span className="text-sm font-black text-slate-900">-{reward.pointsRequired}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Logistics Center</h4>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">{address.fullName}</p>
                       <p className="text-xs font-medium text-slate-500 leading-relaxed">{address.street}, {address.city || "Mumbai"}</p>
                       <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-400">
                          <span>{address.phone}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{address.email}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-600" />
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                     <FontAwesomeIcon icon={faCalendarCheck} className="text-8xl" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-lg font-black uppercase tracking-widest mb-1">Authorization Protocol</h3>
                     <p className="text-xs font-medium text-indigo-100 opacity-80">By confirming, you authorize the immediate deduction of {reward.pointsRequired} Mastery Points.</p>
                  </div>
                  <button 
                    disabled={isProcessing}
                    onClick={handleConfirmRedemption}
                    className="relative z-10 h-14 px-10 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-70 transition-all"
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
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-none">Order Secured</h2>
            <p className="text-slate-500 font-medium max-w-md mb-10">
               Congratulations achievement hunter! Your institutional reward has been logged and is moving through the logistics pipeline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mb-12">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <FontAwesomeIcon icon={faReceipt} className="text-slate-400 mb-3" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference ID</span>
                  <p className="text-xs font-black text-slate-900">{orderId}</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-slate-400 mb-3" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                  <p className="text-xs font-black text-emerald-600 uppercase">Processing</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-slate-400 mb-3" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Est. Delivery</span>
                  <p className="text-xs font-black text-slate-900">May 15, 2026</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
               <button onClick={onBack} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Return to Vault
               </button>
               <button className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
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
