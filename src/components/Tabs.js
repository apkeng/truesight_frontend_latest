import { Tab } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs({ tabs, setSelected, children }) {
  return (
    <div className="w-fit border border-line bg-white">
      <Tab.Group>
        <Tab.List className="flex items-center">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.title}
              onClick={() => setSelected(index)}
              className={({ selected }) =>
                classNames(
                  "flex h-10 items-center gap-2.5 px-5 text-[11px] font-semibold uppercase tracking-[0.14em] outline-none transition-colors",
                  selected
                    ? "bg-navy text-white"
                    : "text-ink-muted hover:bg-navy-wash hover:text-navy"
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={classNames("text-sm", selected ? "text-white" : "text-ink-muted")}>
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
