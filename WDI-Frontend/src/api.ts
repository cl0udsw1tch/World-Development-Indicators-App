
const API_ENDPOINT: string = "http://127.0.0.1:5000"


export type API_data_t          = {[country: string] : {year: number, value: number}[]}
export type API_indicator_t     = {id: string, name: string, desc: string}
export type API_indicators_t    = Array<API_indicator_t>
export type API_countries_t     = { [code: string]: string }

function wait(delay: number){
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function fetchRetry(url: string,fetchOptions = {}, delay: number = 1000, tries: number = Infinity) : Promise<any> {
    function onError(err: Error){
        var triesLeft = tries - 1;
        if(!triesLeft){
            throw err;
        }
        return wait(delay).then(() => fetchRetry(url, fetchOptions, delay, triesLeft, ));
    }
    return fetch(url,fetchOptions).catch(onError);
}

const get_home = () : Promise<string> => {
    
    return fetchRetry(API_ENDPOINT!, {
        method: "GET",
    })
    .then(res => res.text())

    
}

const get_indicators = (indicator: string | void) : Promise<API_indicators_t> => {
    if (indicator == null) {
        return fetchRetry(API_ENDPOINT + "/indicators")
        .then(res => res.json())
        .then(res => {
            if (res.code == 1) {
                throw Error("Server error.")
            }
            else if (res.code == 2) {
                throw Error("No data.")
            } else {
                return res.data
            }
        })
    }
    return fetchRetry(API_ENDPOINT + `/indicators/${indicator}`)
    .then(res => res.json())
    .then(res => {
        if (res.code == 1) {
            throw Error("Server error.")
        }
        else if (res.code == 2) {
            throw Error("No data.")
        } else {
            return res.data
        }
    })
}

const get_countries = () : Promise<API_countries_t> => {
    return fetchRetry(API_ENDPOINT + "/countries")
    .then(res => res.json())
    .then(res => {
        if (res.code == 1) {
            throw Error("Server error.")
        }
        else if (res.code == 2) {
            throw Error("No data.")
        } else {
            return res.data
        }
    })
}

const get_data = (
    countries: Array<string>, 
    indicator : string,
    year_s  : Number,
    year_f : Number,
) : Promise<API_data_t> => {

    const params : URLSearchParams = new URLSearchParams()
    params.set("countries", countries.join(";"))
    params.set("indicator", indicator)
    params.set("year_s", year_s.toString())
    params.set("year_f", year_f.toString())

    return fetchRetry(API_ENDPOINT + `/data?${params.toString()}`)
    .then(res => res.json())
    .catch((_: Error) => {
        throw Error("Server error.")
    })
    .then(res => {
        console.log(res, (Object.values(res).every(arr => Array.isArray(arr) && arr.length === 0)))
        if (res.code == 1) {
            console.log("code 1")
            throw Error(`The world bank probably archived indicator [${indicator}]'s data. Unfortunately we can't access it.`)
        }
        else if (res.code == 2 || (Object.values(res.data).every(arr => (arr as {year: number, value: number}[]).length === 0))) {
            throw Error("No data found for this combo of inputs.")
        } else {
            return res.data
        }
    })
}

const get_forecast = (
    countries: Array<string>, 
    indicator : string,
    year_s  : Number,
    year_f : Number,
    year_extrapolated: Number
) : Promise<API_data_t> => {
    const params : URLSearchParams = new URLSearchParams()
    params.set("countries", countries.join(";"))
    params.set("indicator", indicator)
    params.set("year_s", year_s.toString())
    params.set("year_f", year_f.toString())
    params.set("year_extrapolated", year_extrapolated.toString())

    return fetchRetry(API_ENDPOINT + `/forecast?${params.toString()}`)
    .then(res => res.json())
    .then(res => {
        if (res.code == 1) {
            throw Error("Server error.")
        }
        else if (res.code == 2) {
            throw Error("No data.")
        } else {
            return res.data
        }
    })
}


export { get_home, get_indicators, get_countries, get_data, get_forecast }

