let PingAudio

function CreatePingSound(){
    if (!PingAudio){
        PingAudio = new Audio("https://qol.haydz6.com/assets/newmessageping.mp3")
    }
    PingAudio.play()
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