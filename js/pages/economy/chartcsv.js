const UniverseIdToGameCache = {}
const PlaceIdToGameCache = {}
const UserIdToGameCache = {}

const ChartCSVTypes = {
    Asset: function(JSON){
        const Datasets = []

        const AssetRevenue = {} //{AssetId: [Day: Revenue]}
        const AssetTotalRevenue = {}
        const LastAssetName = {}

        const DaysInMonth = GetDaysInMonth(JSON[0]?.Date)

        for (let i = 0; i < JSON.length; i++){
            const Sale = JSON[i]
            //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
            const SaleDate = new Date(Sale.Date)
            const Day = SaleDate.getUTCDate()
            let RevenueMonth = AssetRevenue[Sale.AssetId]

            if (!RevenueMonth){
                RevenueMonth = []
                for (let i = 0; i < DaysInMonth.length; i++){
                    RevenueMonth[i] = 0
                }
                AssetRevenue[Sale.AssetId] = RevenueMonth
            }
            if (!AssetTotalRevenue[Sale.AssetId]) AssetTotalRevenue[Sale.AssetId] = Sale.Price
            else AssetTotalRevenue[Sale.AssetId] += Sale.Price

            RevenueMonth[Day-1] += Sale.Price
            LastAssetName[Sale.AssetId] = Sale.AssetName
        }

        const Top300 = Object.entries(AssetTotalRevenue)
        if (Top300.length > 300){
            Top300.sort(function(a, b){
                return b[1] - a[1]
            })
            Top300.length = 300
        }

        for ([AssetId] of Top300){
            if (AssetTotalRevenue[AssetId] === 0) continue //Exclude free items

            const Days = AssetRevenue[AssetId]

            // let WasLastNoRevenue = false
            // for (let i = 0; i < Days.length; i++){
            //     if (Days[i] === 0){
            //         if (WasLastNoRevenue) delete Days[i]
            //         else WasLastNoRevenue = true
            //     } else WasLastNoRevenue = false
            //     //Days[i] += Math.floor(Math.random()*1000)
            // }

            Datasets.push({
                label: LastAssetName[AssetId],//"my coolest sold item! "+Math.floor(Math.random()*10000),
                data: Days,
                fill: false
            })
        }

        return [{
            labels: DaysInMonth,
            datasets: Datasets
        }, 300]
    },
    Place: async function(JSON, Choice){
        const DaysInMonth = GetDaysInMonth(JSON[0]?.Date)
        const Datasets = []

        const UniverseRevenue = {} //{UniverseId: [Day: Revenue]}
        const UniverseTotalRevenue = {}
        const LastAssetName = {}

        if (Choice){
            for (let i = 0; i < JSON.length; i++){
                const Sale = JSON[i]
                if (Sale.UniverseId != Choice) continue
                //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
                const SaleDate = new Date(Sale.Date)
                const Day = SaleDate.getUTCDate()
                let RevenueMonth = UniverseRevenue[Sale.AssetId]
    
                if (!RevenueMonth){
                    RevenueMonth = []
                    for (let i = 0; i < DaysInMonth.length; i++){
                        RevenueMonth[i] = 0
                    }
                    UniverseRevenue[Sale.AssetId] = RevenueMonth
                }
                if (!UniverseTotalRevenue[Sale.AssetId]) UniverseTotalRevenue[Sale.AssetId] = Sale.Price
                else UniverseTotalRevenue[Sale.AssetId] += Sale.Price
    
                RevenueMonth[Day-1] += Sale.Price
                LastAssetName[Sale.AssetId] = Sale.AssetName
            }

            const Top300 = Object.entries(UniverseTotalRevenue)
            if (Top300.length > 300){
                Top300.sort(function(a, b){
                    return b[1] - a[1]
                })
                Top300.length = 300
            }

            for ([AssetId] of Top300){
                if (UniverseTotalRevenue[AssetId] === 0) continue //Exclude free items

                const Days = UniverseRevenue[AssetId]

                Datasets.push({
                    label: LastAssetName[AssetId],
                    data: Days,
                    fill: false
                })
            }

            return [{
                labels: DaysInMonth,
                datasets: Datasets
            }, 300, true]
        }

        for (let i = 0; i < JSON.length; i++){
            const Sale = JSON[i]
            const UniverseId = Sale.UniverseId
            if (!UniverseId || UniverseId == "Null") continue
            //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
            const SaleDate = new Date(Sale.Date)
            const Day = SaleDate.getUTCDate()
            let RevenueMonth = UniverseRevenue[UniverseId]

            if (!RevenueMonth){
                RevenueMonth = []
                for (let i = 0; i < DaysInMonth.length; i++){
                    RevenueMonth[i] = 0
                }
                UniverseRevenue[UniverseId] = RevenueMonth
            }
            if (!UniverseTotalRevenue[UniverseId]) UniverseTotalRevenue[UniverseId] = Sale.Price
            else UniverseTotalRevenue[UniverseId] += Sale.Price

            RevenueMonth[Day-1] += Sale.Price
        }

         const Top100 = Object.entries(UniverseTotalRevenue)
        if (Top100.length > 100){
            Top100.sort(function(a, b){
                return b[1] - a[1]
            })
            Top100.length = 100
        }

        const UniverseIdToName = {}

        if (Top100.length > 0){
            const UniverseIds = []
            for ([AssetId] of Top100){
                if (UniverseIdToGameCache[AssetId]){
                    const Game = UniverseIdToGameCache[AssetId]
                    UniverseIdToName[Game.id] = Game.name
                    continue
                }
                UniverseIds.push(AssetId)
            }

            while (UniverseIds.length > 0){
                const BatchUniverseIds = []
                for (let i = 0; i < Math.min(UniverseIds.length, 10); i++){
                    BatchUniverseIds.push(UniverseIds.pop())
                }

                const [Success, Body] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${BatchUniverseIds.join(",")}`, "GET", undefined, undefined, true)
                if (Success){
                    const Data = Body.data
                    for (let i = 0; i < Data.length; i++){
                        const Game = Data[i]
                        UniverseIdToName[Game.id] = Game.name
                        UniverseIdToGameCache[Game.id] = Game
                    }
                }
            }
        }

        const SecondaryChoices = []

        for ([AssetId] of Top100){
            if (UniverseTotalRevenue[AssetId] === 0) continue //Exclude free items

            const Days = UniverseRevenue[AssetId]

            // let WasLastNoRevenue = false
            // for (let i = 0; i < Days.length; i++){
            //     if (Days[i] === 0){
            //         if (WasLastNoRevenue) delete Days[i]
            //         else WasLastNoRevenue = true
            //     } else WasLastNoRevenue = false
            // }

            const UniverseName = UniverseIdToName[AssetId]
            Datasets.push({
                label: UniverseName !== undefined ? UniverseName : "Unknown Game",
                data: Days,
                fill: false
            })
            if (UniverseName && !SecondaryChoices.includes(UniverseName)) SecondaryChoices.push({name: UniverseName, value: AssetId})
        }

        return [{
            labels: DaysInMonth,
            datasets: Datasets
        }, 100, SecondaryChoices]
    },
    ["Affiliate Place"]: async function(JSON, Choice){
        const DaysInMonth = GetDaysInMonth(JSON[0]?.Date)
        const Datasets = []

        const UniverseRevenue = {} //{UniverseId: [Day: Revenue]}
        const UniverseTotalRevenue = {}
        const LastAssetName = {}

        if (Choice){
            for (let i = 0; i < JSON.length; i++){
                const Sale = JSON[i]
                if (Sale.SaleLocationId !== Choice) continue
                //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
                const SaleDate = new Date(Sale.Date)
                const Day = SaleDate.getUTCDate()
                let RevenueMonth = UniverseRevenue[Sale.AssetId]
    
                if (!RevenueMonth){
                    RevenueMonth = []
                    for (let i = 0; i < DaysInMonth.length; i++){
                        RevenueMonth[i] = 0
                    }
                    UniverseRevenue[Sale.AssetId] = RevenueMonth
                }
                if (!UniverseTotalRevenue[Sale.AssetId]) UniverseTotalRevenue[Sale.AssetId] = Sale.Price
                else UniverseTotalRevenue[Sale.AssetId] += Sale.Price
    
                RevenueMonth[Day-1] += Sale.Price
                LastAssetName[Sale.AssetId] = Sale.AssetName
            }

            const Top300 = Object.entries(UniverseTotalRevenue)
            if (Top300.length > 300){
                Top300.sort(function(a, b){
                    return b[1] - a[1]
                })
                Top300.length = 300
            }

            for ([AssetId] of Top300){
                if (UniverseTotalRevenue[AssetId] === 0) continue //Exclude free items

                const Days = UniverseRevenue[AssetId]

                Datasets.push({
                    label: LastAssetName[AssetId],
                    data: Days,
                    fill: false
                })
            }

            return [{
                labels: DaysInMonth,
                datasets: Datasets
            }, 300, true]
        }

        for (let i = 0; i < JSON.length; i++){
            const Sale = JSON[i]
            const UniverseId = Sale.SaleLocationId
            if (!UniverseId || UniverseId == "Null") continue
            //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
            const SaleDate = new Date(Sale.Date)
            const Day = SaleDate.getUTCDate()
            let RevenueMonth = UniverseRevenue[UniverseId]

            if (!RevenueMonth){
                RevenueMonth = []
                for (let i = 0; i < DaysInMonth.length; i++){
                    RevenueMonth[i] = 0
                }
                UniverseRevenue[UniverseId] = RevenueMonth
            }
            if (!UniverseTotalRevenue[UniverseId]) UniverseTotalRevenue[UniverseId] = Sale.Price
            else UniverseTotalRevenue[UniverseId] += Sale.Price

            RevenueMonth[Day-1] += Sale.Price
        }

        const Top100 = Object.entries(UniverseTotalRevenue)
        if (Top100.length > 50){
            Top100.sort(function(a, b){
                return b[1] - a[1]
            })
            Top100.length = 50
        }

        const UniverseIdToName = {}

        if (Top100.length > 0){
            const UniverseIds = []
            for ([AssetId] of Top100){
                if (PlaceIdToGameCache[AssetId]){
                    const Game = PlaceIdToGameCache[AssetId]
                    UniverseIdToName[Game.placeId] = Game.sourceName
                    continue
                }

                UniverseIds.push(AssetId)
            }

            if (UniverseIds.length > 0){
                const [Success, Body] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${UniverseIds.join("&placeIds=")}`, "GET", undefined, undefined, true)
                if (Success){
                    for (let i = 0; i < Body.length; i++){
                        const Game = Body[i]
                        UniverseIdToName[Game.placeId] = Game.sourceName
                        PlaceIdToGameCache[Game.placeId] = Game
                    }
                }
            }
        }

        const SecondaryChoices = []

        for ([AssetId] of Top100){
            if (UniverseTotalRevenue[AssetId] === 0) continue //Exclude free items

            const Days = UniverseRevenue[AssetId]

            // let WasLastNoRevenue = false
            // for (let i = 0; i < Days.length; i++){
            //     if (Days[i] === 0){
            //         if (WasLastNoRevenue) delete Days[i]
            //         else WasLastNoRevenue = true
            //     } else WasLastNoRevenue = false
            // }

            const UniverseName = UniverseIdToName[AssetId]
            Datasets.push({
                label: UniverseName !== undefined ? UniverseName : "Unknown Game",
                data: Days,
                fill: false
            })
            if (UniverseName && !SecondaryChoices.includes(UniverseName)) SecondaryChoices.push({name: UniverseName, value: AssetId})
        }

        return [{
            labels: DaysInMonth,
            datasets: Datasets
        }, 50, SecondaryChoices]
    },
    ["User"]: async function(CSVJSON){
        const DaysInMonth = GetDaysInMonth(CSVJSON[0]?.Date)
        const Datasets = []

        const UniverseRevenue = {} //{UniverseId: [Day: Revenue]}
        const UniverseTotalRevenue = {}

        for (let i = 0; i < CSVJSON.length; i++){
            const Sale = CSVJSON[i]
            const UniverseId = Sale.UserId
            if (!UniverseId || UniverseId == "Null") continue
            //{HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])}
            const SaleDate = new Date(Sale.Date)
            const Day = SaleDate.getUTCDate()
            let RevenueMonth = UniverseRevenue[UniverseId]

            if (!RevenueMonth){
                RevenueMonth = []
                for (let i = 0; i < DaysInMonth.length; i++){
                    RevenueMonth[i] = 0
                }
                UniverseRevenue[UniverseId] = RevenueMonth
            }
            if (!UniverseTotalRevenue[UniverseId]) UniverseTotalRevenue[UniverseId] = Sale.Price
            else UniverseTotalRevenue[UniverseId] += Sale.Price

            RevenueMonth[Day-1] += Sale.Price
        }

        const Top100 = Object.entries(UniverseTotalRevenue)
        if (Top100.length > 100){
            Top100.sort(function(a, b){
                return b[1] - a[1]
            })
            Top100.length = 100
        }

        const UserToName = {}
        
        if (Top100.length > 0){
            const UserIds = []
            for ([AssetId] of Top100){
                if (UserIdToGameCache[AssetId]){
                    const User = UserIdToGameCache[AssetId]
                    UserToName[User.id] = User.name
                    continue
                }
                UserIds.push(parseInt(AssetId))
            }

            if (UserIds.length > 0){
                const [Success, Body] = await RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: UserIds, excludeBannedUsers: false}), true)
                if (Success){
                    const Data = Body.data
                    for (let i = 0; i < Data.length; i++){
                        const User = Data[i]
                        UserToName[User.id] = User.name
                        UserIdToGameCache[User.id] = User
                    }
                }
            }
        }

        for ([AssetId] of Top100){
            if (UniverseTotalRevenue[AssetId] === 0) continue //Exclude free items

            const Days = UniverseRevenue[AssetId]

            // let WasLastNoRevenue = false
            // for (let i = 0; i < Days.length; i++){
            //     if (Days[i] === 0){
            //         if (WasLastNoRevenue) delete Days[i]
            //         else WasLastNoRevenue = true
            //     } else WasLastNoRevenue = false
            // }

            const UniverseName = UserToName[AssetId]
            Datasets.push({
                label: UniverseName !== undefined ? UniverseName : "Terminated User",
                data: Days,
                fill: false
            })
        }

        return [{
            labels: DaysInMonth,
            datasets: Datasets
        }, 100]
    }
}

