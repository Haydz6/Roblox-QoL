function CreatePlatformIcon(IconName){
    const Icon = document.createElement("span")
    Icon.className = "info-icon-devices"
    Icon.style = `background-image: url(${chrome.runtime.getURL(`img/devices/${IconName}.png`)}); background-size: contain; display: inline-block; height: 20px; width: 20px; margin: 0px 3px;`
    Icon.setAttribute("data-toggle", "tooltip")
    Icon.setAttribute("data-original-title", IconName)

    return Icon
}

IsFeatureEnabled("SupportedPlatforms").then(async function(Enabled){
    if (!Enabled) return

    const GlobalContainer = await WaitForClass("game-stats-container")
    const AllowedGears = GlobalContainer.children[GlobalContainer.children.length-1]

    AllowedGears.remove()

    const Container = document.createElement("li")
    Container.className = AllowedGears.className

    const Title = document.createElement("p")
    Title.className = "text-label text-overflow font-caption-header"
    Title.innerText = "Allowed Platform"

    const List = document.createElement("p")
    List.className = "text-lead font-caption-body stat-gears"

    Container.append(Title, List)

    const [Success, Body] = await RequestFunc(WebServerEndpoints.Game+"platforms?universeid="+ (await GetUniverseIdFromGamePage()))
    if (!Success) return

    for (let i = 0; i < Body.length; i++){
        List.appendChild(CreatePlatformIcon(Body[i]))
    }

    GlobalContainer.appendChild(Container)
})