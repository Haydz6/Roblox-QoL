async function LoadCSS(){
    const Link = document.createElement("link")
    Link.href = chrome.runtime.getURL("css/filters.css")
    Link.type = "text/css"
    Link.rel = "stylesheet"

    while (!document.head) await sleep(100)

    document.head.appendChild(Link)
}

let FilterListOpen = false
let FilterList

function UpdateFilterListVisibility(){
    FilterList.style = `display:${FilterListOpen && "block" || "none"};`
}

async function HandleMapRegion(){
    const Button = CreateFilterButton("Region Map")

    const GlobeDiv = document.createElement("div")
    GlobeDiv.className = "filter-globe"
    GlobeDiv.style = "display:none;"
    FilterList.appendChild(GlobeDiv)

    const colorInterpolator = t => `rgba(255,100,50,${Math.sqrt(1-t)})`;

    await import(chrome.runtime.getURL("js/modules/globe.js"))

    const World = Globe()
    .globeImageUrl(chrome.runtime.getURL("img/filters/world.png"))
    //.ringsData(gData)
    .ringColor(() => colorInterpolator)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagationSpeed')
    .ringRepeatPeriod('repeatPeriod')
    .width(575)
    .height(450)
    .backgroundColor('rgba(255, 165, 0, 0)')
    .showAtmosphere(false)
    (GlobeDiv)

    let IsHovering = false

    const WorldContainer = GlobeDiv.getElementsByTagName("div")[0].getElementsByTagName("div")[0].getElementsByTagName("div")[0]
    const WorldElements = WorldContainer.getElementsByTagName("div")[2]
    const WorldCanvas = WorldContainer.getElementsByTagName("canvas")[0]

    const Controls = World.controls()

    Controls.zoomSpeed = 3
    Controls.minZoom = 0.25
    Controls.maxZoom = 0.4
    Controls.minDistance = 0.25
    Controls.miaxDistance = 0.4
    Controls.autoRotate = true
    Controls.autoRotateSpeed = 1
    Controls.update()

    GlobeDiv.addEventListener("mouseenter", function(){
        IsHovering = true
        Controls.autoRotate = false
     })

    GlobeDiv.addEventListener("mouseleave", function(){
        IsHovering = false
        Controls.autoRotate = true
    })

    WorldCanvas.style["border-radius"] = "12px"

    let Fetched = false
    let IsFetching = false

    let Open = false

    function UpdateVisiblity(){
        GlobeDiv.style = `display:${Open && "block" || "none"};`
    }

    async function FetchGlobeData(){
        if (Fetched || IsFetching) return

        IsFetching = true
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Servers+"regions", "POST", undefined, JSON.stringify({PlaceId: await GetPlaceIdFromGamePage()}))
        IsFetching = false

        if (!Success) {
            return
        }

        Fetched = true

        const GlobeData = []

        for (let i = 0; i < Result.length; i++){
            const Region = Result[i]

            const Info = CreateInfoDiv()
            CreateHeaderAndValueForHover(Info, Region.Region, `Server${Region.Count > 1 && "s" || ""}: `+Region.Count)

            Region.element = Info
            Info.className = "filter-globe-serverinfo hidden"
            WorldElements.appendChild(Info)

            GlobeData.push({
                lat: Region.Lat,
                lng: Region.Lng,
                count: Region.Count,
                region: Region.Region,
                element: Info,
                maxR: 1,
                size: 10,
                propagationSpeed: 0.25,
                repeatPeriod: 1000
            })
        }

        World.tilesData(GlobeData)
        .tileWidth(5)
        .tileHeight(3)
        .tileMaterial({opacity: 0})
        .onTileHover(function(Tile, PreviousTile){
            if (PreviousTile){
                PreviousTile.element.className = "filter-globe-serverinfo hidden"
            }
            if (Tile){
                Tile.element.className = "filter-globe-serverinfo visible"
            }
        })
        .onTileClick(function(Tile){
            FilterListOpen = false
            UpdateFilterListVisibility()

            EnableRegionFilter(Tile.region)

            Open = false
            UpdateVisiblity()
        })

        // World.htmlElementsData(GlobeData)
        // .htmlElement(Region => {
        //     const Info = CreateInfoDiv()
        //     CreateHeaderAndValueForHover(Info, Region.region, "Servers: "+Region.count)

        //     Region.element = Info
        //     Info.className = "filter-globe-serverinfo hidden"

        //     return Info
        // })

        function UpdateElements(){
            for (let i = 0; i < GlobeData.length; i++){
                const Region = GlobeData[i]

                const {x,y} = World.getScreenCoords(Region.lat, Region.lng)
                Region.element.style = `top: ${y-75}px; left: ${x-75}px;`
            }


            if (!IsHovering) Controls.update()

            window.requestAnimationFrame(UpdateElements)
        }
        window.requestAnimationFrame(UpdateElements)

        World.ringsData(GlobeData)
    }

    // Button.addEventListener("mouseenter", function(){
    //     FetchGlobeData()
    //     GlobeDiv.style = "display:block;"
    // })

    // Button.addEventListener("mouseleave", function(){
    //     FetchGlobeData()
    //     GlobeDiv.style = "display:none;"
    // })

    Button.addEventListener("click", function(){
        Open = !Open
        UpdateVisiblity()
        FetchGlobeData()
    })

    return Button
}

