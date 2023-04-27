let PingAudio
let UserHasInteractedWithPage = false

function PlayPingSound(){
    if (!PingAudio){
        PingAudio = new Audio("https://qol.haydz6.com/assets/newmessageping.mp3")
    }

    PingAudio.play()
}

function CreatePingSound(){
    if (UserHasInteractedWithPage) window.postMessage("canpingformessage")
}

async function WaitForFactory(){
    while (!window.Roblox?.RealTime?.Factory){
        await new Promise(r => setTimeout(r, 100))
    }

    window.Roblox.RealTime.Factory.GetClient()?.Subscribe("ChatNotifications", message => {
        let IsFocused = document.activeElement?.closest(`#dialog-container-${message.ConversationId}`)

        if (!IsFocused && message.Type === "NewMessage") CreatePingSound()
    })  //Thanks Jullian!!
}
WaitForFactory()

window.addEventListener("message", function(event){
    if (event.type === "message" && event.data === "canpingformessage-confirm") PlayPingSound()
})

function PageInteraction(){
    UserHasInteractedWithPage = true

    document.removeEventListener("mousedown", PageInteraction)
    document.removeEventListener("touchstart", PageInteraction)
    document.removeEventListener("keydown", PageInteraction)
}

document.addEventListener("mousedown", PageInteraction)
document.addEventListener("touchstart", PageInteraction)
document.addEventListener("keydown", PageInteraction)