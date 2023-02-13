let LoadMoreServersButton
let DefaultLoadMoreServersButton
let ClearFiltersButton
let HiddenRefreshButton
let RefreshButtonConn

let FilterInt = 0
let FirstEightServerElements = []

async function GetImageUrlsFromServer(Servers){
    const Batch = []
    const JobIdToServer = {}

    for (let i = 0; i < Servers.length; i++){
        const Server = Servers[i]
        const FriendTokens = []

        for (let i = 0; i < Server.players.length; i++){
            FriendTokens.push(Server.players[i].playerToken)
        }

        const Tokens = FriendTokens.concat(Server.playerTokens)

        JobIdToServer[Server.id] = Server

        for (let i = 0; i < Tokens.length-FriendTokens.length; i++){
            const Token = Tokens[i]

            Batch.push({
                requestId: `${Server.id}/${Token}`,
                token: Token,
                type: "AvatarHeadShot",
                size: "150x150",
                format: "PNG",
                isCircular: true
            })
        }
    }

    const Chunks = SplitArrayIntoChunks(Batch, 100)
    const AllPromises = []

    for (let i = 0; i < Chunks.length; i++){
        AllPromises.push(new Promise(async(resolve) => {
            const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", undefined, JSON.stringify(Chunks[i]), true)

            if (!Success){
                resolve()
                return
            }

            const Data = Result.data

            for (let i = 0; i < Data.length; i++){
                const Item = Data[i]

                //if (Item.state !== "Completed") continue

                const requestId = Item.requestId.split("/")
                const JobId = requestId[0]
                const Token = requestId[1]

                const Server = JobIdToServer[JobId]

                if (!Server.ImageUrls) Server.ImageUrls = []
                Server.ImageUrls.push({imageUrl: Item.imageUrl, token: Token})
            }
            resolve()
        }))
    }

    await Promise.all(AllPromises)
}

async function CreateServersFromRobloxServers(Servers){
    if (Servers.length === 0) return

    await GetImageUrlsFromServer(Servers)

    const PlaceId = await GetPlaceIdFromGamePage()
    const ServerList = await WaitForId("rbx-game-server-item-container")

    const Elements = []

    for (let i = 0; i < Servers.length; i++){
        const Element = await CreateServerBox(Servers[i], PlaceId)
        Elements.push(Element)

        ServerList.appendChild(Element)
    }

    return Elements
}

async function ReplaceLoadMoreServersButton(){
    const OldLoadMoreButton = FindFirstClass("rbx-running-games-load-more btn-control-md btn-full-width")
    const Parent = (await WaitForClass("rbx-running-games-footer"))
    
    if (OldLoadMoreButton){
        if (!DefaultLoadMoreServersButton){
            DefaultLoadMoreServersButton = OldLoadMoreButton
            OldLoadMoreButton.style = "display:none;"
        } else if (DefaultLoadMoreServersButton !== OldLoadMoreButton) {
            OldLoadMoreButton.remove()
        } else {
            OldLoadMoreButton.style = "display:none;"
        }
    }

    const Button = document.createElement("button")
    Button.type = "button"
    Button.className = "rbx-running-games-load-more btn-control-md btn-full-width"
    Button.innerText = "Load More"
    
    Parent.appendChild(Button)

    LoadMoreServersButton = Button

    return Button
}

function EnableFilterMode(){
    WaitForId("rbx-running-games").then(function(ServerList){
        const Options = ServerList.getElementsByClassName("container-header")[0].getElementsByClassName("server-list-container-header")[0]
        
        const children = Options.children

        for (let i = 0; i < children.length; i++){
            const child = children[i]

            if (child.innerText === "Refresh" && child.className === "btn-more rbx-refresh refresh-link-icon btn-control-xs btn-min-width"){
                HiddenRefreshButton = child
                child.style = "display:none;"
                break
            }
        }

        if (!ClearFiltersButton){
            ClearFiltersButton = CreateClearFiltersButton()
            ClearFiltersButton.addEventListener("click", DisableFilter)
            Options.appendChild(ClearFiltersButton)
        }
    })

    WaitForClass("server-list-options").then(function(Options){
        Options.style = "display:none;"
    })

    WaitForId("rbx-game-server-item-container").then(function(Servers){
        const children = Servers.children

        for (let i = 0; i < children.length; i++){
            FirstEightServerElements.push(children[i])
            children[i].parentElement = null
        }

        ClearAllChildren(Servers)
    })
}

