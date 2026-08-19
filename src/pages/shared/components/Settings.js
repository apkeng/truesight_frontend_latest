import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../../firebase/firebase-config";
import Textbox from "../../../components/Textbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved, 
  faLock, 
  faKey, 
  faCircleCheck, 
  faUserShield,
  faFingerprint,
  faShieldVirus
} from "@fortawesome/free-solid-svg-icons";

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const user = auth.currentUser;
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      toast.error("Security protocol failed: New passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Security credentials updated!");
      reset();
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Authentication failed: Current password incorrect.");
      } else {
        toast.error("Protocol error: Failed to update security key.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Security Hero */}
      <div className="mb-10 mt-6 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black  p-8 sm:p-12 text-white  overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FontAwesomeIcon icon={faShieldVirus} className="text-[14rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24  bg-white/10  border border-white/20 flex items-center justify-center ">
              <FontAwesomeIcon icon={faLock} className="text-3xl sm:text-4xl text-blue-400" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 ">
                 <FontAwesomeIcon icon={faFingerprint} className="text-[10px] text-blue-300" />
                 <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-50">Advanced Security Protocol</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight">Access Control & Security</h1>
              <p className="text-ink-muted font-medium text-sm max-w-xl leading-relaxed">
                Maintain the integrity of your academic workspace. We recommend updating your cryptographic access keys regularly.
              </p>
            </div>
            
            <div className="hidden lg:flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4   ">
               <FontAwesomeIcon icon={faCircleCheck} className="text-2xl text-emerald-400" />
               <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Identity Guard Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Security Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="bg-white  border border-line p-8 ">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10  bg-navy-wash flex items-center justify-center text-navy ">
                   <FontAwesomeIcon icon={faUserShield} className="text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-ink tracking-tight">Security Audit</h3>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-start gap-3 p-4  bg-parchment transition-colors hover:bg-parchment">
                   <div className="mt-1 flex-shrink-0"><FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-emerald-500" /></div>
                   <div>
                      <p className="text-xs font-semibold text-ink leading-none mb-1">Session Encryption</p>
                      <p className="text-[10px] text-ink-muted font-medium tracking-wide">SSL/TLS AES-256 enabled on all terminal sessions.</p>
                   </div>
                </div>
                <div className="flex items-start gap-3 p-4  bg-parchment transition-colors hover:bg-parchment">
                   <div className="mt-1 flex-shrink-0"><FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-emerald-500" /></div>
                   <div>
                      <p className="text-xs font-semibold text-ink leading-none mb-1">Identity Synchronization</p>
                      <p className="text-[10px] text-ink-muted font-medium tracking-wide">Unified institutional authentication active.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-navy  p-8  relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faKey} className="text-8xl" /></div>
             <p className="relative z-10 text-xs font-semibold uppercase text-indigo-400 tracking-[0.2em] mb-4">Encryption Alert</p>
             <p className="relative z-10 text-white/70 text-xs font-medium leading-relaxed">
               Updating your access key will synchronize credentials across all authenticated academic terminals.
             </p>
          </div>
        </div>

        {/* Change Password Form Card */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white  border border-line p-8 sm:p-12  relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FontAwesomeIcon icon={faKey} className="text-[14rem]" />
             </div>
             
             <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12  bg-navy-wash flex items-center justify-center text-navy ">
                   <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                </div>
                <h3 className="text-2xl font-semibold text-ink tracking-tight">Credential Rotation</h3>
             </div>

             <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-3 px-1">
                   <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted ml-1">Current Cryptographic Key</label>
                   <Textbox
                     placeholder="Enter your existing password"
                     type="password"
                     className="w-full !rounded-[2rem] !p-6"
                     register={register("currentPassword", {
                       required: "Initial authentication required",
                     })}
                     error={errors.currentPassword?.message}
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3 px-1">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted ml-1">New Security Key</label>
                      <Textbox
                        placeholder="Min. 8 characters"
                        type="password"
                        className="w-full !rounded-[2rem] !p-6"
                        register={register("newPassword", {
                          required: "New key definition required",
                          minLength: { value: 6, message: "Minimal security strength required: 6 chars" },
                        })}
                        error={errors.newPassword?.message}
                      />
                   </div>
                   <div className="space-y-3 px-1">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted ml-1">Confirm New Key</label>
                      <Textbox
                        placeholder="Re-type new key"
                        type="password"
                        className="w-full !rounded-[2rem] !p-6"
                        register={register("confirmPassword", {
                          required: "Secondary confirmation required",
                        })}
                        error={errors.confirmPassword?.message}
                      />
                   </div>
                </div>

                <div className="pt-6 flex justify-end">
                   <button
                     disabled={isLoading}
                     type="submit"
                     className={`w-full sm:w-auto px-12 py-5  bg-navy text-white text-[11px] font-semibold uppercase tracking-[0.2em]  transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 ${
                       isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-blue-200"
                     }`}
                   >
                     {isLoading ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <FontAwesomeIcon icon={faFingerprint} className="text-sm text-blue-400" />
                     )}
                     {isLoading ? "Synchronizing..." : "Initialize Credential Rotation"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
