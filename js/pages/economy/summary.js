const ListenToTimeChange = []

function GetTableRow(TBody, Name){
    const children = TBody.children
    for (let i = 0; i < children.length; i++){
        const child = children[i]

        if (child.children[0]?.innerText == Name) return child
    }
}

async function WaitForTableRow(TBody, Name){
    while (true){
        const Row = GetTableRow(TBody, Name)

        if (Row) return Row
        await sleep(100)
    }
}

function CreateGroupItem(Group, BackgroundColor){
    const href = `https://roblox.com/${Group.Type == "Group" && "group" || Group.Type == "Place" && "games" || Group.Type == "GamePass" && "game-pass" || Group.Type == "User" && "users" || Group.Type == "Asset" && "catalog"}/${Group.Type == "Place" && Group.Place.placeId || Group.Id}/${Group.Type == "User" && "profile" || "-"}`

    const Container = document.createElement("div")
    Container.style = BackgroundColor+"padding: 9px; height: 62px; display: flex; align-items: center;"

    const Headshot = document.createElement("div")
    Headshot.className = "avatar avatar-headshot-xs group-icon"
    Headshot.style = "float: left; flex-shrink: 0; margin-right: 12px;"

    const AvatarCardLink = document.createElement(Group.Type != "DeveloperProduct" && "a" || "span")
    AvatarCardLink.className = "avatar-card-link"
    AvatarCardLink.href = href

    const Thumbnail2DContainer = document.createElement("span")
    Thumbnail2DContainer.className = "thumbnail-2d-container"

    const Img = document.createElement("img")
    Img.src = Group.Icon || "https://create.roblox.com/assets/thumbnails/broken.svg"

    Thumbnail2DContainer.appendChild(Img)
    AvatarCardLink.appendChild(Thumbnail2DContainer)
    Headshot.appendChild(AvatarCardLink)

    const AvatarCardCaption = document.createElement("div")
    AvatarCardCaption.className = "avatar-card-caption"
    AvatarCardCaption.style = "width: calc(100% - 44px);"

    const AvatarCardName = document.createElement(Group.Type != "DeveloperProduct" && "a" || "span")
    AvatarCardName.className = `avatar-card-name ${Group.Type != "DeveloperProduct" && "text-name" || ""} text-overflow`
    AvatarCardName.href = href
    AvatarCardName.innerText = Group.Name

    AvatarCardCaption.appendChild(AvatarCardName)

    const RobuxContainer = document.createElement("td")
    RobuxContainer.style = "display: flex;"
    const IconRobux = document.createElement("span")
    IconRobux.className = "icon-robux-16x16"
    const RobuxLabel = document.createElement("span")
    RobuxLabel.innerText = numberWithCommas(Group.Robux)

    RobuxContainer.append(IconRobux, RobuxLabel)

    Container.append(Headshot, AvatarCardCaption, RobuxContainer)

    return Container
}

async function GetTypeAndIdFromURL(){
    if (!window.location.href.includes("/groups/configure")) return ["users", await GetUserId()]

    const Params = new URLSearchParams(window.location.search)
    return ["groups", parseInt(Params.get("id"))]
}

