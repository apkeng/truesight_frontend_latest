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

export const PRIOTITYSTYELS = {
  "Undergraduate Student": "bg-red-50 border-red-100 text-red-600",
  "High School": "bg-yellow-50 border-yellow-100 text-yellow-600",
  "Primary School": "bg-blue-50 border-blue-100 text-blue-600",
  "Post Graduate": "bg-green-50 border-green-100 text-green-600",
};
