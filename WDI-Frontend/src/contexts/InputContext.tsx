import { createContext } from "react";
import { SetStateType } from "../types";

export type IndicatorLetters = {
    first: string, second: string, third: string
}

export const defaultIndicatorLetters = {first: "", second: "", third: ""}
export const defaultInput = {indicator: {code: "", name: ""}, countries: new Array<string>, yearStart: new Date(Date.now()).getFullYear() - 12, yearEnd: new Date(Date.now()).getFullYear() - 2}
export type Input = {
    indicator: {code: string, name: string},
    countries: string[],
    yearStart: number,
    yearEnd: number
}

export const InputContextReader = createContext<Input>(defaultInput)
export const InputContextWriter = createContext<SetStateType<Input>>(()=>{})
export const IndicatorContextReader = createContext<IndicatorLetters>(defaultIndicatorLetters)
export const IndicatorContextWriter = createContext<SetStateType<IndicatorLetters>>(()=>{})

export const IndicatorDisplayContextReader = createContext<"code" | "name">("code")

export const IndicatorDisplayContextWriter = createContext<SetStateType<"code" | "name">>(()=>{})


export const IsSearchingContextReader = createContext<boolean>(false)

export const IsSearchingContextWriter = createContext<SetStateType<boolean>>(()=>{})

export const DisplayInfoContextReader = createContext<string>("")
export const DisplayInfoContextWriter = createContext<SetStateType<string>>(() => {})
