import React, { useEffect, useState } from "react";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaClipboard } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import Cookies from "js-cookie";
import clsx from "clsx";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";
import moment from "moment";
import { getInitials } from "../../../utils";

// import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
// import UserInfo from "../components/UserInfo";

// const TaskTable = ({ tasks }) => {
//   const ICONS = {
//     high: <MdKeyboardDoubleArrowUp />,
//     medium: <MdKeyboardArrowUp />,
//     low: <MdKeyboardArrowDown />,
//   };

//   const TableHeader = () => (
//     <thead className="border-b border-gray-300 ">
//       <tr className="text-black text-left">
//         <th className="py-2">Task Title</th>
//         <th className="py-2">Priority</th>
//         <th className="py-2">Team</th>
//         <th className="py-2 hidden md:block">Created At</th>
//       </tr>
//     </thead>
//   );

//   const TableRow = ({ task }) => (
//     <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
//       <td className="py-2">
//         <div className="flex items-center gap-2">
//           <div
//             className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
//           />

//           <p className="text-base text-black">{task.title}</p>
//         </div>
//       </td>

//       <td className="py-2">
//         <div className="flex gap-1 items-center">
//           <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
//             {ICONS[task.priority]}
//           </span>
//           <span className="capitalize">{task.priority}</span>
//         </div>
//       </td>

//       <td className="py-2">
//         <div className="flex">
//           {task.team.map((m, index) => (
//             <div
//               key={index}
//               className={clsx(
//                 "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
//                 BGS[index % BGS.length]
//               )}
//             >
//               <UserInfo user={m} />
//             </div>
//           ))}
//         </div>
//       </td>
//       <td className="py-2 hidden md:block">
//         <span className="text-base text-gray-600">
//           {moment(task?.date).fromNow()}
//         </span>
//       </td>
//     </tr>
//   );
//   return (
//     <>
//       <div className="w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
//         <table className="w-full">
//           <TableHeader />
//           <tbody>
//             {tasks?.map((task, id) => (
//               <TableRow key={id} task={task} />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// };

const UserTable = ({ users }) => {
  const getDisplayRole = (role) => {
    switch (role) {
      case "Level-1":
        return "Teacher";
      case "Level-2":
        return "Student";
      default:
        return role;
    }
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300 ">
      <tr className="text-black  text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200  text-gray-600 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
            <span className="text-center">{getInitials(user?.name)}</span>
          </div>

          <div>
            <p> {user.name}</p>
            <span className="text-xs text-black">
              {getDisplayRole(user?.role)}
            </span>
          </div>
        </div>
      </td>
      <td className="py-2 text-sm">
        {user.createdAt ? moment(user.createdAt).fromNow() : "N/A"}
      </td>
    </tr>
  );

  return (
    <div className="w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded">
      <table className="w-full mb-5">
        <TableHeader />
        <tbody>
          {users?.map((user, index) => (
            <TableRow key={index + user?._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const summary = {
  totalTasks: 10,
  tasks: {
    completed: 3,
    "in progress": 5,
    todo: 2,
  },
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [instituteCode, setInstituteCode] = useState("");
  const totals = summary.tasks;

  useEffect(() => {
    const fetchInstituteCode = async () => {
      const uid = Cookies.get("uid");
      if (uid) {
        const userDoc = doc(db, "users", uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const code = docSnap.data().instituteCode || "";
          setInstituteCode(code);
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
        const fetchedUsers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert createdAt from Timestamp to Date
          const createdAt = data.createdAt
            ? data.createdAt.toDate()
            : new Date();
          return {
            ...data,
            _id: doc.id,
            createdAt, // Use the converted Date
          };
        });
        setUsers(fetchedUsers);
      }
    };

    fetchInstituteCode().then(() => {
      if (instituteCode) fetchUsers();
    });
  }, [instituteCode]);

  const stats = [
    {
      _id: "1",
      label: "TOTAL USERS",
      total: users.length,
      icon: <FaUsers />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLTED TASK",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS ",
      total: totals["in progress"] || 0,
      icon: <FaClipboard />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODOS",
      total: totals["todo"],
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]" || 0,
    },
  ];

  const Card = ({ label, count, bg, icon }) => {
    return (
      <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
        <div className="h-full flex flex-1 flex-col justify-between">
          <p className="text-base text-gray-600">{label}</p>
          <span className="text-2xl font-semibold">{count}</span>
          <span className="text-sm text-gray-400"></span>
        </div>

        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            bg
          )}
        >
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8">
        {/* <TaskTable tasks={summary.last10Task} /> */}
        <UserTable users={users} />
      </div>
    </div>
  );
};

export default Dashboard;
