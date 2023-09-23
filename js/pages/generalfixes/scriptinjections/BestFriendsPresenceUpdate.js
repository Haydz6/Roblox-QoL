async function BestFriendsPresenceUpdate(){
    let PeopleList
    while (true){
        PeopleList = document.querySelector('[ng-controller="peopleListContainerController"]')
        if (PeopleList) break
        await new Promise(r => setTimeout(r, 100))
    }

    const PeopleController = angular.element(PeopleList).scope()
    while (PeopleController.library?.numOfFriends === null) await new Promise(r => setTimeout(r, 0)) //Wait for friends to load

    const Users = Object.values(PeopleController.library.friendsDict)
    if (Users.length > 0) document.dispatchEvent(new CustomEvent("RobloxQoL.BestFriendsPresenceUpdate", {detail: Users}))

    let ChatElement
    while (true){
        ChatElement = document.querySelector('[ng-controller="chatController"]')
        if (ChatElement) break
        await new Promise(r => setTimeout(r, 100))
    }

    const ChatController = angular.element(ChatElement).scope()

    document.addEventListener("RobloxQoL.OpenFriendChatConversation", function(Event){
        ChatController.openConversation(Event.detail, true)
    })

    document.addEventListener("RobloxQoL.launchGame", function(Event){
        const Presence = Event.detail
        Roblox.PlayButton.launchGame(Presence.placeId, Presence.rootPlaceId, undefined, Presence.gameId)
    })
}

BestFriendsPresenceUpdate()