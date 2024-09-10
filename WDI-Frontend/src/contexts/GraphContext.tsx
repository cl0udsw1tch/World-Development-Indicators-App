
import { createContext } from "react"
import { SetStateType } from "../types"


type GraphDataValue = {
    name: string,
    countries: string[],
    yearStart: number,
    yearEnd: number
}

type GraphData = {
    [indicator: string] : GraphDataValue
}


export const defaultGraphData: GraphData = {
    "SP.POP.TOTL": {
        name: "Population, total",
        countries: ["CAN", "USA"],
        yearStart: new Date(Date.now()).getFullYear() - 12,
        yearEnd: new Date(Date.now()).getFullYear() - 2
    }
}


export const GraphContextReader = createContext<GraphData>(defaultGraphData)
export const GraphContextWriter = createContext<SetStateType<GraphData>>(()=>{})
export type { GraphData, GraphDataValue }