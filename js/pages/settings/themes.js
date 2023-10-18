async function CreateThemesSection(List){
    const ThemesList = document.createElement("div")
    ThemesList.className = "themes-list"

    function CreateTheme(Name){
        const Theme = document.createElement("a")
        Theme.className = "theme"

        const Button = document.createElement("a")
        Button.className = "theme-button"

        const Image = document.createElement("iframe")
        Image.className = "theme-frame"
        Image.src = `${WebServerEndpoints.Themes}theme?theme=${Name}`
        Image.style = "width: 100%; height: 100%"
        Theme.append(Button, Image)

        ThemesList.appendChild(Theme)

        Button.addEventListener("click", async function(){
            if (!await PaidForFeature("CurrentTheme")) return CreatePaymentPrompt()
            if (await IsFeatureEnabled("CurrentTheme") === Name) return

            SetFeatureEnabled("CurrentTheme", Name)
            RequestFunc(WebServerEndpoints.Themes+"set", "POST", {"Content-Type": "application/json"}, JSON.stringify({Theme: Name}))
        })

        return Theme
    }

    const Clear = document.createElement("a")
    const SVG = document.createElement("img")
    SVG.src = chrome.runtime.getURL("img/whitecross.svg")

    Clear.className = "theme clear-button"
    Clear.appendChild(SVG)

    Clear.addEventListener("click", function(){
        SetFeatureEnabled("CurrentTheme", undefined)
        RequestFunc(WebServerEndpoints.Themes+"set", "POST", {"Content-Type": "application/json"}, JSON.stringify({Theme: ""}))
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