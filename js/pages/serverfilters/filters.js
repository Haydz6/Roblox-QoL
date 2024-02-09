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

    const Tooltip = CreateInfoDiv()
    const [TooltipHeader, TooltipValue] = CreateHeaderAndValueForHover(Tooltip, "", "")

    Tooltip.className = "filter-globe-serverinfo"
    Tooltip.style.display = "none"
    Tooltip.style.pointerEvents = "none"
    GlobeDiv.appendChild(Tooltip)

    let World
    let WorldCanvas
    let IsHovering = false
    let planetaryjs = CreatePlanetaryJS(undefined, undefined, window)

    GlobeDiv.addEventListener("mouseenter", function(){
        if (World) World.plugins.autorotate.pause()
        IsHovering = true
    })

   GlobeDiv.addEventListener("mouseleave", function(){
        if (World) World.plugins.autorotate.resume()
        IsHovering = false
        Tooltip.style.display = "none"
    })

    let GlobeConfig
    const Colors = {dark: {oceans: "#354060", land: "#1b1f2b", borders: "#5f6061"}, light: {oceans: "#8ab4f8", land: "#bbe2c6", borders: "#64686b"}}
    let ActiveColor = Colors.dark

    function UpdateGlobeColors(){
        ActiveColor = document.body.className.includes("light-theme") ? Colors.light : Colors.dark

        if (GlobeConfig){
            GlobeConfig.oceans.fill = ActiveColor.oceans
            GlobeConfig.lakes.fill = ActiveColor.oceans
            GlobeConfig.land.fill = ActiveColor.land
            GlobeConfig.borders.stroke = ActiveColor.borders
        }
    }
    new MutationObserver(UpdateGlobeColors).observe(document.body, {attributeFilter: ["class"]})
    UpdateGlobeColors()

    function CreateGlobe(){
        if (World) return

        WorldCanvas = document.createElement("canvas")
        WorldCanvas.id = "region-globe"
        WorldCanvas.style = "height: 100%; width: 100%;"
        WorldCanvas.setAttribute("height", "500px")
        WorldCanvas.setAttribute("width", "500px")

        GlobeDiv.appendChild(WorldCanvas)

        globe = planetaryjs.planet()
        World = globe

        function autorotate(degPerSec) {
            // Planetary.js plugins are functions that take a `planet` instance
            // as an argument...
            return function(planet) {
              var lastTick = null;
              planet.plugins.autorotate = {
                paused: IsHovering,
                pause:  function() { planet.plugins.autorotate.paused = true;  },
                resume: function() { planet.plugins.autorotate.paused = false; }
              };
              // ...and configure hooks into certain pieces of its lifecycle.
              planet.onDraw(function() {
                if (planet.plugins.autorotate.paused || !lastTick) {
                  lastTick = new Date();
                } else {
                  var now = new Date();
                  var delta = now - lastTick;
                  // This plugin uses the built-in projection (provided by D3)
                  // to rotate the globe each time we draw it.
                  var rotation = planet.projection.rotate();
                  rotation[0] += degPerSec * delta / 1000;
                  if (rotation[0] >= 180) rotation[0] -= 360;
                  planet.projection.rotate(rotation);
                  lastTick = now;
                }
              });
            };
          };

          function lakes(options) {
            options = options || {};
            var lakes = null;
        
            return function(planet) {
              planet.onInit(function() {
                // We can access the data loaded from the TopoJSON plugin
                // on its namespace on `planet.plugins`. We're loading a custom
                // TopoJSON file with an object called "ne_110m_lakes".
                var world = planet.plugins.topojson.world;
                lakes = topojson.feature(world, world.objects.ne_110m_lakes);
              });
        
              planet.onDraw(function() {
                planet.withSavedContext(function(context) {
                  context.beginPath();
                  planet.path.context(context)(lakes);
                  context.fillStyle = options.fill || 'black';
                  context.fill();
                });
              });
            };
          };


        LoadLocalFile(chrome.runtime.getURL("js/modules/world.json")).then(function(WorldData){
            GlobeConfig = {
                topojson: {world: JSON.parse(WorldData)},
                oceans:   { fill:   ActiveColor.oceans },
                land:     { fill:   ActiveColor.land },
                borders:  { stroke: ActiveColor.borders },
                lakes:    { fill: ActiveColor.oceans }
            }

            globe.loadPlugin(planetaryjs.plugins.earth(GlobeConfig))
            globe.loadPlugin(lakes(GlobeConfig.lakes))

            globe.loadPlugin(planetaryjs.plugins.zoom({
                scaleExtent: [200, 700]
              }));
              globe.loadPlugin(planetaryjs.plugins.drag({
                // Dragging the globe should pause the
                // automatic rotation until we release the mouse.
                onDragStart: function() {
                    WorldCanvas.style.cursor = "grabbing"
                  this.plugins.autorotate.pause();
                },
                onDragEnd: function() {
                    WorldCanvas.style.cursor = "grab"
                  if (!IsHovering) this.plugins.autorotate.resume();
                }
              }))
              globe.loadPlugin(planetaryjs.plugins.pings());

            globe.projection.scale(250).translate([250, 250]).rotate([0, -10, 0]);
            globe.loadPlugin(autorotate(10))

            globe.draw(WorldCanvas)
        }).catch()

        WorldCanvas.style["border-radius"] = "12px"
    }

    let Fetched = false
    let IsFetching = false

    let Open = false

    function UpdateVisiblity(){
        if (WorldCanvas) WorldCanvas.style.cursor = "grab"
        
        Tooltip.style.display = "none"
        GlobeDiv.style = `display:${Open && "block" || "none"};`
    }

    async function FetchGlobeData(){
        if (Fetched || IsFetching) return

        CreateGlobe()

        IsFetching = true
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Servers+"regions", "POST", undefined, JSON.stringify({PlaceId: await GetPlaceIdFromGamePage()}))
        IsFetching = false

        if (!Success) {
            return
        }

        Fetched = true

        //const GlobeData = []

        for (let i = 0; i < Result.length; i++){
            const Region = Result[i]

            const Lat = Region.Lat
            const Lng = Region.Lng
            const Config = {color: "#3c89e7", ttl: 2000, angle: 3.5}
            
            setInterval(function(){
                globe.plugins.pings.add(Lng, Lat, Config)
            }, 350)
        }

        function GetClosestRegion(Lat, Lng){
            let ClosestDistance = 99999999
            let ClosestRegion

            for (let i = 0; i < Result.length; i++){
                const Region = Result[i]

                const Distance = DistanceBetweenCoordinates(Lat, Lng, Region.Lat, Region.Lng)
                if (Distance < ClosestDistance){
                    ClosestDistance = Distance
                    ClosestRegion = Region
                }
            }

            return [ClosestDistance, ClosestRegion]
        }

        let MouseDownRegion
        d3.select("#region-globe").on("mousedown.log", function(){
            const Mouse = d3.mouse(this)
            const Vector = globe.projection.invert(Mouse)
            const [Distance, Region] = GetClosestRegion(Vector[1], Vector[0])

            if (Distance < 325){
                MouseDownRegion = Region
            }
        })

        d3.select("#region-globe").on("click.log", function(){
            const Mouse = d3.mouse(this)
            const Vector = globe.projection.invert(Mouse)
            const [Distance, Region] = GetClosestRegion(Vector[1], Vector[0])

            if (Distance < 325 && MouseDownRegion === Region){
                FilterListOpen = false
                UpdateFilterListVisibility()

                EnableRegionFilter(Region.Region)

                Open = false
                UpdateVisiblity()
            }
            MouseDownRegion = undefined
        })

        d3.select("#region-globe").on("mousemove.log", function(){
            const Mouse = d3.mouse(this)
            const Vector = globe.projection.invert(Mouse)
            const [Distance, Region] = GetClosestRegion(Vector[1], Vector[0])

            if (Distance < 325){
                TooltipHeader.innerText = Region.Region
                TooltipValue.innerText = `Servers: ${Region.Count}`
                Tooltip.style.display = ""
                Tooltip.style.top = Mouse[1] - Tooltip.offsetHeight - 5 + "px"
                Tooltip.style.left = Mouse[0] - Tooltip.offsetWidth/2 + "px"

                WorldCanvas.style.cursor = "pointer"
            } else {
                Tooltip.style.display = "none"
            }
        })
        
        // for (let i = 0; i < Result.length; i++){
        //     const Region = Result[i]

        //     const Info = CreateInfoDiv()
        //     CreateHeaderAndValueForHover(Info, Region.Region, `Server${Region.Count > 1 && "s" || ""}: `+Region.Count)

        //     Region.element = Info
        //     Info.className = "filter-globe-serverinfo hidden"
        //     WorldElements.appendChild(Info)

        //     GlobeData.push({
        //         lat: Region.Lat,
        //         lng: Region.Lng,
        //         count: Region.Count,
        //         region: Region.Region,
        //         element: Info,
        //         maxR: 1,
        //         size: 10,
        //         propagationSpeed: 0.25,
        //         repeatPeriod: 1000
        //     })
        // }

        // World.tilesData(GlobeData)
        // .tileWidth(5)
        // .tileHeight(3)
        // .tileMaterial({opacity: 0})
        // .onTileHover(function(Tile, PreviousTile){
        //     if (PreviousTile){
        //         PreviousTile.element.className = "filter-globe-serverinfo hidden"
        //     }
        //     if (Tile){
        //         Tile.element.className = "filter-globe-serverinfo visible"
        //     }
        // })
        // .onTileClick(function(Tile){
        //     FilterListOpen = false
        //     UpdateFilterListVisibility()

        //     EnableRegionFilter(Tile.region)

        //     Open = false
        //     UpdateVisiblity()
        // })

        // // World.htmlElementsData(GlobeData)
        // // .htmlElement(Region => {
        // //     const Info = CreateInfoDiv()
        // //     CreateHeaderAndValueForHover(Info, Region.region, "Servers: "+Region.count)

        // //     Region.element = Info
        // //     Info.className = "filter-globe-serverinfo hidden"

        // //     return Info
        // // })

        // function UpdateElements(){
        //     for (let i = 0; i < GlobeData.length; i++){
        //         const Region = GlobeData[i]

        //         const {x,y} = World.getScreenCoords(Region.lat, Region.lng)
        //         Region.element.style = `top: ${y-75}px; left: ${x-75}px;`
        //     }


        //     if (!IsHovering) Controls.update()

        //     window.requestAnimationFrame(UpdateElements)
        // }
        // window.requestAnimationFrame(UpdateElements)

        // World.ringsData(GlobeData)
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
        //Button.style.display = "none" //Turning off ropro filter settings keeps the button for some odd reason? Old behaviour, both should show side by side.
        function Reset(){
            Button.style.right = "220px"
        }

        new MutationObserver(function(){
            if (Button.style.right !== "220px") Reset()
        }).observe(Button, {attributeFilter: ["style"]})
        Reset()
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