let HasInjectedServerPropsRetriever = false

function InjectServerPropsRetriever(){
    if (HasInjectedServerPropsRetriever) return
    HasInjectedServerPropsRetriever = true

    const Script = document.createElement("script")
    Script.src = chrome.runtime.getURL("js/pages/serverfilters/getserverprops.js")
    document.head.appendChild(Script)
}

function OnNewServerElement(Element){
    if (Element.className.search("rbx-game-server-item") > -1 || Element.className.search("rbx-friends-game-server-item") > -1){

        function UpdateRegion(){
            if (!Element.getAttribute("qol-checked")){
                return
            }
            AddServerRegion(Element)
        }

        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                if (Mutation.type === "attributes"){
                    if (Mutation.attributeName === "qol-checked"){
                        UpdateRegion()
                    }
                }
            })
        }).observe(Element, {attributes: true})
        UpdateRegion()
    }
}

function NewServerAddedMutation(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type !== "childList") return

        const NewNodes = Mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            OnNewServerElement(NewNodes[i])
        }
    })
}

function HandleList(Id){
    WaitForId(Id).then(function(List){
        const Observer = new MutationObserver(NewServerAddedMutation)
        Observer.observe(List, {childList: true})

        const children = List.children
        for (let i = 0; i < children.length; i++){
            OnNewServerElement(children[i])
        }
    })
}

async function Main(){
    HandleList("rbx-game-server-item-container")
    HandleList("rbx-friends-game-server-item-container")
}

IsFeatureEnabled("ServerRegions").then(function(Enabled){
    if (Enabled){
        InjectServerPropsRetriever()
        Main()
    }
})

IsFeatureEnabled("ServerFilters").then(function(Enabled){
    if (Enabled){
        InjectServerPropsRetriever()
        RunFiltersMain()
    }
})