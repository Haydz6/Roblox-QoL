let CurrentIFrame
const StyleFixes = []

async function GetSRCAuthenticated(Url){
    const [Success, _, Response] = await RequestFunc(Url, "GET", undefined, undefined, undefined, true)
    if (!Success) return
    const Blob = await Response.blob()
    const Object = URL.createObjectURL(Blob)
    return Object
}

async function UpdateTheme(Theme){
    const URL = window.location.href
    if (!URL.includes("web.roblox.com") && !URL.includes("www.roblox.com")) return

    if (CurrentIFrame) CurrentIFrame.remove()

    if (!Theme){
        WaitForClass("content").then(function(Content){
            Content.style.padding = ""
            Content.style.borderRadius = ""
    
            if (URL.includes("/home") || URL.match("/games/[0-9]+/") && URL.match("/games/[0-9]+/").length != 0) {
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
        if (!URL.match("/users/[0-9]+/profile")) WaitForClass("content").then(function(Content){
            Content.style.padding = "20px"
            Content.style.borderRadius = "10px"
    
            if (URL.includes("/home") || URL.match("/games/[0-9]+/") && URL.match("/games/[0-9]+/").length != 0) {
                Content.style.maxWidth = "1000px"
            }
        })

        WaitForId("Skyscraper-Abp-Right").then(function(Ad){
            Ad.style.marginRight = "-200px"
        })

        WaitForId("Skyscraper-Abp-Left").then(function(Ad){
            Ad.style.marginLeft = "-185px"
        })

        if (URL.includes("/users/")) {
            WaitForClass("profile-ads-container").then(function(Ad){
                if (!Ad.parentElement) return

                const Container = FindFirstClass("content")
                Container.parentElement.insertBefore(Ad, Container.nextSibling)

                Ad.style.marginTop = "20px"
            })
        }
        if (URL.match("/groups/[0-9]+/")) {
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
        IFrame.style = "position: absolute; width: 100%; height: 100%; border: 0; z-index: -2; top: 0; left: 0;"
        IFrame.src = `${WebServerEndpoints.Themes}theme?theme=${Theme}`
        CurrentIFrame = IFrame

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