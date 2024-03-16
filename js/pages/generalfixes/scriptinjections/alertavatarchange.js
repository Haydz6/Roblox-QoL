(async() => {
    let Controller
    while (!Controller){
        await new Promise(r => setTimeout(r, 100))
        Controller = document.querySelector('[ng-controller="avatarController"]')
    }
    Controller = angular.element(Controller).scope()

    document.addEventListener("RoQoL.AlertControllerOfAvatarChange", async function(){
        const result = await fetch("https://avatar.roblox.com/v1/avatar", {method: "GET", credentials: "include"})

        Controller.loadAvatarDetailsSuccessCallBack(await result.json())
    })
})()