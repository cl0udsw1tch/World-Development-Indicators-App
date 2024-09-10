import  { ReactHTML, useContext, useEffect, useRef, useState } from 'react'

import { defaultInput, InputContextWriter } from '../../contexts/InputContext'
import { SetStateType } from '../../types'


const YearPicker = () => {

    const inputContextWriter = useContext(InputContextWriter)
    const [years, setYears] : [Array<number>, SetStateType<Array<number>>] = useState([defaultInput.yearStart, defaultInput.yearEnd])

    const leftref = useRef<HTMLDivElement>(null)
    const rightref = useRef<HTMLDivElement>(null)

    const createHandleWheel = (i: "start" | "end") :(e: WheelEvent) => void =>  {
        switch (i) {
            case "start" :
                return (e: WheelEvent) : void => {
                    e.preventDefault()
                    setYears(years => {
                        if (e.deltaY < 0 && years[0] < years[1] - 1) {
                            return [years[0] + 1, years[1]]
                        }
                        else if (e.deltaY > 0 && years[0] > 1950) {
                            return [years[0] - 1, years[1]]
                        } else {
                            return years
                        }
                
                    })
                }

            default : 
                return (e: WheelEvent) : void => {
                    e.preventDefault()
                    setYears(years => {

                        if (e.deltaY < 0 && years[1] < new Date(Date.now()).getFullYear()) {
                            return [years[0], years[1] + 1]
                        } else if (e.deltaY > 0 && years[1] - 1 > years[0]) {
                            return [years[0], years[1] - 1]
                        } else {
                            return years
                        }
                    })
                }

        }
    }

    useEffect(() => {
        inputContextWriter((input) => ({
            ...input, 
            yearStart: years[0],
            yearEnd: years[1]
        }))
    }, [years])

    useEffect(() => {
       
        if (leftref.current) {
            leftref.current!.addEventListener("wheel", createHandleWheel("start"), {passive: false})
        }
        if (rightref.current) {
            rightref.current!.addEventListener("wheel", createHandleWheel("end"), {passive: false})
        }
    }, [])

  return (
    <div className='datePicker'>

        <div id='datePicker'>
            <div id='yearStart' ref={leftref}>
             <span >
                {years[0]}
             </span>
            </div>
            <div id='yearEnd' ref={rightref}>
            <span>
                {years[1]}
             </span>
            </div>
        </div>


    </div>
  )
}

export default YearPicker