async function CreateDetailedSummary(TableRow, Fetch, CanFetch, DropdownOptions, Cache, FileUpload, FileTypeParser){
    const Table = TableRow.children[0]
    const RobuxContainer = TableRow.children[1]
    const RobuxLabel = RobuxContainer.children[2]

    const Button = document.createElement("a")

    const Arrow = document.createElement("span")
    Arrow.className = "icon-right-16x16"
    Arrow.style = "margin-left: 10px;"

    Button.innerText = Table.innerText
    Table.innerText = ""
    Button.appendChild(Arrow)

    const PayoutList = document.createElement("div")
    let UploadContainer, UploadButton, UploadLabel

    if (FileUpload){
        [UploadContainer, UploadButton, UploadLabel] = CreateCSVUpload()
        UploadContainer.style.display = "none"
    }

    const ImposterTextLabel = document.createElement("span")
    RobuxContainer.insertBefore(ImposterTextLabel, RobuxLabel)

    Table.appendChild(Button)

    let CurrentOption
    let Dropdown

    let HasFetched = false
    let HasLoaded = false
    let CSVFile

    async function Get(ItemsPromise){
        if (!ItemsPromise && (!CanFetch(CurrentOption) || HasFetched)) return
        HasFetched = true
        HasLoaded = false

        while (PayoutList.firstChild) {
            PayoutList.removeChild(PayoutList.lastChild)
        }
        
        let Items

        const Spinner = document.createElement("div")
        Spinner.className = "spinner spinner-default"
        PayoutList.style.paddingTop = "10px"

        ImposterTextLabel.style.display = "none"
        if (RobuxLabel){
            RobuxLabel.style["text-decoration"] = ""
            RobuxLabel.style["margin-left"] = ""
        }

        PayoutList.appendChild(Spinner)

        if (!ItemsPromise){
            if (Dropdown) Dropdown.style.display = "none"

            const [Success, AlreadyFetched, InnerItems] = await Fetch(CurrentOption)
            HasLoaded = true
            Items = InnerItems

            Spinner.remove()

            if (Success && AlreadyFetched) return
            if (!Success){
                const Label = document.createElement("p")
                Label.innerText = "Failed to load"
                return
            }
        } else {
            await Fetch("Cancel")

            Cache[0]++
            const CurrentCache = Cache[0]

            Items = await ItemsPromise

            if (Cache[0] != CurrentCache){
                return
            }

            if (FileTypeParser) Items = await FileTypeParser(Items, CurrentOption, Cache, CurrentCache)

            if (Cache[0] != CurrentCache){
                return
            }

            if (Items){
                Items.sort(function(a, b){
                    return b.Robux - a.Robux
                })
            }

            let TotalRobux = 0
            for (let i = 0; i < Items.length; i++){
                TotalRobux += Items[i].Robux
            }
            ImposterTextLabel.innerText = numberWithCommas(TotalRobux)
            ImposterTextLabel.style.display = ""

            if (RobuxLabel){
                RobuxLabel.style["text-decoration"] = "line-through"
                RobuxLabel.style["margin-left"] = "8px"
            }

            HasLoaded = true
            Spinner.remove()
        }

        if (!Items) return

        if (Items.length == 0){
            PayoutList.style.paddingTop = ""
        } else {
            PayoutList.style.paddingTop = "10px"
        }

        if (Dropdown) Dropdown.style.display = "revert"
        for (let i = 0; i < Items.length; i++){
            PayoutList.appendChild(CreateGroupItem(Items[i], (i+1)%2 == 1 && "background-color: #393b3d; " || ""))
        }
    }

    let Visible = false
    Button.addEventListener("click", function(){
        Visible = !Visible
        PayoutList.style.display = !Visible && "none" || ""
        RobuxContainer.style.display = Visible && "block" || ""
        if (Dropdown) Dropdown.style.display = (Visible && HasLoaded) && "revert" || "none"
        if (UploadContainer) UploadContainer.style.display = !Visible && "none" || "contents"

        Arrow.className = `icon-${Visible && "down" || "right"}-16x16`

        Get()
    })

    ListenToTimeChange.push(function(){
        HasFetched = false
        if (Visible && !CSVFile) Get()
    })

    if (DropdownOptions){
        CurrentOption = DropdownOptions[0]
        const [DropdownContainer, List, ButtonLabel, Close] = CreateDropdownList(CurrentOption)
        Dropdown = DropdownContainer

        DropdownContainer.style.display = "none"
        DropdownContainer.style.float = ""
        DropdownContainer.style.top = ""

        const Button = DropdownContainer.getElementsByTagName("button")[0]
        Button.style.height = "30px"
        Button.getElementsByClassName("icon-down-16x16")[0].style.marginTop = "2px"
        
        ButtonLabel.style.fontSize = "14px"
        ButtonLabel.style.lineHeight = "20px"
        
        for (let i = 0; i < DropdownOptions.length; i++){
            const Option = DropdownOptions[i]
            const [Container, Button] = CreateDropdownButton(Option)

            Button.addEventListener("click", function(){
                CurrentOption = Option
                ButtonLabel.innerText = Option
                HasFetched = false

                Close()
                Get(CSVFile && FileUpload(CSVFile, CurrentOption))
            })

            List.appendChild(Container)
        }
        Table.appendChild(DropdownContainer)
    }
    if (UploadContainer){
        UploadLabel.addEventListener("click", async function(e){
            if (CSVFile){
                CSVFile = null
                UploadButton.value = null

                HasFetched = false
                UploadLabel.innerText = "Upload CSV Instead"
                e.stopImmediatePropagation()

                await sleep(10)
                UploadLabel.setAttribute("for", "uploadCSV")
                Get()
            }
        })

        UploadButton.addEventListener("change", function(e){
            const TargetFile = e.target.files[0]
            if (!TargetFile) return

            let reader = new FileReader()
            reader.onload = async function(File){
                CSVFile = File.target.result
                HasFetched = false
                UploadLabel.removeAttribute("for")
                UploadLabel.innerText = "Remove CSV"

                Get(FileUpload(CSVFile, CurrentOption))
            }
            reader.readAsText(TargetFile)
        })

        Table.appendChild(UploadContainer)
    }

    Table.appendChild(PayoutList)
}

