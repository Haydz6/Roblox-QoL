function CreatePlatformIcon(IconName){
    const Icon = document.createElement("span")
    Icon.className = "info-icon-devices"
    Icon.style = `background-image: url(${chrome.runtime.getURL(`img/devices/${IconName}.png`)}); background-size: contain; display: inline-block; height: 20px; width: 20px; margin: 0px 3px;`
    Icon.setAttribute("data-toggle", "tooltip")
    Icon.setAttribute("data-original-title", IconName)

    return Icon
}

function CreateAllowedDevicesContainer(ClassName){
    const Container = document.createElement("li")
    Container.className = ClassName

    const Title = document.createElement("p")
    Title.className = "text-label text-overflow font-caption-header"
    Title.innerText = "Allowed Device"

    const List = document.createElement("p")
    List.className = "text-lead font-caption-body stat-gears"

    Container.append(Title, List)

    return [Container, List]
}

IsFeatureEnabled("SupportedPlatforms").then(async function(Enabled){
    if (!Enabled) return

    const GlobalContainer = await WaitForClass("game-stats-container")
    const AllowedGears = GlobalContainer.children[GlobalContainer.children.length-1]

    const [Placeholder] = CreateAllowedDevicesContainer(AllowedGears.className) //Fix for roseal
    GlobalContainer.appendChild(Placeholder)

    AllowedGears.remove()

    const [Container, List] = CreateAllowedDevicesContainer(AllowedGears.className)
    GlobalContainer.appendChild(Container)

    const [Success, Body] = await RequestFunc(WebServerEndpoints.Game+"platforms?universeid="+ (await GetUniverseIdFromGamePage()))
    if (!Success) return

    for (let i = 0; i < Body.length; i++){
        List.appendChild(CreatePlatformIcon(Body[i]))
    }

    Placeholder.remove()
    GlobalContainer.appendChild(Container)
})