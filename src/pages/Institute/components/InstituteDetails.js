import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";
import Textbox from "../../../components/Textbox";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function InstituteDetails() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const uid = Cookies.get("uid");
    if (uid) {
      const fetchUserDetails = async () => {
        const userDocRef = doc(db, "users", uid);
        const instituteDocRef = doc(db, "instituteDetails", uid);

        try {
          const [userDocSnap, instituteDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(instituteDocRef),
          ]);

          // Setting values from user collection
          if (userDocSnap.exists()) {
            setValue("email", userDocSnap.data().email);
            if (!instituteDocSnap.exists()) {
              // Only set these if not present in instituteDetails
              setValue("instituteName", userDocSnap.data().instituteName);
              setValue("instituteCode", userDocSnap.data().instituteCode);
            }
          } else {
            toast.error("No user details found.");
          }

          // Setting values from instituteDetails collection
          if (instituteDocSnap.exists()) {
            const data = instituteDocSnap.data();
            setValue("instituteName", data.instituteName);
            setValue("instituteCode", data.instituteCode);
            setValue("address", data.address);
            setValue("contactNumber", data.contactNumber);
            setValue("type", data.type);
          }
        } catch (error) {
          console.error("Error fetching details:", error);
          toast.error("Failed to fetch details.");
        }
      };

      fetchUserDetails();
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const uid = Cookies.get("uid");
    if (uid) {
      const docRef = doc(db, "instituteDetails", uid);
      const userDocRef = doc(db, "users", uid);
      try {
        await setDoc(docRef, data, { merge: true });

        // Check if instituteName has changed, and update in users collection
        const userDocSnap = await getDoc(userDocRef);
        if (
          userDocSnap.exists() &&
          data.instituteName !== userDocSnap.data().instituteName
        ) {
          await updateDoc(userDocRef, {
            instituteName: data.instituteName,
          });
          toast.success("User details updated successfully.");
        }

        toast.success("Institute details submitted successfully!");
        // console.log("Form Submission Data:", data);
      } catch (error) {
        console.error("Error saving institute details:", error);
        toast.error("Failed to save institute details.");
      }
    } else {
      toast.error("User ID not found. Please log in again.");
    }
  };

  const onError = (errors, e) => {
    console.error("Form Error:", errors);
    toast.error("Errors in form!");
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="bg-white mt-3 px-2 md:px-4 py-4 shadow-md rounded">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold leading-tight py-2">
            Enter Institute Details
          </h2>
          <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5">
            <div className="grid grid-cols-2 gap-4">
              <Textbox
                placeholder="Institute Name"
                label="Institute Name"
                type="text"
                className="w-full mb-4"
                register={register("instituteName", {
                  required: "Institute name is required",
                })}
                error={errors.instituteName?.message}
              />
              <Textbox
                placeholder="Institute Code"
                label="Institute Code"
                type="text"
                className="w-full mb-4"
                register={register("instituteCode")}
                readOnly={true}
                error={errors.instituteCode?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Textbox
                placeholder="Address"
                label="Address"
                type="text"
                className="w-full mb-4"
                register={register("address", {
                  required: "Address is required",
                })}
                error={errors.address?.message}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Textbox
                placeholder="Contact Number"
                label="Contact Number"
                type="tel"
                className="w-full mb-4"
                register={register("contactNumber", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Contact number must be exactly 10 digits",
                  },
                })}
                error={errors.contactNumber?.message}
              />
              <Textbox
                placeholder="Email Address"
                label="Email Address"
                type="email"
                className="w-full mb-4"
                register={register("email")}
                readOnly={true}
                error={errors.email?.message}
              />
              <Dropdown
                placeholder="Type of Institute (e.g., College, High School, etc.)"
                label="Type of Institute"
                register={register("type", {
                  required: "Type of institute is required",
                })}
                options={[
                  { value: "university", label: "University" },
                  { value: "college", label: "College" },
                  { value: "school", label: "School" },
                  {
                    value: "vocational",
                    label: "Vocational Training Institute",
                  },
                  { value: "technical", label: "Technical Institute" },
                ]}
                error={errors.type?.message}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                label="Submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
