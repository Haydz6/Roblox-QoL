let PingAudio

function CreatePingSound(){
    if (!PingAudio){
        PingAudio = new Audio(chrome.runtime.getURL("sounds/newmessageping.mp3"))
    }
    PingAudio.play()
}

async function ListenToContact(Contact){
    if (Contact.tagName === "LI" && Contact.className.search("chat-friend chat-friend-") > -1){
        const PreLastMessageContainer = Contact.getElementsByTagName("div")[0].getElementsByTagName("div")[2].getElementsByTagName("div")[0]
        let LastMessageContainer

        while (!LastMessageContainer){
            LastMessageContainer = PreLastMessageContainer.getElementsByTagName("div")[1]
            await sleep(100)
        }

        const LastMessageElement = LastMessageContainer.getElementsByTagName("span")[1]
    
        const InnerTextMutation = new MutationObserver(function(mutationList, observer){
            mutationList.forEach(async function(mutation){
                await sleep(1000)
                if (LastMessageContainer.className.search("unread") > -1){
                    CreatePingSound()
                }
            })
        })

        InnerTextMutation.observe(LastMessageElement, {childList: true})
    }
}

const NewMessageObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(function(mutation) {
      if (mutation.type === "childList") {
        const NewNodes = mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            if (NewNodes[i].nodeType === Node.ELEMENT_NODE){
                ListenToContact(NewNodes[i])
            }
        }
      }
    })
})

async function Run(){
    const ContactsList = await WaitForId("chat-friends")
    NewMessageObserver.observe(ContactsList, {childList: true})

    const children = ContactsList.children

    for (let i = 0; i < children.length; i++){
        ListenToContact(children[i])
    }
}

IsFeatureEnabled("NewMessagePing").then(function(Enabled){
    if (Enabled){
        Run()
    }
})