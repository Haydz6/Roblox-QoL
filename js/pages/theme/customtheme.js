let CurrentIFrame

async function GetSRCAuthenticated(Url){
    const [Success, _, Response] = await RequestFunc(Url, "GET", undefined, undefined, undefined, true)
    if (!Success) return
    const Blob = await Response.blob()
    const Object = URL.createObjectURL(Blob)
    return Object
}

async function UpdateTheme(Theme){
    if (CurrentIFrame) CurrentIFrame.remove()
    const URL = window.location.href

    if (!Theme){
        WaitForClass("content").then(function(Content){
            Content.style.padding = ""
            Content.style.borderRadius = ""
    
            if (URL.includes("/home") || URL.match("/games/[0-9]+/") && URL.match("/games/[0-9]+/").length != 0) {
                Content.style.maxWidth = ""
            }
        })

        const Container = await WaitForId("container-main")
        Container.style.padding = ""
        Container.style.borderRadius = ""
    } else {
        WaitForClass("content").then(function(Content){
            Content.style.padding = "20px"
            Content.style.borderRadius = "10px"
    
            if (URL.includes("/home") || URL.match("/games/[0-9]+/") && URL.match("/games/[0-9]+/").length != 0) {
                Content.style.maxWidth = "1000px"
            }
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
    const URL = window.location.href
    if (!Theme || (!URL.includes("web.roblox.com") && !URL.includes("www.roblox.com"))) return

    UpdateTheme(Theme)
})

ListenToEventFromBackground("ThemeChange", function(Message){
    UpdateTheme(Message.Theme)
})