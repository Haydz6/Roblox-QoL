IsFeatureEnabled("ViewBannedUser").then(async function(Enabled){
    if (!Enabled) return

    const Title = await WaitForClass("error-title")

    function Error(Text){
        Title.innerText = "Failed: "+Text
    }

    Title.innerText = "Fetching user info"

    const UserId = parseInt(window.location.href.split("banned-user/")[1])
    const [Success, Account] = await RequestFunc("https://users.roblox.com/v1/users/"+UserId, "GET")
    if (!Success){
        if (Account?.errors?.[0]?.code === 3){
            Error("User does not exist")
            return
        }

        Error("Failed to fetch user info")
        return
    }
    if (!Account.isBanned){
        window.location.href = `https://roblox.com/users/${UserId}/profile`
        return
    }

    let [FriendCountSuccess, FriendsCount] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/friends/count`)
    if (!FriendCountSuccess){
        FriendsCount = {count: "???"}
    }

    let [FollowersCountSuccess, FollowersCount] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/followers/count`)
    if (!FollowersCountSuccess){
        FollowersCount = {count: "???"}
    }

    let [FollowingCountSuccess, FollowingCount] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/followings/count`)
    if (!FollowingCountSuccess){
        FollowingCount = {count: "???"}
    }
    
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = async function(){
        if (xmlhttp.status == 200 && xmlhttp.readyState == 4){
            const today = new Date(Account.created)
            const yyyy = today.getFullYear()
            let mm = today.getMonth() + 1
            let dd = today.getDate()

            if (dd < 10) dd = '0' + dd
            if (mm < 10) mm = '0' + mm

            const formattedToday = dd + '/' + mm + '/' + yyyy

            const html = xmlhttp.responseText.replaceAll("%USERID%", UserId)
            .replaceAll("%USERNAME%", SanitizeString(Account.name))
            .replaceAll("%DISPLAYNAME%", SanitizeString(Account.displayName))
            .replaceAll("%JOINDATE%", formattedToday)
            .replaceAll("%DESCRIPTION%", SanitizeString(Account.description))
            .replaceAll("%FRIENDSCOUNT%", FriendsCount.count >= 10000 && AbbreviateNumber(FriendsCount.count) || numberWithCommas(FriendsCount.count))
            .replaceAll("%FOLLOWERSCOUNTABBREV%", FollowersCount.count >= 10000 && AbbreviateNumber(FollowersCount.count) || numberWithCommas(FollowersCount.count))
            .replaceAll("%FOLLOWINGSCOUNTABBREV%", FollowingCount.count >= 10000 && AbbreviateNumber(FollowingCount.count) || numberWithCommas(FollowingCount.count))

            const Content = await WaitForClass("content")
            Content.innerHTML = html

            RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${UserId}&size=420x420&format=Png&isCircular=false`, "GET").then(function([Success, Body]){
                Content.getElementsByClassName("main-body-thumbnail-image")[0].src = Body?.data?.[0]?.imageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
            })
            RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserId}&size=420x420&format=Png&isCircular=false`, "GET").then(function([Success, Body]){
                Content.getElementsByClassName("headshot-thumbnail-image")[0].src = Body?.data?.[0]?.imageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
            })

            const RobloxBadgeList = document.getElementById("roblox-badges-container").getElementsByClassName("badge-list")[0]
            const RobloxBadgeClone = RobloxBadgeList.getElementsByClassName("list-item")[0].cloneNode(true)
            RobloxBadgeList.replaceChildren()

            RequestFunc(`https://accountinformation.roblox.com/v1/users/${UserId}/roblox-badges`, "GET").then(function([Success, Body]){
                if (!Success){
                    document.getElementById("roblox-badges-container").remove()
                    return
                }
                if (Body.length === 0){
                    document.getElementById("roblox-badges-container").remove()
                    return
                }

                for (let i = 0; i < Body.length; i++){
                    const Badge = Body[i]
                    const BadgeElement = RobloxBadgeClone.cloneNode(true)
                    
                    BadgeElement.children[0].href = `https://roblox.com/info/roblox-badges#Badge${Badge.id}`
                    BadgeElement.children[0].title = Badge.description
                    BadgeElement.getElementsByClassName("asset-thumb-container")[0].className = "border asset-thumb-container icon-badge-"+Badge.name.toLowerCase().replaceAll(" ", "-")
                    BadgeElement.getElementsByClassName("asset-thumb-container")[0].title = Badge.name
                    BadgeElement.getElementsByClassName("item-name")[0].innerText = Badge.name

                    RobloxBadgeList.appendChild(BadgeElement)
                }
            })

            const BadgeList = document.getElementById("player-badges-container").getElementsByClassName("badge-list")[0]
            const BadgeClone = BadgeList.getElementsByClassName("list-item")[0].cloneNode(true)
            BadgeList.replaceChildren()

            RequestFunc(`https://badges.roblox.com/v1/users/${UserId}/badges?limit=10&sortOrder=Asc`, "GET").then(async function([Success, Body]){
                if (!Success){
                    document.getElementById("player-badges-container").remove()
                    return
                }

                const BadgeIcons = {}
                const BadgeIds = []

                const Badges = Body.data
                if (Badges.length === 0){
                    document.getElementById("player-badges-container").remove()
                    return
                }

                Badges.length = Math.min(Badges.length, 6)

                for (let i = 0; i < Badges.length; i++){
                    BadgeIds.push(Badges[i].id)
                }

                const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${BadgeIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
                if (ThumbSuccess){
                    const Data = Thumbnails.data
                    for (let i = 0; i < Data.length; i++){
                        BadgeIcons[Data[i].targetId] = Data[i].imageUrl
                    }
                }

                for (let i = 0; i < Badges.length; i++){
                    const Badge = Badges[i]
                    const BadgeElement = BadgeClone.cloneNode(true)
                    
                    BadgeElement.children[0].href = `https://roblox.com/badges/${Badge.id}/You-Played-Admin-Roulette`
                    BadgeElement.children[0].title = Badge.description
                    BadgeElement.getElementsByClassName("asset-thumb-container")[0].src = BadgeIcons[Badge.id] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                    BadgeElement.getElementsByClassName("asset-thumb-container")[0].title = Badge.description
                    BadgeElement.getElementsByClassName("item-name")[0].innerText = Badge.name

                    BadgeList.appendChild(BadgeElement)
                }
            })

            const FavouritesList = document.getElementsByClassName("favorite-games-container")[0].getElementsByClassName("game-cards")[0]
            const GameCardClone = FavouritesList.getElementsByClassName("list-item")[0].cloneNode(true)
            FavouritesList.replaceChildren()

            RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=6&pageNumber=1&userId=${UserId}`, "GET").then(async function([Success, Body]){
                if (!Success){
                    document.getElementsByClassName("favorite-games-container")[0].remove()
                    return
                }

                const BadgeIds = []

                const Badges = Body.Data.Items
                if (Badges.length === 0){
                    document.getElementsByClassName("favorite-games-container")[0].remove()
                    return
                }

                Badges.length = Math.min(Badges.length, 6)

                for (let i = 0; i < Badges.length; i++){
                    BadgeIds.push(Badges[i].Item.UniverseId)
                }

                const UniverseLookup = {}
                const [UniverseSuccess, Universes] = await RequestFunc("https://games.roblox.com/v1/games?universeIds="+BadgeIds.join(","))
                if (UniverseSuccess){
                    const Data = Universes.data
                    for (let i = 0; i < Data.length; i++){
                        const Universe = Data[i]
                        UniverseLookup[Universe.id] = Universe
                    }
                }

                const VotesLookup = {}
                const [VotesSuccess, Votes] = await RequestFunc("https://games.roblox.com/v1/games/votes?universeIds="+BadgeIds.join(","))
                if (VotesSuccess){
                    const Data = Votes.data
                    for (let i = 0; i < Data.length; i++){
                        const Universe = Data[i]
                        VotesLookup[Universe.id] = Universe
                    }
                }

                for (let i = 0; i < Badges.length; i++){
                    const Badge = Badges[i]
                    const BadgeElement = GameCardClone.cloneNode(true)
                    
                    let Playing = UniverseLookup[Badge.Item.UniverseId]?.playing
                    if (Playing === undefined) Playing = "???"

                    BadgeElement.getElementsByClassName("game-card-link")[0].href = `https://roblox.com/games/${Badge.Item.UniverseId}`
                    BadgeElement.getElementsByClassName("game-card-thumb")[0].src = Badge.Thumbnail.Url
                    BadgeElement.getElementsByClassName("game-card-name")[0].innerText = UniverseLookup[Badge.Item.UniverseId]?.name || "???"
                    BadgeElement.getElementsByClassName("game-card-name")[0].title = UniverseLookup[Badge.Item.UniverseId]?.name || "???"
                    BadgeElement.getElementsByClassName("playing-counts-label")[0].innerText = typeof(Playing) === "number" ? AbbreviateNumber(Playing) : Playing
                    BadgeElement.getElementsByClassName("playing-counts-label")[0].title = Playing

                    let LikeRatio
                    const Vote = VotesLookup[Badge.Item.UniverseId]

                    if (Vote){
                        LikeRatio = 0
                        if (Vote.downVotes == 0){
                            if (Vote.upVotes == 0) {
                                LikeRatio = null
                            } else {
                                LikeRatio = 100
                            }
                        } else {
                            LikeRatio = Math.floor((Vote.upVotes / (Vote.upVotes+Vote.downVotes))*100)
                        }
                    }
                    BadgeElement.getElementsByClassName("vote-percentage-label")[0].className = "info-label vote-percentage-label"
                    BadgeElement.getElementsByClassName("vote-percentage-label")[0].innerText = LikeRatio ? LikeRatio+"%" : "--"
                    BadgeElement.getElementsByClassName("info-label no-vote")[0].remove()

                    FavouritesList.appendChild(BadgeElement)
                }
            })

            const CollectiblesList = document.getElementsByClassName("collections-list")[0]
            const CollectibleClone = CollectiblesList.getElementsByClassName("list-item")[0].cloneNode(true)
            CollectiblesList.replaceChildren()

            RequestFunc(`https://inventory.roblox.com/v1/users/${UserId}/assets/collectibles?limit=10&sortOrder=Asc`, "GET").then(async function([Success, Body]){
                if (!Success) return

                const BadgeIcons = {}
                const BadgeIds = []

                const Badges = Body.data
                if (Badges.length === 0){
                    document.getElementsByClassName("profile-collections")[0].remove()
                    return
                }

                Badges.length = Math.min(Badges.length, 6)

                for (let i = 0; i < Badges.length; i++){
                    BadgeIds.push(Badges[i].assetId)
                }

                const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/assets?assetIds=${BadgeIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
                if (ThumbSuccess){
                    const Data = Thumbnails.data
                    for (let i = 0; i < Data.length; i++){
                        BadgeIcons[Data[i].targetId] = Data[i].imageUrl
                    }
                }

                for (let i = 0; i < Badges.length; i++){
                    const Badge = Badges[i]
                    const BadgeElement = CollectibleClone.cloneNode(true)
                    
                    BadgeElement.children[0].href = `https://roblox.com/catalog/${Badge.assetId}`
                    BadgeElement.children[0].title = Badge.name
                    BadgeElement.getElementsByClassName("asset-thumb-container")[0].src = BadgeIcons[Badge.assetId] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                    BadgeElement.getElementsByClassName("item-name")[0].innerText = Badge.name

                    CollectiblesList.appendChild(BadgeElement)
                }
            })

            const WearingList = document.getElementsByClassName("accoutrement-items-container")[0]
            const WearingClone = WearingList.getElementsByClassName("accoutrement-item")[0].cloneNode(true)
            WearingList.replaceChildren()

            RequestFunc(`https://avatar.roblox.com/v1/users/${UserId}/currently-wearing`, "GET").then(async function([Success, Body]){
                if (!Success) return

                const BadgeIcons = {}
                const AssetInfoLookup = {}

                const Assets = Body.assetIds
                if (Assets.length === 0){
                    return
                }

                const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/assets?assetIds=${Assets.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
                if (ThumbSuccess){
                    const Data = Thumbnails.data
                    for (let i = 0; i < Data.length; i++){
                        BadgeIcons[Data[i].targetId] = Data[i].imageUrl
                    }
                }

                const Items = []
                for (let i = 0; i < Assets.length; i++){
                    Items.push({itemType: "Asset", id: Assets[i]})
                }

                const [AssetSuccess, AssetInfo] = await RequestFunc("https://catalog.roblox.com/v1/catalog/items/details", "POST", {"Content-Type": "application/json"}, JSON.stringify({items: Items}))
                if (AssetSuccess){
                    const Data = AssetInfo.data
                    for (let i = 0; i < Data.length; i++){
                        AssetInfoLookup[Data[i].id] = Data[i]
                    }
                }

                for (let i = 0; i < Assets.length; i++){
                    const AssetId = Assets[i]
                    const BadgeElement = WearingClone.cloneNode(true)
                    
                    BadgeElement.children[0].href = `https://roblox.com/catalog/${AssetId}`
                    BadgeElement.getElementsByClassName("accoutrment-image")[0].src = BadgeIcons[AssetId] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                    BadgeElement.getElementsByClassName("accoutrment-image")[0].title = AssetInfoLookup[AssetId]?.name || ""

                    WearingList.appendChild(BadgeElement)
                }
            })

            async function CalcuatePlaceVisits(PlaceVisits = 0, Cursor = ""){
                const [Success, Result] = await RequestFunc(`https://games.roblox.com/v2/users/${UserId}/games?accessFilter=Public&cursor=${Cursor}&limit=50`, "GET")
                if (!Success) return

                Cursor = Result.nextPageCursor
                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    PlaceVisits += Data[i].placeVisits
                }

                if (!Cursor){
                    document.getElementById("place-visits-label").innerText = numberWithCommas(PlaceVisits)
                    return
                }
                CalcuatePlaceVisits(PlaceVisits, Cursor)
            }
            CalcuatePlaceVisits()

            document.getElementsByClassName("abuse-report-link")[0].remove()
            Content.getElementsByClassName("enable-three-dee")[0].remove()

            let PreviousPanel = document.getElementById("about")
            let PreviousTab = document.getElementById("tab-about")

            function HashChange(){
                const Hash = window.location.hash.substring(1)
                const NewPanel = document.getElementById(Hash)
                const NewTab = this.document.getElementById("tab-"+Hash)

                if (NewPanel){
                    PreviousPanel.className = "tab-pane"
                    NewPanel.className = "tab-pane active"
                    PreviousPanel = NewPanel
                }

                if (NewTab){
                    PreviousTab.parentElement.className = "rbx-tab"
                    NewTab.parentElement.className = "rbx-tab active"
                    PreviousTab = NewTab
                }
            }

            window.addEventListener("hashchange", HashChange)
            HashChange()

            InjectScript("TooltipBannedUserIcon")
        }
    };
    xmlhttp.open("GET", chrome.runtime.getURL("html/profile.html"), true)
    xmlhttp.send()
})