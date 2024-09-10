
import IndicatorSliders from './sidebar/IndicatorSliders'
import CountryBar from './sidebar/CountryBar'
import { SetStateType } from '../types'
import IndicatorPicker from './sidebar/IndicatorPicker'
import { IndicatorDB } from '../util/indicatorDb'
import { useContext, useEffect, useState } from 'react'
import { defaultIndicatorLetters,  IndicatorContextReader,  IndicatorContextWriter,  IndicatorLetters, InputContextReader, InputContextWriter } from '../contexts/InputContext'
import { API_countries_t } from '../api'
import YearPicker from './sidebar/YearPicker'
import { GraphContextWriter } from '../contexts/GraphContext'
import { CountriesErrorContextReader, CountriesErrorContextWriter} from '../contexts/CountriesErrorContext'
import { motion, useAnimate } from 'framer-motion'
import { IsSearchingContextReader, IsSearchingContextWriter, IndicatorDisplayContextReader, IndicatorDisplayContextWriter} from "../contexts/InputContext"


const CountriesTab = () => {

    const countriesErrorContext = useContext(CountriesErrorContextReader)
    const countriesErrorContextWriter = useContext(CountriesErrorContextWriter)

    const inputContext = useContext(InputContextReader)
    const inputContextWriter = useContext(InputContextWriter)

    const [countryScope, animate] = useAnimate()
    
    useEffect(() => {
        if (countryScope.current && countriesErrorContext){
            
            animate(
                countryScope.current,
                {
                    color: ["rgb(255,255,255)", "rgb(188, 19, 188)", "rgb(255,255,255)"],
                    rotate: [0, -1,0,1, 0, -1,0,1, 0],
                    translateX: [0, -1, 0, 1, 0, -1, 0, 1, 0]
                },
                {
                    duration: 0.5,
                }
    
            )
            countriesErrorContextWriter(() => false)
        }
        
    }, [countriesErrorContext])

    return (
        <div id='countries-date'>
            <div className='countries'>
                <motion.div className='input' ref={countryScope}>Countries:{" "}</motion.div> 
                
                {inputContext.countries.map((country) => {
                    return (
                        <div className='country' onClick={() => {
                            inputContextWriter((input) => {
                                const c = input
                                c.countries = c.countries.filter(item => item != country)
                                return {...c}
                            })
                        }}>
                            <span>
                                {country}
                            </span>
                        </div>
                    )
                })}
            </div>
            <div className='date'>
                <span>
                    Years: {inputContext.yearStart} : {inputContext.yearEnd}
                </span>
            </div>
            
        </div>
    )
}

const InputTab = () => {
    const inputContext = useContext(InputContextReader)
    
    const graphContextWriter = useContext(GraphContextWriter)
    const [scope, animate] = useAnimate()
    const [shouldAnimate, setShouldAnimate] = useState(false)


    const handleUpdate = () => {
        if (inputContext.indicator.code != "") {

            graphContextWriter(graphContext => ({
                ...graphContext,
                [inputContext.indicator.code] : {
                    name: inputContext.indicator.name,
                    countries: inputContext.countries,
                    yearStart: inputContext.yearStart,
                    yearEnd: inputContext.yearEnd
                }
            }))
        } else {
            setShouldAnimate(() => true)
        }
    }
    useEffect(() => {
        if (scope.current && shouldAnimate) {

            animate(
                scope.current,
                {
                    color: ["rgb(255,255,255)", "rgb(188, 19, 188)", "rgb(255,255,255)"],
                    opacity: [1, 1, 1, 1, 1, 0.15],
                    rotate: [0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0]

                },
                {
                    duration: 0.5,
                    delay: 0
                }
            )
        }
        setShouldAnimate(() => false)

    }, [shouldAnimate])


    return (
        <div className='inputTab' >

            
            <div id='indicator' onClick={() => {
                handleUpdate()
            }}>
                <motion.i ref={scope} className='add bx bx-plus'>
                </motion.i>
                <span>

                Indicator: {inputContext.indicator.code}<br/>
                {inputContext.indicator.name}
                </span>
            </div>
            
                <CountriesTab/>
            
            
        </div>
    )
}


const SideBar = (
    {countryDB, indicatorDB} : 
    {countryDB: API_countries_t, indicatorDB: IndicatorDB}
) => {

    const [letters, setLetters] : [IndicatorLetters, SetStateType<IndicatorLetters>] = useState(defaultIndicatorLetters)
    const [visible, setVisible] : [boolean, SetStateType<boolean>] = useState(false)
    const [countriesError, setCountriesError] = useState(false)
    const [searchType, setSearchType] : ["code" | "name", SetStateType<"code" | "name">] = useState<"code" | "name">("code")
    const [isSearching, setIsSearching] = useState(false)

    const [toggleScope, toggleAnim] = useAnimate()

    
    useEffect(() => {
        if (toggleScope.current) {
            toggleAnim(
                toggleScope.current,
                {
                    x: ["0px",  "-10px",  "0px"]
                },
                {
                    duration: 2,
                    delay: 0,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }
            )
        }
    }, [])

    const [activeToggle, setActiveToggle] = useState(false)

  return ( 
    <div className={`sideBar ${visible ? "" : "hideBar"}`}>
        <motion.div className="toggle" id={`${visible? "right" : "left"}`} ref={toggleScope}>

        <i className='bx bx-chevrons-left' id={activeToggle? "active" : ""} onMouseOver={() => {setActiveToggle(() => true)}} onMouseLeave={() => {setActiveToggle(() => false)}}  onClick={() => {
            setVisible(v => !v)
        }}></i>
        </motion.div>
        <div className='content'>

            <div id='top'>

                <div id='sliders'>
                <div className='searchTypePicker'>
                    <div className={`name ${searchType == "name" ? "active" : ""}`} onClick={() => {setSearchType(()=>"name")}}>
                        <span>name</span>
                    </div>
                    <div className={`code ${searchType == "code" ? "active" : ""}`} onClick={() => {setSearchType(()=>"code")}}>
                        <span>code</span>
                    </div>
                </div>
                    <CountriesErrorContextWriter.Provider value={setCountriesError}>
                        <CountryBar countryDB={countryDB}/>
                    </CountriesErrorContextWriter.Provider>
                    <IndicatorContextWriter.Provider value={setLetters}>
                        <IndicatorDisplayContextWriter.Provider value={setSearchType}>
                            <IsSearchingContextWriter.Provider value={setIsSearching}>
                                <IndicatorSliders/>
                            </IsSearchingContextWriter.Provider>
                        </IndicatorDisplayContextWriter.Provider>
                    </IndicatorContextWriter.Provider>
                </div>
                <div className='indicatorPicker'>
                    <IndicatorContextReader.Provider value={letters}>
                         <IndicatorDisplayContextReader.Provider value={searchType}>
                            <IsSearchingContextWriter.Provider value={setIsSearching}>
                                <IsSearchingContextReader.Provider value={isSearching}>
                                    <IndicatorPicker indicatorDB={indicatorDB}/>
                                </IsSearchingContextReader.Provider>
                            </IsSearchingContextWriter.Provider>
                        </IndicatorDisplayContextReader.Provider>
                    </IndicatorContextReader.Provider>
                </div>
                
            </div>
            <div id='bottom'>
                <YearPicker/>
                <CountriesErrorContextWriter.Provider value={setCountriesError}>
                    <CountriesErrorContextReader.Provider value={countriesError}>
                        <InputTab/>
                    </CountriesErrorContextReader.Provider>
                </CountriesErrorContextWriter.Provider>
            </div>
        </div>
    </div>
  )
}

export default SideBar