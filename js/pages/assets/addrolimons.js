const DemandIntToString = {
    [-1]: "Unassigned",
    0: "Terrible",
    1: "Low",
    2: "Normal",
    3: "High",
    4: "Amazing"
}

async function Main(){
    const ItemDetails = await WaitForId("item-details")
    const PriceContainer = ItemDetails.getElementsByClassName("clearfix item-field-container")[0]

    const AssetId = GetAssetIdFromURL()
    const RolimonsURL = `https://www.rolimons.com/item/${AssetId}`

    const [Success, Result] = await GetItemDetails([AssetId], false)

    if (!Success) return

    const Details = Result[AssetId]

    if (!Details) return

    const [ValueContainer, ValueTitle, ValueValue] = CreateItemField("Value", "...", RolimonsURL)
    const [DemandContainer, DemandTitle, DemandValue] = CreateItemField("Demand", "...", RolimonsURL)
    DemandContainer.style = "margin-bottom: 12px;"

    ItemDetails.insertBefore(ValueContainer, PriceContainer)
    ItemDetails.insertBefore(DemandContainer, PriceContainer)

    ValueValue.innerText = numberWithCommas(Details.Value)
    DemandValue.innerText = DemandIntToString[Details.Demand]

    const ItemNameContainer = await WaitForClass("border-bottom item-name-container")
    const NameLabel = ItemNameContainer.getElementsByTagName("h1")[0]
    NameLabel.style = "display: inline-flex; align-items: center;"

    if (Details.Rare){
        NameLabel.appendChild(CreateCategoryIcon("Rare", chrome.runtime.getURL("img/trades/rare.svg")))
    }
    if (Details.Projected){
        NameLabel.appendChild(CreateCategoryIcon("Projected", chrome.runtime.getURL("img/trades/projected.svg")))
    }
    if (Details.Hyped){
        NameLabel.appendChild(CreateCategoryIcon("Hyped", chrome.runtime.getURL("img/trades/hyped.svg")))
    }
}

IsFeatureEnabled("ValueDemandOnItem").then(function(Enabled){
    if (Enabled) Main()
})