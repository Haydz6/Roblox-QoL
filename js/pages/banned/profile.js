IsFeatureEnabled("ViewBannedUser").then(async function(Enabled){
    if (!Enabled) return

    function Error(Text){

    }

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
            .replaceAll("%USERNAME%", Account.name)
            .replaceAll("%DISPLAYNAME%", Account.displayName)
            .replaceAll("%JOINDATE%", formattedToday)
            .replaceAll("%DESCRIPTION%", Account.description)
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
                if (!Success) return
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
                if (!Success) return

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

            RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=6&pageNumber=1&userId=${UserId}`, "GET").then(async function([Success, Body]){
                if (!Success) return

                const BadgeIcons = {}
                const BadgeIds = []

                const Badges = Body.Data
                if (Badges.length === 0){
                    document.getElementsByClassName("favorite-games-container")[0].remove()
                    return
                }

                Badges.length = Math.min(Badges.length, 6)

                for (let i = 0; i < Badges.length; i++){
                    const Badge = Badges[i]
                    const BadgeElement = GameCardClone.cloneNode(true)
                    
                    Badge.getElementsByClassName("game-card-link")[0].href = `https://roblox.com/games/${Badge.Item.UniverseId}`
                    Badge.getElementsByClassName("game-card-thumb")[0].src = Badge.Thumbnail.Url
                    Badge.getElementsByClassName("game-card-name")[0].innerText = ""
                    Badge.getElementsByClassName("game-card-name")[0].title = ""

                    FavouritesList.appendChild(BadgeElement)
                }
            })

            document.getElementsByClassName("abuse-report-link")[0].remove()
            Content.getElementsByClassName("enable-three-dee")[0].remove()

            InjectScript("TooltipBannedUserIcon")
        }
    };
    xmlhttp.open("GET", chrome.runtime.getURL("html/profile.html"), true)
    xmlhttp.send()
})