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
        },
        HideDesktopAppBanner: {
            Title: "Hide Desktop App Banner",
            Description: "Hides the roblox desktop app banner from appearing."
        },
        MoveHomeFavouritesToThirdRow: {
            Title: "Move Favorites Row Up",
            Description: "Move the favorites category on the games page above the recommended rows."
        },
        HideRobloxAds: {
            Title: "Hide Roblox Ads",
            Description: "Hides roblox advertisements from appearing."
        },
        HideFooter: {
            Title: "Hide Footer",
            Description: "Hides the footer at the bottom of the page."
        },
        AddDownloadButtonToNewVersionHistory: {
            Title: "Add Download Button to version history",
            Description: "Adds a download button to place version history."
        },
        DetailedGroupTranscationSummary: {
            Title: "Transaction Summary Source",
            Description: "Shows source of income on transaction and group summary page."
        },
        OutfitSearchbar: {
            Title: "Outfit Searchbar",
            Description: "Adds a search bar to your avatar outfits."
        },
        AddUSDToRobux: {
            Title: "Show currency on Robux",
            Description: "Shows amount of robux in currency selected (Devex Rate)"
        },
        Currency: {
            Title: "Currency",
            Description: "Shows amount of robux in currency you selected (Devex Rate)",
            Type: "SelectionList",
            GetList: async function(){
                const [Success, Result] = await RequestFunc("https://qol.haydz6.com/api/currency/rates", "GET")
                if (!Success) return []

                const List = []

                for (const [Currency, Rate] of Object.entries(Result)){
                    List.push(Currency)
                }
                return List
            }
        }
        // Mutuals: {
        //     Title: "Mutuals",
        //     Description: "Allows you to see mutuals friends!"
        // }
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
        Playtime: {
            Title: "Playtime",
            Description: "Tracks and shows how long you have played a game."
        },
        QuickInvite: {
            Title: "Quick Invite",
            Description: "A link you can share with your friends to join a server."
        },
        AwardedBadgeDates: {
            Title: "Badge Awarded Dates",
            Description: "Shows you when the date you achieved a badge."
        },
        RecentServers: {
            Title: "Show Recent Servers",
            Description: "Shows recent servers you have joined for a game."
        }
    },
    Trades: {
        TradeNotifier: {
            Title: "Trade Notifier",
            Description: "Sends you a notification when you receive, send, decline or cancel a trade."
        },
        TradeFilters: {
            Title: "Trade Filters",
            Description: "Allows you to cancel all, old, loss and other trades."
        },
        ValuesOnOverview: {
            Title: "Trade Value Overview",
            Description: "Allows you to see trade values on the overview list."
        },
        ShowSummaryOnTrade: {
            Title: "Shows earnings on trade",
            Description: "Shows how much you earnt/loss in value and rap on a trade."
        },
        ShowValueOnTrade: {
            Title: "Show value on trade",
            Description: "Shows total value of trade (rolimons)"
        },
        ShowDemandOnTrade: {
            Title: "Show demand on trade",
            Description: "Shows average demand of trade (rolimons)"
        },
        ValueDemandOnItem: {
            Title: "Demand/Value on Item",
            Description: "Shows a limited item's demand and value."
        },
        ValueAndCategoriesOnOffer: {
            Title: "Show demand and categories on offer",
            Description: "Shows a limited item's value and categories (rare, projected, hyped) on the offer page."
        },
        RapOnProfile: {
            Title: "Rap on Profile",
            Description: "Shows a user's rap on their profile."
        },
        ValueOnProfile: {
            Title: "Value on Profile",
            Description: "Shows a user's rolimons value on their profile."
        },
        QuickDecline: {
            Title: "Quick Decline",
            Description: "Adds a button to the trades list to quick decline."
        },
        QuickCancel: {
            Title: "Quick Cancel",
            Description: "Adds a button to the trades list to quick cancel."
        },
        AutodeclineTradeValue: {
            Title: "Auto-decline Inbound Value Loss",
            Description: "Declines any trade that you receive which have a value loss more than specified",
        },
        AutodeclineTradeValueThreshold: {
            Title: "Auto-decline Inbound Value Loss Threshold",
            Description: "",
            Type: "InputBox",
            Placeholder: "%",
            Middleman: function(Feature, PreviousValue, Value){
                const Numbers = Value.replace(/^\D+/g, "")
                if (Numbers === ""){
                    return PreviousValue+"%"
                }
                const New = clamp(parseInt(Numbers), 0, 100)
                SetFeatureEnabled(Feature, New)
                return New+"%"
            }
        },
        AutodeclineOutboundTradeValue: {
            Title: "Auto-decline Outbound Value Loss",
            Description: "Declines any trade that you send which have a value loss more than specified",
        },
        AutodeclineOutboundTradeValueThreshold: {
            Title: "Auto-decline Outbound Value Loss Threshold",
            Description: "",
            Type: "InputBox",
            Placeholder: "%",
            Middleman: function(Feature, PreviousValue, Value){
                const Numbers = Value.replace(/^\D+/g, "")
                if (Numbers === ""){
                    return PreviousValue+"%"
                }
                const New = clamp(parseInt(Numbers), 0, 100)
                SetFeatureEnabled(Feature, New)
                return New+"%"
            }
        },
        AutodeclineLowTradeValue: {
            Title: "Auto-decline Low Value Trades",
            Description: "Declines any trade that you send which have less value then specified",
        },
        AutodeclineLowTradeValueThreshold: {
            Title: "Auto-decline Low Value Trades Threshold",
            Description: "",
            Type: "InputBox",
            Placeholder: "",
            Middleman: function(Feature, PreviousValue, Value){
                const Numbers = Value.replace(/^\D+/g, "")
                if (Numbers === ""){
                    return PreviousValue
                }
                SetFeatureEnabled(Feature, parseInt(Numbers))
                return parseInt(Numbers)
            }
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
    Assets: {
        AddSales: {
            Title: "Show Sales",
            Description: "Shows the amount of sales on assets you manage/created."
        },
        AddCreationDate: {
            Title: "Show Created/Updated Date",
            Description: "Shows the created and updated date of asset."
        },
        ShowUSDOnAsset: {
            Title: "Show currency price",
            Description: "Shows price of asset in currency selected (Devex Rate)"
        }
        // ShowSimilarUGCItems: {
        //     Title: "Show recolors of UGC accessory",
        //     Description: "Shows UGC accessories recolors"
        // }
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
    },
    Security: {
        NewLoginNotifier2: {
            Title: "Notification on new login",
            Description: "Sends notification to browser when a new login is detected. It includes the location, os, browser and IP of the login."
        },
        NewLoginNotifierTTS2: {
            Title: "TTS Notification on new login",
            Description: "Uses text to speech to say location, os and browser.",
            Supported: async function(){
                return await chrome.runtime.sendMessage({type: "FeatureSupported", name: "tts"})
            }
        },
        ShowStateAndCountryOnNewSessionOnly: {
            Title: "Only show country and state on new session login",
            Description: "Only shows country and state on new session notification (Disables city).",
        },
        ShowIPOnNewSession: {
            Title: "Display IP on new session login",
            Description: "Shows IP on new session notification.",
        },
        IgnoreSessionsFromSameIP: {
            Title: "Ignore new sessions from same IP",
            Description: "Ignores session if it has the same IP as current browser. (Recommended off for VPN or NAT users)"
        },
        DisallowOtherIPs: {
            Title: "Disallow other IPs on login",
            Description: "If a session is first logged in from another/unknown IP, it will automatically log it out (Does not affect existing sessions)\nIf you become locked out while away from your device from this setting, use forget your password to regain access."
        },
        StrictlyDisallowOtherIPs: {
            Title: "Strictly disallow other IP",
            Description: "If a session's IP does not match your device's IP, it will be logged out.\nIf you become locked out while away from your device from this setting, use forget your password to regain access."
        },
    }
}

function IsQOLSettingsOpened(){
    const urlParams = new URLSearchParams(window.location.search)

    let ParamsLength = 0
    urlParams.forEach(function(){
        ParamsLength++
    })

    return urlParams.get("tab") === "robloxqol" && ParamsLength == 1
}

async function CreateSpecificSettingsSection(OptionsList, title, settings){
    let Title

    if (typeof(title) == "string"){
        Title = CreateSectionTitle(title)
        OptionsList.appendChild(Title)
    } else {
        Title = title
    }

    let NextIndex = 1

    for (const [feature, info] of Object.entries(settings)){
        let Index = NextIndex
        NextIndex++
        await new Promise(async(resolve) => {
            let Section

            let IsSupported = info.Supported == undefined || await info.Supported()
            const FeatureEnabled = await IsFeatureEnabled(feature)
            const FeatureKilled = await IsFeatureKilled(feature)

            if (info.Type === "InputBox") Section = CreateSectionSettingsInputBox(feature, info.Title, info.Description, info.Placeholder, FeatureEnabled, FeatureKilled, IsSupported, info.Middleman)
            else if (info.Type == "SelectionList") Section = CreateSectionSettingsDropdown(feature, info.Title, info.Description, await info.GetList(), FeatureEnabled, FeatureKilled, IsSupported, function(NewValue){
                SetFeatureEnabled(feature, NewValue)
            })
            else Section = CreateSectionSettingsToggable(feature, info.Title, info.Description, FeatureEnabled, FeatureKilled, IsSupported)

            let TitleIndex = 0
            let OptionsChildren = OptionsList.children

            for (let i = 0; i < OptionsChildren.length; i++){
                if (OptionsChildren[i] == Title){
                    TitleIndex = i
                    break
                }
            }

            OptionsList.insertBefore(Section, OptionsList.children[TitleIndex+Index])
            resolve()
        })
    }
}

async function CreateSettingsSection(OptionsList){
    for (const [title, settings] of Object.entries(Settings)){
        if (title == "Security") continue
        CreateSpecificSettingsSection(OptionsList, title, settings)
    }
}

function CreateSignoutOption(OptionsList){
    const [Section, Button] = CreateSectionButtonSetting("Sign out of all other sessions (Roblox QoL Service)", "Sign out")
    let Debounce = false

    Button.addEventListener("click", async function(){
        if (Debounce) return
        Debounce = true

        const NewKey = await Reauthenticate()

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

    CreateSpecificSettingsSection(OptionsList, Title, Settings.Security)

    CreateSignoutOption(OptionsList)
}

async function HideOriginalSettingButtonActive(){
    const ActiveButton = await WaitForClass("menu-option ng-scope active")
    ActiveButton.className = "menu-option ng-scope"
}

function HandleTabChange(SettingsButtonList, QOLContainer){
    const children = SettingsButtonList.children;
    for (let i = 0; i < children.length; i++) {
        children[i].getElementsByTagName("a")[0]?.addEventListener("click", function(){
            if (Child.href) window.location.search = ""

            QOLContainer.className = "menu-option ng-scope"
        })
    }
}

async function OpenQOLSettings(SettingsButtonList, NavigateContainer){
    //window.location.href = "https://www.roblox.com/my/account?tab=robloxqol"
    window.history.pushState(null, "Settings", "/my/account?tab=robloxqol")

    WaitForId("vertical-menu").then(function(Menu){
        ChildAdded(Menu, true, async function(Button){
            ChildAdded(Button, true, function(Child){
                if (Child){
                    Child.href = Child.href.replaceAll("?tab=robloxqol", "")

                    if (Child.href.includes("#!/")){
                        Child.addEventListener("click", function(){
                            window.location.href = Child.href
                        })
                    }
                }
            })
        })
    })

    HideOriginalSettingButtonActive()
    HandleTabChange(SettingsButtonList, NavigateContainer)

    NavigateContainer.className = "menu-option ng-scope active"

    const SettingsContainer = await WaitForClass("tab-content rbx-tab-content ng-scope")

    const OptionsList = SettingsContainer.getElementsByClassName("ng-scope")[0].getElementsByClassName("ng-scope")[0]
    ClearAllChildren(OptionsList)

    await CreateSettingsSection(OptionsList)
    CreateSecuritySection(OptionsList)
}

async function StartQOLSettings(){
    const IsOpen = IsQOLSettingsOpened()
    const SettingsButtonList = await WaitForClass("menu-vertical submenus")

    const [NavigateContainer] = CreateSettingNavigationButton("Roblox QoL")
    SettingsButtonList.appendChild(NavigateContainer)

    NavigateContainer.addEventListener("click", function(e){
        e.preventDefault()
        OpenQOLSettings(SettingsButtonList, NavigateContainer)
    })

    if (IsOpen) OpenQOLSettings(SettingsButtonList, NavigateContainer)
}

StartQOLSettings()