async function CreateThemesSection(List){
    const ThemesList = document.createElement("div")
    ThemesList.className = "themes-list"

    function CreateTheme(Name){
        const Theme = document.createElement("a")
        Theme.className = "theme"

        const Image = document.createElement("iframe")
        Image.className = "theme-frame"
        Image.src = `${WebServerEndpoints.Themes}theme?theme=${Name}`
        Image.style = "width: 100%; height: 100%"
        Theme.appendChild(Image)

        ThemesList.appendChild(Theme)

        Theme.addEventListener("click", function(){
            SetFeatureEnabled("CurrentTheme", Name)
        })

        return Theme
    }

    const Clear = document.createElement("a")
    const SVG = document.createElement("img")
    SVG.src = chrome.runtime.getURL("img/whitecross.svg")

    Clear.className = "theme"
    Clear.appendChild(SVG)

    Clear.addEventListener("click", function(){
        SetFeatureEnabled("CurrentTheme", undefined)
    })

    ThemesList.appendChild(Clear)

    CreateTheme("Winterness.webp")
    CreateTheme("boykisser.gif")
    
    RequestFunc(WebServerEndpoints.Themes, "GET").then(function([Success, Body]){
        if (!Success){
            ThemesList.innerText = "An error occurred"
            return
        }

        for (let i = 0; i < Body.length; i++){
            CreateTheme(Body[i])
        }
    })

    List.appendChild(ThemesList)
}