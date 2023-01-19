const Settings = {
    Features: {
        ExtraOutfits: {
            Title: "Extra Outfits",
            Description: "Allows you to have more than 50 outfits."
        },
        ActivePrivateServers: {
            Title: "Active Private Servers",
            Description: "Allows you to see which private servers are billing you."
        },
        NewMessagePing: {
            Title: "New Message Ping",
            Description: "Creates a ping sound whenever you receive a new chat message."
        },
        ExploreAsset: {
            Title: "Asset Download/View",
            Description: "Allows you to download or view an asset. Also allows you to go to the image of a decal."
        }
    },
    Games: {
        LiveExperienceStats: {
            Title: "Live Experience Statistics",
            Description: "Updates an experiences stats while you are looking at the page."
        },
        ServerRegions: {
            Title: "Server Regions",
            Description: "Shows where a server is located."
        },
        ServerFilters: {
            Title: "Server Filters",
            Description: "Allows you to filter servers by region, size and age."
        },
        QuickInvite: {
            Title: "Quick Invite",
            Description: "A link you can share with your friends to join a server."
        },
        AwardedBadgeDates: {
            Title: "Badge Awarded Dates",
            Description: "Shows you when the date you achieved a badge."
        }
    },
    Friends: {
        FriendHistory: {
            Title: "Friend History",
            Description: "Allows you to see a history of what friends you have had."
        },
        FriendNotifications: {
            Title: "Friend Notifications",
            Description: "Notifies you when you make or lose a friend."
        },
    },
    Fixes: {
        FixFavouritesPage: {
            Title: "Favourites Page Fix",
            Description: "Fixes the favourites page only showing the first 30 games."
        },
        PurchasedGamesFix: {
            Title: "Purchased Games Fix",
            Description: "Fixes the purchased games option in your inventory."
        },
    }
}

function IsQOLSettingsOpened(){
    const urlParams = new URLSearchParams(window.location.search)

    return urlParams.get("tab") === "robloxqol"
}

async function CreateSettingsSection(OptionsList){
    for (const [title, settings] of Object.entries(Settings)){
        const Title = CreateSectionTitle(title)
        OptionsList.appendChild(Title)

        for (const [feature, info] of Object.entries(settings)){
            const Section = CreateSectionSettingsToggable(feature, info.Title, info.Description, await IsFeatureEnabled(feature))
            OptionsList.appendChild(Section)
        }
    }
}

function CreateSignoutOption(OptionsList){
    const [Section, Button] = CreateSectionButtonSetting("Sign out of all other sessions (Roblox QoL Service)", "Sign out")
    let Debounce = false

    Button.addEventListener("click", async function(){
        if (Debounce) return
        Debounce = true

        const NewKey = await InvalidateAuthKey()

        const [Modal, Backdrop, [OkButton], CloseButton] = CreateSuccessDialog(NewKey === "" && "Failed" || "Success", NewKey === "" && "Failed to sign out of all other sessions!" || "You have been signed out of all other sessions.", ["OK"])

        OkButton.addEventListener("click", function(){
            Modal.remove()
            Backdrop.remove()
        })

        CloseButton.addEventListener("click", function(){
            Modal.remove()
            Backdrop.remove()
        })

        document.body.insertBefore(Modal, document.body.firstChild)
        document.body.insertBefore(Backdrop, document.body.firstChild)

        Debounce = false
    })

    OptionsList.appendChild(Section)
}

function CreateSecuritySection(OptionsList){
    const Title = CreateSectionTitle("Security")
    OptionsList.appendChild(Title)

    CreateSignoutOption(OptionsList)
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

    await CreateSettingsSection(OptionsList)
    CreateSecuritySection(OptionsList)
}

Run()