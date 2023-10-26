let CurrentIFrame
const DefaultIFrameStyle = "position: absolute; width: 100%; height: 100%; border: 0; z-index: -2; top: 0; left: 0;"
const StyleFixes = []

async function GetSRCAuthenticated(Url){
    const [Success, _, Response] = await RequestFunc(Url, "GET", undefined, undefined, undefined, true)
    if (!Success) return
    const Blob = await Response.blob()
    const Object = URL.createObjectURL(Blob)
    return Object
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
}

function UpdateThemeSettings(Theme){
    const Settings = Theme?.Settings
    if (!Settings) return
    if (!CurrentIFrame) return

    CurrentIFrame.style = `${DefaultIFrameStyle} filter: blur(${Settings.Blur || 0}px) brightness(${Settings.Brightness || 1}%) saturation(${Settings.Saturation || 1}%);`

    if (Settings.Opacity && Settings.Opacity < 1){
        WaitForClass("content").then(function(Content){
            const Style = window.getComputedStyle(Content)
            console.log(Style.backgroundColor)

            if (Style.backgroundColor.startsWith("rgb")){
                const Regex = new RegExp("[0-9]+", "g")
                const Numbers = []

                while (result = Regex.exec(Style.backgroundColor)) Numbers.push(result)
                if (Numbers.length < 3) return
                Content.style["background-color"] = `rgba(${Numbers[0]},${Numbers[1]},${Numbers[2]},${Settings.Opacity})`
            } else if (Style.backgroundColor.startsWith("#")) {
                const Color = hexToRgb(Style.backgroundColor)
                Content.style["background-color"] = `rgba(${Color.r},${Color.g},${Color.b},${Settings.Opacity})`
            }
        })
    }
}


async function UpdateTheme(Theme){
    const DocURL = window.location.href
    if (!DocURL.includes("web.roblox.com") && !DocURL.includes("www.roblox.com")) return

    if (CurrentIFrame) CurrentIFrame.remove()

    if (!Theme?.Theme){
        WaitForClass("content").then(function(Content){
            Content.style.padding = ""
            Content.style.borderRadius = ""
    
            if (DocURL.includes("/home") || DocURL.match("/games/[0-9]+/") && DocURL.match("/games/[0-9]+/").length != 0) {
                Content.style.maxWidth = ""
            }
        })

        WaitForId("Skyscraper-Abp-Right").then(function(Ad){
            Ad.style.marginRight = ""
        })

        WaitForId("Skyscraper-Abp-Left").then(function(Ad){
            Ad.style.marginLeft = ""
        })

        const Container = await WaitForId("container-main")
        Container.style.padding = ""
        Container.style.borderRadius = ""

        for (let i = 0; i < StyleFixes.length; i++){
            StyleFixes[i].remove()
        }
        StyleFixes.length = 0
    } else {
        //if (!DocURL.match("/users/[0-9]+/profile"))
        WaitForClass("content").then(function(Content){
            Content.style.padding = "20px"
            Content.style.borderRadius = "10px"
    
            if (DocURL.includes("/home") || DocURL.match("/games/[0-9]+/") && DocURL.match("/games/[0-9]+/").length != 0) {
                Content.style.maxWidth = "1000px"
            }
        })

        WaitForId("Skyscraper-Abp-Right").then(function(Ad){
            Ad.style.marginRight = "-200px"
        })

        WaitForId("Skyscraper-Abp-Left").then(function(Ad){
            Ad.style.marginLeft = "-185px"
        })

        if (DocURL.includes("/users/")) {
            WaitForClass("profile-ads-container").then(function(Ad){
                if (!Ad.parentElement) return

                const Container = FindFirstClass("content")
                Container.parentElement.insertBefore(Ad, Container.nextSibling)

                Ad.style.marginTop = "20px"
            })
        }
        if (DocURL.match("/groups/[0-9]+/")) {
            const MaxWidthFix = document.createElement("style")
            MaxWidthFix.innerHTML = `@media (min-width: 1850px) { .content {max-width: 1335px !important;} }`
            document.head.appendChild(MaxWidthFix)
            StyleFixes.push(MaxWidthFix)
        }

        WaitForId("Leaderboard-Abp").then(function(Ad){
            if (!Ad.parentElement) return

            const Container = FindFirstClass("content")
            Container.parentElement.insertBefore(Ad, Container)
            Ad.style.marginBottom = "20px"
        })

        const Container = await WaitForId("container-main")

        const IFrame = document.createElement("iframe")
        IFrame.style = DefaultIFrameStyle
        if (Theme.Theme != "custom") IFrame.src = `${WebServerEndpoints.Themes}theme?theme=${Theme.Theme}`
        else IFrame.src = Theme.Access
        CurrentIFrame = IFrame

        UpdateThemeSettings(Theme)
        Container.style = "border-radius: 20px; padding: 20px;"

        Container.appendChild(IFrame)
    }
}

IsFeatureEnabled("CurrentTheme").then(async function(Theme){
    UpdateTheme(Theme)
})

ListenToEventFromBackground("ThemeChange", function(Message){
    UpdateTheme(Message.Theme)
})

ListenToEventFromBackground("ThemeSettingsChange", function(Message){
    UpdateThemeSettings(Message.Theme)
})