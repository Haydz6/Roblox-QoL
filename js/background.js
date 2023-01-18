chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse){
    console.log(sender.id, chrome.runtime.id, request)
    if (sender.id !== chrome.runtime.id){
        if (request.type === "installed"){
            sendResponse(true)
        }
        return
    }

    if (request.type === "notification"){
        chrome.notifications.create("", request.notification)
    }
})