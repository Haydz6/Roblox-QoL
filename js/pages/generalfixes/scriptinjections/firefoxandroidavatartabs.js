async function FixAvatarTabsForFirefoxAndroid(){
    let AvatarControllerHTML
    while (true){
        AvatarControllerHTML = document.querySelector('[ng-controller="avatarController"]')
        if (AvatarControllerHTML) break
        await new Promise(r => setTimeout(r, 100))
    }

    const Controller = angular.element(AvatarControllerHTML).scope()
    const _mouseLeftTabMenu = Controller.mouseLeftTabMenu
    console.log(Controller)

    Controller.mouseLeftTabMenu = function(){
        //if (!Controller.tabWithOpenMenu?.active) return _mouseLeftTabMenu.apply(this, arguments)

        setTimeout(function(){
            _mouseLeftTabMenu.apply(this, arguments)
        }, 100)
    }
}

//setTimeout
setTimeout(FixAvatarTabsForFirefoxAndroid, 0)