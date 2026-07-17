import { Tab } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs({ tabs, setSelected, children }) {
  return (
    <div className="w-fit p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-inner">
      <Tab.Group>
        <Tab.List className="flex items-center gap-1">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.title}
              onClick={() => setSelected(index)}
              className={({ selected }) =>
                classNames(
                  "flex items-center gap-2.5 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none transition-all duration-300 rounded-xl",
                  selected
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={classNames("text-sm", selected ? "text-blue-500" : "text-slate-400")}>
                    {tab.icon}
                  </span>
                  <span>{tab.title}</span>
                </>
              )}
            </Tab>
          ))}
        </Tab.List>
        {children && <Tab.Panels className="w-full mt-6">{children}</Tab.Panels>}
      </Tab.Group>
    </div>
  );
}
