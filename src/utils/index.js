export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Recently Established";
  }
  
  // Get the month, day, and year
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  // Get hours, minutes, and adjust for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hour from 24-hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Combine into a single string
  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

  return formattedDate;
};

export function dateFormatter(dateString) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate)) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function getInitials(fullName) {
  if (!fullName) {
    return ""; // Return an empty string or some default initials if fullName is undefined or null
  }
  const names = fullName.split(" ");
  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
  const initialsStr = initials.join("");
  return initialsStr;
}

// Learning-level chips share one muted treatment so the level reads as a label,
// not as a status colour.
export const PRIOTITYSTYELS = {
  "Undergraduate Student": "bg-parchment border-line text-ink-muted",
  "High School": "bg-parchment border-line text-ink-muted",
  "Primary School": "bg-parchment border-line text-ink-muted",
  "Post Graduate": "bg-parchment border-line text-ink-muted",
};
