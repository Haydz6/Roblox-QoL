function CreateMenuOption(Text, NoSpace){
    const Button = document.createElement("li")
    Button.className = "menu-option" //"menu-option active"

    const Content = document.createElement("a")
    Content.className = "menu-option-content"

    const Label = document.createElement("span")
    Label.className = "font-caption-header"
    Label.innerText = NoSpace ? Text : Text.replace(/([A-Z])/g, ' $1').trim()

    Content.appendChild(Label)
    Button.appendChild(Content)

    return Button
}

function CreateMenuList(){
    const Container = document.createElement("div")
    return Container
}

function CreateMobileSettingsDropdown(){
    const Container = document.createElement("div")
    Container.className = "tab-dropdown"
    Container.innerHTML = `<div class="input-group-btn dropdown" uib-dropdown=""> <button type="button" uib-dropdown-toggle="" class="input-dropdown-btn dropdown-toggle" aria-haspopup="true" aria-expanded="false"> <span class="rbx-selection-label">General</span> <span class="icon-down-16x16"></span> </button> <ul class="dropdown-menu"></ul> </div>`
    return Container
}

function CreateMobileSettingsDropdownReact(){
    const Container = document.createElement("div")
    Container.className = "rbx-select-group select-group mobile-navigation-dropdown"
    Container.innerHTML = `<select class="input-field rbx-select select-option"></select><span class="icon-arrow icon-down-16x16"></span>`
    return Container
}

function CreateMobileMenuOption(Text, NoSpace){
    const Button = document.createElement("li")

    const Content = document.createElement("a")
    Content.innerText = NoSpace ? Text : Text.replace(/([A-Z])/g, ' $1').trim()

    Button.appendChild(Content)

    return Button
}

function CreateMobileMenuOptionReact(Text, NoSpace, Lowercase){
    // const Button = document.createElement("li")

    // const Content = document.createElement("a")
    const Content = document.createElement("option")
    Content.value = Lowercase ? Text.replace(/\s+/g, '-').toLowerCase() : Text
    Content.innerText = NoSpace ? Text : Text.replace(/([A-Z])/g, ' $1').trim()

    //Button.appendChild(Content)

    return Content
}


function CreateStandaloneButton(Text){
    const Container = document.createElement("div")
    Container.style = "display: flex; justify-content: center; width: 100%;"
    Container.innerHTML = `<button class="btn-control-sm" style="width: 90%; margin-top: 20px;"><span>Return</span></button>`
    Container.getElementsByTagName("span")[0].innerText = Text

    return [Container, Container.getElementsByTagName("button")[0]]
}

