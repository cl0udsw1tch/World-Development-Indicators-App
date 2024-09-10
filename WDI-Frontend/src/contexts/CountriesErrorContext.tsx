import { createContext } from "react";
import { SetStateType } from "../types";




export const CountriesErrorContextReader = createContext<boolean>(false)

export const CountriesErrorContextWriter = createContext<SetStateType<boolean>>(()=>{})