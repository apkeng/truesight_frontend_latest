import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";
import Textbox from "../../../components/Textbox";
import Button from "../../../components/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBuilding, faUserTie, faGraduationCap, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { verifyPassword } from "../../../utils/apiServices";
import ModalWrapper from "../../../components/ModalWrapper";


// Map technical roles to user-friendly display names
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

// Get role icon
const getRoleIcon = (role) => {
  if (role === "Level-1") return faGraduationCap;
  if (role === "Level-2") return faUser;
  if (role === "Institute Admin") return faBuilding;
  return faUserTie;
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
  
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
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const uid = Cookies.get("uid");
    if (uid) {
      const fetchUserDetails = async () => {
        const docRef = doc(db, "users", uid);

        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setValue("name", data.name);
            setValue("email", data.email);
            setValue("instituteCode", data.instituteCode);
            setValue("instituteName", data.instituteName);
            setValue("phone", data.phone);
            setValue("role", data.role);
            setValue("photoURL", data.photoURL || "No photo available");
          } else {
            toast.error("No user details found.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to fetch user details.");
        }
      };

      fetchUserDetails();
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const uid = Cookies.get("uid");
    if (uid) {
      const userDocRef = doc(db, "users", uid);
      const instituteDetailsRef = doc(db, "instituteDetails", uid);
      try {
        // Perform updates if instituteName is different from current value
        const userDoc = await getDoc(userDocRef);
        if (
          userDoc.exists() &&
          data.instituteName !== userDoc.data().instituteName
        ) {
          await updateDoc(userDocRef, {
            instituteName: data.instituteName,
          });

          const instituteDoc = await getDoc(instituteDetailsRef);
          if (instituteDoc.exists()) {
            await updateDoc(instituteDetailsRef, {
              instituteName: data.instituteName,
            });
          }
          toast.success("Institute name updated!");
        }

        // Update other user details
        await updateDoc(userDocRef, data);
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile.");
      }
    } else {
      toast.error("User ID not found. Please log in again.");
    }
  };

  const onError = (errors) => {
    console.error("Form Error:", errors);
    toast.error("Please check your form.");
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="bg-white mt-3 px-2 md:px-4 py-4 shadow-md rounded">
        <div className="container mx-auto px-4 py-2">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={getRoleIcon(userData?.role)} 
                  className="text-2xl text-white/80" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData?.name || "User Name"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <FontAwesomeIcon 
                    icon={getRoleIcon(userData?.role)} 
                    className="text-sm" 
                  />
                  <span className="text-blue-100 font-semibold">
                    {getRoleDisplayName(userData?.role) || "User"}
                  </span>
                </div>
                <p className="text-blue-200 text-sm mt-1">{userData?.instituteName || "Institute"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold leading-tight mb-4">
            Profile Details
          </h3>
          <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5">
            <Textbox
              placeholder="Name"
              label="Full Name"
              type="text"
              className="w-full mb-4"
              register={register("name")}
            />

            {/* Email and Phone Number in one line */}
            <div className="grid grid-cols-2 gap-4">
              <Textbox
                placeholder="Email Address"
                label="Email Address"
                type="email"
                className="w-full mb-4"
                register={register("email")}
                readOnly={true}
              />
              <Textbox
                placeholder="Phone Number"
                label="Phone Number"
                type="tel"
                className="w-full mb-4"
                register={register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                error={errors.phone?.message}
              />
            </div>

            {/* Institute Name and Institute Code in one line */}
            <div className="grid grid-cols-2 gap-4">
              <Textbox
                placeholder="Institute Name"
                label="Institute Name"
                type="text"
                className="w-full mb-4"
                register={register("instituteName")}
              />
              <Textbox
                placeholder="Institute Code"
                label="Institute Code"
                type="text"
                className="w-full mb-4"
                register={register("instituteCode")}
                readOnly={true}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={getRoleIcon(userData?.role)} className="w-4 h-4 text-blue-600" />
                <span>Role</span>
              </label>
              <div className="relative">
                <Textbox
                  placeholder="Role"
                  type="text"
                  className="w-full"
                  register={register("role")}
                  readOnly={true}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">
                    {getRoleDisplayName(userData?.role)}
                  </span>
                </div>
              </div>
            </div>
            <Textbox
              placeholder="Photo URL"
              label="Photo URL"
              type="text"
              className="w-full mb-4"
              register={register("photoURL")}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                label="Verify Credentials"
                className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
              />
              <Button
                type="submit"
                label="Update Profile"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Password Verification Modal */}
      <ModalWrapper open={isPasswordModalOpen} setOpen={setIsPasswordModalOpen}>
        <form onSubmit={handleVerifyPasswordSubmit} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Security Check</h3>
          </div>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            For security purposes, please enter your current password to verify your credentials.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded outline-none text-slate-800 focus:ring-2 ring-blue-300 transition-all"
                disabled={isVerifying}
              />
              {passwordError && (
                <p className="text-xs text-red-500 font-medium">{passwordError}</p>
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
                className="flex-1 py-2.5 rounded bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all flex items-center justify-center"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>

  );
}
