function OnNewServerElement(Element){
    if (Element.className.search("rbx-game-server-item") > -1 || Element.className.search("rbx-friends-game-server-item") > -1){
        AddServerRegion(Element)
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

if (IsFeatureEnabled("ServerRegions")){
    Main()
}

if (IsFeatureEnabled("ServerFilters")){
    RunFiltersMain()
}