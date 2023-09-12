function CreatePlatformIcon(IconName){
    const Icon = document.createElement("span")
    Icon.className = "info-icon-devices"
    Icon.style = `background-image: url(${chrome.runtime.getURL(`img/devices/${IconName}.png`)}); background-size: contain; display: inline-block; height: 20px; width: 20px; margin: 0px 3px;`
    Icon.setAttribute("data-toggle", "tooltip")
    Icon.setAttribute("data-placement", "bottom")
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
    let AllowedGears = FindFirstClass("icon-nogear")
    let className = GlobalContainer.children[0].className

    if (AllowedGears) AllowedGears.parentElement.parentElement.remove()

    const [Container, List] = CreateAllowedDevicesContainer(className)
    List.className = "spinner spinner-default"
    GlobalContainer.appendChild(Container)

    const [Success, Body] = await RequestFunc(WebServerEndpoints.Game+"platforms?universeid="+ (await GetUniverseIdFromGamePage()))
    List.className = "text-lead font-caption-body stat-gears"

    if (!Success){
        List.innerText = "Couldn't fetch"
        return
    } else if (Body.length == 0){
        List.innerText = "Unknown"
        return
    }

    for (let i = 0; i < Body.length; i++){
        List.appendChild(CreatePlatformIcon(Body[i]))
    }

    InjectScript("TooltipSupportedDevices")
})