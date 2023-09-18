async function MakeFriendRequestCancellable(){
    let ControllerElement

    while (true){
        ControllerElement = document.querySelector('[ng-controller="profileHeaderController"]')
        if (ControllerElement) break
        await new Promise(r => setTimeout(r, 100))
    }

    while (!angular) await new Promise(r => setTimeout(r, 100))
    
    const ControllerWrap = angular.element(ControllerElement)
    while (!ControllerWrap.scope()) await new Promise(r => setTimeout(r, 100))
    const Controller = ControllerWrap.scope()

    let FriendRequestButton
    while (true){
        FriendRequestButton = document.getElementsByClassName("btn-friends")[0]?.getElementsByClassName("btn-control-md")[0]
        if (FriendRequestButton) break
        await new Promise(r => setTimeout(r, 100))
    }

    let IsCancellable = false

    function SetFriendRequestPending(){
        FriendRequestButton.className = FriendRequestButton.className.replace("disabled", "")
        FriendRequestButton.innerText = "Cancel Request"
        IsCancellable = true
    }

    const sendFriendRequest = Controller.sendFriendRequest
    const updateLayoutBySendingFRFromMyself = Controller.firePlayerFriendAddEvent

    Controller.updateLayoutBySendingFRFromMyself = function(...args){
        updateLayoutBySendingFRFromMyself(...args)
        SetFriendRequestPending()
    }

    Controller.sendFriendRequest = function(){
        if (IsCancellable) return
        sendFriendRequest()
    }
    if (Controller.profileHeaderLayout.friendRequestPending) SetFriendRequestPending()

    const CallSendFriendRequest = !FriendRequestButton.getAttribute("ng-click")
    FriendRequestButton.addEventListener("click", async function(){
        if (IsCancellable){
            IsCancellable = false
            let Response = await fetch(`https://friends.roblox.com/v1/users/${Controller.profileHeaderLayout.profileUserId}/unfriend`, {method: "POST", credentials: "include"})
            if (!Response.ok && Response.headers.get("x-csrf-token")){
                Response = await fetch(`https://friends.roblox.com/v1/users/${Controller.profileHeaderLayout.profileUserId}/unfriend`, {method: "POST", headers: {"x-csrf-token": Response.headers.get("x-csrf-token")}, credentials: "include"})
            }

            if (Response.ok){
                FriendRequestButton.innerText = "Add Friend"
            } else {
                FriendRequestButton.innerText = "Failed"
                FriendRequestButton.className += " disabled"

                setTimeout(function(){
                    FriendRequestButton.innerText = "Cancel Request"
                    FriendRequestButton.className = FriendRequestButton.className.replace("disabled", "")
                }, 60*1000)
            }
        } else if (CallSendFriendRequest) Controller.sendFriendRequest()
    })
}

MakeFriendRequestCancellable()