async function CreateSettingsListReact(){
    const RobloxContainer = await WaitForId("settings-container")
    const FullContainer = RobloxContainer.parentNode
    const RobloxMobileVerticalMenu = await WaitForClass("mobile-navigation-dropdown")

    const OpenOption = CreateMenuOption("Roblox QoL", true)
    WaitForClass("menu-vertical").then(function(RobloxVerticalMenu){
        RobloxVerticalMenu.appendChild(OpenOption)
    })

    const RobloxMobileSelectOptions = RobloxMobileVerticalMenu.getElementsByClassName("select-option")[0]
    const MobileOpenOption = CreateMobileMenuOptionReact("Roblox QoL", true, true)
    RobloxMobileSelectOptions.appendChild(MobileOpenOption)

    const SettingsContainer = document.createElement("div")
    SettingsContainer.style.display = "none"
    SettingsContainer.id = "settings-container"
    SettingsContainer.innerHTML = `<div class="left-navigation"> <ul class="menu-vertical submenus" role="tablist" ng-init="currentData.activeTab">  </ul> </div> <div class="tab-content rbx-tab-content ng-scope" ng-controller="accountsContentController">   </div>`
    FullContainer.appendChild(SettingsContainer)

    const VerticalMenu = SettingsContainer.getElementsByClassName("menu-vertical")[0]
    const MobileVerticalMenu = CreateMobileSettingsDropdownReact()
    //const OpenMobileVerticalMenu = MobileVerticalMenu.getElementsByClassName("input-group-btn dropdown")[0]
    MobileVerticalMenu.style.display = "none"
    const MobileVerticalMenuList = MobileVerticalMenu.getElementsByClassName("input-field")[0]
    //RobloxMobileVerticalMenu.parentNode.appendChild(MobileVerticalMenu)
    SettingsContainer.appendChild(MobileVerticalMenu)

    //const MobileVerticalMenuButton = MobileVerticalMenu.getElementsByClassName("input-dropdown-btn dropdown-toggle")[0]
    //const MobileVerticalMenuButtonLabel = MobileVerticalMenuButton.getElementsByClassName("rbx-selection-label")[0]

    const [MobileReturnContainer, MobileReturnButton] = CreateStandaloneButton("Return")
    MobileVerticalMenu.appendChild(MobileReturnContainer)

    let LastActiveButton
    let CurrentOption

    // function UpdateMobileVerticalMenuName(title){
    //     MobileVerticalMenuButtonLabel.innerText = title.replace(/([A-Z])/g, ' $1').trim()
    // }

    // let MobileVerticalMenuOpen = false
    // function CloseMobileVerticalMenu(){
    //     if (MobileVerticalMenuOpen){
    //         OpenMobileVerticalMenu.className = OpenMobileVerticalMenu.className.replace("open", "")
    //         MobileVerticalMenuOpen = false
    //     }
    // }

    // MobileVerticalMenuButton.addEventListener("click", function(e){
    //     e.stopPropagation()
    //     if (!MobileVerticalMenuOpen) {
    //         OpenMobileVerticalMenu.className += " open"
    //         MobileVerticalMenuOpen = true
    //     } else CloseMobileVerticalMenu()
    // })

    // document.addEventListener("click", CloseMobileVerticalMenu)

    function OpenQoLSettings(){
        SettingsContainer.style.display = ""
        RobloxContainer.style.display = "none"

        RobloxMobileVerticalMenu.style.display = "none"
        MobileVerticalMenu.style.display = ""
        window.history.pushState(null, "Settings", `/my/account?tab=robloxqol${CurrentOption ? "&option="+CurrentOption : ""}`)
    }

    OpenOption.addEventListener("click", OpenQoLSettings)
    MobileOpenOption.addEventListener("click", OpenQoLSettings)

    let PriorValue = RobloxMobileSelectOptions?.value
    if (RobloxMobileSelectOptions) RobloxMobileSelectOptions.addEventListener("change", function(e){
        if (RobloxMobileSelectOptions.value === "roblox-qol"){
            e.stopImmediatePropagation()
            e.stopPropagation()

            OpenQoLSettings()
            RobloxMobileSelectOptions.value = PriorValue
        }

        PriorValue = RobloxMobileSelectOptions.value
    })

    MobileVerticalMenuList.addEventListener("change", function(){
        OpenContainer(MobileVerticalMenuList.value)
    })

    const TabContent = SettingsContainer.getElementsByClassName("tab-content rbx-tab-content")[0]
    SettingsContainer.appendChild(TabContent)

    const TitleToContainer = {}
    const TitleToButton = {}
    const TitleToMobileButton = {}

    function HideAllContainers(){
        for (const [_, Container] of Object.entries(TitleToContainer)){
            Container.style.display = "none"
        }
    }

    function OpenContainer(Title){
        HideAllContainers()

        if (LastActiveButton) LastActiveButton.className = "menu-option"
        LastActiveButton = TitleToButton[Title]
        TitleToButton[Title].className = "menu-option active"
        TitleToContainer[Title].style.display = ""

        CurrentOption = Title
        //UpdateMobileVerticalMenuName(Title)
        window.history.pushState(null, "Settings", "/my/account?tab=robloxqol&option="+Title)
    }

    const CustomTabNames = []
    let TabConstructors = []

    async function CreateCustomTab(Name, Callback, GhostTab){
        CustomTabNames.push(Name)

        await new Promise((resolve) => {
            TabConstructors.push(resolve)
        })

        const AllTitleIndexes = Object.keys(Settings)

        const SecurityList = CreateMenuList()
        const Button = CreateMenuOption(Name)
        const MobileButton = CreateMobileMenuOptionReact(Name)

        Callback(SecurityList)

        if (!GhostTab){
            VerticalMenu.insertBefore(Button, TitleToButton[AllTitleIndexes[AllTitleIndexes.indexOf(Name)+1]])
            MobileVerticalMenuList.insertBefore(MobileButton, TitleToMobileButton[AllTitleIndexes[AllTitleIndexes.indexOf(Name)+1]])
        }

        Button.addEventListener("click", function(){
            OpenContainer(Name)
        })

        MobileButton.addEventListener("click", function(){
            OpenContainer(Name)
        })

        TabContent.appendChild(SecurityList)
        TitleToButton[Name] = Button
        TitleToContainer[Name] = SecurityList
        SecurityList.style.display = "none"
    }

    const CustomTabPromises = [
        CreateCustomTab("Themes", CreateThemesSection),
        CreateCustomTab("Security", CreateSecuritySection),
        CreateCustomTab("Diagnose", CreateDiagnoseSection, true)
    ]

    for (const [title, _] of Object.entries(Settings)){
        if (CustomTabNames.includes(title)) continue
        const List = CreateMenuList()
        TabContent.appendChild(List)

        const Button = CreateMenuOption(title)
        VerticalMenu.appendChild(Button)

        Button.addEventListener("click", function(){
            OpenContainer(title)
        })

        const MobileButton = CreateMobileMenuOptionReact(title)
        MobileVerticalMenuList.appendChild(MobileButton)

        MobileButton.addEventListener("click", function(){
            OpenContainer(title)
        })
        
        TitleToButton[title] = Button
        TitleToMobileButton[title] = MobileButton
        TitleToContainer[title] = List
    }

    for (const [title, settings] of Object.entries(Settings)){
        if (CustomTabNames.includes(title)) continue
        CreateSpecificSettingsSection(TitleToContainer[title], title, settings)
    }

    for (let i = 0; i < TabConstructors.length; i++){
        TabConstructors[i]()
    }
    await Promise.all(CustomTabPromises)

    const [ReturnContainer, ReturnButton] = CreateStandaloneButton("Return")
    VerticalMenu.parentNode.appendChild(ReturnContainer)

    function CloseRobloxQoL(){
        SettingsContainer.style.display = "none"
        RobloxContainer.style.display = ""

        RobloxMobileVerticalMenu.style.display = ""
        MobileVerticalMenu.style.display = "none"

        window.history.pushState(null, "Settings", "/my/account?")
    }

    ReturnButton.addEventListener("click", CloseRobloxQoL)

    MobileReturnButton.addEventListener("click", CloseRobloxQoL)

    const Params = new URLSearchParams(window.location.search)
    if (Params.get("tab") === "robloxqol"){
        OpenQoLSettings()
        const CurrentOption = Params.get("option")
        if (CurrentOption){
            HideAllContainers()
            OpenContainer(CurrentOption)
        } else {
            HideAllContainers()
            OpenContainer(Object.keys(Settings)[0])
        }
    }
}

