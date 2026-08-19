import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loading";
import Button from "./Button";
import { emailSignUp } from "../firebase/auth";
import { db } from "../firebase/firebase-config";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";

const AddUser = ({ open, setOpen, userData, onUserAddedOrUpdated }) => {
  const defaultValues = userData ?? { isActive: true };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ defaultValues });

  const isActive = watch("isActive");
  const selectedRole = watch("role");

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating] = useState(!!userData);
  const [instituteCode, setInstituteCode] = useState("");
  const [instituteName, setInstituteName] = useState("");

  // Set default education level for teachers (Level-1) when role changes
  useEffect(() => {
    if (selectedRole === "Level-1" && !isUpdating) {
      setValue("educationLevel", "Teacher");
    }
  }, [selectedRole, setValue, isUpdating]);

  useEffect(() => {
    // Fetch the institute when the component mounts based on the uid from cookies
    const fetchInstitute = async () => {
      const uid = Cookies.get("uid");
      if (uid) {
        const userDoc = doc(db, "users", uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setInstituteCode(docSnap.data().instituteCode || "");
          setInstituteName(docSnap.data().instituteName || ""); // Assuming 'instituteName' is a field in the document
        }
      }
    };

    fetchInstitute();
  }, []);

  const handleOnSubmit = async (data) => {
    setIsLoading(true);
    try {
      let updatedUser;
      
      // Set default education level for teachers (Level-1) if not provided
      if (data.role === "Level-1" && !data.educationLevel) {
        data.educationLevel = "Teacher";
      }
      
      if (isUpdating) {
        const userDoc = doc(db, "users", userData.uid);
        await updateDoc(userDoc, {
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          educationLevel: data.educationLevel || (data.role === "Level-1" ? "Teacher" : null),
        })
          .then(() => {
            updatedUser = { ...userData, ...data };
            toast.success("User updated successfully!");
            onUserAddedOrUpdated(updatedUser);
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            toast.error("Failed to update user.");
          });
      } else {
        const userCredential = await emailSignUp(data.email, data.password);
        const uid = userCredential.user.uid;
        const newUserDoc = doc(db, "users", uid);
        const newUser = {
          uid,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          educationLevel: data.educationLevel || (data.role === "Level-1" ? "Teacher" : null),
          instituteCode,
          instituteName,
          createdAt: serverTimestamp(),
        };

        await setDoc(newUserDoc, newUser);
        updatedUser = newUser;
        toast.success("User added successfully!");
        onUserAddedOrUpdated(updatedUser);
      }
    } catch (error) {
      console.error("Error in user operation:", error);
      toast.error("Operation failed: " + error.message);
    } finally {
      setIsLoading(false);
      setOpen(false); // Close modal after action
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <ToastContainer autoClose={2000} />
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-ink mb-4"
        >
          {isUpdating ? "UPDATE PROFILE" : "ADD NEW USER"}
        </Dialog.Title>
        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Full name"
            type="text"
            name="name"
            label="Full Name"
            className="w-full rounded"
            register={register("name", {
              required: "Full name is required!",
            })}
            error={errors.name ? errors.name.message : ""}
          />

          <Textbox
            placeholder="Email Address"
            type="email"
            name="email"
            label="Email Address"
            className="w-full rounded"
            register={register("email", {
              required: "Email Address is required!",
            })}
            error={errors.email ? errors.email.message : ""}
          />

          {!isUpdating && ( // Conditionally render the Password field
            <Textbox
              placeholder="Password"
              type="password"
              name="password"
              label="Password"
              className="w-full rounded"
              register={register("password", {
                required: "Password is required!",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              })}
              error={errors.password ? errors.password.message : ""}
            />
          )}

          <div className="flex flex-col">
            <label htmlFor="role" className="font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              className="form-select mt-1 block w-full  border-gray-300 "
              {...register("role", {
                required: "User role is required!",
              })}
              style={{ height: "40px" }}
            >
              <option value="">Select Role</option>
              <option value="Institute Admin">Institute Admin</option>
              <option value="Level-1">User (Level-1) - Teacher</option>
              <option value="Level-2">User (Level-2) - Student</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs italic">
                {errors.role.message}
              </p>
            )}
          </div>

          {selectedRole === "Level-2" && (
            <div className="flex flex-col">
              <label
                htmlFor="educationLevel"
                className="font-medium text-gray-700"
              >
                Education Level
              </label>
              <select
                id="educationLevel"
                className="form-select mt-1 block w-full  border-gray-300 "
                {...register("educationLevel", {
                  required: "Education level is required for Level-2 users!",
                })}
                style={{ height: "40px" }}
              >
                <option value="">Select Education Level</option>
                <option value="Primary School">Primary School</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
              {errors.educationLevel && (
                <p className="text-red-500 text-xs italic">
                  {errors.educationLevel.message}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center">
            <label
              htmlFor="isActive"
              className="block font-medium text-gray-700 mr-2"
              style={{ fontSize: "16px" }}
            >
              Active Status
            </label>
            <input
              id="isActive"
              type="checkbox"
              className="form-checkbox rounded"
              {...register("isActive")}
              onChange={() => setValue("isActive", !isActive)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-5">
            <Loading />
          </div>
        ) : (
          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              className="bg-navy px-8 text-sm font-semibold text-white hover:bg-navy-dark sm:w-auto"
              label="Submit"
            />
            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-ink sm:w-auto"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddUser;
