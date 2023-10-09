IsFeatureEnabled("ViewBannedUser").then(async function(Enabled){
    if (!Enabled) return

    const Title = await WaitForClass("error-title")

    function Error(Text){
        Title.innerText = "Failed: "+Text
    }

    Title.innerText = "Fetching user info"

    const UserId = parseInt(window.location.href.split("banned-user/")[1])
    if (!UserId || isNaN(UserId)) return Error("UserId is not valid")

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
            .replaceAll("%FRIENDSCOUNT%", FriendsCount.count >= 10000 && AbbreviateNumber(FriendsCount.count) || numberWithCommas(FriendsCount.count))
            .replaceAll("%FOLLOWERSCOUNTABBREV%", FollowersCount.count >= 10000 && AbbreviateNumber(FollowersCount.count) || numberWithCommas(FollowersCount.count))
            .replaceAll("%FOLLOWINGSCOUNTABBREV%", FollowingCount.count >= 10000 && AbbreviateNumber(FollowingCount.count) || numberWithCommas(FollowingCount.count))

            const Content = await WaitForClass("content")
            Content.innerHTML = html

            Content.getElementsByClassName("profile-display-name")[0].innerText = Account.name
            const DisplayNames = Content.getElementsByClassName("profile-name")
            for (let i = 0; i < DisplayNames.length; i++){
                DisplayNames[i].innerText = Account.displayName
            }

            Content.getElementsByClassName("join-date-profile-stat")[0].innerText = formattedToday
            Content.getElementsByClassName("profile-description")[0].innerText = Account.description

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
            document.getElementById("player-badges-container").getElementsByClassName("btn-more")[0].remove()
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
            document.getElementsByClassName("favorite-games-container")[0].getElementsByClassName("btn-more")[0].remove()
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

                    BadgeElement.getElementsByClassName("game-card-link")[0].href = `https://roblox.com/games/${Badge.Item.AssetId}`
                    BadgeElement.getElementsByClassName("game-card-thumb")[0].src = Badge.Thumbnail.Url
                    BadgeElement.getElementsByClassName("game-card-name")[0].innerText = UniverseLookup[Badge.Item.UniverseId]?.name || "???"
                    BadgeElement.getElementsByClassName("game-card-name")[0].title = UniverseLookup[Badge.Item.UniverseId]?.name || "???"
                    BadgeElement.getElementsByClassName("playing-counts-label")[0].innerText = typeof(Playing) === "number" ? AbbreviateNumber(Playing, 0, true) : Playing
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

            //const CollectiblesList = document.getElementsByClassName("collections-list")[0]
            document.getElementsByClassName("profile-collections")[0].remove() //Roblox blocks requests to see collectibles
            // const CollectibleClone = CollectiblesList.getElementsByClassName("list-item")[0].cloneNode(true)
            // CollectiblesList.replaceChildren()

            // RequestFunc(`https://inventory.roblox.com/v1/users/${UserId}/assets/collectibles?limit=10&sortOrder=Asc`, "GET").then(async function([Success, Body]){
            //     if (!Success) return

            //     const BadgeIcons = {}
            //     const BadgeIds = []

            //     const Badges = Body.data
            //     if (Badges.length === 0){
            //         document.getElementsByClassName("profile-collections")[0].remove()
            //         return
            //     }

            //     Badges.length = Math.min(Badges.length, 6)

            //     for (let i = 0; i < Badges.length; i++){
            //         BadgeIds.push(Badges[i].assetId)
            //     }

            //     const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/assets?assetIds=${BadgeIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
            //     if (ThumbSuccess){
            //         const Data = Thumbnails.data
            //         for (let i = 0; i < Data.length; i++){
            //             BadgeIcons[Data[i].targetId] = Data[i].imageUrl
            //         }
            //     }

            //     for (let i = 0; i < Badges.length; i++){
            //         const Badge = Badges[i]
            //         const BadgeElement = CollectibleClone.cloneNode(true)
                    
            //         BadgeElement.children[0].href = `https://roblox.com/catalog/${Badge.assetId}`
            //         BadgeElement.children[0].title = Badge.name
            //         BadgeElement.getElementsByClassName("asset-thumb-container")[0].src = BadgeIcons[Badge.assetId] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
            //         BadgeElement.getElementsByClassName("item-name")[0].innerText = Badge.name

            //         CollectiblesList.appendChild(BadgeElement)
            //     }
            // })

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

            const FriendsList = document.getElementById("friends-list")
            document.getElementsByClassName("people-list-container")[0].getElementsByClassName("btn-more")[0].href = `https://roblox.com/users/${UserId}/friends`

            const FriendClone = FriendsList.getElementsByClassName("list-item")[0].cloneNode(true)
            FriendsList.replaceChildren()

            RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/friends`, "GET").then(async function([Success, Body]){
                const CountLabel = document.getElementById("friends-count")

                if (!Success) return CountLabel.innerText = "(ERR)"

                const FriendIcons = {}

                const Friends = Body.data
                CountLabel.innerText = `(${Friends.length})`
                if (Friends.length === 0){
                    return
                }

                Friends.length = Math.min(Friends.length, 9)
                const FriendIds = []
                for (let i = 0; i < Friends.length; i++){
                    FriendIds.push(Friends[i].id)
                }

                const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${FriendIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
                if (ThumbSuccess){
                    const Data = Thumbnails.data
                    for (let i = 0; i < Data.length; i++){
                        FriendIcons[Data[i].targetId] = Data[i].imageUrl
                    }
                }

                for (let i = 0; i < Friends.length; i++){
                    const Friend = Friends[i]
                    const FriendElement = FriendClone.cloneNode(true)

                    FriendElement.id = "people-"+Friend.id
                    FriendElement.setAttribute("rbx-user-id", Friend.id)
                    
                    FriendElement.getElementsByClassName("friend-link")[0].href = `https://roblox.com/users/${Friend.id}/profile`
                    FriendElement.getElementsByClassName("friend-thumbnail-image")[0].src = FriendIcons[Friend.id] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                    FriendElement.getElementsByClassName("friend-name")[0].innerText = Friend.displayName
                    FriendElement.getElementsByClassName("friend-name")[0].title = Friend.displayName

                    if (!Friend.hasVerifiedBadge) FriendElement.getElementsByClassName("verification-badge")[0].remove()

                    FriendsList.appendChild(FriendElement)
                }
            })

            const Packages = document.getElementById("ModelsAndPackagesList")
            Packages.getElementsByClassName("btn-more")[0].remove()

            const PackagesList = Packages.getElementsByClassName("hlist")[0]
            const PackageClone = PackagesList.getElementsByClassName("list-item")[0].cloneNode(true)
            PackagesList.replaceChildren()

            RequestFunc(`https://www.roblox.com/users/profile/playerassets-json?assetTypeId=10&userId=${UserId}`, "GET").then(function([Success, Body]){
                if (!Success || Body.Assets.length === 0) return Packages.remove()

                const Assets = Body.Assets
                for (let i = 0; i < Assets.length; i++){
                    const Asset = Assets[i]
                    const AssetElement = PackageClone.cloneNode(true)

                    AssetElement.children[0].href = `https://roblox.com/library/${Asset.Id}/`
                    AssetElement.children[0].title = Asset.Name
                    AssetElement.getElementsByClassName("asset-thumb-container")[0].src = Asset.Thumbnail.Url
                    AssetElement.getElementsByClassName("item-name")[0].innerText = Asset.Name

                    PackagesList.appendChild(AssetElement)
                }
            })

            const Clothes = document.getElementById("ClothingList")
            Clothes.getElementsByClassName("btn-more")[0].href = `https://www.roblox.com/catalog?Category=1&CreatorName=${Account.name}&salesTypeFilter=1&IncludeNotForSale`
            //Clothes.getElementsByClassName("btn-more")[0].remove()

            const ClothesList = Clothes.getElementsByClassName("hlist")[0]
            const ClothesClone = ClothesList.getElementsByClassName("list-item")[0].cloneNode(true)
            ClothesList.replaceChildren()

            RequestFunc(`https://www.roblox.com/users/profile/playerassets-json?assetTypeId=11&userId=${UserId}`, "GET").then(function([Success, Body]){
                if (!Success || Body.Assets.length === 0) return Packages.remove()

                const Assets = Body.Assets
                for (let i = 0; i < Assets.length; i++){
                    const Asset = Assets[i]
                    const AssetElement = ClothesClone.cloneNode(true)

                    AssetElement.children[0].href = `https://roblox.com/library/${Asset.Id}/`
                    AssetElement.children[0].title = Asset.Name
                    AssetElement.getElementsByClassName("asset-thumb-container")[0].src = Asset.Thumbnail.Url
                    AssetElement.getElementsByClassName("item-name")[0].innerText = Asset.Name

                    ClothesList.appendChild(AssetElement)
                }
            })

            RequestFunc("https://presence.roblox.com/v1/presence/last-online", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: [UserId]}), true).then(function([Success, Body]){
                const Label = document.getElementById("last-online")
                if (!Success) return Label.innerText = "Failed"
                const LastOnline = new Date(Body.lastOnlineTimestamps[0].lastOnline)

                Label.title = LastOnline.toLocaleDateString(undefined, {hour: "numeric", minute: "numeric", second: "numeric", hour12: true})
                Label.innerText = SecondsToLengthSingle(Date.now()/1000 - LastOnline.getTime()/1000, true) + " ago"
            })

            const Games = []
            const GameSlideElements = []
            let PriorSelectedSlideElement
            let CurrentGameSelected = 1
            let LoadingNextGames = false

            const GameSwitcher = document.getElementById("games-switcher")
            const Slide = GameSwitcher.getElementsByClassName("slide-items-container")[0]

            const GameGrid = document.getElementsByClassName("game-grid")[0]
            GameGrid.className = GameGrid.className.replace("ng-hide", "")
            GameGrid.style.display = "none"
            const GamesList = GameGrid.getElementsByClassName("hlist")[0]

            const SlideTemplate = Slide.children[0].cloneNode(true)
            SlideTemplate.className = SlideTemplate.className.replace(" active", "")
            Slide.replaceChildren()

            const GameCardTemplate = GamesList.children[0].cloneNode(true)
            GamesList.replaceChildren()

            const GameGridLoadMore = GameGrid.getElementsByClassName("load-more-button")[0]

            function ReachedEndOfGamesList(){
                GameGridLoadMore.style.display = "none"
            }

            async function GetNextGames(Total = 10, FromCurrent = true, Reverse = false){
                if (LoadingNextGames) return
                LoadingNextGames = true

                const Start = FromCurrent ? CurrentGameSelected-1 : GameSlideElements.length
                const End = Reverse ? Math.min(Start - Total, 0) : Math.min(Start + Total, Games.length-1)

                if (Start >= Games.length){
                    LoadingNextGames = false
                    return ReachedEndOfGamesList()
                }

                const SelectedGames = []
                const UniverseIdToGame = {}
                const UniverseIdToThumbnail = {}
                const UniverseIdToVotes = {}

                if (Reverse){
                    for (let i = Start; i > End; i--){
                        SelectedGames.push(Games[i].id)
                    }
                } else {
                    for (let i = Start; i <= End; i ++){
                        SelectedGames.push(Games[i].id)
                    }
                }

                const Promises = [
                    RequestFunc("https://games.roblox.com/v1/games?universeIds="+SelectedGames.join(","), "GET", undefined, undefined, true).then(function([Success, Body]){
                        if (!Success){
                            for (let i = 0; i < SelectedGames.length; i++){
                                const Game = SelectedGames[i]
                                UniverseIdToGame[Game] = {}
                            }
                            return
                        }

                        const Data = Body.data
                        for (let i = 0; i < Data.length; i++){
                            const Game = Data[i]
                            UniverseIdToGame[Game.id] = Game
                        }
                    }),
                    RequestFunc("https://games.roblox.com/v1/games/votes?universeIds="+SelectedGames.join(","), "GET", undefined, undefined, true).then(function([Success, Body]){
                        if (!Success){
                            for (let i = 0; i < SelectedGames.length; i++){
                                const Game = SelectedGames[i]
                                UniverseIdToVotes[Game] = "--"
                            }
                            return
                        }

                        const Data = Body.data
                        for (let i = 0; i < Data.length; i++){
                            const Vote = Data[i]

                            let LikeRatio
                            if (Vote.downVotes == 0){
                                if (Vote.upVotes == 0) {
                                    LikeRatio = null
                                } else {
                                    LikeRatio = 100
                                }
                            } else {
                                LikeRatio = Math.floor((Vote.upVotes / (Vote.upVotes+Vote.downVotes))*100)
                            }

                            UniverseIdToVotes[Vote.id] = LikeRatio ? LikeRatio+"%" : "--"
                        }
                    }),
                    RequestFunc("https://thumbnails.roblox.com/v1/games/icons?size=256x256&format=Png&isCircular=false&returnPolicy=PlaceHolder&universeIds="+SelectedGames.join(","), "GET", undefined, undefined, true).then(function([Success, Body]){
                        if (!Success){
                            for (let i = 0; i < SelectedGames.length; i++){
                                const Game = SelectedGames[i]
                                UniverseIdToThumbnail[Game] = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                            }
                            return
                        }

                        const Data = Body.data
                        for (let i = 0; i < Data.length; i++){
                            const Result = Data[i]
                            UniverseIdToThumbnail[Result.targetId] = Result.imageUrl
                        }
                    })
                ]
                await Promise.all(Promises)

                for (let i = 0; i < SelectedGames.length; i++){
                    const Game = SelectedGames[i]
                    const GameInfo = UniverseIdToGame[Game]
                    const SlideElement = SlideTemplate.cloneNode(true)

                    if (CurrentGameSelected === 1 && i === 0){
                        PriorSelectedSlideElement = SlideElement
                        SlideElement.className += " active"
                    }

                    SlideElement.getElementsByClassName("slide-item-emblem-container")[0].children[0].href = `https://roblox.com/games/${GameInfo.rootPlaceId}/`
                    SlideElement.getElementsByClassName("slide-item-image")[0].src = UniverseIdToThumbnail[Game]

                    SlideElement.getElementsByClassName("slide-item-name")[0].innerText = GameInfo?.name !== undefined ? GameInfo.name : "???"
                    SlideElement.getElementsByClassName("text-description")[0].innerText = GameInfo?.description !== undefined ? GameInfo.description : "???"

                    SlideElement.getElementsByClassName("slide-item-members-count")[0].innerText = GameInfo?.playing !== undefined ? AbbreviateNumber(GameInfo.playing, 1, true) : "--"
                    SlideElement.getElementsByClassName("slide-item-my-rank")[0].innerText = GameInfo?.visits !== undefined ? (GameInfo.visits >= 10000 ? AbbreviateNumber(GameInfo.visits, 0, false) : numberWithCommas(GameInfo.visits)) : "--"
                
                    GameSlideElements.push(SlideElement)
                    Slide.appendChild(SlideElement)

                    const CardElement = GameCardTemplate.cloneNode(true)

                    CardElement.getElementsByClassName("game-card-link")[0].href = `https://roblox.com/games/${GameInfo.rootPlaceId}/`
                    CardElement.getElementsByClassName("game-card-thumb")[0].src = UniverseIdToThumbnail[Game]

                    CardElement.getElementsByClassName("game-card-name")[0].innerText = GameInfo?.name !== undefined ? GameInfo.name : "???"
                    CardElement.getElementsByClassName("game-card-name")[0].title = GameInfo?.name !== undefined ? GameInfo.name : "???"

                    CardElement.getElementsByClassName("vote-percentage-label")[0].innerText = UniverseIdToVotes[Game] !== undefined ? UniverseIdToVotes[Game] : "--"
                    CardElement.getElementsByClassName("playing-counts-label")[0].innerText = GameInfo?.playing !== undefined ? AbbreviateNumber(GameInfo.playing, 1, true) : "--"

                    GamesList.appendChild(CardElement)
                }

                if (End+1 >= Games.length) ReachedEndOfGamesList()
                LoadingNextGames = false
            }

            async function LoadGameSlideElement(Reverse = false){
                if (!GameSlideElements[CurrentGameSelected-1]) await GetNextGames(undefined, undefined, Reverse)
                if (PriorSelectedSlideElement) PriorSelectedSlideElement.className = PriorSelectedSlideElement.className.replace(" active", "")
                const Element = GameSlideElements[CurrentGameSelected-1]
                PriorSelectedSlideElement = Element
                Element.className += " active"
            }

            GameSwitcher.getElementsByClassName("carousel-control left")[0].addEventListener("click", function(){
                if (LoadingNextGames) return

                CurrentGameSelected--
                if (CurrentGameSelected <= 0) CurrentGameSelected = Games.length
                LoadGameSlideElement(true)
            })

            GameSwitcher.getElementsByClassName("carousel-control right")[0].addEventListener("click", function(){
                if (LoadingNextGames) return

                CurrentGameSelected++
                if (CurrentGameSelected > Games.length) CurrentGameSelected = 1
                LoadGameSlideElement()
            })

            const ProfileGame = document.getElementsByClassName("profile-game")[0]
            const GameSlideButton = ProfileGame.getElementsByClassName("btn-generic-slideshow-xs")[0]
            const GameGridButton = ProfileGame.getElementsByClassName("btn-generic-grid-xs")[0]

            GameSlideButton.addEventListener("click", function(){
                GameSlideButton.className = GameSlideButton.className.replace("btn-secondary-xs", "btn-control-xs")
                GameGridButton.className = GameSlideButton.className.replace("btn-control-xs", "btn-secondary-xs")
                GameSlideButton.getElementsByClassName("icon-slideshow")[0].className += " selected"
                GameGridButton.getElementsByClassName("icon-grid")[0].className = GameGridButton.getElementsByClassName("icon-grid")[0].className.replace(" selected", "")

                GameSwitcher.style.display = ""
                GameGrid.style.display = "none"
            })

            GameGridButton.addEventListener("click", function(){
                GameGridButton.className = GameGridButton.className.replace("btn-secondary-xs", "btn-control-xs")
                GameSlideButton.className = GameSlideButton.className.replace("btn-control-xs", "btn-secondary-xs")
                GameGridButton.getElementsByClassName("icon-grid")[0].className += " selected"
                GameSlideButton.getElementsByClassName("icon-slideshow")[0].className = GameSlideButton.getElementsByClassName("icon-slideshow")[0].className.replace(" selected", "")

                GameGrid.style.display = ""
                GameSwitcher.style.display = "none"
            })

            GameGridLoadMore.addEventListener("click", async function(){
                GameGridLoadMore.setAttribute("disabled", "disabled")
                await GetNextGames(10, false)
                GameGridLoadMore.removeAttribute("disabled")
            })

            async function CalcuatePlaceVisits(PlaceVisits = 0, Cursor = ""){
                const [Success, Result] = await RequestFunc(`https://games.roblox.com/v2/users/${UserId}/games?accessFilter=Public&cursor=${Cursor}&limit=50`, "GET")
                if (!Success) return

                if (Cursor === "") setTimeout(GetNextGames, 0) //Defer

                Cursor = Result.nextPageCursor
                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    PlaceVisits += Data[i].placeVisits
                    Games.push(Data[i])
                }

                if (!Cursor){
                    document.getElementById("place-visits-label").innerText = numberWithCommas(PlaceVisits)
                    return
                }
                CalcuatePlaceVisits(PlaceVisits, Cursor)
            }
            CalcuatePlaceVisits()

            const GroupsContainer = document.querySelector("[groups-showcase]")
            const GroupHeader = GroupsContainer.getElementsByClassName("container-header")[0]
            const Switchers = GroupsContainer.getElementsByClassName("profile-slide-container")[0]
            const GroupSliderContainer = Switchers.getElementsByClassName("switcher")[0]
            const GroupGridContainer = Switchers.getElementsByTagName("groups-showcase-grid")[0]

            const GroupSlider = GroupSliderContainer.getElementsByClassName("hlist")[0]
            const GroupGrid = GroupGridContainer.getElementsByClassName("hlist")[0]

            const GroupGridClone = GroupGrid.children[0].cloneNode(true)
            const GroupSlideClone = GroupSlider.children[0].cloneNode(true)
            GroupSlideClone.className = GroupSlideClone.className.replace(" active", "")

            let CurrentGroupSelected = 0
            let PriorGroupSlide
            const GroupSlides = []

            GroupSlider.replaceChildren()
            GroupGrid.replaceChildren()

            function LoadGroupSlideElement(){
                if (PriorGroupSlide) PriorGroupSlide.className = PriorGroupSlide.className.replace(" active", "")
                const NewSlide = GroupSlides[CurrentGroupSelected]
                if (NewSlide){
                    PriorGroupSlide = NewSlide
                    NewSlide.className += " active"
                }
            }

            RequestFunc(`https://groups.roblox.com/v1/users/${UserId}/groups/roles`, "GET").then(async function([Success, Body]){
                if (!Success) return GroupsContainer.remove()

                const GroupIcons = {}

                const Groups = Body.data
                if (Groups.length === 0){
                    return GroupsContainer.remove()
                }

                const GroupIds = []
                for (let i = 0; i < Groups.length; i++){
                    GroupIds.push(Groups[i].group.id)
                }

                const [ThumbSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${GroupIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET")
                if (ThumbSuccess){
                    const Data = Thumbnails.data
                    for (let i = 0; i < Data.length; i++){
                        GroupIcons[Data[i].targetId] = Data[i].imageUrl
                    }
                }

                for (let i = 0; i < Groups.length; i++){
                    const Group = Groups[i]
                    const Icon = GroupIcons[Group.group.id] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
                    const URL = `https://roblox.com/groups/${Group.group.id}`

                    const Grid = GroupGridClone.cloneNode(true)
                    Grid.getElementsByClassName("game-card-container")[0].href = URL
                    Grid.getElementsByClassName("thumbnail-2d-container")[0].getElementsByTagName("img")[0].src = Icon

                    Grid.getElementsByClassName("game-card-name")[0].innerText = Group.group.name
                    if (!Group.group.hasVerifiedBadge) Grid.getElementsByClassName("verified-badge-icon-group-showcase-grid-rendered")[0].parentElement.remove()
                    Grid.getElementsByClassName("game-card-name-secondary")[0].innerText = `${numberWithCommas(Group.group.memberCount)} Members`
                    Grid.getElementsByClassName("game-card-name-secondary")[1].innerText = Group.role.name

                    GroupGrid.appendChild(Grid)

                    const Slider = GroupSlideClone.cloneNode(true)
                    Slider.getElementsByClassName("slide-item-emblem-container")[0].getElementsByTagName("a")[0].href = URL
                    Slider.getElementsByClassName("thumbnail-2d-container")[0].getElementsByTagName("img")[0].src = Icon

                    if (!Group.group.hasVerifiedBadge) Slider.getElementsByClassName("verified-badge-icon-group-carousel-rendered")[0].parentElement.remove()

                    Slider.getElementsByClassName("group-title-with-badges")[0].href = URL
                    if (!Group.group.hasVerifiedBadge) Slider.getElementsByClassName("group-title-with-badges")[0].className = Slider.getElementsByClassName("group-title-with-badges")[0].className.replace("group-title-with-badge", "")
                    Slider.getElementsByClassName("slide-item-name")[0].innerText = Group.group.name
                    if (!Group.group.hasVerifiedBadge) Slider.getElementsByClassName("slide-item-name")[0].className = Slider.getElementsByClassName("slide-item-name")[0].className.replace("truncate-with-verified-badge", "")

                    Slider.getElementsByClassName("slide-item-description")[0].innerText = Group.group.description

                    const Statistics = Slider.getElementsByClassName("slide-item-stats")[0].getElementsByClassName("hlist")[0]
                    Statistics.children[0].children[1].innerText = AbbreviateNumber(Group.group.memberCount, 0)
                    Statistics.children[1].children[1].innerText = Group.role.name

                    GroupSlider.appendChild(Slider)
                    GroupSlides.push(Slider)
                }

                LoadGroupSlideElement()
            })

            const GroupButtonTypes = GroupHeader.getElementsByClassName("container-buttons")[0]
            const GroupSlideButton = GroupButtonTypes.getElementsByClassName("btn-generic-slideshow-xs")[0]
            const GroupGridButton = GroupButtonTypes.getElementsByClassName("btn-generic-grid-xs")[0]

            GroupSlideButton.addEventListener("click", function(){
                GroupSlideButton.className = GroupSlideButton.className.replace("btn-secondary-xs", "btn-control-xs")
                GroupSlideButton.getElementsByClassName("icon-slideshow")[0].className += " selected"
                GroupGridButton.className = GroupGridButton.className.replace("btn-control-xs", "btn-secondary-xs")
                GroupGridButton.getElementsByClassName("icon-grid")[0].className = GroupGridButton.getElementsByClassName("icon-grid")[0].className.replace(" selected", "")

                GroupSlider.style.display = ""
                GroupGrid.style.display = "none"
            })

            GroupGridButton.addEventListener("click", function(){
                GroupGridButton.className = GroupSlideButton.className.replace("btn-secondary-xs", "btn-control-xs")
                GroupGridButton.getElementsByClassName("icon-grid")[0].className += " selected"
                GroupSlideButton.className = GroupGridButton.className.replace("btn-control-xs", "btn-secondary-xs")
                GroupSlideButton.getElementsByClassName("icon-slideshow")[0].className = GroupSlideButton.getElementsByClassName("icon-slideshow")[0].className.replace(" selected", "")

                GroupGrid.style.display = ""
                GroupSlider.style.display = "none"
            })

            GroupSlideButton.className = GroupSlideButton.className.replace("btn-secondary-xs", "btn-control-xs")
            GroupSlideButton.getElementsByClassName("icon-slideshow")[0].className += " selected"
            GroupGridButton.className = GroupGridButton.className.replace("btn-control-xs", "btn-secondary-xs")
            GroupGridButton.getElementsByClassName("icon-grid")[0].className = GroupGridButton.getElementsByClassName("icon-grid")[0].className.replace(" selected", "")
            GroupSlider.style.display = ""
            GroupGrid.style.display = "none"

            GroupSliderContainer.getElementsByClassName("carousel-control left")[0].addEventListener("click", function(){
                if (LoadingNextGames) return

                CurrentGroupSelected--
                if (CurrentGroupSelected < 0) CurrentGroupSelected = Games.length - 1
                LoadGroupSlideElement()
            })

            GroupSliderContainer.getElementsByClassName("carousel-control right")[0].addEventListener("click", function(){
                if (LoadingNextGames) return

                CurrentGroupSelected++
                if (CurrentGroupSelected > Games.length) CurrentGroupSelected = 0
                LoadGroupSlideElement()
            })

            GroupGridContainer.getElementsByClassName("load-more-button")[0].remove()

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