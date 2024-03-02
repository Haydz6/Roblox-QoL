let CurrentHeatmap
let IsHeatmapVisible = true
let HeatmapVisibleInt = 0

async function UpdateVisibility(){
    CurrentHeatmap.classList.toggle("open", IsHeatmapVisible)
    CurrentHeatmap.classList.toggle("close", !IsHeatmapVisible)

    HeatmapVisibleInt++
    const Cache = HeatmapVisibleInt

    if (!IsHeatmapVisible) await sleep(500)
    if (Cache == HeatmapVisibleInt) CurrentHeatmap.style.display = IsHeatmapVisible ? "" : "none"
}

function CreateHeatmap(Label){
    // Initialize random data for the demo
    if (CurrentHeatmap){
        IsHeatmapVisible = !IsHeatmapVisible
        UpdateVisibility()
        return
    }

    const Container = document.createElement("div")
    Container.id = "heatmap-playtime-calendar"
    Container.className = "close"
    Container.innerHTML = `<button type="button" class="close top-right-close-button" data-dismiss="modal" style="float: left; opacity: 1;">
    <span aria-hidden="true"><span class="icon-close"></span></span>
</button><div class="container" id="heatmap-playtime-calendar-inner"></div>`

    const InnerContainer = Container.getElementsByClassName("container")[0]

    Container.getElementsByClassName("close")[0].addEventListener("click", function(){
        IsHeatmapVisible = false
        UpdateVisibility()
    })

    CurrentHeatmap = Container

    async function Fetch(){
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Playtime+"heatmap?universeId="+await GetUniverseIdFromGamePage())
        if (!Success){
            return
        }

        const Sessions = Result.Sessions
        const Lookup = {}

        function DateToKey(d){
            return `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`
        }

        for (let i = 0; i < Sessions.length; i++){
            const Session = Sessions[i]

            const d = new Date(Session.Start * 1000)
            const Key = DateToKey(d)

            if (!Lookup[Key]) Lookup[Key] = []

            if (!Session.End && !Session.LastUpdate){
                Lookup[Key].push({name: "Some data missing from 4-20th", date: d, value: 1})
                continue
            }

            Lookup[Key].push({name: d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }), date: d, value: (Session.End || Session.LastUpdate)-Session.Start})
        }

        // let total = 0

        // function padLeft(str,base,chr) {
        //     var  len = (String(base || 10).length - String(str).length)+1;
        //     return len > 0? new Array(len).join(chr || '0')+str : str;
        // }

        // for (let i = 0; i < Sessions.length; i++){
        //     const Session = Sessions[i]
        //     if (!Session.End && !Session.LastUpdate) continue

        //     const d = new Date(Session.Start * 1000)

        //     // const DateFormat = [padLeft((d.getMonth()+1)),
        //     //     padLeft(d.getDate()),
        //     //     d.getFullYear()].join('/') +' ' +
        //     //    [padLeft(d.getHours()),
        //     //     padLeft(d.getMinutes()),
        //     //     padLeft(d.getSeconds())].join(':');

        //     const Elapsed = (Session.End || Session.LastUpdate)-Session.Start
        //     total += Elapsed

        //     Details.push({name: d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }), date: d, value: Elapsed})
        // }

        var now = moment().endOf('day').toDate();
        var time_ago = moment().startOf('day').subtract(10, 'year').toDate();
        var example_data = d3.timeDays(time_ago, now).map(function (dateElement, index) {
            const Details = Lookup[DateToKey(dateElement)] || []
            
            return {
                date: dateElement,
                details: Details,
                init: function () {
                this.total = this.details.reduce(function (prev, e) {
                    return prev + e.value;
                }, 0);
                return this;
                }
            }.init();
        });

        // Set the div target id
        var div_id = 'heatmap-playtime-calendar-inner';

        // Set custom color for the calendar heatmap
        var color = '#cd2327';

        // Set overview type (choices are year, month and day)
        var overview = 'year';

        // Handler function
        var print = function (val) {
            
        };

        // Initialize calendar heatmap
        calendarHeatmap.init(example_data, div_id, color, overview, print)
        UpdateVisibility()

        const Tooltip = Container.getElementsByClassName("heatmap-tooltip")[0]
        Tooltip.style.position = "absolute"
        Tooltip.style["z-index"] = "101"
        Tooltip.style["pointer-events"] = "none"
        document.body.appendChild(Tooltip)

        Container.style.maxWidth = "1450px"
        UpdatePosition()
    }

    Fetch()

    function UpdatePosition(){
        Container.style.top = Label.getBoundingClientRect().top + "px"
    }
    window.addEventListener("resize", function(){
        UpdatePosition()
        window.requestAnimationFrame(UpdatePosition)
    })
    UpdatePosition()

    return Container
}