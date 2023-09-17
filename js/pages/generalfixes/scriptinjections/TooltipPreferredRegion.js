function TooltipPreferredRegion(){
    const Icons = document.getElementsByClassName("preferred-region-join-button")

    if (Icons.length > 0) $(Icons[0]).tooltip()
}
TooltipPreferredRegion()