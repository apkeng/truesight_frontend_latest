import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
// import { summary } from "../../assets/data";
import clsx from "clsx";
import { getInitials } from "../../utils";
import { MdCheck } from "react-icons/md";

export const summary = {
  users: [
    {
      _id: "65c5f27fb5204a81bde86833",
      name: "New User",
      title: "Designer",
      role: "Developer",
      isActive: true,
      createdAt: "2024-02-09T09:38:07.765Z",
    },
    {
      _id: "65c3176a0fd860f958baa099",
      name: "Emily Wilson",
      title: "Data Analyst",
      role: "Analyst",
      isActive: true,
      createdAt: "2024-02-07T05:38:50.816Z",
    },
    {
      _id: "65c317360fd860f958baa08e",
      name: "Alex Johnson",
      title: "UX Designer",
      role: "Designer",
      isActive: true,
      createdAt: "2024-02-07T05:37:58.862Z",
    },
    {
      _id: "65c30b96e639681a13def0b5",
      name: "Jane Smith",
      title: "Product Manager",
      role: "Manager",
      isActive: true,
      createdAt: "2024-02-07T04:48:22.519Z",
    },
    {
      _id: "65c202d4aa62f32ffd1303cc",
      name: "Codewave Asante",
      title: "Administrator",
      role: "Admin",
      createdAt: "2024-02-06T09:58:44.794Z",
      isActive: true,
    },
  ],
};

const UserList = ({ setTeam, team }) => {
  const data = summary.users;
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleChange = (el) => {
    setSelectedUsers(el);
    setTeam(el?.map((u) => u._id));
  };
  useEffect(() => {
    if (team?.length < 1) {
      data && setSelectedUsers([data[0]]);
    } else {
      setSelectedUsers(team);
    }
  }, []);

  return (
    <div>
      <p className="text-gray-700">Assign Task To: </p>
      <Listbox
        value={selectedUsers}
        onChange={(el) => handleChange(el)}
        multiple
      >
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 2xl:py-3 border border-gray-300 sm:text-sm">
            <span className="block truncate">
              {selectedUsers?.map((user) => user.name).join(", ")}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BsChevronExpand
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {data?.map((user, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4. ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                    } `
                  }
                  value={user}
                >
                  {({ selected }) => (
                    <>
                      <div
                        className={clsx(
                          "flex items-center gap-2 truncate",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600">
                          <span className="text-center text-[10px]">
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <span>{user.name}</span>
                      </div>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <MdCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default UserList;