async function CreateSettingsListController(){
    const RobloxContainer = await WaitForId("settings-container")
    const FullContainer = RobloxContainer.parentNode
    const RobloxVerticalMenu = await WaitForId("vertical-menu")
    const RobloxMobileVerticalMenu = await WaitForClassPath(await WaitForQuerySelector(`[ng-controller="accountsController"]`), "section", "tab-dropdown")

    const OpenOption = CreateMenuOption("Roblox QoL", true)
    RobloxVerticalMenu.appendChild(OpenOption)

    const MobileOpenOption = CreateMobileMenuOption("Roblox QoL", true)
    RobloxMobileVerticalMenu.getElementsByClassName("dropdown-menu")[0].appendChild(MobileOpenOption)

    const SettingsContainer = document.createElement("div")
    SettingsContainer.style.display = "none"
    SettingsContainer.id = "settings-container"
    SettingsContainer.innerHTML = `<div class="left-navigation"> <ul class="menu-vertical submenus" role="tablist" ng-init="currentData.activeTab">  </ul> </div> <div class="tab-content rbx-tab-content ng-scope" ng-controller="accountsContentController">   </div>`
    FullContainer.appendChild(SettingsContainer)

    const VerticalMenu = SettingsContainer.getElementsByClassName("menu-vertical")[0]
    const MobileVerticalMenu = CreateMobileSettingsDropdown()
    const OpenMobileVerticalMenu = MobileVerticalMenu.getElementsByClassName("input-group-btn dropdown")[0]
    MobileVerticalMenu.style.display = "none"
    const MobileVerticalMenuList = MobileVerticalMenu.getElementsByClassName("dropdown-menu")[0]
    RobloxMobileVerticalMenu.parentNode.appendChild(MobileVerticalMenu)

    const MobileVerticalMenuButton = MobileVerticalMenu.getElementsByClassName("input-dropdown-btn dropdown-toggle")[0]
    const MobileVerticalMenuButtonLabel = MobileVerticalMenuButton.getElementsByClassName("rbx-selection-label")[0]

    const [MobileReturnContainer, MobileReturnButton] = CreateStandaloneButton("Return")
    MobileVerticalMenu.appendChild(MobileReturnContainer)

    let LastActiveButton
    let CurrentOption

    function UpdateMobileVerticalMenuName(title){
        MobileVerticalMenuButtonLabel.innerText = title.replace(/([A-Z])/g, ' $1').trim()
    }

    let MobileVerticalMenuOpen = false
    function CloseMobileVerticalMenu(){
        if (MobileVerticalMenuOpen){
            OpenMobileVerticalMenu.className = OpenMobileVerticalMenu.className.replace("open", "")
            MobileVerticalMenuOpen = false
        }
    }

    MobileVerticalMenuButton.addEventListener("click", function(e){
        e.stopPropagation()
        if (!MobileVerticalMenuOpen) {
            OpenMobileVerticalMenu.className += " open"
            MobileVerticalMenuOpen = true
        } else CloseMobileVerticalMenu()
    })

    document.addEventListener("click", CloseMobileVerticalMenu)

    function OpenQoLSettings(){
        SettingsContainer.style.display = ""
        RobloxContainer.style.display = "none"

        RobloxMobileVerticalMenu.style.display = "none"
        MobileVerticalMenu.style.display = ""
        window.history.pushState(null, "Settings", `/my/account?tab=robloxqol${CurrentOption ? "&option="+CurrentOption : ""}`)
    }

    OpenOption.addEventListener("click", OpenQoLSettings)
    MobileOpenOption.addEventListener("click", OpenQoLSettings)

    const TabContent = SettingsContainer.getElementsByClassName("tab-content rbx-tab-content")[0]
    SettingsContainer.appendChild(TabContent)

    const TitleToContainer = {}
    const TitleToButton = {}
    const TitleToMobileButton = {}

    function HideAllContainers(){
        for (const [_, Container] of Object.entries(TitleToContainer)){
            Container.style.display = "none"
        }
    }

    function OpenContainer(Title){
        HideAllContainers()

        if (LastActiveButton) LastActiveButton.className = "menu-option"
        LastActiveButton = TitleToButton[Title]
        TitleToButton[Title].className = "menu-option active"
        TitleToContainer[Title].style.display = ""

        CurrentOption = Title
        UpdateMobileVerticalMenuName(Title)
        window.history.pushState(null, "Settings", "/my/account?tab=robloxqol&option="+Title)
    }

    const CustomTabNames = []
    let TabConstructors = []

    async function CreateCustomTab(Name, Callback, GhostTab){
        CustomTabNames.push(Name)

        await new Promise((resolve) => {
            TabConstructors.push(resolve)
        })

        const AllTitleIndexes = Object.keys(Settings)

        const SecurityList = CreateMenuList()
        const Button = CreateMenuOption(Name)
        const MobileButton = CreateMobileMenuOption(Name)

        Callback(SecurityList)

        if (!GhostTab){
            VerticalMenu.insertBefore(Button, TitleToButton[AllTitleIndexes[AllTitleIndexes.indexOf(Name)+1]])
            MobileVerticalMenuList.insertBefore(MobileButton, TitleToMobileButton[AllTitleIndexes[AllTitleIndexes.indexOf(Name)+1]])
        }

        Button.addEventListener("click", function(){
            OpenContainer(Name)
        })

        MobileButton.addEventListener("click", function(){
            OpenContainer(Name)
        })

        TabContent.appendChild(SecurityList)
        TitleToButton[Name] = Button
        TitleToContainer[Name] = SecurityList
        SecurityList.style.display = "none"
    }

    const CustomTabPromises = [
        CreateCustomTab("Themes", CreateThemesSection),
        CreateCustomTab("Security", CreateSecuritySection),
        CreateCustomTab("Diagnose", CreateDiagnoseSection, true)
    ]

    for (const [title, _] of Object.entries(Settings)){
        if (CustomTabNames.includes(title)) continue
        const List = CreateMenuList()
        TabContent.appendChild(List)

        const Button = CreateMenuOption(title)
        VerticalMenu.appendChild(Button)

        Button.addEventListener("click", function(){
            OpenContainer(title)
        })

        const MobileButton = CreateMobileMenuOption(title)
        MobileVerticalMenuList.appendChild(MobileButton)

        MobileButton.addEventListener("click", function(){
            OpenContainer(title)
        })
        
        TitleToButton[title] = Button
        TitleToMobileButton[title] = MobileButton
        TitleToContainer[title] = List
    }

    for (const [title, settings] of Object.entries(Settings)){
        if (CustomTabNames.includes(title)) continue
        CreateSpecificSettingsSection(TitleToContainer[title], title, settings)
    }

    for (let i = 0; i < TabConstructors.length; i++){
        TabConstructors[i]()
    }
    await Promise.all(CustomTabPromises)

    const [ReturnContainer, ReturnButton] = CreateStandaloneButton("Return")
    VerticalMenu.parentNode.appendChild(ReturnContainer)

    function CloseRobloxQoL(){
        SettingsContainer.style.display = "none"
        RobloxContainer.style.display = ""

        RobloxMobileVerticalMenu.style.display = ""
        MobileVerticalMenu.style.display = "none"

        window.history.pushState(null, "Settings", "/my/account?")
    }

    ReturnButton.addEventListener("click", CloseRobloxQoL)

    MobileReturnButton.addEventListener("click", CloseRobloxQoL)

    const Params = new URLSearchParams(window.location.search)
    if (Params.get("tab") === "robloxqol"){
        OpenQoLSettings()
        const CurrentOption = Params.get("option")
        if (CurrentOption){
            HideAllContainers()
            OpenContainer(CurrentOption)
        } else {
            HideAllContainers()
            OpenContainer(Object.keys(Settings)[0])
        }
    }

}

async function CreateSettingsList(){
    const Result = await Promise.race([
        new Promise(async(resolve) => {
            await WaitForClassPath(await WaitForQuerySelector(`[ng-controller="accountsController"]`), "section", "tab-dropdown")
            resolve("Controller")
        }),
        new Promise(async(resolve) => {
            await WaitForClass("mobile-navigation-dropdown")
            resolve("React")
        })
    ])

    if (Result === "React") CreateSettingsListReact()
    else CreateSettingsListController()
}

setTimeout(CreateSettingsList, 0)