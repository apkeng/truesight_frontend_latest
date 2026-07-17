import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../../../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../../../components/Dialogs";
import AddUser from "../../../components/AddUser";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";

const Team = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [instituteCode, setInstituteCode] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchInstituteCode = async () => {
      const uid = Cookies.get("uid");
      if (uid) {
        const userDoc = doc(db, "users", uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setInstituteCode(docSnap.data().instituteCode || "");
        } else {
          console.log("No such document!");
        }
      }
    };

    const fetchUsers = async () => {
      if (instituteCode) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("instituteCode", "==", instituteCode));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs
          .map((doc) => ({
            _id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.role !== "Institute Admin"); // Filter out 'Institute Admin'
        setUsers(usersData);
      }
    };

    fetchInstituteCode();
    fetchUsers(); // Adjusted to call after the instituteCode is set
  }, [instituteCode]);

  // Callback function to update users
  const handleUserAddedOrUpdated = (updatedUser) => {
    if (selected) {
      setUsers(
        users.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
    } else {
      setUsers([...users, updatedUser]);
    }
  };

  const userActionHandler = () => {};

  const deleteHandler = async () => {
    if (selected) {
      console.log("Attempting to delete user with ID:", selected);
      try {
        await deleteDoc(doc(db, "users", selected));
        console.log("User deleted successfully");
        setOpenDialog(false); // Close the dialog after deleting
        setUsers(users.filter((user) => user._id !== selected)); // Update the local state
        setSelected(null); // Reset selected after deletion
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    } else {
      console.log("No user selected for deletion");
    }
  };

  const deleteClick = (id) => {
    console.log("Delete clicked for ID:", id);
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (user) => {
    setSelected(user);
    setOpen(true);
  };

  // Helper function to map role codes to display names
  const mapRoleToDisplayName = (roleCode) => {
    const roleMapping = {
      "Level-1": "Teacher",
      "Level-2": "Student",
    };
    return roleMapping[roleCode] || roleCode;
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2" style={{ width: "200px" }}>
          Full Name
        </th>
        <th className="py-2" style={{ width: "300px" }}>
          Email
        </th>
        <th className="py-2" style={{ width: "150px" }}>
          Role
        </th>
        <th className="py-2" style={{ width: "100px" }}>
          Active
        </th>
        <th className="py-2" style={{ width: "150px", textAlign: "center" }}>
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            {getInitials(user.name)}
          </div>
          {user.name}
        </div>
      </td>
      <td className="p-2">{user.email || "N/A"}</td>
      <td className="p-2">
        <div className="flex gap-2 items-center">
          <span
            className={`px-3 py-1 rounded-l-full ${
              user.role === "Level-2"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {mapRoleToDisplayName(user.role)}
          </span>
          {user.role === "Level-2" && (
            <span className="text-xs text-gray-700 px-3 py-1">
              {(user.educationLevel || "N/A").split(" ").join("-")}
            </span>
          )}
        </div>
      </td>
      <td className="p-2">
        <button
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user.isActive ? "Active" : "Disabled"}
        </button>
      </td>
      <td className="p-2 flex gap-4 justify-end sticky-column">
        <Button
          className="text-blue-600 hover:text-blue-500 font-semibold"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />
        <Button
          className="text-red-700 hover:text-red-500 font-semibold"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user._id)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full mt-3 md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Team Members" />
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => {
              setSelected(null); // Reset selected state
              setOpen(true); // Open the form
            }}
          />
        </div>
        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody>
                {users.map((user, index) => (
                  <TableRow key={user._id || index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
        onUserAddedOrUpdated={handleUserAddedOrUpdated} // Pass the callback here
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Team;
