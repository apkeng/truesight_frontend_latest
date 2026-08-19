import { Dialog } from "@headlessui/react";
import clsx from "clsx";
import { FaQuestion } from "react-icons/fa";
import ModalWrapper from "./ModalWrapper";
import Button from "./Button";

export default function ConfirmationDialog({
  open,
  setOpen,
  msg,
  setMsg = () => {},
  onClick = () => {},
  type = "delete", // Can be "delete", "publish", "unpublish", "restore", etc.
  setType = () => {},
}) {
  const closeDialog = () => {
    setType("delete");
    setMsg(null);
    setOpen(false);
  };

  // Define styles and labels based on type
  const getTypeStyles = () => {
    switch (type) {
      case "publish":
        return {
          iconBg: "text-emerald-700 bg-emerald-50",
          buttonBg: "bg-navy hover:bg-navy-dark",
          buttonLabel: "Publish",
        };
      case "unpublish":
        return {
          iconBg: "text-amber-700 bg-amber-50",
          buttonBg: "bg-navy hover:bg-navy-dark",
          buttonLabel: "Unpublish",
        };
      case "restore":
        return {
          iconBg: "text-amber-700 bg-amber-50",
          buttonBg: "bg-navy hover:bg-navy-dark",
          buttonLabel: "Restore",
        };
      case "delete":
      default:
        return {
          iconBg: "text-red-600 bg-red-50",
          buttonBg: "bg-red-600 hover:bg-red-700",
          buttonLabel: "Delete",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <Dialog.Title as="h3" className="">
            <p className={clsx("p-3", styles.iconBg)}>
              <FaQuestion size={60} />
            </p>
          </Dialog.Title>

          <p className="text-center text-ink-muted">
            {msg ?? "Are you sure you want to perform this action?"}
          </p>

          <div className="bg-parchment py-3 sm:flex sm:flex-row-reverse gap-4">
            <Button
              type="button"
              className={clsx(
                "px-8 text-sm font-semibold text-white sm:w-auto",
                styles.buttonBg
              )}
              onClick={onClick}
              label={styles.buttonLabel}
            />

            <Button
              type="button"
              className="bg-white px-8 text-sm font-semibold text-ink sm:w-auto border border-line"
              onClick={() => closeDialog()}
              label="Cancel"
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}

export function UserAction({ open, setOpen, onClick = () => {} }) {
  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <Dialog.Title as="h3" className="">
            <p className={clsx("p-3 ", "text-red-600 bg-red-50")}>
              <FaQuestion size={60} />
            </p>
          </Dialog.Title>

          <p className="text-center text-ink-muted">
            {"Are you sure you want to activate or deactivate this account?"}
          </p>

          <div className="bg-parchment py-3 sm:flex sm:flex-row-reverse gap-4">
            <Button
              type="button"
              className={clsx(
                " px-8 text-sm font-semibold text-white sm:w-auto",
                "bg-red-600 hover:bg-red-700"
              )}
              onClick={onClick}
              label={"Yes"}
            />

            <Button
              type="button"
              className="bg-white px-8 text-sm font-semibold text-ink sm:w-auto border border-line"
              onClick={() => closeDialog()}
              label="No"
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
