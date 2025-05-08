import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60); // Use Math.floor for seconds as well

  let result = "";
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0 || (hours > 0 && minutes === 0)) { // Show minutes if hours > 0 or minutes > 0
    result += `${minutes}m `;
  }
  // Always show seconds if total duration is less than a minute, or if it's the only unit left.
  if (hours === 0 && minutes === 0) {
     result += `${seconds}s`;
  } else if (seconds > 0 && (hours > 0 || minutes > 0)) { // Optionally show seconds if other units are present
     // result += `${seconds}s`; // Uncomment if you want to show seconds e.g., 1h 0m 5s
  }
  
  if (result.trim() === "") return "0s"; // Handle case where totalSeconds is 0 or very small

  return result.trim();
}
