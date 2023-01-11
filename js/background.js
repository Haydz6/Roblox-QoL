chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (sender.id !== chrome.runtime.id) return

    if (request.type === "notification"){
        chrome.notifications.create("", request.notification)
    }
})