function CreateMaxPlayersFilter(){
    const [Container, Input, Button] = CreateFilterPlayerCountBox()
    const OpenButton = CreateFilterButton("Max Players")

    let Open = false

    function UpdateVisiblity(){
        Container.style = `display:${Open && "block" || "none"};`
    }

    OpenButton.addEventListener("click", function(){
        Open = !Open
        UpdateVisiblity()
    })

    Button.addEventListener("click", function(){
        Open = false
        UpdateVisiblity()

        FilterListOpen = false
        UpdateFilterListVisibility()

        const MaxPlayers = parseInt(Input.value)

        if (!MaxPlayers) return

        EnableMaxPlayerCount(MaxPlayers)
    })

    UpdateVisiblity()

    FilterList.appendChild(OpenButton)
    FilterList.appendChild(Container)
}

function CreateGeneralButtons(){
    const AvailableButton = CreateFilterButton("Available Room")

    AvailableButton.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableAvailableSpaces()
    })

    const SmallestButton = CreateFilterButton("Smallest Servers")

    SmallestButton.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableSmallestServer()
    })

    const BestServer = CreateFilterButton("Best Connection")

    BestServer.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableBestConnection()
    })

    const OldestServer = CreateFilterButton("Oldest Servers")

    OldestServer.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableServerAge(true)
    })


    const NewestServer = CreateFilterButton("Newest Servers")

    NewestServer.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableServerAge(false)
    })

    const RandomServer = CreateFilterButton("Random Servers")

    RandomServer.addEventListener("click", function(){
        FilterListOpen = false
        UpdateFilterListVisibility()

        EnableRandomServers()
    })

    FilterList.appendChild(AvailableButton)
    FilterList.appendChild(SmallestButton)
    FilterList.appendChild(BestServer)
    FilterList.appendChild(NewestServer)
    FilterList.appendChild(OldestServer)
    FilterList.appendChild(RandomServer)
}

async function HandleFilterClick(Container, FilterButton){
    FilterList = CreateFilterList()
    
    FilterButton.addEventListener("click", function(){
        FilterListOpen = !FilterListOpen
        UpdateFilterListVisibility()
    })

    FilterList.appendChild((await HandleMapRegion()))
    CreateGeneralButtons()
    CreateMaxPlayersFilter()

    Container.appendChild(FilterList)
    WaitForId("roproServerFiltersButton").then(function(Button){
        Button.style.display = "none" //Turning off ropro filter settings keeps the button for some odd reason?
    })
}

async function RunFiltersMain(){
    LoadCSS()

    let ServerListHeader

    while (!ServerListHeader){
        const ServerList = await WaitForId("rbx-running-games")
        ServerListHeader = ServerList.getElementsByTagName("div")[0]?.getElementsByTagName("div")[0]
        
        await sleep(100)
    }

    const Container = document.createElement("div")
    Container.className = "rbx-filter"

    const FilterButton = CreateFiltersButton()
    const RefreshButton = ServerListHeader.getElementsByTagName("button")[0]
    RefreshButton.style = "margin-left:16px;"

    ServerListHeader.insertBefore(Container, RefreshButton)
    Container.appendChild(FilterButton)

    HandleFilterClick(Container, FilterButton)
}