const sleep = ms => new Promise(r => setTimeout(r, ms))
let RefreshButton

const ServerElements = []

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

async function GetRefreshButton(){
	if (!RefreshButton){
		const RunningGames = await WaitForId("rbx-running-games")
		RefreshButton = RunningGames.getElementsByClassName("btn-more rbx-refresh refresh-link-icon btn-control-xs btn-min-width")[0]

		new MutationObserver(function(Mutations){
			Mutations.forEach(function(Mutation){
				if (Mutation.type === "attributes"){
					if (Mutation.attributeName === "disabled"){
						if (RefreshButton.getAttribute("disabled") === ""){
							for (let i = 0; i < ServerElements.length; i++){
								const Server = ServerElements[i]

								Server.removeAttribute("qol-checked")
								Server.removeAttribute("jobid")
								Server.removeAttribute("placeid")

								const ServerRegion = Server.getElementsByClassName("text-info rbx-game-status rbx-game-server-status text-overflow server-info")[0]
								if (ServerRegion) ServerRegion.remove()
							}
						}
					}
				}
			})
		}).observe(RefreshButton, {attributes: true})
	}

	return RefreshButton
}

async function ElementAdded(Element){
	if (Element.className.search("game-server-item") === -1) return

	async function UpdateInfo(){
		if (Element.getAttribute("checking-qol-checked") || Element.getAttribute("qol-checked")) return
		Element.removeAttribute("has-region")
		Element.setAttribute("checking-qol-checked", true)

		await GetRefreshButton()
		while (RefreshButton.getAttribute("disabled") === ""){
			await sleep(50)
		}

		AngularInfo = angular.element(Element).context[Object.keys(angular.element(Element).context)[0]]

		if (!AngularInfo){
			//Element.removeAttribute("qol-checked")
			Element.removeAttribute("checking-qol-checked")
			return
		}

		let ServerInfo = AngularInfo.return.memoizedProps
		let Attempts = 0

		while (!ServerInfo && Attempts < 5){
			await sleep(100)
			ServerInfo = AngularInfo.return.memoizedProps
			Attempts++
		}
		
		if (!ServerInfo){
			//Element.removeAttribute("qol-checked")
			Element.removeAttribute("checking-qol-checked")
			return
		}

		Element.setAttribute("jobid", ServerInfo.id)
		Element.setAttribute("placeid", ServerInfo.placeId)
		Element.setAttribute("qol-checked", true)
		Element.removeAttribute("checking-qol-checked")

		if (Element.className.search("rbx-private-game-server-item") > -1){
			Element.setAttribute("accesscode", ServerInfo.accessCode)
		}
	}
	
	ServerElements.push(Element)

	new MutationObserver(function(Mutations){
		Mutations.forEach(function(Mutation){
			if (Mutation.type === "attributes"){
				if (Mutation.attributeName === "qol-checked"){
					UpdateInfo()
				}
			}
		})
	}).observe(Element, {attributes: true})

	let ServerUpdatedDefer = false
	new MutationObserver(function(Mutations){
		if (ServerUpdatedDefer) return

		Mutations.forEach(function(Mutation){
			if (ServerUpdatedDefer) return

			if (Mutation.type === "childList"){
				ServerUpdatedDefer = true
				setTimeout(function(){
					ServerUpdatedDefer = false
						
					Element.removeAttribute("jobid")
					Element.removeAttribute("placeid")

					const ServerRegion = Element.getElementsByClassName("text-info rbx-game-status rbx-game-server-status text-overflow server-info")[0]
					if (ServerRegion) ServerRegion.remove()

					Element.removeAttribute("qol-checked")
				}, 0)
			}
		})
	}).observe(Element.getElementsByClassName("player-thumbnails-container")[0], {childList: true})

	UpdateInfo()
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

async function GetServerProps(){
	HandleList("rbx-game-server-item-container")
	HandleList("rbx-friends-game-server-item-container")
	HandleList("rbx-private-game-server-item-container")
}

GetServerProps()