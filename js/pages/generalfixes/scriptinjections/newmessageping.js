let PingAudio

function CreatePingSound(){
    if (!PingAudio){
        PingAudio = new Audio("https://qol.haydz6.com/assets/newmessageping.mp3")
    }
    PingAudio.play()
}

async function WaitForFactory(){
    while (!window.Roblox?.RealTime?.Factory){
        console.log("waiting for factory")
        await new Promise(r => setTimeout(r, 100))
    }

    console.log("factory")
    window.Roblox.RealTime.Factory.GetClient()?.Subscribe("ChatNotifications", message => {
        let IsFocused = document.activeElement?.parentElement?.parentElement?.parentElement?.id === "dialog-container-"+message.ConversationId
        console.log(message, IsFocused)

        if (!IsFocused && message.Type === "NewMessage") CreatePingSound()
    })  //Thanks Jullian!!
}
WaitForFactory()