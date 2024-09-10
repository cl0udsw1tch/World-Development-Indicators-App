import React, { useContext, useEffect, useRef, useState } from "react"
import { API_countries_t } from "../../api"
import { SetStateType } from "../../types"
import { InputContextReader, InputContextWriter } from "../../contexts/InputContext"
import { CountriesErrorContextWriter } from "../../contexts/CountriesErrorContext"
import Loading from "../loading/Loading"

const CountryCodeBar = ({letter, countryDB}: {letter: string, countryDB: API_countries_t}) => {

    const inputContextWriter = useContext(InputContextWriter)
    const inputReaderContext = useContext(InputContextReader)
    const countriesErrorContext = useContext(CountriesErrorContextWriter)

    const [activeCode, setActiveCode] : [string, SetStateType<string>] = useState("")

    const handleClick = (code: string) => {
        var a = new Array<string>
        if (inputReaderContext.countries.includes(code)) {
            a = inputReaderContext.countries.filter(c => c != code)
        } else if (inputReaderContext.countries.length == 10) {
            countriesErrorContext(() => true)
            a = inputReaderContext.countries
        } else {
            a = [...inputReaderContext.countries, code]
        }
        
        inputContextWriter((input) => ({...input, countries: a}))
        
    }

    return (

        <div className='countryCodeBar'>
        {Object.keys(countryDB).length == 0 ? <Loading/> : Object.keys(countryDB).filter(code => code.at(0)! == letter).map(code => {
          
            return (
                <div className='countryCode' 
                onPointerEnter={() => {
                    setActiveCode(code)
                   }}
                onPointerLeave={() => setActiveCode("")}
                onClick={() => handleClick(code)} 
                >
                    <span className={code == activeCode || inputReaderContext.countries.includes(code) ? "active" : ""} >
                    {code}
                    </span>
                </div>
            )
        })}
        </div>
        )
}

const CountryBar = ({countryDB}: {countryDB: API_countries_t}) => {

    const [letter, setLetter] : [string, SetStateType<string>] = useState("A")
    const ref = useRef<HTMLDivElement>(null)

    const handleWheel = (e: WheelEvent) => {
        
        e.preventDefault()
        setLetter((letter) => {
            const _letter = String.fromCodePoint(letter.charCodeAt(0)! + Math.sign(e.deltaY))
            if (!(_letter >= "A" && _letter <= "Z")) {
                return letter
            }
            return _letter
        })
    }

    useEffect(() => {
        if (ref.current) {
          ref.current!.addEventListener("wheel", handleWheel, {passive: false})
        }
    }, [])

    return (
        <div id='countryBar' ref={ref}>

            {[-1,0,1].map(idx => String.fromCharCode(letter.codePointAt(0)! + idx)).map(_letter => {
                
                return (
                    <div className='country' >
                        <span style={{
                        color: `${_letter == letter ? "orange" : "white"}`, 
                        fontSize: _letter == letter ? "0.6rem" : "0.5rem",}}>
                            {_letter >= "A" && _letter <= "Z" ? _letter : "_"}
                        </span>
                        {_letter == letter &&  <CountryCodeBar letter={letter} countryDB={countryDB} />}
                  
                    </div>
                )
            })}
        </div>
    )
}

export default CountryBar