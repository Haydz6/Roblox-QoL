let ChartElements = []

function CreateChart(Name, Id){
    const SalesContainer = CreateContainer(Name, Id)

    const Chart = ""

    return SalesContainer
}

async function CreateCharts(){
    const Container = document.createElement("div")
    Container.id = "revenue-charts"

    const SalesContainer = CreateChart("Sales", "sales-chart")
    Container.appendChild(SalesContainer)
}

async function RemoveCharts(){
    for (let i = 0; i < ChartElements.length; i++){
        ChartElements[i].remove()
    }
    ChartElements = []
}

function CanCreateChart(){

}