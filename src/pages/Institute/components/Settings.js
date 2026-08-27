import React from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Textbox from "../../../components/Textbox";
import Button from "../../../components/Button";
import { changeOwnPassword } from "../../../utils/apiServices";

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await changeOwnPassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password. Please try again.");
    }
  };

  const onError = (errors) => {
    console.error("Form Error:", errors);
    toast.error("Errors in form!");
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="bg-white mt-3 px-2 md:px-4 py-4 shadow-md rounded">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold leading-tight py-2">
            Change Password
          </h2>
          <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5">
            <div className="grid grid-cols-1 gap-4">
              <Textbox
                placeholder="Current Password"
                label="Current Password"
                type="password"
                className="w-full mb-4"
                register={register("currentPassword", {
                  required: "Current password is required",
                })}
                error={errors.currentPassword?.message}
              />
              <Textbox
                placeholder="New Password"
                label="New Password"
                type="password"
                className="w-full mb-4"
                register={register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
                error={errors.newPassword?.message}
              />
              <Textbox
                placeholder="Confirm New Password"
                label="Confirm New Password"
                type="password"
                className="w-full mb-4"
                register={register("confirmPassword", {
                  required: "Please confirm your new password",
                })}
                error={errors.confirmPassword?.message}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                label="Change Password"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
