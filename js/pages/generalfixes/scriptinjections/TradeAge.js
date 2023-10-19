async function AddTradeAge(TradeElement){
    if (!TradeElement.className) return

    const TradeInfo = angular.element(TradeElement).scope()
    const Created = new Date(TradeInfo.trade.created)
    const Since = Date.now() - Created.getTime()

    function SecondsToLengthSingle(Seconds, Full){
        if (Full){
          const y = Math.floor(Seconds / (3600*24*365))
          const mo = Math.floor(Seconds / (3600*24*30))
          const d = Math.floor(Seconds / (3600*24))
          const h = Math.floor(Seconds % (3600*24) / 3600)
          const m = Math.floor(Seconds % 3600 / 60)
          const s = Math.floor(Seconds % 60)
      
          if (y > 0){
            return `${y} year${y == 1 ? "" : "s"}`
          } else if (mo > 0){
            return `${mo} month${mo == 1 ? "" : "s"}`
          } else if (d > 0){
            return `${d} day${d == 1 ? "" : "s"}`
          } else if (h > 0){
            return `${h} hour${h == 1 ? "" : "s"}`
          } else if (m > 0){
            return `${m} minute${m == 1 ? "" : "s"}`
          }
      
          return `${s} second${s == 1 ? "" : "s"}`
        }
      
        const d = Math.floor(Seconds / (3600*24))
        const h = Math.floor(Seconds % (3600*24) / 3600)
        const m = Math.floor(Seconds % 3600 / 60)
        const s = Math.floor(Seconds % 60)
      
        if (d > 0){
          return `${d} day${d == 1 ? "" : "s"}`
        } else if (h > 0){
          return `${h} hour${h == 1 ? "" : "s"}`
        } else if (m > 0){
          return `${m} minute${m == 1 ? "" : "s"}`
        }
      
        return `${s} second${s == 1 ? "" : "s"}`
      }

    const Label = TradeElement.getElementsByClassName("trade-sent-date")[0]
    Label.title = Created.toLocaleString()
    Label.innerText = SecondsToLengthSingle(Since/1000)
}

async function InjectTradeAge(){
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
    
    async function WaitForClassPath(Element, ...Paths){
        let LastElement = Element
      
        for (let i = 0; i < Paths.length; i++){
          while (true){
            const NewElement = LastElement.getElementsByClassName(Paths[i])[0]
            
            if (NewElement){
              LastElement = NewElement
              break
            }
      
            await sleep(50)
          }
        }
      
        return LastElement
    }

    const OuterList = await WaitForId("trade-row-scroll-container")
    const TradesList = await WaitForClassPath(OuterList, "simplebar-wrapper", "simplebar-mask", "simplebar-offset", "simplebar-content-wrapper", "simplebar-content")

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const NewElements = Mutation.addedNodes

            for (let i = 0; i < NewElements.length; i++){
                AddTradeAge(NewElements[i])
            }
        })
    }).observe(TradesList, {childList: true})

    const Children = TradesList.children

    for (let i = 0; i < Children.length; i++){
        AddTradeAge(Children[i])
    }
}

InjectTradeAge()