IsFeatureEnabled("MinimizePrivateServers").then(function(Enabled){
    if (!Enabled) return

    async function ModifyPrivateServersList(PrivateServers){
        const Header = await WaitForClassPath(PrivateServers, "container-header")
        const Banner = await WaitForClassPath(PrivateServers, "create-server-banner")
        const Section = await WaitForClassPath(PrivateServers, "section")

        Header.style = "cursor: pointer;"

        const Minimize = document.createElement("span")
        Minimize.className = "icon-up-16x16"
        Minimize.style = "margin-left: 3px;"

        let Opened = true
        function Click(){
            Opened = !Opened
            Minimize.className = `icon-${Opened ? "up" : "down"}-16x16`
            Banner.style.display = Opened ? "" : "none"
            Section.style.display = Opened ? "" : "none"
        }

        Header.getElementsByTagName("h2")[0].addEventListener("click", Click)
        Minimize.addEventListener("click", Click)

        const Tooltip = Header.getElementsByClassName("tooltip-container")[0]
        if (Tooltip) Header.insertBefore(Minimize, Tooltip)
        else Header.appendChild(Minimize)
    }

    setTimeout(async function(){
        WaitForId("running-game-instances-container").then(function(Container){
            const Observer = ChildAdded(Container, true, function(Item){
                if (Item.id === "rbx-private-servers"){
                    ModifyPrivateServersList(Item)
                    Observer.disconnect()
                }
            })
        })

        WaitForId("private-server-container-about-tab").then(function(Container){
            const Observer = ChildAdded(Container, true, function(Item){
                if (Item.id === "rbx-private-servers"){
                    ModifyPrivateServersList(Item)
                    Observer.disconnect()
                }
            })
        })
    }, 0)
})