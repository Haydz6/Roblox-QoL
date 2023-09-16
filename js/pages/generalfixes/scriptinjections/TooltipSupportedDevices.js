function TooltipSupportedDevices(){
    const Icons = document.getElementsByClassName("info-icon-devices")

    for (let i = 0; i < Icons.length; i++){
        $(Icons[i]).tooltip()
    }
}
TooltipSupportedDevices()