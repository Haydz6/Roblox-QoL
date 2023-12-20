async function FixAvatarTabsForFirefoxAndroid(){
    let AvatarControllerHTML
    while (true){
        AvatarControllerHTML = document.querySelector('[ng-controller="avatarController"]')
        if (AvatarControllerHTML) break
        await new Promise(r => setTimeout(r, 100))
    }

    const Controller = angular.element(AvatarControllerHTML).scope()
    const _onTabBlur = Controller.onTabBlur

    Controller.onTabBlur = async function(...args){
        if (!Controller.isMenuOpen) return _onTabBlur(...args)

        setTimeout(function(){
            _onTabBlur(...args)
            Controller.$apply()
        }, 100)
    }
}

setTimeout(FixAvatarTabsForFirefoxAndroid, 0)