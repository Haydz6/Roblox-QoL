IsFeatureEnabled("MinimizePrivateServers").then(async function(Enabled){
    if (!Enabled) return

    const PrivateServers = await WaitForId("rbx-private-servers")
    const Header = await WaitForClassPath(PrivateServers, "container-header")
    const Banner = await WaitForClassPath(PrivateServers, "create-server-banner")
    const Section = await WaitForClassPath(PrivateServers, "section")

    Header.style = "cursor: pointer;"

    const Minimize = document.createElement("span")
    Minimize.className = "icon-up-16x16"
    Minimize.style = "margin-left: 3px;"

    let Opened = true
    Header.addEventListener("click", function(){
        Opened = !Opened
        Minimize.className = `icon-${Opened ? "up" : "down"}-16x16`
        Banner.style.display = Opened ? "" : "none"
        Section.style.display = Opened ? "" : "none"
    })

    const Tooltip = Header.getElementsByClassName("tooltip-container")[0]
    if (Tooltip) Header.insertBefore(Minimize, Tooltip)
    else Header.appendChild(Minimize)
})