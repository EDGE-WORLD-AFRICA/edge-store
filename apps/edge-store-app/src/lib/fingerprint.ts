import { invoke } from "@tauri-apps/api/core";
import { updateCache } from "./cache";

/** Get Machine Fingerprint via Tauri */
export async function getMachineFingerprint(): Promise<string>{
  try{
    const machineCode = await invoke<string>("get_machine_fingerprint");

    updateCache((cache) => {cache.meta.machineCode = machineCode;});

    return machineCode;
  } catch(e){
    console.warn("TAURI ERROR", `Tauri fingerprint failed. using browser fallback: ${e}`);
    return getBrowserFallbackFingerprint();
  }
}

// Get Machine Fingerprint via Browser Fallback
const getBrowserFallbackFingerprint = async (): Promise<string> => {
  let deviceId = localStorage.getItem("EDGE_DEVICE_ID");

  if(!deviceId){
    deviceId = crypto.randomUUID();
    localStorage.setItem("EDGE_DEVICE_ID", deviceId);
  }
  
  const raw = [
    deviceId, 
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen.width,
    screen.height
  ].join("|");

  const encoded = new TextEncoder().encode(raw);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);

  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const machineCode = `sha256:${hashHex}`;

  updateCache((cache) => {
    cache.meta.deviceId = deviceId as string;
    cache.meta.machineCode = machineCode;
  });

  return machineCode;
}