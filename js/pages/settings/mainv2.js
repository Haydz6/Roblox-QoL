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

function CreateStandaloneButton(Text){
    const Container = document.createElement("div")
    Container.style = "display: flex; justify-content: center;"
    Container.innerHTML = `<button class="btn-control-sm" style="width: 90%; margin-top: 20px;"><span>Return</span></button>`
    Container.getElementsByTagName("span")[0].innerText = Text

    return [Container, Container.getElementsByTagName("button")[0]]
}

async function CreateSettingsList(){
    const RobloxContainer = await WaitForId("settings-container")
    const FullContainer = RobloxContainer.parentNode
    const RobloxVerticalMenu = await WaitForId("vertical-menu")

    const OpenOption = CreateMenuOption("Roblox QoL", true)
    RobloxVerticalMenu.appendChild(OpenOption)

    const SettingsContainer = document.createElement("div")
    SettingsContainer.style.display = "none"
    SettingsContainer.id = "settings-container"
    SettingsContainer.innerHTML = `<div class="left-navigation"> <ul id="vertical-menu" class="menu-vertical submenus" role="tablist" ng-init="currentData.activeTab">  </ul> </div> <div class="tab-content rbx-tab-content ng-scope" ng-controller="accountsContentController">   </div>`
    FullContainer.appendChild(SettingsContainer)

    const VerticalMenu = SettingsContainer.getElementsByClassName("menu-vertical")[0]

    let LastActiveButton
    let CurrentOption

    function OpenQoLSettings(){
        SettingsContainer.style.display = ""
        RobloxContainer.style.display = "none"
        window.history.pushState(null, "Settings", `/my/account?tab=robloxqol${CurrentOption ? "&option="+CurrentOption : ""}`)
    }

    OpenOption.addEventListener("click", OpenQoLSettings)

    const TabContent = SettingsContainer.getElementsByClassName("tab-content rbx-tab-content")[0]
    SettingsContainer.appendChild(TabContent)

    const TitleToContainer = {}
    const TitleToButton = {}

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
        window.history.pushState(null, "Settings", "/my/account?tab=robloxqol&option="+Title)
    }

    for (const [title, _] of Object.entries(Settings)){
        if (title == "Security") continue
        const List = CreateMenuList()
        TabContent.appendChild(List)

        const Button = CreateMenuOption(title)
        VerticalMenu.appendChild(Button)

        Button.addEventListener("click", function(){
            OpenContainer(title)
        })
        
        TitleToButton[title] = Button
        TitleToContainer[title] = List
    }

    for (const [title, settings] of Object.entries(Settings)){
        if (title == "Security") continue
        CreateSpecificSettingsSection(TitleToContainer[title], title, settings)
    }

    const SecurityList = CreateMenuList()
    const Button = CreateMenuOption("Security")

    CreateSecuritySection(SecurityList)
    VerticalMenu.appendChild(Button)
    TabContent.appendChild(SecurityList)

    Button.addEventListener("click", function(){
        OpenContainer("Security")
    })
        
    TitleToButton["Security"] = Button
    TitleToContainer["Security"] = SecurityList

    HideAllContainers()
    OpenContainer(Object.keys(Settings)[0])

    const [ReturnContainer, ReturnButton] = CreateStandaloneButton("Return")
    VerticalMenu.parentNode.appendChild(ReturnContainer)

    ReturnButton.addEventListener("click", function(){
        SettingsContainer.style.display = "none"
        RobloxContainer.style.display = ""
        window.history.pushState(null, "Settings", "/my/account")
    })

    const Params = new URLSearchParams(window.location.search)
    console.log(window.location.search)
    if (Params.get("tab") === "robloxqol"){
        OpenQoLSettings()
        const CurrentOption = Params.get("option")
        if (CurrentOption){
            console.log(CurrentOption)
            HideAllContainers()
            OpenContainer(CurrentOption)
        }
    }
}

CreateSettingsList()