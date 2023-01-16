const sleep = ms => new Promise(r => setTimeout(r, ms));

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

function ElementAdded(Element){
	if (Element.className.search("game-server-item") === -1) return

	AngularInfo = angular.element(Element).context[Object.keys(angular.element(Element).context)[0]]

	if (!AngularInfo) return

	ServerInfo = AngularInfo.return.memoizedProps

	Element.setAttribute("jobid", ServerInfo.id)
	Element.setAttribute("placeid", ServerInfo.placeId)

	if (Element.className.search("rbx-private-game-server-item") > -1){
		Element.setAttribute("accesscode", ServerInfo.accessCode)
	}
}

function NewServerAddedMutation(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type !== "childList") return

        const NewNodes = Mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            ElementAdded(NewNodes[i])
        }
    })
}

function HandleList(Id){
	WaitForId(Id).then(function(ServerList){
		new MutationObserver(NewServerAddedMutation).observe(ServerList, {childList: true})

		const children = ServerList.children

		for (let i = 0; i < children.length; i++){
			ElementAdded(children[i])
		}
	})
}

async function Main(){
	HandleList("rbx-game-server-item-container")
	HandleList("rbx-friends-game-server-item-container")
	HandleList("rbx-private-game-server-item-container")
}

Main()