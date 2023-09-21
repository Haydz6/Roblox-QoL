async function CreateChart(Type){
    await import(chrome.runtime.getURL("js/modules/chart.js"))

    const Container = document.createElement("div")
    Container.style.marginTop = "20px"

    const Title = document.createElement("h3")
    Title.innerText = Type
    
    const PerformanceLabel = document.createElement("p")
    PerformanceLabel.innerText = "Shows top 300 for performance reasons"

    const UploadCSVButton = document.createElement("form")
    UploadCSVButton.style = "height: 30px; margin: 30px 0px;"

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

    function UpdateChart(){
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
        //const Labels = []
        const Datasets = []

        const AssetRevenue = {} //{AssetId: [Day: Revenue]}
        const AssetTotalRevenue = {}
        const LastAssetName = {}

        const DaysInMonth = []
        if (JSON.length > 0){
            const SaleDate = new Date(JSON[0].Date)
            for (let i = 1; i <= new Date(SaleDate.getUTCFullYear(), SaleDate.getUTCMonth(), 0).getDate(); i++){
                DaysInMonth.push(i)
            }
        }

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

            let WasLastNoRevenue = false
            for (let i = 0; i < Days.length; i++){
                if (Days[i] === 0){
                    if (WasLastNoRevenue) delete Days[i]
                    else WasLastNoRevenue = true
                } else WasLastNoRevenue = false
                //Days[i] += Math.floor(Math.random()*1000)
            }

            Datasets.push({
                label: LastAssetName[AssetId],//"my coolest sold item! "+Math.floor(Math.random()*10000),
                data: Days,
                fill: false
            })
        }

        const Data = {
            labels: DaysInMonth,
            datasets: Datasets
        }

        NewChart.data = Data
        NewChart.update()
    }

    UploadCSVButton.addEventListener("click", async function(e){
        if (CSVFile){
            CSVFile = null
            CSVInput.value = null

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
            HasFetched = false
            CSVLabel.removeAttribute("for")
            CSVLabel.innerText = "Remove CSV"

            UpdateChart()
        }
        reader.readAsText(TargetFile)
    })

    Container.append(Title, PerformanceLabel, UploadCSVButton, ChartContainer)

    let PageContainer
    if (window.location.href.includes("group")) PageContainer = await WaitForTag("revenue-summary")
    else PageContainer = await WaitForClass("user-transactions-container")
    PageContainer.appendChild(Container)
}

IsFeatureEnabled("CSVChart").then(function(Enabled){
    if (Enabled) CreateChart("Sales Of Goods")
})