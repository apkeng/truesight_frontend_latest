import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import Textbox from "../../../components/Textbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUser, updateUser, updateInstituteDetails, verifyPassword } from "../../../utils/apiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faBuilding, faGraduationCap, faCamera, faEdit, faUserTie, faUserCircle, faShieldHalved, faFingerprint } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../../components/Loading";
import ModalWrapper from "../../../components/ModalWrapper";


const getRoleDisplayName = (role) => {
  if (!role) return "User";
  const roleMap = {
    "Level-1": "Teacher",
    "Level-2": "Student",
    "Institute Admin": "Institute Admin",
    "Admin": "Admin"
  };
  return roleMap[role] || role;
};

const getRoleIcon = (role) => {
  if (role === "Level-1") return faGraduationCap;
  if (role === "Level-2") return faUser;
  if (role === "Institute Admin") return faBuilding;
  return faUserTie;
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleVerifyPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setPasswordError("Password is required");
      return;
    }
    setPasswordError("");
    setIsVerifying(true);
    try {
      const res = await verifyPassword(passwordInput);
      if (res.success) {
        toast.success("Password verified successfully!");
        setIsPasswordModalOpen(false);
        setPasswordInput("");
      } else {
        setPasswordError(res.error || "Incorrect password");
        toast.error(res.error || "Incorrect password");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setPasswordError(err.message || "Incorrect password");
      toast.error(err.message || "Incorrect password");
    } finally {
      setIsVerifying(false);
    }
  };

  
  const {
    register,
    setValue,
    handleSubmit,
    watch,
  } = useForm();
  
  const watchedRole = watch("role");

  useEffect(() => {
    const uid = Cookies.get("uid");
    if (uid) {
      const fetchUserDetails = async () => {
        try {
          const data = await getUser(uid);
          if (data) {
            setUserData(data);
            setValue("name", data.name);
            setValue("email", data.email);
            setValue("instituteCode", data.instituteCode);
            setValue("instituteName", data.instituteName);
            setValue("phone", data.phone);
            setValue("role", data.role);
            setValue("photoURL", data.photoURL || "");
            setValue("educationLevel", data.educationLevel || "");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to fetch user details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const uid = Cookies.get("uid");
    if (uid) {
      try {
        if (userData && data.instituteName !== userData.instituteName) {
          try {
            await updateInstituteDetails(uid, {
              instituteName: data.instituteName,
              uid: uid,
              updatedAt: new Date().toISOString()
            });
          } catch (instituteError) {
            console.error("Error updating institute details:", instituteError);
          }
        }

        await updateUser(uid, data);
        setUserData({ ...userData, ...data });
        setIsEditing(false);
        toast.success("Identity profile synchronized!");
      } catch (error) {
        toast.error("Profile synchronization failed.");
      }
    }
  };

  if (isLoading) return <Loading message="Synchronizing identity..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Hero Banner */}
      <div className="mb-10 mt-6 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FontAwesomeIcon icon={faFingerprint} className="text-[14rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="relative group/avatar">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/10 group-hover/avatar:ring-blue-400/30 transition-all duration-500">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Identity" className="w-full h-full object-cover" />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} className="text-5xl sm:text-7xl text-white/40" />
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95">
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                 <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-blue-200" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Verified Academic Identity</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">{userData?.name || "Anonymous Researcher"}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-indigo-100 font-bold">
                   <FontAwesomeIcon icon={getRoleIcon(userData?.role)} className="text-sm opacity-70" />
                   <span className="text-sm uppercase tracking-widest">{getRoleDisplayName(userData?.role)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-indigo-400 hidden sm:block" />
                <p className="text-indigo-200 font-medium text-sm">{userData?.instituteName || "Global Academy Consortium"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 whitespace-nowrap ${
                  isEditing 
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                    : "bg-white text-indigo-900 hover:scale-105 active:scale-95"
                }`}
              >
                <FontAwesomeIcon icon={isEditing ? faEnvelope : faEdit} />
                {isEditing ? "Cancel Edition" : "Update Profile"}
              </button>
              {!isEditing && (
                <div className="bg-emerald-500/20 px-6 py-2 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Privacy Secured</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Metadata */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <FontAwesomeIcon icon={faUser} className="text-[10rem]" />
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                      <FontAwesomeIcon icon={faUser} className="text-sm" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Identity Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Legal Full Name</label>
                      <Textbox
                        placeholder="e.g. Dr. Jordan Smith"
                        type="text"
                        className="w-full"
                        register={register("name", { required: "Identity name required" })}
                        readOnly={!isEditing}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Electronic Mail</label>
                      <Textbox
                        placeholder="email@institution.edu"
                        type="email"
                        className="w-full opacity-60 grayscale"
                        register={register("email")}
                        readOnly={true}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Terminal (Phone)</label>
                      <Textbox
                        placeholder="10-digit mobile"
                        type="tel"
                        className="w-full"
                        register={register("phone", {
                          required: "Contact frequency required",
                          pattern: { value: /^\d{10}$/, message: "Must be 10 digits" },
                        })}
                        readOnly={!isEditing}
                      />
                   </div>
                   {watchedRole === "Level-2" && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Level</label>
                        <Textbox
                          placeholder="e.g. Final Year Scholar"
                          type="text"
                          className="w-full"
                          register={register("educationLevel")}
                          readOnly={!isEditing}
                        />
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <FontAwesomeIcon icon={faBuilding} className="text-[10rem]" />
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <FontAwesomeIcon icon={faBuilding} className="text-sm" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Institutional Affiliation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Educational Institution</label>
                      <Textbox
                        placeholder="Name of your academy"
                        type="text"
                        className="w-full"
                        register={register("instituteName")}
                        readOnly={!isEditing}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Organization ID</label>
                      <Textbox
                        placeholder="SYSTEM-AUTH-CODE"
                        type="text"
                        className="w-full opacity-60 grayscale"
                        register={register("instituteCode")}
                        readOnly={true}
                      />
                   </div>
                </div>
             </div>

             {/* Verify Password Card */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Credentials Verification</h3>
                   <p className="text-slate-400 text-xs mt-1">Verify your current login credentials securely.</p>
                </div>
                <button
                   type="button"
                   onClick={() => setIsPasswordModalOpen(true)}
                   className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-95"
                >
                   Verify Credentials
                </button>
             </div>
          </div>

          {/* Right Column: Identity Configuration */}
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                         <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight">Security Status</h3>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Role</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-black uppercase">Active</span>
                         </div>
                         <p className="text-lg font-black">{getRoleDisplayName(watchedRole)}</p>
                      </div>

                      <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Protocol Identity URL</label>
                         <Textbox
                           placeholder="External media link"
                           type="text"
                           className="w-full !bg-white/5 !border-white/10 !text-white text-xs !rounded-2xl"
                           register={register("photoURL")}
                           readOnly={!isEditing}
                         />
                      </div>
                   </div>
                </div>
             </div>

             {isEditing && (
               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-8 duration-500">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">Finalize Synchronization</h4>
                  <button
                    type="submit"
                    className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Commit Identity Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full py-5 rounded-[2rem] bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                  >
                    Discard Changes
                  </button>
               </div>
             )}
          </div>
        </div>
      </form>

      {/* Password Verification Modal */}
      <ModalWrapper open={isPasswordModalOpen} setOpen={setIsPasswordModalOpen}>
        <form onSubmit={handleVerifyPasswordSubmit} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Security Check</h3>
          </div>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            For security purposes, please enter your current password to verify your credentials.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none text-slate-800 focus:ring-2 ring-blue-300 transition-all"
                disabled={isVerifying}
              />
              {passwordError && (
                <p className="text-xs text-rose-500 font-medium">{passwordError}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordInput("");
                  setPasswordError("");
                }}
                className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
