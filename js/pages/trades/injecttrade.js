const sleep = ms => new Promise(r => setTimeout(r, ms))

function FindFirstId(Id){
    return document.getElementById(Id)
}
  
async function WaitForId(Id){
    let Element = null
    
    while (true) {
        Element = FindFirstId(Id)
        if (Element != undefined) {
          break
        }
    
        await sleep(50)
    }
    
    return Element
}

function FindFirstClass(ClassName){
    return document.getElementsByClassName(ClassName)[0]
}
  
async function WaitForClass(ClassName){
    let Element = null
    
    while (true) {
        Element = FindFirstClass(ClassName)
        if (Element != undefined) {
            break
        }
    
        await sleep(50)
    }
    
    return Element
}

async function TradeRowAdded(TradeRow){
    if (!TradeRow.className || TradeRow.className.search("trade-row") === -1) return

    Trade = angular.element(TradeRow).scope().trade

    TradeRow.setAttribute("userid", Trade.user.id)
    TradeRow.setAttribute("tradeid", Trade.id)
    TradeRow.className += " loaded"
}

// async function ListenToNewOpenTrade(){
//     const TradeListDetail = await WaitForClass("col-xs-12 col-sm-8 trades-list-detail")

//     function Update(TradeData){
//         if (TradeData.nodeType !== Node.ELEMENT_NODE) return

//         const TradeInfo = angular.element(TradeListDetail).scope()
//         TradeData.setAttribute("userid", TradeInfo.data.trade.user.id)
//     }

//     new MutationObserver(function(Mutations){
//         Mutations.forEach(function(Mutation){
//             if (Mutation.type !== "childList") return

//             const NewElements = Mutation.addedNodes

//             for (let i = 0; i < NewElements.length; i++){
//                 Update(NewElements[i])
//             }
//         })
//     }).observe(TradeListDetail, {childList: true})
// }

async function ListenToNewName(TradeListDetail, TradeData){
    let PairedName = await WaitForClass("trades-header-nowrap font-title")
    PairedName = PairedName.getElementsByTagName("span")[1]

    function NameAdded(Name){
        if (Name.parentElement.children.length < 3) return

        const TradeInfo = angular.element(TradeListDetail).scope()
        TradeData.setAttribute("userid", TradeInfo.data.trade.user.id)
        TradeData.setAttribute("tradeid", TradeInfo.data.trade.id)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const NewElements = Mutation.addedNodes

            for (let i = 0; i < NewElements.length; i++){
                NameAdded(NewElements[i])
            }

            if (Mutation.removedNodes.length > 0 && PairedName.children.length < 3){
                TradeData.removeAttribute("userid")
                TradeData.removeAttribute("tradeid")
            }
        })
    }).observe(PairedName, {childList: true})

    const Children = PairedName.children

    for (let i = 0; i < Children.length; i++){
        NameAdded(Children[i])
    }
}

async function ListenToNewTradeData(){
    const TradeListDetail = await WaitForClass("col-xs-12 col-sm-8 trades-list-detail")

    function TradeDataAdded(TradeData){
        if (TradeData.nodeType === Node.ELEMENT_NODE &&TradeData.tagName.toLowerCase() === "div") ListenToNewName(TradeListDetail, TradeData)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const NewElements = Mutation.addedNodes

            for (let i = 0; i < NewElements.length; i++){
                TradeDataAdded(NewElements[i])
            }
        })
    }).observe(TradeListDetail, {childList: true})

    const Children = TradeListDetail.children

    for (let i = 0; i < Children.length; i++){
        TradeDataAdded(Children[i])
    }
}

async function Main(){
    const OuterList = await WaitForId("trade-row-scroll-container")
    const TradesList = OuterList.getElementsByClassName("simplebar-wrapper")[0].getElementsByClassName("simplebar-mask")[0].getElementsByClassName("simplebar-offset")[0].getElementsByClassName("simplebar-content-wrapper")[0].getElementsByClassName("simplebar-content")[0]

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const NewElements = Mutation.addedNodes

            for (let i = 0; i < NewElements.length; i++){
                TradeRowAdded(NewElements[i])
            }
        })
    }).observe(TradesList, {childList: true})

    const Children = TradesList.children

    for (let i = 0; i < Children.length; i++){
        TradeRowAdded(Children[i])
    }

    //ListenToNewOpenTrade()
    ListenToNewTradeData()
}

Main()