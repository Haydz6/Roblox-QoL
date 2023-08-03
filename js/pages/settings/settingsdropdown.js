async function AddOptionToSettingsDropdown(){
    ChildAdded(await WaitForId("navbar-settings"), true, async function(){
        const Dropdown = await WaitForId("settings-popover-menu")

        const List = document.createElement("li")
        const Button = document.createElement("a")

        Button.className = "rbx-menu-item"
        Button.href = "https://www.roblox.com/my/account?tab=robloxqol"
        Button.innerText = "QoL Settings"

        List.appendChild(Button)
        Dropdown.insertBefore(List, Dropdown.firstChild)
    })
}

AddOptionToSettingsDropdown()