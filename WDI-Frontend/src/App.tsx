import { useContext, useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import './App.css'
import * as api from "./api"
import { HomeSvg } from './components/HomeLogo'
import { SetStateType } from './types'
import SideBar from './components/SideBar'
import { IndicatorDB, secondarySorter } from './util/indicatorDb'
import { defaultGraphData, GraphContextReader, GraphContextWriter, GraphData } from './contexts/GraphContext'
import Graphs from './components/graph/Graphs'
import { defaultInput, Input, InputContextReader, InputContextWriter } from './contexts/InputContext'

const TitleVariants : Variants = {

    hidden: {
        opacity: 0, 
        scale: 0.1,
        x: "-100vw"
    },
    visible: {
        opacity: 1, 
        color: "#FFFFFF", 
        scale: 1.0, 
        rotate: 360, 
        x: '0vw',
        transition: {
            duration: 3, 
            type: 'spring', 
            stiffness: 100
        }
    },
    whileHover: {
        color: ["#09CBC5", "#FF00FF"], 
        transition: {
            duration: 2, 
            repeat: Infinity, 
            ease: "linear", 
            repeatType: "mirror"
        }
    }
}

const CountryHeaderBar = () => {
    const graphContextReader = useContext(GraphContextReader)
    return (
        
        <h3 style={{color: "#FFF", fontFamily: "monospace"}}> &gt; {[...new Set(Object.keys(graphContextReader).map(indicator => graphContextReader[indicator].countries).flat())].join(", ")}
        </h3>
    )
}

const Message = () => {
    const [fullMsg, setFullMsg] : [string, SetStateType<string>] = useState("")
    const [msg, setMsg]         : [string, SetStateType<string>] = useState("")
    useEffect(() => {{
        api.get_home()
        .then(res => {

            setFullMsg(res)
        })
    }}, [])
    useEffect(() => {
        if (msg.length < fullMsg.length) {
            setTimeout(() => {
                setMsg(() => fullMsg.substring(0, msg.length+1))
            }, msg[msg.length - 1] == "," ? 45 : msg[msg.length - 1] == " " ? 25 : 35)
        }
    }, [fullMsg, msg])

    return (
        <div id='msg'>
            <span>{msg}</span>
        </div>
    )
}

const prepareIndicators = (indicators : api.API_indicators_t) : IndicatorDB => {


    var res = indicators.map(ind => {
        return {
            code: ind.id,
            name: ind.name,
            frags: ind.id.toUpperCase().match(/([a-zA-Z0-9]+)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*)[._]*([a-zA-Z0-9]*).*/)!.slice(1)
        }
    })

    res.sort((a, b) => {
        const aVal = a.frags.join("")
        const bVal = b.frags.join("")
        return aVal < bVal ? -1 :(aVal > bVal ? 1 : 0)
        
    })

    const sorted = res.map((item, i) => ({item: item, originalIndex: i}))
    .sort((a, b) => secondarySorter(a.item.frags, b.item.frags))
    .map(item => item.originalIndex)

    const invertedArray: number[] = [];

    sorted.forEach((value, index) => {
    invertedArray[value] = index;
    });


    const db = new IndicatorDB(res, sorted, invertedArray);
    
    return db
}



function App() {


   
    const [indicatorDB, setIndicatorsDB] : 
    [IndicatorDB, SetStateType<IndicatorDB>] 
    = useState(new IndicatorDB(new Array<{code: "", name: "", frags: string[]}> , [], []))


    const [countryDB, setCountryDB] : [api.API_countries_t, SetStateType<api.API_countries_t>] = useState({})
    const [graphData, setGraphData] : [GraphData, SetStateType<GraphData>] = useState(defaultGraphData)

    const [input, setInput] : [Input, SetStateType<Input>] = useState(defaultInput)

   


    useEffect(() => {
        api.get_countries()
        .then(res => {setCountryDB(res)})
    }, [])


    useEffect(() => {
        (api.get_indicators() as Promise<api.API_indicators_t>)
        .then((res) => {
            setIndicatorsDB(() =>  prepareIndicators(res) )
        })
    }, [])


    


  return (
      <div className='app'>
            <header>
                <div id='title-logo'>
                <motion.h1 className='title' variants={TitleVariants} initial="hidden" animate="visible" whileHover="whileHover" >
                THE WORLD DEVELOPMENT INDICATORS APP
                </motion.h1> 
                    <HomeSvg/>
                <div style={{flex: "1"}}>
                </div>
                </div>
                <Message/>
                <GraphContextReader.Provider value={graphData}>
                    <CountryHeaderBar/>
                </GraphContextReader.Provider>
            </header>
            <div className='body'>
                <InputContextReader.Provider value={input}>
                    <InputContextWriter.Provider value={setInput}>
                        <GraphContextWriter.Provider value={setGraphData}>
                            <GraphContextReader.Provider value={graphData}>
                                <Graphs/>
                            </GraphContextReader.Provider>
                            <SideBar countryDB={countryDB} indicatorDB={indicatorDB} />
                        </GraphContextWriter.Provider>
                    </InputContextWriter.Provider>
                </InputContextReader.Provider>
            </div>
        <footer>
            <a className='LinkedIn' target="_blank" style={{display: "flex", justifyContent: "center", alignItems: "center", color: '#DBC012', textDecoration: "none"}} href='https://www.linkedin.com/in/nurein-umeya-26b759326/' >
                My LinkedIn
              </a>
              <div>
                <p style={{display: "flex", justifyContent: "center", alignItems: "center", color: "#96aeda", fontSize: 15}} >
                  ALL DATA AND DESCRIPTIVE INFORMATION WAS TAKEN FROM THE&nbsp; <a href='https://www.worldbank.org/' target="_blank" style={{color: "#e9afe7", textDecoration: "none"}}>WORLD BANK</a> </p>
              </div>
        </footer>
    </div>
  )
}

export default App
