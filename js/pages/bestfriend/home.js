IsFeatureEnabled("BestFriends").then(async function(Enabled){
    if (!Enabled) return
    const [Success, BestFriends] = await RequestFunc(WebServerEndpoints.BestFriends+"all", "GET")
    if (!Success || BestFriends.length === 0) return

    const PeopleList = document.createElement("div")
    PeopleList.id = "best-friend-list-container"
    PeopleList.setAttribute("people-list-container", "")
    PeopleList.innerHTML = `<div class="col-xs-12 people-list-container" ng-show="layout.isAllFriendsDataLoaded &amp;&amp; library.numOfFriends > 0 || layout.friendsError"> <div class="section home-friends"> <div class="container-header people-list-header"> <h2 class="ng-binding"> Best Friends<span ng-show="library.numOfFriends !== null" class="friends-count ng-binding">(...)</span> </h2> <span ng-show="layout.invalidPresenceData" class="presence-error ng-hide"> <span class="icon-warning"></span> <span class="text-error ng-binding" ng-bind="'Label.PresenceError' | translate">User status may not be up to date</span> </span> <a class="btn-secondary-xs btn-more see-all-link-icon ng-binding">Expand</a> </div> <div class="section-content remove-panel people-list"> <p ng-show="layout.friendsError" class="section-content-off ng-binding ng-hide" ng-bind="'Label.FriendsError' | translate">Unable to load friends</p> <ul class="hlist" ng-controller="friendsListController" people-list="" ng-class="{'invisible': !layout.isAllFriendsDataLoaded}">  </ul> <span class="spinner spinner-default ng-hide" ng-show="!layout.isAllFriendsDataLoaded"></span> </div> </div> </div> <div class="col-xs-12 people-list-container ng-hide" ng-hide="layout.isAllFriendsDataLoaded"> <div class="section home-friends"> <div class="container-header people-list-header"> <h2 class="ng-binding">Friends</h2> </div> <div class="section-content remove-panel people-list"> <span class="spinner spinner-default"></span> </div> </div> </div>`
    
    const MoreButton = PeopleList.getElementsByClassName("btn-more")[0]

    let IsExpanded = localStorage.getItem("roqol-bestfriends-expanded") == "true" ? true : false
    function UpdateExpanded(){
        if (BestFriends.length <= 9 || !IsExpanded){
            PeopleList.style = "height: 190px !important;"
            PeopleList.getElementsByClassName("people-list-container")[0].style = "height: 190px !important; overflow: hidden;"
            PeopleList.getElementsByClassName("people-list")[0].style = "height: 163px !important; max-height: 163px !important;"
        } else {
            PeopleList.style = ""
            PeopleList.getElementsByClassName("people-list-container")[0].style = ""
            PeopleList.getElementsByClassName("people-list")[0].style = ""
        }

        MoreButton.innerText = IsExpanded ? "Retract" : "Expand"
        //MoreButton.children[0].style.transform = IsExpanded ? "scale(.875) rotate(90deg)" : ""
    }

    MoreButton.addEventListener("click", function(){
        IsExpanded = !IsExpanded
        localStorage.setItem("roqol-bestfriends-expanded", IsExpanded)
        UpdateExpanded()
    })

    function UpdateBestFriendsList(){
        PeopleList.getElementsByClassName("friends-count")[0].innerText = `(${BestFriends.length}/18)`

        if (BestFriends.length <= 9) MoreButton.style.display = "none"
        else MoreButton.style.display = ""

        UpdateExpanded()
    }
    UpdateBestFriendsList()

    const List = PeopleList.getElementsByClassName("hlist")[0]

    WaitForId("HomeContainer").then(function(HomeContainer){
        WaitForId("people-list-container").then(function(PeopleListContainer){
            HomeContainer.insertBefore(PeopleList, PeopleListContainer)
        })
    })

    const CachedPresences = {}
    const CachedUser = {}
    const CachedGame = {}
    const CachedGameIcons = {}

    async function GetGameIcon(UniverseId){
        while (CachedGameIcons[UniverseId] === true) await sleep(0)
        if (CachedGameIcons[UniverseId]) return CachedGameIcons[UniverseId]

        CachedGameIcons[UniverseId] = true
        const [Success, Body] = await RequestFunc(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${UniverseId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`, "GET", undefined, undefined, true)
        if (!Success) CachedGameIcons[UniverseId] = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
        else CachedGameIcons[UniverseId] = Body.data[0].imageUrl
        
        return CachedGameIcons[UniverseId]
    }

    let GameInfoQueue = []
    function GetGameInfo(UniverseId){
        return new Promise(async(resolve, reject) => {
            if (CachedGame[UniverseId]) return resolve(CachedGame[UniverseId])
            GameInfoQueue.push({resolve: resolve, reject: reject, universeId: UniverseId})
            if (GameInfoQueue.length !== 1) return
            if (GameInfoQueue.length > 50) GameInfoQueue = []
            const Queue = GameInfoQueue

            await sleep(50) //Wait for it to batch up

            GameInfoQueue = []

            const UniverseIds = []
            const Lookup = {}
            for (let i = 0; i < Queue.length; i++){
                const Info = Queue[i]
                if (!Lookup[Info.universeId]){
                    UniverseIds.push(Info.universeId)
                    Lookup[Info.universeId] = []
                }

                Lookup[Info.universeId].push(Info)
            }

            const [Success, Body] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${UniverseIds.join("&placeIds=")}`, "GET", undefined, undefined, true)
            if (!Success){
                for (i = 0; i < Queue.length; i++){
                    Queue[i].resolve()
                }
                return
            }

            const Data = Body
            for (let i = 0; i < Data.length; i++){
                const Game = Data[i]
                CachedGame[Game.placeId] = Game

                const Lookups = Lookup[Game.placeId]
                for (let o = 0; o < Lookups.length; o++){
                    Lookups[o].resolve(Game)
                }
            }
        })
    }

    function CreatePopover(UserId){
        const Presence = CachedPresences[UserId]
        if (!Presence) return

        const Popover = document.createElement("div")
        Popover.setAttribute("uib-popover-template-popup", "")
        Popover.setAttribute("uib-title", "")
        Popover.className = "popover ng-scope ng-isolate-scope bottom people-info-card-container card-with-game fade in"
        Popover.style = "top: 550px; left: 72px;"
        Popover.innerHTML = `<div class="arrow"></div>

        <div class="popover-inner">
            <!-- ngIf: uibTitle -->
            <div class="popover-content" uib-tooltip-template-transclude="contentExp()" tooltip-template-transclude-scope="originScope()"><div ng-controller="peopleInfoCardController" ng-class="{'card-with-game': friend.presence.placeUrl}" class="ng-scope card-with-game"> <div class="border-bottom place-container" ng-show="friend.presence.placeUrl" style="
            /* display: none; */
        "> <a href="" class="game-link"> <thumbnail-2d class="cursor-pointer place-icon ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.gameIcon" thumbnail-target-id="library.placesDict[friend.presence.rootPlaceId].universeId"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GameIcon" thumbnail-target-id="2324018757"> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="https://tr.rbxcdn.com/624b92c3b39e5fa6a7c41db0a95718a7/150/150/Image/Png" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope game-image" src=""><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> </a> <div class="place-info-container"> <div class="place-info"> <a href="https://www.roblox.com/games/6298464951/gamename" class="text-subject cursor-pointer place-title ng-binding" ng-bind="library.placesDict[friend.presence.rootPlaceId].name" ng-click="goToGameDetails('link')"></a> <div class="icon-text-wrapper ng-hide" ng-show="library.placesDict[friend.presence.rootPlaceId].requiredPurchase"> <span class="icon-robux"></span> <span class="text-robux ng-binding" ng-bind="library.placesDict[friend.presence.rootPlaceId].price">0</span> </div> </div> <div class="place-btn-container"> <button class="btn-full-width place-btn btn-growth-sm join-button" ng-click="clickBtn('btn')"> Join </button> </div> </div> </div> <ul class="dropdown-menu interaction-container"> <li class="interaction-item chat-with-button" ng-click="goToChat()"> <span class="icon icon-chat-gray"></span> <span class="text-overflow border-bottom label ng-binding chat-with-user" ng-bind="layout.interactionLabels.chat(friend.nameToDisplay)" title="Chat with BinglyWingly">Chat with BinglyWingly</span> </li> <li class="interaction-item go-to-profile-page" ng-click="goToProfilePage()"> <span class="icon icon-viewdetails"></span> <span class="label ng-binding" ng-bind="layout.interactionLabels.viewProfile">View Profile</span> </li> </ul> </div></div>
        </div>`

        //Add space at end of name
        if (Presence.userPresenceType === 2 && Presence.lastLocation){
            Popover.getElementsByClassName("game-link")[0].href = `https://www.roblox.com/games/${Presence.rootPlaceId}/`
            Popover.getElementsByClassName("place-title")[0].href = `https://www.roblox.com/games/${Presence.rootPlaceId}/`
            Popover.getElementsByClassName("place-title")[0].innerText = Presence.lastLocation

            GetGameIcon(Presence.universeId).then(function(Url){
                Popover.getElementsByClassName("game-image")[0].src = Url
            })

            GetGameInfo(Presence.rootPlaceId).then(function(Game){ //place api returns playability, not universe :/
                Popover.getElementsByClassName("icon-text-wrapper")[0].className = "icon-text-wrapper ng-hide"

                const JoinButton = Popover.getElementsByClassName("place-btn")[0]
                if (Game && Game.isPlayable){
                    JoinButton.addEventListener("click", function(){
                        document.dispatchEvent(new CustomEvent("RobloxQoL.launchGame", {detail: CachedPresences[UserId]}))
                    })
                } else {
                    JoinButton.className = "btn-full-width place-btn btn-control-sm"
                    JoinButton.innerText = "View Details"
    
                    JoinButton.addEventListener("click", function(){
                        window.location.href = `https://www.roblox.com/games/${Presence.rootPlaceId}/`
                    })

                    if (Game.reasonProhibited === "PurchaseRequired" && Game.price){
                        Popover.getElementsByClassName("text-robux")[0].innerText = Game.price
                        Popover.getElementsByClassName("icon-text-wrapper")[0].className = "icon-text-wrapper"
                    }
                }
            })

        } else {
            Popover.getElementsByClassName("place-container")[0].remove()
        }

        const User = CachedUser[UserId]
        Popover.getElementsByClassName("chat-with-user")[0].title = `Chat with ${User ? User.displayName : "???"}`
        Popover.getElementsByClassName("chat-with-user")[0].innerText = `Chat with ${User ? User.displayName : "???"}`

        Popover.getElementsByClassName("go-to-profile-page")[0].addEventListener("click", function(){
            window.location.href = `https://www.roblox.com/users/${UserId}/profile`
        })
        Popover.getElementsByClassName("chat-with-button")[0].addEventListener("click", function(){
            document.dispatchEvent(new CustomEvent("RobloxQoL.OpenFriendChatConversation", {detail: UserId}))
        })

        document.body.appendChild(Popover)
        return Popover
    }

    let LastPopover

    function UpdatePopoverPosition(Friend){
        if (!LastPopover) return
        const Rect = Friend.getBoundingClientRect()
        LastPopover.style = `top: ${((Rect.top+84*1.5)+4) + window.scrollY}px; left: ${Rect.left-320/3}px;`
    }

    async function KillPopover(){
        if (!LastPopover) return
        const Popover = LastPopover
        LastPopover = null

        Popover.className = "popover ng-scope ng-isolate-scope bottom people-info-card-container card-with-game fade"
        await sleep(1000)
        Popover.remove()
    }

    function CreateFriend(UserId){
        const Friend = document.createElement("li")
        Friend.id = "best-friend-"+UserId
        Friend.className = "list-item friend best-friend-item ng-scope"

        Friend.setAttribute("rbx-user-id", UserId)
        Friend.innerHTML = `<div people="" class="ng-scope"> <div class="avatar-container"> <a href="" class="text-link friend-link ng-isolate-scope" ng-click="clickAvatar(friend, $index)" popover-trigger=" 'none' " popover-class="people-info-card-container card-with-game best-friend-people-info-37270727" popover-placement="bottom" popover-append-to-body="true" popover-is-open="hoverPopoverParams.isOpen" hover-popover-params="hoverPopoverParams" hover-popover="" uib-popover-template="'people-info-card'"> <div class="avatar avatar-card-fullbody"> <span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot" ng-class="{'icon-placeholder-avatar-headshot': !friend.avatar.imageUrl}"> <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.avatarHeadshot" thumbnail-target-id="friend.id"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="37270727"> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope"><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> </span> </div> <div ng-class="{'shimmer': layout.namesLoading}" class="friend-parent-container"> <div class="friend-name-container"> <span class="text-overflow friend-name font-caption-header ng-binding" ng-bind="friend.nameToDisplay" title=""></span> <span ng-class="{'hide': !friend.hasVerifiedBadge || layout.namesLoading}" class="verified-badge hide"> <span><span role="button" tabindex="0" data-rblx-verified-badge-icon="" data-rblx-badge-icon="true" class="jss4"><img class="verified-badge-icon-friends-carousel-rendered" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cg clip-path='url(%23clip0_8_46)'%3E%3Crect x='5.88818' width='22.89' height='22.89' transform='rotate(15 5.88818 0)' fill='%230066FF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_8_46'%3E%3Crect width='28' height='28' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E" title="Verified Badge Icon" alt="Verified Badge Icon"></span></span> </span> </div> </div> <!-- ngIf: friend.presence.placeUrl --><div class="text-overflow xsmall text-label place-name ng-binding ng-scope" style="display: hidden;" ng-if="friend.presence.placeUrl" ng-bind="library.placesDict[friend.presence.rootPlaceId].name"></div><!-- end ngIf: friend.presence.placeUrl --> </a> <!-- ngIf: friend.presence.placeUrl --><a class="friend-status place-link ng-scope" ng-href="https://www.roblox.com/games/147848991/gamename" ng-if="friend.presence.placeUrl" ng-click="clickPlaceLink(friend, $index)" href="https://www.roblox.com/games/147848991/gamename"> <span class="avatar-status friend-status icon-game" style="display: none;" title="Be A Parkour Ninja"></span> </a></div> </div>`
        Friend.getElementsByClassName("friend-link")[0].href = `https://www.roblox.com/users/${UserId}/profile`

        let HoveringPopover = false
        let HoveringFriend = false

        function TryToKillPopover(){
            if (!HoveringFriend && !HoveringPopover) KillPopover()
        }

        Friend.addEventListener("mouseenter", async function(){
            HoveringFriend = true
            HoveringPopover = false
            KillPopover()
            await sleep(0)
            LastPopover = CreatePopover(UserId)

            LastPopover.addEventListener("mouseenter", function(){
                HoveringPopover = true
            })
            LastPopover.addEventListener("mouseleave", function(){
                HoveringPopover = false
                TryToKillPopover()
            })

            UpdatePopoverPosition(Friend)
        })

        Friend.addEventListener("mouseleave", async function(){
            await sleep(0) //Yield for mouseenter listeners to fire
            HoveringFriend = false
            TryToKillPopover()
        })

        //List.appendChild(Friend)
        return Friend
    }

    const IdToElement = {}
    for (let i = 0; i < BestFriends.length; i++){
        const Friend = BestFriends[i]
        const Element = CreateFriend(Friend)

        IdToElement[Friend] = Element
    }

    RequestFunc("https://thumbnails.roblox.com/v1/users/avatar-headshot?size=150x150&format=Png&isCircular=true&userIds="+BestFriends.join(","), "GET", undefined, undefined, true).then(function([Success, Body]){
        if (!Success) return

        const Data = Body.data
        for (let i = 0; i < Data.length; i++){
            IdToElement[Data[i].targetId].getElementsByClassName("thumbnail-2d-container")[0].getElementsByTagName("img")[0].src = Data[i].imageUrl
        }
    })

    RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: BestFriends, excludeBannedUsers: false}), true).then(function([Success, Body]){
        if (!Success) return

        const Data = Body.data
        for (let i = 0; i < Data.length; i++){
            const User = Data[i]
            const Element = IdToElement[User.id]
            const FriendLabel = Element.getElementsByClassName("friend-name")[0]
            FriendLabel.title = User.displayName
            FriendLabel.innerText = User.displayName

            const VerifiedBadge = Element.getElementsByClassName("verified-badge")[0]
            if (User.hasVerifiedBadge) VerifiedBadge.className = VerifiedBadge.className.replace("hide", "")

            CachedUser[User.id] = User
        }
    })

    function UpdateUserPresence(User){
        const UserId = User.userId || User.id
        const Presence = User.presence || User
        CachedPresences[UserId] = Presence

        const Element = IdToElement[UserId]
        if (!Element) return

        const AvatarStatus = Element.getElementsByClassName("avatar-status")[0]

        if (Presence.userPresenceType !== 0){
            AvatarStatus.style.display = ""
            AvatarStatus.title = Presence.lastLocation
            AvatarStatus.className = `avatar-status friend-status icon-${Presence.userPresenceType === 1 && "online" || Presence.userPresenceType === 2 && "game" || Presence.userPresenceType === 3 && "studio" || ""}`
            Element.getElementsByClassName("friend-status place-link")[0].href = Presence.rootPlaceId ? `https://www.roblox.com/games/${Presence.rootPlaceId}/` : ""
            Element.getElementsByClassName("text-label place-name")[0].innerText = Presence.userPresenceType === 2 ? Presence.lastLocation : ""
        } else AvatarStatus.style.display = "none"
    }

    document.addEventListener("Roblox.Presence.Update", async function(Event){
        UpdateUserPresence(Event.detail[0])
    })

    document.addEventListener("RobloxQoL.BestFriendsPresenceUpdate", function(Event){
        const Detail = Event.detail
        const Friends = {}

        for (let i = 0; i < Detail.length; i++){
            const User = Detail[i]
            const UserId = User.userId || User.id
            UpdateUserPresence(User)

            //Update order
            const Element = IdToElement[UserId]
            if (Element) List.appendChild(Element)

            Friends[UserId] = true
        }

        for (let i = 0; i < BestFriends.length; i++){
            const UserId = BestFriends[i]
            if (!Friends[UserId]){
                BestFriends.splice(i, 1)
                i--
                RequestFunc(WebServerEndpoints.BestFriends+"pin", "POST", {"Content-Type": "application/json"}, JSON.stringify({Pinned: false, UserId: UserId}))
            }
        }
        UpdateBestFriendsList()
        document.dispatchEvent(new CustomEvent("RobloxQoL.BestFriendsLoaded"))
    })

    InjectScript("BestFriendsPresenceUpdate")
})