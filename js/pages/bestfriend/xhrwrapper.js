function onDefined(object, property, checkInit) { //thanks julia
    return new Promise((resolve) => {
        if (!checkInit && (object[property] !== undefined)) return resolve(object[property]);

        const oldSetProperty = Object.getOwnPropertyDescriptor(object, property)?.set;
        const properties = {
            enumerable: false,
            configurable: true,
            set(value) {
                // We actually define the .set property after extensions like BTRoblox
                // so we need to store the old set property and then call it for compatibility
                if (oldSetProperty) {
                    try {
                        oldSetProperty(value);
                    } catch {
                        /* catch errors */
                    }
                }
                delete object[property];
                object[property] = value;

                resolve(value);
            },
        };

        if (checkInit) {
            const oldValue = object[property];
            properties.get = () => oldValue;
        }

        Object.defineProperty(object, property, properties);
    });
}

function InterceptXMLHttpRequest(CheckIntercept, Callback){
    var _XMLHttpRequest = XMLHttpRequest.bind(globalThis);
    XMLHttpRequest = function() {
        var xhr = new _XMLHttpRequest();

        // augment/wrap/modify here
        let Intercept = false
        let URL

        var _send = xhr.send.bind(xhr)
        xhr.send = function(){
            if (Intercept){
                async function Modify(){
                    if (!xhr.responseUrl) xhr.responseUrl = URL

                    const Return = await Callback(xhr)
    
                    if (Return){
                        const [Result, Body] = Return
                        try {
                            Object.defineProperties(xhr, {
                                responseText: {writable: true, configurable: true, value: Body},
                                response: {writable: true, configurable: true, value: Body},
                                status: {writable: true, configurable: true, value: Result.status},
                                statusText: {writable: true, configurable: true, value: Result.statusText}
                            })
                        } catch (error) {console.log(error)}
                    }
                }

                onDefined(xhr, "onload").then(function(){
                    if (!xhr.onload) return

                    var _onload = xhr.onload.bind(xhr)

                    xhr.onload = async function(){
                        await Modify()
                        return _onload.apply(this, arguments)
                    }
                })

                onDefined(xhr, "onreadystatechange").then(function(){
                    if (!xhr.onreadystatechange) return

                    var _onreadystatechange = xhr.onreadystatechange.bind(xhr)

                    xhr.onreadystatechange = async function(){
                        if (xhr.readyState == 4){
                            await Modify()
                        }
    
                        return _onreadystatechange.apply(this, arguments)
                    }
                })
            }

            return _send.apply(this, arguments)
        }

        var _open = xhr.open.bind(xhr);
        xhr.open = function(_, url) {
            //if (url.includes("https://inventory.roblox.com/v2/users/")){
            if (CheckIntercept(url)){
                URL = url
                Intercept = true
            }
            
            return _open.apply(this, arguments);
        }

        return xhr;
    }
}