async function AddIcons(Groups){
    const Chunks = SplitArrayIntoChunks(Groups, 100)

    for (let i = 0; i < Chunks.length; i++){
        const Chunk = Chunks[i]
        const GroupToMap = {}
        const UserToMap = {}

        const Info = []

        for (let i = 0; i < Chunk.length; i++){
            const Group = Chunk[i]

            if (Group.Type == "Group") GroupToMap[Group.Id] = Group
            else UserToMap[Group.Id] = Group
            Info.push({targetId: Group.Id, type: Group.Type == "Group" && "GroupIcon" || Group.Type == "Place" && "GameIcon" || Group.Type == "GamePass" && "GamePass" || Group.Type == "DeveloperProduct" && "DeveloperProduct" || Group.Type == "Asset" && "Asset" || "AvatarHeadShot", requestId: Group.Type, size: "150x150"})
        }

        const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", undefined, JSON.stringify(Info), true)

        if (!Success) continue

        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            const Thumbnail = Data[i]
            ;(Thumbnail.requestId == "Group" && GroupToMap || UserToMap)[Thumbnail.targetId].Icon = Thumbnail.imageUrl
        }
    }
}

async function FetchTranscations(Current, Cache, Type, Time, IncludeCallback){
    const Groups = []
    const GroupsMap = {}
    const Transcations = []

    let Cursor = ""
    let ReachedEnd = false

    const [IdType, Id] = await GetTypeAndIdFromURL()
    const ListCache = FetchCache(IdType, Type, Time)

    const CurrentTime = (new Date().getTime())/1000

    function HandleTransaction(Info){
        if (Info.currency.type !== "Robux" || (IncludeCallback && !IncludeCallback(Info))) return "continue"

        const CurrentDate = new Date(Info.created)
        if (CurrentDate.getTime()/1000 <= CurrentTime-Time){
            ReachedEnd = true
            return "break"
        }

        const IsPlace = Info?.details?.place
        const Id = IsPlace && Info?.details?.place?.universeId || Info.agent.id

        if (!GroupsMap[Id]){
            const Place = Info?.details?.place
            const Group = {Type: IsPlace && "Place" || Info.agent.type, Name: IsPlace && Place.name || Info.agent.name, Id: Id, Robux: 0, Place: IsPlace && Place}
            Groups.push(Group)
            GroupsMap[Group.Id] = Group
        }

        GroupsMap[Id].Robux += Info.currency.amount
        Transcations.push(Info)
    }

    const ToCache = []

    while (true){
        const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v2/${IdType}/${Id}/transactions?cursor=${Cursor}&limit=100&transactionType=${Type}`, "GET", undefined, undefined, true)

        if (!Success){
            return [false]
        }

        const Data = Result.data
        const CurrentFoundIds = {}

        for (let i = 0; i < Data.length; i++){
            const Info = Data[i]

            if (IsIdInCache(IdType, Type, Time, Info.id)){
                for (let o = 0; o < ListCache.List.length; o++){
                    const CacheInfo = ListCache.List[o]

                    if (CurrentFoundIds[CacheInfo.id]) continue

                    const Terminator = HandleTransaction(CacheInfo)
                    if (Terminator == "continue") continue
                    else if (Terminator == "break") break
                }
                ReachedEnd = true
                break
            }

            const Terminator = HandleTransaction(Info)
            ToCache.push(Info)
            CurrentFoundIds[Info.id] = true
            if (Terminator == "continue") continue
            else if (Terminator == "break") break
        }

        if (ReachedEnd) break

        Cursor = Result.nextPageCursor

        if (!Cursor || Current != Cache[0]) break
    }

    if (ReachedEnd){
        for (let i = 0; i < ToCache.length; i++){
            AddToCache(IdType, Type, Time, ToCache[i])
        }
        SortCache(IdType, Type, Time)
        TrimCache(IdType, Type, Time)
        SaveCache(IdType, Type, Time)
    }

    return [true, Groups, Transcations]
}

IsFeatureEnabled("DetailedGroupTranscationSummary").then(async function(Enabled){
    if (!Enabled) return

    let Time = 86400*30
    let GroupPayoutFetchIteration = [0] //0 is current, 1 is cache
    let PremiumPayoutFetchIteration = [0]
    let SalesPayoutFetchIteration = [0]
    let CommissionsFetchIteration = [0]

    const [SummaryType] = await GetTypeAndIdFromURL()

    async function HandleDropdownMenu(Menu){
        let i = 0

        ChildAdded(Menu, true, function(Presentation){
            const Option = Presentation.children[0]
            const NewTime = i == 0 && 1 || i == 1 && 7 || i == 2 && 30 || i == 3 && 365
            i++

            Option.addEventListener("click", function(){
                Time = 86400*NewTime

                GroupPayoutFetchIteration[0]++
                PremiumPayoutFetchIteration[0]++
                SalesPayoutFetchIteration[0]++
                CommissionsFetchIteration[0]++

                for (let o = 0; o < ListenToTimeChange.length; o++){
                    ListenToTimeChange[o](Time)
                }
            })
        })
    }

    if (SummaryType == "groups"){
        WaitForClass("tab-content configure-group-details").then(function(Tab){
            ChildAdded(Tab, true, async function(Child){
                if (Child.nodeType !== Node.ELEMENT_NODE || Child.tagName.toLowerCase() !== "revenue-summary") return

                const Dropdown = await WaitForClassPath(Child, "input-group-btn group-dropdown dropdown")
                const Menu = await WaitForClassPath(Dropdown, "dropdown-menu")
                HandleDropdownMenu(Menu)
            })
        })
    } else {
        WaitForClass("transaction-date-dropdown").then(async function(Dropdown){
            const Menu = await WaitForClassPath(Dropdown, "dropdown-menu")
            HandleDropdownMenu(Menu)
        })
    }

    let LastGroupPayoutsTime = 0

    function CanFetchGroupPayouts(){
        return LastGroupPayoutsTime !== Time
    }

    async function FetchGroupPayouts(){
        if (LastGroupPayoutsTime == Time) return [true, true]

        GroupPayoutFetchIteration[0]++
        const Iteration = GroupPayoutFetchIteration[0]

        const [Success, Groups] = await FetchTranscations(Iteration, GroupPayoutFetchIteration, "GroupPayout", Time, function(Group){
            return Group.agent.type === "Group"
        })

        if (!Success) return [false]

        if (Iteration != GroupPayoutFetchIteration[0]) return [true, true]
        
        Groups.sort(function(a, b){
            return b.Robux - a.Robux
        })
    
        await AddIcons(Groups)
    
        if (Iteration != GroupPayoutFetchIteration[0]) return [true, true]
    
        return [true, false, Groups]
    }

    
    let LastPremiumPayoutsTime = 0

    function CanFetchPremiumPayouts(){
        return LastPremiumPayoutsTime !== Time
    }

    async function FetchPremiumPayouts(){
        if (LastPremiumPayoutsTime == Time) return [true, true]

        PremiumPayoutFetchIteration[0]++
        const Iteration = PremiumPayoutFetchIteration[0]

        const [Success, Places] = await FetchTranscations(Iteration, PremiumPayoutFetchIteration, "EngagementPayout", Time)

        if (!Success) return [false]

        if (Iteration != PremiumPayoutFetchIteration[0]) return [true, true]
        
        Places.sort(function(a, b){
            return b.Robux - a.Robux
        })

        await AddIcons(Places)
    
        if (Iteration != PremiumPayoutFetchIteration[0]) return [true, true]
    
        return [true, false, Places]
    }

    let LastSalesPayoutsTime = 0
    let CacheSalesPayoutsTime = 0
    let LastSalesPayoutsType = ""
    let LastSalesPayoutsTransactions

    function CanFetchSalesPayouts(){
        return LastSalesPayoutsTime !== Time || LastSalesPayoutsType !== Type
    }

    async function FetchSalesPayouts(Type){
        if (Type == "Cancel"){
            LastSalesPayoutsType = "Cancel"
            SalesPayoutFetchIteration[0]++
            return
        }

        if (LastSalesPayoutsTime == Time && LastSalesPayoutsType == Type) return [true, true]

        SalesPayoutFetchIteration[0]++
        LastSalesPayoutsType = Type
        const Iteration = SalesPayoutFetchIteration[0]

        let Success, Places, Transactions
        if (!LastSalesPayoutsTransactions || CacheSalesPayoutsTime != Time){
            [Success, Places, Transactions] = await FetchTranscations(Iteration, SalesPayoutFetchIteration, "Sale", Time)
            
            if (!Success) return [false]

            if (Iteration != SalesPayoutFetchIteration[0]) return [true, true]

            LastSalesPayoutsTransactions = Transactions
            CacheSalesPayoutsTime = Time
        }

        if (Type == "Asset" || Type == "Place"){
            const Map = {}
            const Assets = []

            const ToRead = (LastSalesPayoutsTransactions || Transactions)

            for (let i = 0; i < ToRead.length; i++){
                const Info = ToRead[i]
                const Id = Type == "Place" && Info?.details?.place?.universeId || Info.details.id || Info?.details?.place?.universeId

                if (!Map[Id]){
                    let IsPlace = Type == "Place" && Info?.details?.place

                    if (!IsPlace && Info.details.id == null){
                        IsPlace = Info?.details?.place
                    }

                    const Asset = {Type: IsPlace && "Place" || Info?.details?.type == "GamePass" && "GamePass" || Info?.details?.type == "DeveloperProduct" && "DeveloperProduct" || "Asset", Name: IsPlace?.name && `${IsPlace.name}${Type == "Asset" && " (Private Servers)" || ""}` || Info.details.name, Id: Id, Robux: 0, Place: IsPlace}
                    Assets.push(Asset)
                    Map[Id] = Asset
                }

                Map[Id].Robux += Info.currency.amount
            }

            Places = Assets
        } else if (Type == "User"){
            const Map = {}
            const Assets = []

            const ToRead = (LastSalesPayoutsTransactions || Transactions)

            for (let i = 0; i < ToRead.length; i++){
                const Info = ToRead[i]
                const Id = Info.agent.id

                if (!Map[Id]){
                    const Asset = {Type: "User", Name: Info.agent.name, Id: Id, Robux: 0}
                    Assets.push(Asset)
                    Map[Id] = Asset
                }

                Map[Id].Robux += Info.currency.amount
            }

            Places = Assets
        }
        
        Places.sort(function(a, b){
            return b.Robux - a.Robux
        })

        await AddIcons(Places)
    
        if (Iteration != SalesPayoutFetchIteration[0]) return [true, true]
    
        return [true, false, Places]
    }

    let LastCommissionsTime = 0
    let CacheComissionsTime = 0
    let LastComissionsType = ""
    let LastComissionTransactions

    function CanFetchCommissions(Type){
        return LastCommissionsTime !== Time || LastComissionsType !== Type
    }

    async function FetchCommissions(Type){
        if (LastCommissionsTime == Time && LastComissionsType == Type) return [true, true]

        CommissionsFetchIteration[0]++
        LastComissionsType = Type
        const Iteration = CommissionsFetchIteration[0]

        let Success, Places, Transactions
        if (!LastComissionTransactions || CacheComissionsTime != Time){
            [Success, Places, Transactions] = await FetchTranscations(Iteration, CommissionsFetchIteration, "AffiliateSale", Time)

            if (!Success) return [false]

            if (Iteration != CommissionsFetchIteration[0]) return [true, true]

            LastComissionTransactions = Transactions
            CacheComissionsTime = Time
        }

        if (Type == "Asset"){
            const Map = {}
            const Assets = []

            const ToRead = (LastComissionTransactions || Transactions)

            for (let i = 0; i < ToRead.length; i++){
                const Info = ToRead[i]
                const Id = Info.details.id

                if (!Map[Id]){
                    const Asset = {Type: "Asset", Name: Info.details.name, Id: Id, Robux: 0}
                    Assets.push(Asset)
                    Map[Id] = Asset
                }

                Map[Id].Robux += Info.currency.amount
            }

            Places = Assets
        } else if (Type == "User"){
            const Map = {}
            const Assets = []

            const ToRead = (LastComissionTransactions || Transactions)

            for (let i = 0; i < ToRead.length; i++){
                const Info = ToRead[i]
                const Id = Info.agent.id

                if (!Map[Id]){
                    const Asset = {Type: "User", Name: Info.agent.name, Id: Id, Robux: 0}
                    Assets.push(Asset)
                    Map[Id] = Asset
                }

                Map[Id].Robux += Info.currency.amount
            }

            Places = Assets
        }

        Places.sort(function(a, b){
            return b.Robux - a.Robux
        })

        await AddIcons(Places)
    
        if (Iteration != CommissionsFetchIteration[0]) return [true, true]
    
        return [true, false, Places]
    }

    if (SummaryType == "users"){
        const PageContainer = await WaitForClass("user-transactions-container")

        ChildAdded(PageContainer, true, async function(TSummary){
            if (TSummary.className !== "summary") return
            while (TSummary.children.length === 0) await sleep(20)
            
            const TBody = TSummary.getElementsByTagName("tbody")[0]
            Time = 86400*30

            GroupPayoutFetchIteration[0]++
            PremiumPayoutFetchIteration[0]++
            SalesPayoutFetchIteration[0]++
            CommissionsFetchIteration[0]++

            CreateDetailedSummary(await WaitForTableRow(TBody, "Group Payouts"), FetchGroupPayouts, CanFetchGroupPayouts)
            CreateDetailedSummary(await WaitForTableRow(TBody, "Premium Payouts"), FetchPremiumPayouts, CanFetchPremiumPayouts)
            CreateDetailedSummary(await WaitForTableRow(TBody, "Sales of Goods"), FetchSalesPayouts, CanFetchSalesPayouts, ["Place", "Asset", "User"], SalesPayoutFetchIteration, SalesOfGoodsCSV, ParseCSVSalesOfGoods)
            CreateDetailedSummary(await WaitForTableRow(TBody, "Commissions"), FetchCommissions, CanFetchCommissions, ["Asset", "User"])
        })
    } else {
        WaitForClass("tab-content configure-group-details").then(function(Tab){
            ChildAdded(Tab, true, async function(Child){
                if (Child.nodeType !== Node.ELEMENT_NODE || Child.tagName.toLowerCase() !== "revenue-summary") return
                const Table = await WaitForClassPath(Child, "table section-content")
                const TBody = await WaitForTagPath(Table, "tbody")

                CreateDetailedSummary(await WaitForTableRow(TBody, "Sale of Goods"), FetchSalesPayouts, CanFetchSalesPayouts, ["Place", "Asset", "User"], SalesPayoutFetchIteration, SalesOfGoodsCSV, ParseCSVSalesOfGoods)
            })
        })
    }
})

KillAllCaches() //took too much room.