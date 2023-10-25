IsFeatureEnabled("AdRates").then(async function(Enabled){
    console.log("ADrates", Enabled)
    if (!Enabled) return
    if (!window.location.href.includes("?Page=ads")) return
    console.log("ads")

    const Container = document.createElement("div")
    Container.style = "position: absolute;"
    Container.className = "ad-chart"

    await import(chrome.runtime.getURL("js/modules/chart.js"))

    const ChartContainer = document.createElement("canvas")
    const NewChart = new Chart(ChartContainer, {type: "line", options: {}})

    RequestFunc(WebServerEndpoints.Ads+"rates", "GET").then(function([Success, Result]){
        if (!Success) return

        const labels = []
        const datasets = []

        for ([Type, Ad] of Object.entries(Result)){
            datasets.push(Ad.rates)
            labels.push(Type)
        }

        NewChart.data = {labels: labels, datasets: datasets}
        NewChart.update()
    })

    Container.append(ChartContainer)
    WaitForId("container-main").then(function(Main){
        Main.appendChild(Container)
        console.log("container-main")
    })
})