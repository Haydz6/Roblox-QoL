console.log(window.location.href)

IsFeatureEnabled("FixContinueCuration").then(async function(Enabled){
    if (!Enabled) return
    if (!window.location.href.includes("#/sortName")) return

    const [Success, Body] = await RequestFunc("https://apis.roblox.com/discovery-api/omni-recommendation", "POST", {"Content-Type": "application/json"}, JSON.stringify({pageType: "Continue", "sessionId": "a", "supportedTreatmentTypes": []}), true)
    if (!Success) return

    const Sorts = Body.sorts
    for (let i = 0; i < Sorts.length; i++){
        const Sort = Sorts[i]
        if (Sort.topicId == 100000003){
            if (!window.location.href.includes("sortName/v2/"+Sort.topic)) return
            break
        }
    }

    setTimeout(async function(){
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Playtime+"continue/fetch", "GET")

        if (Success){
            const Grid = await WaitForClass("game-grid")
            let Children = Grid.children
            const Cards = {}

            while (Children.length === 0){
                await sleep(20)
                Children = Grid.children
            }

            const ExistsLookup = {}
            for (let i = 0; i < Result.length; i++){
                ExistsLookup[Result[i]] = true
            }

            const CardsInOrder = []

            for (let i = 0; i < Children.length; i++){
                const Card = Children[i]
                const Id = parseInt(Card.children[0].getAttribute("id"))

                if (ExistsLookup[Id]) Cards[Id] = Card
                else CardsInOrder.push(Card)
            }

            for (let i = Result.length-1; i >= 0; i--){
                const Card = Cards[Result[i]]
                if (Card) CardsInOrder.unshift(Card)
            }

            Grid.append(...CardsInOrder)
        }
    }, 0)
})