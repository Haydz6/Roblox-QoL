const Settings = {
    Features: {
        ExtraOutfits: {
            Title: "Extra Outfits",
            Description: "Allows you to have more than 50 outfits."
        },
        FixFavouritesPage: {
            Title: "Favourites Page Fix",
            Description: "Fixes the favourites page only showing the first 30 games."
        },
        ActivePrivateServers: {
            Title: "Active Private Servers",
            Description: "Allows you to see which private servers are billing you."
        },
        NewMessagePing: {
            Title: "New Message Ping",
            Description: "Creates a ping sound whenever you receive a new chat message."
        },
        PurchasedGamesFix: {
            Title: "Purchased Games Fix",
            Description: "Fixes the purchased games option in your inventory."
        }
    }
}

function IsQOLSettingsOpened(){
    const urlParams = new URLSearchParams(window.location.search)

    return urlParams.get("tab") === "robloxqol"
}

function CreateFeaturesSection(OptionsList){
    const Title = CreateSectionTitle("Features")
    OptionsList.appendChild(Title)

    for (const [feature, info] of Object.entries(Settings.Features)){
        const Section = CreateSectionSettingsToggable(feature, info.Title, info.Description, IsFeatureEnabled(feature))
        OptionsList.appendChild(Section)
    }
}

async function HideOriginalSettingButtonActive(){
    const ActiveButton = await WaitForClass("menu-option ng-scope active")
    ActiveButton.className = "menu-option ng-scope"
}

function HandleTabChange(SettingsButtonList, QOLContainer){
    const children = SettingsButtonList.children;
    for (let i = 0; i < children.length; i++) {
        children[i].getElementsByTagName("a")[0].addEventListener("click", function(){
            window.location.search = ""

            QOLContainer.className = "menu-option ng-scope"
        })
    }
}

async function Run(){
    const SettingsButtonList = await WaitForClass("menu-vertical submenus")

    const [NavigateContainer] = CreateSettingNavigationButton("Roblox QoL", "?tab=robloxqol")
    SettingsButtonList.appendChild(NavigateContainer)

    if (!IsQOLSettingsOpened()) {
        return
    }

    HideOriginalSettingButtonActive()
    HandleTabChange(SettingsButtonList, NavigateContainer)

    NavigateContainer.className = "menu-option ng-scope active"

    const SettingsContainer = await WaitForClass("tab-content rbx-tab-content ng-scope")

    const OptionsList = SettingsContainer.getElementsByClassName("ng-scope")[0].getElementsByClassName("ng-scope")[0]
    ClearAllChildren(OptionsList)

    CreateFeaturesSection(OptionsList)
}

Run()