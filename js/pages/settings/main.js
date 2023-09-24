const Settings = {
    Discord: {
        DiscordPresence: {
            Title: "Discord Presence",
            Description: "Displays what you are playing and join button on discord. (You will not be able to see your own presence if you already have activity, this is a discord limitation)\nUses the account logged into the browser version.",
            Run: async function(Title){
                const Avatar = document.createElement("span")
                Avatar.className = "avatar avatar-headshot-xs user"
                Avatar.style = "display: none; margin-left: 10px; height: 23px; width: 23px;"

                const ThumbnailContainer = document.createElement("span")
                ThumbnailContainer.className = "thumbnail-2d-container avatar-card-image"

                const Image = document.createElement("img")
                ThumbnailContainer.appendChild(Image)
                Avatar.appendChild(ThumbnailContainer)

                const Label = document.createElement("a")
                Label.style = "margin-left: 7px;"
                Label.target = "_blank"
                Title.append(Avatar, Label)

                function SetAvatar(Info){
                    if (Info){
                        Image.src = `https://cdn.discordapp.com/avatars/${Info.Id}/${Info.Avatar}.webp?size=80`
                        Avatar.style.display = "inline-flex"
                    } else {
                        Avatar.style.display = "none"
                    }
                }

                async function CheckLogin(){
                    const Info = await chrome.runtime.sendMessage({type: "GetDiscordInfo"})

                    if (Info == undefined){
                        Label.innerText = "(Click here to login)"
                    } else {
                        if (Info === false){
                            Label.innerText = "(Connected to external)"
                        } else {
                            if (Info.Discriminator == 0) {
                                Label.innerText = Info.Name
                            } else {
                                Label.innerText = `${Info.Name}#${Info.Discriminator}`
                            }
                        }
                    }

                    Label.href = "https://discord.com/app"
                    SetAvatar(Info)
                }

                setInterval(CheckLogin, 1*1000)
                CheckLogin()
            }
        },
        ExternalDiscordPresence: {
            Title: "External Discord Presence",
            Description: "Displays what you are playing and join button on discord. (",
            Run: async function(Title, Description){
                const Avatar = document.createElement("span")
                Avatar.className = "avatar avatar-headshot-xs user"
                Avatar.style = "display: none; margin-left: 10px; height: 23px; width: 23px;"

                const ThumbnailContainer = document.createElement("span")
                ThumbnailContainer.className = "thumbnail-2d-container avatar-card-image"

                const Image = document.createElement("img")
                ThumbnailContainer.appendChild(Image)
                Avatar.appendChild(ThumbnailContainer)

                const Label = document.createElement("a")
                Label.style = "margin-left: 7px;"
                Label.target = "_blank"
                Title.append(Avatar, Label)

                const DownloadLink = document.createElement("a")
                DownloadLink.href = "https://qol.haydz6.com/discord-presence-client"
                DownloadLink.innerText = "Requires external program"
                DownloadLink.style = "text-decoration: underline; cursor: pointer;"
                DownloadLink.target = "_blank"

                const FinishText = document.createElement("text")
                FinishText.innerText = " does not have same limitations as browser version)"

                Description.append(DownloadLink, FinishText)

                function SetAvatar(Info){
                    if (Info){
                        Image.src = `https://cdn.discordapp.com/avatars/${Info.id}/${Info.avatar}.webp?size=80`
                        Avatar.style.display = "inline-flex"
                    } else {
                        Avatar.style.display = "none"
                    }
                }

                async function CheckLogin(){
                    const Info = await chrome.runtime.sendMessage({type: "GetExternalDiscordInfo"})

                    if (Info == false){
                        Label.innerText = "(Not Connected)"
                    } else if (Info != true) {
                        if (Info.discriminator == 0) {
                            Label.innerText = Info.username
                        } else {
                            Label.innerText = `${Info.username}#${Info.discriminator}`
                        }
                    } else {
                        Label.innerText = "(Discord Not Detected)"
                    }

                    SetAvatar(Info != true && Info)
                }

                setInterval(CheckLogin, 1*1000)
                CheckLogin()
            }
        },
        DiscordPresenceJoin: {
            Title: "Show Join Button",
            Description: "Adds join button to presence to allow other users to join you."
        }
    },
    Features: {
        ExtraOutfits: {
            Title: "Extra Outfits",
            Description: "Allows you to have more than 50 outfits."
        },
        RemoveAccessoryLimit: {
            Title: "Remove Accessory Limit",
            Description: "Allows you to equip up to 10 accessories."
        },
        ActivePrivateServers: {
            Title: "Active Private Servers",
            Description: "Allows you to see which private servers are billing you."
        },
        NewMessagePing3: {
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
        CSVChart: {
            Title: "CSV Chart",
            Description: "Allows you to upload a CSV file and display it in a chart (User and Group transactions page)."
        },
        OutfitSearchbar: {
            Title: "Outfit Searchbar",
            Description: "Adds a search bar to your avatar outfits."
        },
        Mutuals2: {
            Title: "Friend Mutuals",
            Description: "Shows mutuals on a users page."
        },
        BestFriends: {
            Title: "Best Friends",
            Description: "Adds a new friends row to your home page."
        },
        ResizableChatBoxes: {
            Title: "Resizable chat boxes",
            Description: "Allows you to resize the chat boxes on the roblox site. (Drag top left)"
        },
        SupportedPlatforms: {
            Title: "Show Supported Devices",
            Description: "Shows what devices a game supports. (Replaces allowed gears)"
        },
        FriendsHomeLastOnline: {
            Title: "Last Online on Home",
            Description: "Shows last online if friend is offline on home page."
        },
        HideOffline: {
            Title: "Appear offline (Website Only)",
            Description: "Makes you appear offline to other users while browsing the website. (This only works on the website, it is a limitation of roblox)"
        },
        ShowFollowsYou: {
            Title: "Follows You Indicator",
            Description: "Shows if a user is following you."
        },
        ViewBannedGroup: {
            Title: "View Locked Group",
            Description: "Allows you to view locked groups."
        },
        ViewBannedUser: {
            Title: "View Banned User",
            Description: "Allows you to view a banned user."
        },
        AddRowToHomeFriends: {
            Title: "Expand home friends list",
            Description: "Adds another row to friends list on the home page."
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
        PreferredServerRegion: {
            Title: "Preferred Server Region",
            Description: "Adds a button that allows you to join a server from a certain region (if one exists, else it will look for the closest one)",
            Type: "SelectionList",
            GetList: async function(){
                const [Success, Result] = await RequestFunc("https://qol.haydz6.com/api/servers/regions", "GET")
                if (!Success) return ["None"]
                const RegionList = []
                for (let i = 0; i < Result.length; i++){
                    RegionList.push(Result[i].Region)
                }
                RegionList.push("None")
                return RegionList
            }
        },
        ServerFilters: {
            Title: "Server Filters",
            Description: "Allows you to filter servers by region, size and age."
        },
        Playtime: {
            Title: "Playtime",
            Description: "Tracks and shows how long you have played a game."
        },
        PinnedGames: {
            Title: "Pinned Games",
            Description: "Allows you to pin games to your home page."
        },
        PinnedGroups: {
            Title: "Pinned Groups",
            Description: "Allows you to pin groups you are in to the top of your groups list."
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
        },
        MinimizePrivateServers: {
            Title: "Minimizable Private Servers",
            Description: "Allows you to minimize private servers tab.Minimizable"
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
        FriendRequestNotifications: {
            Title: "Friend Request Notifications",
            Description: "Notifies you when someone sends you a friend request."
        },
        CancelFriendRequest: {
            Title: "Cancel Friend Request",
            Description: "Allows you to cancel an outgoing friend request on a users profile."
        }
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
        NewLoginNotifier3: {
            Title: "Notification on new login",
            Description: "Sends notification to browser when a new login is detected. It includes the location, os, browser and IP of the login."
        },
        NewLoginNotifierTTS4: {
            Title: "TTS Notification on new login",
            Description: "Uses text to speech to say location, os and browser.",
            Supported: async function(){
                return await chrome.runtime.sendMessage({type: "FeatureSupported", name: "tts"})
            }
        },
        NewLoginNotifierTTSVolume: {
            Title: "TTS Notification on new login volume",
            Description: "Volume can be between 0 - 1",
            Type: "InputBox",
            Placeholder: "",
            Middleman: function(Feature, PreviousValue, Value){
                const Numbers = Value.replace(/^\D+/g, "")
                if (Numbers === ""){
                    return PreviousValue
                }
                if (Value.charAt(0) === ".") Value = "0"+Value
                const NewNumber = clamp(parseFloat(Value), 0, 1)
                SetFeatureEnabled(Feature, NewNumber)
                return NewNumber
            }
        },
        OnlyReadNewLoginNotifierTitle: {
            Title: "Read title for TTS notifications",
            Description: "Only speaks the title (and location if new login) instead of the entire notifiction."
        },
        ShowStateAndCountryOnNewSessionOnly: {
            Title: "Only show country and state on new session login",
            Description: "Only shows country and state on new session notification (Disables city).",
        },
        ShowIPOnNewSession: {
            Title: "Display IP on new session login",
            Description: "Shows IP on new session notification.",
        },
        IgnoreSessionsFromSameIP2: {
            Title: "Ignore new sessions from same IP",
            Description: "Ignores session if it has the same IP as current browser. (Recommended off for VPN or NAT users)"
        },
        DisallowOtherIPs2: {
            Title: "Disallow other IPs on login",
            Description: "If a session is first logged in from another/unknown IP, it will automatically log it out (Does not affect existing sessions)\nIf you become locked out while away from your device from this setting, use forget your password to regain access."
        },
        StrictlyDisallowOtherIPs2: {
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
            const FeaturePaid = await PaidForFeature(feature)

            if (info.Type === "InputBox") Section = CreateSectionSettingsInputBox(feature, info.Title, info.Description, info.Placeholder, FeatureEnabled, FeatureKilled, FeaturePaid, IsSupported, info.Middleman)
            else if (info.Type == "SelectionList") Section = CreateSectionSettingsDropdown(feature, info.Title, info.Description, await info.GetList(), FeatureEnabled, FeatureKilled, FeaturePaid, IsSupported, function(NewValue){
                SetFeatureEnabled(feature, NewValue)
            })
            else Section = CreateSectionSettingsToggable(feature, info.Title, info.Description, FeatureEnabled, FeatureKilled, FeaturePaid, IsSupported)

            if (info.Run) info.Run(Section.getElementsByTagName("label")[0], Section.getElementsByClassName("text-description")[0])

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
    if (new URLSearchParams(window.location.search).get("roseal")) return

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