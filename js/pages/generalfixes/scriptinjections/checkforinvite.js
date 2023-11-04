function WaitForRoblox(Callback){
    if (!Roblox?.GameLauncher?.joinGameInstance || !Roblox?.GameLauncher?.gameLaunchInterface?.joinGameInstance){
        setTimeout(function(){
            WaitForRoblox(Callback)
        }, 100)
        return
    }
    Callback()
}

const Params = new URLSearchParams(document.currentScript.getAttribute("search"))
const PlaceId = Params.get("placeId")
const JobId = Params.get("jobId")

if (PlaceId && JobId){
    WaitForRoblox(function(){
        Roblox.GameLauncher.joinGameInstance(parseInt(PlaceId, 10), JobId)
    })
}

document.addEventListener("joinGameInstance", function(Event){
    WaitForRoblox(function(){
        const Detail = Event.detail
        Roblox.GameLauncher.joinGameInstance(Detail.PlaceId, Detail.JobId)
    })
})