async function AreFriendedDispatcher(){
    let ControllerElement

    while (true){
        ControllerElement = document.querySelector('[ng-controller="profileHeaderController"]')
        if (ControllerElement) break
        await new Promise(r => setTimeout(r, 0))
    }

    while (true){
        let canbreak = false
        try {
            if (angular) canbreak = true
        } catch {}
        if (canbreak) break
        await new Promise(r => setTimeout(r, 0))
    }

    const ControllerWrap = angular.element(ControllerElement)
    while (!ControllerWrap.scope()) await new Promise(r => setTimeout(r, 100))
    const Controller = ControllerWrap.scope()

    const profileHeaderLayout = Controller.profileHeaderLayout
    function SendAreFriends(){
        document.dispatchEvent(new CustomEvent("RobloxQoL.areFriended", {detail: profileHeaderLayout.areFriends}))
    }

    Controller.profileHeaderLayout = new Proxy(profileHeaderLayout, {
        set: function(target, key, value){
            target[key] = value
            if (key === "areFriends") SendAreFriends()

            return true
        }
    })
    
    SendAreFriends()
}

AreFriendedDispatcher()