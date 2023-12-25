async function AddOptionToSettingsDropdown(){
    ChildAdded(await WaitForId("navbar-settings"), false, async function(){
        const Dropdown = await WaitForId("settings-popover-menu")

        const List = document.createElement("li")
        const Button = document.createElement("a")

        Button.className = "rbx-menu-item"
        Button.href = "https://www.roblox.com/my/account?tab=robloxqol"
        Button.innerText = "QoL Settings"

        if (AlreadySetAuthenticationError){
            const Error = document.createElement("img")
            Error.src = chrome.runtime.getURL("img/warning.png")
            Error.style = "width: 23px; height: 23px; margin-left: 5px;"

            Button.href = "https://www.roblox.com/my/account?tab=robloxqol&option=Diagnose"

            Button.appendChild(Error)
        }

        List.appendChild(Button)
        Dropdown.insertBefore(List, Dropdown.firstChild)
    })
}

AddOptionToSettingsDropdown()