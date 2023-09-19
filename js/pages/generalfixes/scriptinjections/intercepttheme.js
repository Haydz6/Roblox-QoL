async function InterceptTheme(){
    let ThemesList = document.getElementById("themes-list")
    let personalController
    while (true){
        personalController = document.querySelector('[ng-controller="personalController"]')
        if (personalController) break
        await new Promise(r => setTimeout(r, 0))
    }
    
    const Scope = angular.element(ThemesList).scope()
    const personalScope = angular.element(personalController).scope()
    const chooseThemes = Scope.chooseThemes

    Scope.chooseThemes = function(...args){
        if (personalScope.themeContent?.newThemeType){
            document.dispatchEvent(new CustomEvent("RobloxQoLThemeChange", {detail: null}))
            chooseThemes(...args)
        }
        else {
            document.dispatchEvent(new CustomEvent("RobloxQoLThemeChange", {detail: "System"}))
        }
    }
}

InterceptTheme()