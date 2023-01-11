let AllHistory

async function FetchHistory(){
    const [Success, Result] = await RequestFunc(WebServerEndpoints.History, "GET")

    return [Success, Success && Result.History || Result]
}

async function LoadPage(Page){
    if (!AllHistory){
        while (true){
            const [Success, Result] = await FetchHistory()

            if (!Success){
                await sleep(1000)
                continue
            }

            AllHistory = Result.reverse()
            break
        }
    }

    const PageFriends = []

    const Start = (Page * 18) - 18
    const End = Math.min(Page * 18, AllHistory.length)

    for (let i = Start; i < End; i++){
        PageFriends.push(AllHistory[i])
    }

    return [PageFriends, AllHistory.length > Page * 18, AllHistory.length]
}