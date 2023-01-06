function IsQOLSettingsOpened(){
    const urlParams = new URLSearchParams(window.location.search)

    return urlParams.get("tab") === "robloxqol"
}

async function Run(){
    const SettingsList = await WaitForClass("menu-vertical submenus")

    SettingsList.appendChild(CreateSettingNavigationButton("Roblox QoL", "?tab=robloxqol"))

    if (!IsQOLSettingsOpened()) {
        return
    }

    
}

Run()