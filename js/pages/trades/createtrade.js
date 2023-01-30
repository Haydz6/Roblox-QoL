function GetUserIdFromTradeWithURL(){
    return parseInt(window.location.href.split("users/")[1].split("/")[0])
}

async function AddLinkToName(){
    const TradeHeader = await WaitForClass("trades-header-nowrap")

    let Titles = TradeHeader.getElementsByClassName("paired-name")[0]
    while (Titles.children < 3) await sleep(20)

    const LinkIcon = CreateLinkIcon(`https://www.rolimons.com/player/${GetUserIdFromTradeWithURL()}`)
    LinkIcon.style = "width: 30px;"
    Titles.children[2].appendChild(LinkIcon)
}

async function NewAsset(Asset){
    if (Asset.nodeType !== Node.ELEMENT_NODE || Asset.tagName.toLowerCase() !== "li") return
    Asset.style = "margin-bottom: 0px!important;"

    const ItemCardContainer = Asset.children[0].children[0]

    const Caption = ItemCardContainer.getElementsByClassName("item-card-caption")[0]
    const AssetId = parseInt(Caption.getElementsByTagName("a")[0].href.split("catalog/")[1].split("/")[0])

    const [ValueDiv, CurrencyLabel] = CreateValueCardLabel()

    Caption.appendChild(ValueDiv)
    ValueDiv.appendChild(CreateLinkIcon(`https://www.rolimons.com/item/${AssetId}`))

    let CategoryCardLabel = CreateCategoriesCardLabel()
    Caption.appendChild(CategoryCardLabel)

    QueueForItemDetails(AssetId).then(function([Success, Details]){
        CurrencyLabel.innerText = Success && numberWithCommas(Details.Value) || "???"
    })
}

function NewOfferAsset(Asset, AddToValue, AddDemand){
    if (Asset.nodeType !== Node.ELEMENT_NODE || Asset.tagName.toLowerCase() !== "div" || Asset.children.length === 0) return

    const AssetId = parseInt(Asset.getElementsByTagName("thumbnail-2d")[0].getElementsByTagName("span")[0].getAttribute("thumbnail-target-id"))
    const [ValueDiv, CurrencyLabel] = CreateValueCardLabel("item-value custom ng-scope")

    Asset.appendChild(ValueDiv)
    AddToValue()

    QueueForItemDetails(AssetId).then(function([Success, Details]){
        CurrencyLabel.innerText = Success && numberWithCommas(Details.Value) || "???"

        if (Success && Asset.parentElement.parentElement){
            AddToValue(Details.Value)
            AddDemand(Details.Demand)
        }
    })
}

function NewOfferSummary(Summary, AddToValue, AddDemand){
    if (Summary.nodeType !== Node.ELEMENT_NODE || Summary.tagName.toLowerCase() !== "div") return

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewOfferAsset(addedNodes[i], AddToValue, AddDemand)
            }
        })
    }).observe(Summary, {childList: true})

    const children = Summary.children

    for (let i = 0; i < children.length; i++){
        NewOfferAsset(children[i], AddToValue, AddDemand)
    }
}

async function AddValuesToOffer(Offer){
    if (Offer.nodeType !== Node.ELEMENT_NODE || Offer.tagName.toLowerCase() !== "div") return

    const CardsList = Offer.getElementsByClassName("hlist item-cards item-cards-stackable")[0]

    if (!CardsList) return

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewAsset(addedNodes[i])
            }
        })
    }).observe(CardsList, {childList: true})

    const children = CardsList.children

    for (let i = 0; i < children.length; i++){
        NewAsset(children[i])
    }
}

async function ListenToOffers(){
    const Offers = await WaitForClass("inventory-panel-holder")

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                AddValuesToOffer(addedNodes[i])
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        AddValuesToOffer(children[i])
    }
}

async function ListenToSummaryOffers(Offers, Update){
    if (Offers.nodeType !== Node.ELEMENT_NODE || Offers.className.search("trade-request-window-offer") === -1) return
    const [ValueLine, ValueValue] = CreateRobuxLineLabel("Rolimons Value:", "0")
    const [DemandLine, DemandValue] = CreateRobuxLineLabel("Rolimons Demand:", "0.0/5.0")
    Offers.append(ValueLine, DemandLine)

    let TotalValue = 0
    let TotalRap = 0
    let TotalDonated = 0
    let Demands = []

    function AddToValue(Value){
        if (!Value){
            ValueValue.innerText = "..."
            return
        }

        TotalValue += Value
        ValueValue.innerText = numberWithCommas(TotalValue)
        Update(TotalRap, TotalValue, TotalDonated)
    }

    function AddDemand(Demand){
        if (!Demand){
            DemandValue.innerText = ".../5.0"
            return
        }
        Demands.push(Demand)

        let Average = Math.floor(((Demands.reduce((partialSum, a) => partialSum + a, 0)/Demands.length)+1)*10)/10
        if (Math.floor(Average) === Average) Average = `${Average}.0`

        DemandValue.innerText = `${Average}/5.0`
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            if (Mutation.removedNodes){
                AddToValue(-TotalValue)
                Demands = []
                AddDemand()
            }

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewOfferSummary(addedNodes[i], AddToValue, AddDemand)
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        NewOfferSummary(children[i], AddToValue, AddDemand)
    }
}

async function ListenForNewSummaryOffer(){
    const Offers = await WaitForClass("trade-request-window-offers")

    const Divider = document.createElement("div")
    Divider.className = "rbx-divider"
    Divider.style = "margin: 24px 0px; overflow: unset; position: relative;"

    const TotalValue = {Ours: 0, Other: 0}
    const GainList = CreateGainList()
    const ValueNet = TotalValue.Other - TotalValue.Ours
    const [ValueList, UpdateValue] = CreateGain(0, "0", "+0%", "icon icon-rolimons-20x20", true)
    GainList.appendChild(ValueList)

    function Update(){
        UpdateValue(ValueNet, numberWithCommas(ValueNet), `${ValueNet >= 0 && "+" || "-"}${Math.abs(Math.floor((TotalValue.Other - TotalValue.Ours)/TotalValue.Ours * 100))}%`)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                ListenToSummaryOffers(addedNodes[i], Update)
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        ListenToSummaryOffers(children[i], Update)
    }
}

async function Main(){
    ListenToOffers()
    ListenForNewSummaryOffer()
    AddLinkToName()
}

Main()