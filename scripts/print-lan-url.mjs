import { networkInterfaces } from "node:os";

function getLanIPv4() {
  const interfaces = networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;

    for (const entry of entries) {
      const family = typeof entry.family === "string" ? entry.family : String(entry.family);
      if (family !== "IPv4") continue;
      if (entry.internal) continue;
      if (entry.address.startsWith("169.254.")) continue;
      return entry.address;
    }
  }

  return null;
}

const lanIp = getLanIPv4();

console.log("\n[OPP] Phone Preview");
if (lanIp) {
  console.log(`[OPP] LAN URL: http://${lanIp}:5173`);
  console.log("[OPP] Keep phone + computer on the same Wi-Fi.");
} else {
  console.log("[OPP] Could not detect a LAN IPv4 address.");
  console.log("[OPP] Vite will still print any available Network URLs.");
}
console.log("");