async function CreateChart(Title){
    await import(chrome.runtime.getURL("js/modules/chart.js"))

    const Container = document.createElement("div")
    Container.style.marginTop = "20px"

    const TitleLabel = document.createElement("h3")
    TitleLabel.innerText = Title
    
    const PerformanceLabel = document.createElement("p")
    PerformanceLabel.innerText = "Shows top 300 for performance reasons"

    const UploadCSVButton = document.createElement("form")
    UploadCSVButton.style = "height: 30px; margin: 30px 0px; display: inline-block;"

    const CSVLabel = document.createElement("label")
    CSVLabel.className = "csv-upload-button"
    CSVLabel.innerText = "Upload CSV"
    CSVLabel.setAttribute("for", "chart-uploadCSV")

    const CSVInput = document.createElement("input")
    CSVInput.type = "file"
    CSVInput.id = "chart-uploadCSV"
    CSVInput.name = "filename"
    CSVInput.accept = ".csv"
    CSVInput.style = "display: none;"

    UploadCSVButton.append(CSVLabel, CSVInput)

    const GameDropdownContainer = document.createElement("div")
    GameDropdownContainer.className = "input-group-btn group-dropdown trade-list-dropdown"
    GameDropdownContainer.style = "width: 150px; display: inline-block; margin-right: 20px; display: none; float: right;"
    GameDropdownContainer.innerHTML = `<button class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false" style="height: 30px;"><span class="rbx-selection-label ng-binding" title="All" style="font-size: 14px; line-height: 20px; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 16px);">All</span><span class="icon-down-16x16" style="margin-top: 2px;"></span></button><ul data-toggle="dropdown-menu" class="dropdown-menu" role="menu"></ul>`
    
    const GameDropdownLabel = GameDropdownContainer.getElementsByClassName("rbx-selection-label")[0]
    const GameDropdownList = GameDropdownContainer.getElementsByClassName("dropdown-menu")[0]

    const ChartContainer = document.createElement("canvas")

    const NewChart = new Chart(ChartContainer, {type: "line", options: {
        scales: {
        x: {
            title: {
                display: true,
                text: "Day"
            }
        },
        y: {
            title: {
                display: true,
                text: "Revenue before tax"
            }
        },
    },
    ticks: {
        sampleSize: 1
    },
    animation: false,
    spanGaps: true,
    normalized: true,
    bezierCurve: false
}})
    let CSVFile
    let CurrentType = "Asset"
    let SecondaryChoice
    let LastSecondaryChoices

    async function UpdateChart(){
        if (!CSVFile){
            const Data = {
                labels: [],
                datasets: []
            }
    
            NewChart.data = Data
            NewChart.update()

            return
        }

        const JSON = SalesOfGoodsCSVToJSON(CSVFile)
        const [Data, Max, SecondaryChoices] = await ChartCSVTypes[CurrentType](JSON, SecondaryChoice)
        
        if (SecondaryChoices) {
            if (typeof(SecondaryChoices) !== "boolean"){
                LastSecondaryChoices = SecondaryChoices
                SecondaryChoices.unshift({name: "All", value: undefined})
            }
        } else {
            LastSecondaryChoices = undefined
        }

        if (LastSecondaryChoices && LastSecondaryChoices.length !== 0){
            if (typeof(SecondaryChoices) !== "boolean"){
                GameDropdownList.replaceChildren()
                GameDropdownLabel.innerText = "All"
                GameDropdownLabel.title = "All"

                for (let i = 0; i < LastSecondaryChoices.length; i++){
                    const Choice = LastSecondaryChoices[i]
                    const Dropdown = document.createElement("li")
                    Dropdown.innerHTML = `<a><span class="ng-scope" style="text-overflow: ellipsis; overflow: hidden; display: block;"></span></a>`
                    Dropdown.getElementsByTagName("span")[0].innerText = Choice.name
                    Dropdown.getElementsByTagName("span")[0].title = Choice.name
                    GameDropdownList.appendChild(Dropdown)

                    Dropdown.addEventListener("click", function(){
                        GameDropdownLabel.innerText = Choice.name
                        GameDropdownLabel.title = Choice.name

                        SecondaryChoice = Choice.value
                        UpdateChart()
                    })
                }

                GameDropdownContainer.style.display = "inline-block"
            }
        } else {
            GameDropdownContainer.style.display = "none"
            GameDropdownList.replaceChildren()
        }

        PerformanceLabel.innerText = `Shows top ${Max} for performance reasons`
        NewChart.data = Data
        NewChart.update()
    }

    UploadCSVButton.addEventListener("click", async function(e){
        if (CSVFile){
            CSVFile = null
            CSVInput.value = null
            SecondaryChoice = undefined

            HasFetched = false
            CSVLabel.innerText = "Upload CSV"
            e.stopImmediatePropagation()

            await sleep(10)
            CSVLabel.setAttribute("for", "chart-uploadCSV")
            UpdateChart()
        }
    })

    UploadCSVButton.addEventListener("change", function(e){
        const TargetFile = e.target.files[0]
        if (!TargetFile) return

        let reader = new FileReader()
        reader.onload = async function(File){
            CSVFile = File.target.result
            SecondaryChoice = undefined
            HasFetched = false
            CSVLabel.removeAttribute("for")
            CSVLabel.innerText = "Remove CSV"

            UpdateChart()
        }
        reader.readAsText(TargetFile)
    })

    //Create dropdown
    const DropdownContainer = document.createElement("div")
    DropdownContainer.className = "input-group-btn group-dropdown trade-list-dropdown"
    DropdownContainer.style = "width: 150px; display: inline-block; margin-right: 20px; float: right;"
    DropdownContainer.innerHTML = `<button class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false" style="height: 30px;"><span class="rbx-selection-label ng-binding" title="Asset" style="font-size: 14px; line-height: 20px; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 16px);">Asset</span><span class="icon-down-16x16" style="margin-top: 2px;"></span></button><ul data-toggle="dropdown-menu" class="dropdown-menu" role="menu"><li class="ng-scope"><a><span class="ng-scope">Asset</span></a></li><li class="ng-scope"><a><span class="ng-scope">Place</span></a></li><li class="ng-scope"><a><span class="ng-scope">Affiliate Place</span></a></li><li class="ng-scope"><a><span class="ng-scope">User</span></a></li></ul>`

    const SelectedLabel = DropdownContainer.getElementsByClassName("rbx-selection-label")[0]
    const DropdownList = DropdownContainer.getElementsByClassName("dropdown-menu")[0]
    const Dropdowns = DropdownList.children

    for (let i = 0; i < Dropdowns.length; i++){
        const Dropdown = Dropdowns[i]
        const Type = Dropdown.innerText

        Dropdown.addEventListener("click", function(){
            SelectedLabel.title = Type
            SelectedLabel.innerText = Type
            CurrentType = Type
            SecondaryChoice = undefined
            UpdateChart()
        })
    }

    Container.append(TitleLabel, PerformanceLabel, UploadCSVButton, DropdownContainer, GameDropdownContainer, ChartContainer)

    return Container
}

IsFeatureEnabled("CSVChart").then(async function(Enabled){
    if (!Enabled) return

    const Chart = await CreateChart("Sales Of Goods")

    if (window.location.href.includes("group")){
        const Container = await WaitForClass("configure-group-details")
        ChildAdded(Container, true, function(Child){
            if (Child.tagName && Child.tagName.toLowerCase() === "revenue-summary") Child.appendChild(Chart)
        })
    } else {
        const Container = await WaitForClass("user-transactions-container")
        ChildAdded(Container, true, function(Child){
            if (Child.className && Child.className === "summary") Child.appendChild(Chart)
        })
    }
})