function SetButtonLoadingState(Enabled){
    if (!LoadMoreServersButton) return

    if (!Enabled) LoadMoreServersButton.setAttribute("disabled", "")
    else LoadMoreServersButton.removeAttribute("disabled")
}

async function EnableAvailableSpaces(){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    EnableFilterMode()

    console.log("button wait.")
    await ReplaceLoadMoreServersButton()
    console.log("button gone.")

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor, false, true, 10)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null
        
        const Elements = await CreateServersFromRobloxServers(Result.data)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        //if (ServersFetched < 8 || Result.data.length === 0) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function EnableMaxPlayerCount(PlayerCount){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    const DuplicateJobIds = {}

    EnableFilterMode()

    await ReplaceLoadMoreServersButton()

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null

        const Servers = []
        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            const Server = Data[i]

            if (Server.playing <= PlayerCount){
                if (DuplicateJobIds[Server.id]) continue
                DuplicateJobIds[Server.id] = true

                Servers.push(Server)
                ServersFetched ++
            }
        }
        
        const Elements = await CreateServersFromRobloxServers(Servers)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        if (ServersFetched < 8 || Servers.length === 0) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function EnableServerAge(Oldest){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    EnableFilterMode()

    await ReplaceLoadMoreServersButton()

    const AllServers = []
    const DuplicateJobIds = {}

    function SortServerElements(){
        AllServers.sort(function(a, b){
            if (Oldest) return a.CreatedTimestamp - b.CreatedTimestamp
            else return b.CreatedTimestamp - a.CreatedTimestamp
        })

        WaitForId("rbx-game-server-item-container").then(function(ServerList){
            for (let i = 0; i < AllServers.length; i++){
                const Server = AllServers[i]
    
                ServerList.appendChild(Server.element)
            }
        })
    }

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null

        const JobIds = []
        const JobIdToServer = {}
        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            if (DuplicateJobIds[Data[i].id]) continue
            DuplicateJobIds[Data[i].id] = true

            JobIds.push(Data[i].id)
            JobIdToServer[Data[i].id] = Data[i]
        }

        const [RegionSuccess, RegionResult] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: await GetPlaceIdFromGamePage(), JobIds: JobIds}))

        if (CacheFilterInt != FilterInt) return

        if (!RegionSuccess){
            SetButtonLoadingState(true)
            return
        }

        const RegionServers = []

        for (let i = 0; i < RegionResult.length; i++){
            const RegionInfo = RegionResult[i]

            const Server = JobIdToServer[RegionInfo.JobId]
            Server.CreatedTimestamp = RegionInfo.CreatedTimestamp
            Server.Region = RegionInfo.Region
            Server.Version = RegionInfo.Version

            RegionServers.push(Server)
            AllServers.push(Server)

            ServersFetched++
        }
        
        const Elements = await CreateServersFromRobloxServers(RegionServers)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        for (let i = 0; i < Elements.length; i++){
            const Element = Elements[i]
            JobIdToServer[Element.getAttribute("jobid")].element = Element
        }

        SortServerElements()

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        //if (ServersFetched < 8 || RegionServers.length === 0) Fetch()
        if (ServersFetched < 1000) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function EnableRandomServers(){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    EnableFilterMode()

    await ReplaceLoadMoreServersButton()

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null

        const Servers = Result.data

        Servers.sort(function(){
            return (Math.random() * 2)-1
        })
        
        const Elements = await CreateServersFromRobloxServers(Servers)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        if (ServersFetched < 500) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function EnableSmallestServer(){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    EnableFilterMode()

    console.log("button wait.")
    await ReplaceLoadMoreServersButton()
    console.log("button gone.")

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor, true, false)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null
        
        const Elements = await CreateServersFromRobloxServers(Result.data)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

function DistanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

async function EnableBestConnection(){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0

    EnableFilterMode()

    await ReplaceLoadMoreServersButton()

    const AllServers = []

    function SortServerElements(){
        AllServers.sort(function(a, b){
            return a.Distance - b.Distance
        })

        WaitForId("rbx-game-server-item-container").then(function(ServerList){
            for (let i = 0; i < AllServers.length; i++){
                const Server = AllServers[i]
    
                ServerList.appendChild(Server.element)
            }
        })
    }

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        // const GotPermission = await chrome.runtime.sendMessage({type: "gpscoords"})

        // if (!GotPermission){
        //     SetButtonLoadingState(true)
        //     return
        // }

        FilterInt ++
        const CacheFilterInt = FilterInt

        let Lat, Lng, Err

        navigator.geolocation.getCurrentPosition(function(Position){
            Lat = Position.coords.latitude
            Lng = Position.coords.longitude
        }, function(Error){
            Err = Error.message
        }, {maximumAge: 86400, timeout: 60*1000, enableHighAccuracy: false})

        while (!Lat && !Lng && !Err){
            await sleep(100)
        }

        if (Err){
            SetButtonLoadingState(true)
            console.log(Err)
            return
        }

        if (CacheFilterInt != FilterInt) return

        const [Success, Result] = await GetRobloxServers(Cursor)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null

        const JobIds = []
        const JobIdToServer = {}
        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            JobIds.push(Data[i].id)
            JobIdToServer[Data[i].id] = Data[i]
        }

        const [RegionSuccess, RegionResult] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: await GetPlaceIdFromGamePage(), JobIds: JobIds, IncludeCoordinates: true}))

        if (CacheFilterInt != FilterInt) return

        if (!RegionSuccess){
            SetButtonLoadingState(true)
            return
        }

        const RegionServers = []

        for (let i = 0; i < RegionResult.length; i++){
            const RegionInfo = RegionResult[i]
            const Coordinates = RegionInfo.Coordinates

            const Server = JobIdToServer[RegionInfo.JobId]
            Server.CreatedTimestamp = RegionInfo.CreatedTimestamp
            Server.Region = RegionInfo.Region
            Server.Version = RegionInfo.Version
            Server.Coordinates = Coordinates
            Server.Distance = Coordinates && DistanceBetweenCoordinates(Coordinates.Lat, Coordinates.Lng, Lat, Lng) || 999999999999

            RegionServers.push(Server)
            AllServers.push(Server)

            ServersFetched++
        }
        
        const Elements = await CreateServersFromRobloxServers(RegionServers)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        for (let i = 0; i < Elements.length; i++){
            const Element = Elements[i]
            JobIdToServer[Element.getAttribute("jobid")].element = Element
        }

        SortServerElements()

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        //if (ServersFetched < 8 || RegionServers.length === 0) Fetch()
        if (ServersFetched < 1000) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function EnableRegionFilter(Region){
    let Cursor = ""
    let AtEnd = false
    let ServersFetched = 0
    const DuplicateJobIds = {}

    EnableFilterMode()

    await ReplaceLoadMoreServersButton()

    async function Fetch(){
        if (AtEnd) return
        
        SetButtonLoadingState(false)

        FilterInt ++
        const CacheFilterInt = FilterInt

        const [Success, Result] = await GetRobloxServers(Cursor)

        if (CacheFilterInt != FilterInt) return

        if (!Success){
            SetButtonLoadingState(true)
            return
        }

        Cursor = Result.nextPageCursor
        AtEnd = Cursor == null

        const JobIds = []
        const JobIdToServer = {}
        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            if (DuplicateJobIds[Data[i].id]) continue
            DuplicateJobIds[Data[i].id] = true

            JobIds.push(Data[i].id)
            JobIdToServer[Data[i].id] = Data[i]
        }

        const [RegionSuccess, RegionResult] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: await GetPlaceIdFromGamePage(), JobIds: JobIds}))

        if (CacheFilterInt != FilterInt) return

        if (!RegionSuccess){
            SetButtonLoadingState(true)
            return
        }

        const RegionServers = []

        for (let i = 0; i < RegionResult.length; i++){
            const RegionInfo = RegionResult[i]

            if (RegionInfo.Region !== Region) continue

            const Server = JobIdToServer[RegionInfo.JobId]
            Server.CreatedTimestamp = RegionInfo.CreatedTimestamp
            Server.Region = RegionInfo.Region
            Server.Version = RegionInfo.Version

            RegionServers.push(Server)
            ServersFetched++
        }
        
        const Elements = await CreateServersFromRobloxServers(RegionServers)

        if (CacheFilterInt != FilterInt){
            for (let i = 0; i < Elements.length; i++){
                Elements[i].remove()
            }
            return
        }

        if (AtEnd){
            if (LoadMoreServersButton) LoadMoreServersButton.remove()
        } else {
            SetButtonLoadingState(true)
        }

        if (ServersFetched < 8 || RegionServers.length === 0) Fetch()
    }

    LoadMoreServersButton.addEventListener("click", Fetch)
    Fetch()
}

