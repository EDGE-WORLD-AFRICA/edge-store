use std::process::Command;

#[tauri::command]
pub fn get_network_type() -> String {
  #[cfg(target_os = "windows")]
  {
    return detect_windows();
  }

  #[cfg(target_os = "macos")]
  {
    return detect_macos();
  }

  #[cfg(target_os = "linux")]
  {
    return detect_linux();
  }

  #[allow(unreachable_code)]
  "unknown".to_string();
}

#[cfg(target_os = "windows")]
fn detect_windows() -> String {
  // Check if WiFi is connected via netsh
    if let Ok(output) = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.contains("State") && stdout.to_lowercase().contains("connected") {
            return "wifi".to_string();
        }
    }

    // If not WiFi, inspect the active adapter description
    if let Ok(output) = Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object -First 1 -ExpandProperty InterfaceDescription",
        ])
        .output()
    {
        let desc = String::from_utf8_lossy(&output.stdout).to_lowercase();

        if desc.contains("ethernet") || desc.contains("gigabit") || desc.contains("realtek") || desc.contains("intel") {
            return "ethernet".to_string();
        }
        if desc.contains("ndis") || desc.contains("usb") || desc.contains("tethering") || desc.contains("remote") {
            return "usb_tethering".to_string();
        }
        if desc.contains("wi-fi") || desc.contains("wireless") || desc.contains("wifi") {
            return "wifi".to_string();
        }
    }

    "unknown".to_string()
}

#[cfg(target_os = "macos")]
fn detect_macos() -> String {
    // Check if WiFi is connected
    if let Ok(output) = Command::new("networksetup")
        .args(["-getairportnetwork", "en0"])
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.contains("Current Wi-Fi Network") {
            return "wifi".to_string();
        }
    }

    // Get the active interface via route
    if let Ok(output) = Command::new("route")
        .args(["get", "default"])
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            if line.contains("interface:") {
                let iface = line.split(':').nth(1).unwrap_or("").trim();
                if iface.starts_with("en") {
                    // Could be ethernet or USB tethering on macOS
                    if let Ok(info) = Command::new("networksetup")
                        .args(["-listallhardwareports"])
                        .output()
                    {
                        let hw = String::from_utf8_lossy(&info.stdout).to_lowercase();
                        if hw.contains("usb") && hw.contains(iface) {
                            return "usb_tethering".to_string();
                        }
                    }
                    return "ethernet".to_string();
                }
            }
        }
    }

    "unknown".to_string()
}

#[cfg(target_os = "linux")]
fn detect_linux() -> String {
    use std::fs;
    use std::path::Path;

    let net_path = Path::new("/sys/class/net");
    if let Ok(entries) = fs::read_dir(net_path) {
        for entry in entries.flatten() {
            let iface_name = entry.file_name().to_string_lossy().to_string();

            // Skip loopback
            if iface_name == "lo" {
                continue;
            }

            let operstate_path = format!("/sys/class/net/{}/operstate", iface_name);
            if let Ok(state) = fs::read_to_string(&operstate_path) {
                if state.trim() != "up" {
                    continue;
                }

                // Check if it's a wireless interface
                let wireless_path = format!("/sys/class/net/{}/wireless", iface_name);
                if Path::new(&wireless_path).exists() {
                    return "wifi".to_string();
                }

                // Check naming conventions for USB tethering
                if iface_name.starts_with("usb") || iface_name.starts_with("rndis") {
                    return "usb_tethering".to_string();
                }

                // Check for WiFi via interface name prefix
                if iface_name.starts_with("wlan") || iface_name.starts_with("wlp") {
                    return "wifi".to_string();
                }

                // Ethernet naming conventions
                if iface_name.starts_with("eth") || iface_name.starts_with("enp") || iface_name.starts_with("eno") {
                    return "ethernet".to_string();
                }
            }
        }
    }

    "unknown".to_string()
}