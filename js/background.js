chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse){
    if (sender.id !== chrome.runtime.id) return

    if (request.type === "notification"){
        chrome.notifications.create("", request.notification)
    }
    // } else if (request.type === "gpscoords"){
    //     const Success = await chrome.permissions.request({permissions: ["geolocation"]})
    //     sendResponse(Success)

        // navigator.geolocation.getCurrentPosition(function(Position){
        //     sendResponse({GPSSuccess: true, Error: "", Lat: Position.coords.latitude, Lng: Position.coords.longitude})
        // }, function(Error){
        //     sendResponse({GPSSuccess: false, Error: Error.message})
        // }, {maximumAge: 86400, timeout: 60, enableHighAccuracy: false})
    // }
})