async function DisableFilter(){
    // WaitForClass("btn-more rbx-refresh refresh-link-icon btn-control-xs btn-min-width").then(function(RefreshButton){
    //     RefreshButton.style = ""
    // })
    FilterInt ++

    WaitForClass("server-list-options").then(function(Options){
        Options.style = ""
    })
    WaitForId("rbx-game-server-item-container").then(function(Servers){
        ClearAllChildren(Servers)

        if (HiddenRefreshButton){
            for (let i = 0; i < FirstEightServerElements.length; i++){
                Servers.appendChild(FirstEightServerElements[i])
            }
            FirstEightServerElements = []
    
            HiddenRefreshButton.style = "margin-left: 16px;"
        }
    })

    if (ClearFiltersButton){
        ClearFiltersButton.remove()
        ClearFiltersButton = null
    }

    if (DefaultLoadMoreServersButton){
        DefaultLoadMoreServersButton.style = ""
    }
    if (LoadMoreServersButton) LoadMoreServersButton.remove()

    if (HiddenRefreshButton){
        HiddenRefreshButton.click()
    }

    // if (RefreshButtonConn) HiddenRefreshButton.removeEventListener("click", RefreshButtonConn)

    // let Cursor = ""
    // let AtEnd = false

    // async function Fetch(){
    //     if (AtEnd) return

    //     SetButtonLoadingState(false)

    //     FilterInt ++
    //     const CacheFilterInt = FilterInt

    //     const [Success, Result] = await GetRobloxServers(Cursor, false, false, 10)

    //     if (CacheFilterInt != FilterInt) return

    //     SetButtonLoadingState(true)

    //     if (!Success) return

    //     Cursor = Result.nextPageCursor
    //     AtEnd = Cursor == null

    //     if (AtEnd){
    //         if (LoadMoreServersButton) LoadMoreServersButton.remove()
    //     }

    //     const Elements = await CreateServersFromRobloxServers(Result.data)

    //     if (CacheFilterInt != FilterInt){
    //         for (let i = 0; i < Elements.length; i++){
    //             Elements[i].remove()
    //         }
    //         return
    //     }
    // }

    // async function Refresh(){
    //     Cursor = ""

    //     const Servers = await WaitForId("rbx-game-server-item-container")
    //     ClearAllChildren(Servers)

    //     Fetch()
    // }

    // HiddenRefreshButton.addEventListener("click", Refresh)
    // RefreshButtonConn = Refresh

    // const LoadMoreServersButton = await ReplaceLoadMoreServersButton()
    // LoadMoreServersButton.addEventListener("click", Fetch)

    // Fetch()
}