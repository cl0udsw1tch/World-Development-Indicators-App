import React, { useContext, useEffect, useRef, useState } from "react"
import { SetStateType } from "../../types"
import {FixedSizeList} from "react-window"
import { IndicatorDB, secondaryOrdinal } from "../../util/indicatorDb";
import { binarySearch } from "../../util/util";
import { IndicatorContextReader, InputContextWriter } from "../../contexts/InputContext";
import {  motion, useAnimate } from "framer-motion";
import { IsSearchingContextReader, IsSearchingContextWriter, IndicatorDisplayContextReader } from "../../contexts/InputContext";
import * as api from "../../api"
import Loading from "../loading/Loading";

const codeGetter = (db: IndicatorDB, idx: number) => {
    // searchType = code
    return db.db[db.secondaryIndex[idx]]
}

const nameGetter = (db: IndicatorDB, idx: number) => {
    return db.db[idx]
}
const codeValGetter = (item: {code: string, name: string, frags: string[]}) => {
    return item.code
} 
const nameValGetter = (item: {code: string, name: string, frags: string[]}) => {
    return item.name
}

const IndicatorPicker = ({indicatorDB} : {indicatorDB: IndicatorDB}) => {

    const [activeIndicator, setActiveIndicator] : [{code: string, name: string, codeIdx: number, nameIdx: number, displayIdx: number}, SetStateType<{code: string, name: string, codeIdx: number, nameIdx: number, displayIdx: number}>] = useState({code: "", name: "", codeIdx: -1, nameIdx: -1, displayIdx: -1})
    const indicatorContextReader = useContext(IndicatorContextReader)
    const inputContextWriter = useContext(InputContextWriter)
    const ref = useRef<FixedSizeList>(null)
    
    

    const [searchResults, setSearchResults]  = useState<
    {ok: boolean, type: "code" | "name", res: Array<{idx: number, resIdx: number}>}
    >({ok: true, type: "code", res: new Array<{idx: number, resIdx: number}>})
    
    const indicatorDisplayContext = useContext(IndicatorDisplayContextReader)

    const [indicatorGetter, setIndicatorGetter] = useState<{
        itemGetter: (db: IndicatorDB, idx: number) => {code: string, name: string, frags: string[]}, 
        valGetter: (item: {code: string, name: string, frags: string[]}) => string
    
    }>({itemGetter: codeGetter, valGetter: codeValGetter})

    const [query, setQuery] : [string, SetStateType<string>] = useState("")
    const isSearching = useContext(IsSearchingContextReader)
    const setIsSearching = useContext(IsSearchingContextWriter)

    const [indicatorInfo, setIndicatorInfo] = useState("")
    const [showInfo, setShowInfo] = useState(false)
    const [exitHover, setExitHover] = useState(false)
    const [loading, setLoading] = useState(false)

    const QuitSearch = () => {
        ClearSearch()
        setQuery(() => "")
        setIsSearching(() => false)

    }
    const ClearSearch = () => {
        setSearchResults((prev) => ({
            ok: true,
            res: [],
            type: prev.type
        }))
        //
    }
    const StartSearch = (_query: string) => {
        setIsSearching(() => true)
        setSearchResults(() => ({
            ok: true,
            res: [],
            type: indicatorDisplayContext
        }))
        setQuery(() => _query)
    }
    const RestartSearch = (_query: string) => {
        setSearchResults((prev) => ({
            ok: true,
            res: [],
            type: prev.type
        }))
        setQuery(() => _query)
    }
    const ContinueSearch = (_query: string) => {
        setQuery(() => _query)
    }


    const [scope, animate] = useAnimate()
    useEffect(() => {
        if (!searchResults.ok) {
            RestartSearch(query)
            animate(
                scope.current, 
                {
                    borderColor: ["rgb(13, 95, 64)", "rgb(188, 19, 188)", "rgb(13, 95, 64)"],
                    rotate: [0, -1,0,1, 0],
                    translateX: [0, -1, 0, 1, 0]
                }, 
                {
                    duration: 0.3,
                    delay: 0
              })
        } 
    }, [searchResults])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.value.length == 0) {
            QuitSearch()
            return
        }

        if (e.target.value.length < query.length){

            RestartSearch(e.target.value)
  
        } else {
            if (!isSearching) {
                StartSearch(e.target.value)
            } else {
                ContinueSearch(e.target.value)
            }
        }

    }

    const getItemDisplayedAt = (index: number) => {
    

            var codeIdx: number
            var nameIdx: number
            if (isSearching && searchResults.ok) {

                if (searchResults.type == "code"){
                    codeIdx = searchResults.res[index].idx
                    nameIdx = indicatorDB.secondaryIndex[codeIdx]
                } else {
                    nameIdx = searchResults.res[index].idx
                    codeIdx = indicatorDB.tertiaryIndex[nameIdx]
                }
            } else {
                if (indicatorDisplayContext == "code"){
                    codeIdx = index
                    nameIdx = indicatorDB.secondaryIndex[codeIdx]
                } else {
                    nameIdx = index
                    codeIdx = indicatorDB.tertiaryIndex[nameIdx]
                }
            }

            return {
                code: indicatorDB.db[nameIdx].code,
                name: indicatorDB.db[nameIdx].name,
                codeIdx: codeIdx,
                nameIdx: nameIdx,
                displayIdx: index
            }
    }
        

    const IndicatorItem = ({index, style} : {index: number, style: React.CSSProperties}) => {
        
        const [item, setItem] = useState({
            code: "",
            name: "",
            codeIdx: -1,
            nameIdx: -1,
            displayIdx: -1,
        })

        useEffect(() => {
            setItem(() => getItemDisplayedAt(index) )
        }, [])

        const handleInfo = () => {
            setShowInfo(() => true)
            setLoading(() => true)
            api.get_indicators(item.code)
            .then(res => {
                setIndicatorInfo(()=>{
                        return (res as api.API_indicator_t[])[0].desc || "No description available"
                    }
                )
            })
            .catch(() => {
                setIndicatorInfo(() => 
                    "Server error, please try again later or pick a different indicator."
                )
            })
            .finally(() => {
                setTimeout(() => {
                    setLoading(() => false)
                }, 1000)
            })
        }



    
        return (
            <div 
            className={`indicatorItem ${item.code == activeIndicator.code? "active": ""}`} 
            style={style}
            onClick={() => {setActiveIndicator(() => item)}}
            
            >
                <div className="infoToggle" onClick={(e) =>{ e.preventDefault();e.stopPropagation(); handleInfo()}}>
                <i className='bx bxs-info-circle' ></i>
                </div>

                <span>
                {indicatorDisplayContext == "code" ? item.code : item.name}
                </span>
            </div>
        )
    }


    const IndicatorFromLetters = () => {
        const reducer = (prev: string, curr: string) => {
            return prev + (curr !== "" ? curr.at(0)! : "")
        }
        var codeIdx = binarySearch(
            idx => indicatorDB.db[indicatorDB.secondaryIndex[idx]], 
            indicatorContextReader.first + indicatorContextReader.second + indicatorContextReader.third, 
            0, 
            indicatorDB.secondaryIndex.length - 1, 
            (a, target) => {
       
            const a_val = a.frags.reduce(reducer, "")
            if (a_val.slice(0, target.length).includes(target, 0)) {
                return 0
            }
            return a_val < target ? -1 : (a_val > target ? 1 : 0) 
            
        })

        if (codeIdx != -1) {
            while (codeIdx > 0 && secondaryOrdinal(indicatorDB.db[indicatorDB.secondaryIndex[codeIdx]].frags).slice(0,(indicatorContextReader.first + indicatorContextReader.second + indicatorContextReader.third).length) == indicatorContextReader.first + indicatorContextReader.second + indicatorContextReader.third) {
                codeIdx--
            }
            codeIdx++
            
            const item = indicatorDB.db[indicatorDB.secondaryIndex[codeIdx]]
            setActiveIndicator({code: item.code, name: item.name, codeIdx: codeIdx, nameIdx: indicatorDB.tertiaryIndex[codeIdx], displayIdx: codeIdx} )
        }
    }


    useEffect(() => {
        switch (indicatorDisplayContext) {
            case "code":
                setIndicatorGetter(() => ({itemGetter: codeGetter, valGetter: codeValGetter}))
                break
            case "name":
                setIndicatorGetter(() => ({itemGetter: nameGetter, valGetter: nameValGetter}))
        }
       
    }, [indicatorDisplayContext])

    useEffect(() => {
        if (query != "") {
            setSearchResults((prev) => {
                const useDB = !isSearching || (searchResults.ok && searchResults.res.length == 0)
                var len = useDB ? indicatorDB.db.length : prev.res.length
                var idxGetter: (i: number) => {idx: number, resIdx: number} 
                = useDB ? 
                (i: number) : {idx: number, resIdx: number} => {
                    return {idx: i, resIdx: -1}
                } : 
                (i: number) : {idx: number, resIdx: number} => {
                    return {idx: prev.res[i].idx, resIdx: i}
                }
               
                var updated = new Array<{idx: number, resIdx: number}>
                for (var i = 0; i < len; i++) {
                    const curr = indicatorGetter.valGetter(indicatorGetter.itemGetter(indicatorDB, idxGetter(i).idx))
                    curr.includes(query) ? updated.push(idxGetter(i)) : false
                }
                return {
                    ok: updated.length > 0,
                    type: indicatorDisplayContext,
                    res: updated
                }
            })
        } else {
            QuitSearch()
        }
    }, [query])


    useEffect(() => {
        IndicatorFromLetters()
    }, [indicatorContextReader.first, indicatorContextReader.second, indicatorContextReader.third])

    useEffect(() => {
        inputContextWriter((input) => ({
            ...input,
            indicator: activeIndicator
        }))
        
    }, [activeIndicator])

    useEffect(() => {
        if (activeIndicator.code != "") {
            setTimeout(() => {
                // THIS DUMB FUCKING FIXEDSIZELIBRARY ACTUALLY FUCKING REQUIRED A TIMEOUT FUCK YOU WHOEVER WROTE IT FUCKING WASTING MY TIME
                ref.current!.scrollToItem((isSearching ? activeIndicator.displayIdx :  indicatorDisplayContext == "code" ? activeIndicator.codeIdx: activeIndicator.nameIdx), "center")
            }, 100);
        }
    }, [activeIndicator, indicatorDisplayContext])

    useEffect(() => {
        if (!isSearching){
            setSearchResults(() => ({ok: true, type: indicatorDisplayContext, res: []}))
        }
    }, [isSearching])


    useEffect(() => {
        if (indicatorInfo == "") {
            setExitHover(() => false)
        }
    }, [indicatorInfo])

  return (
    <div id='indicatorPicker'>
        <div className={`infoContainer ${!showInfo ? "hide" : ""}`} >
            <div className="exit">
                <i className="bx bxs-exit" onClick={() => { setShowInfo(() => false); setIndicatorInfo("")}} onMouseEnter={() => {setExitHover(() => true)}} onMouseLeave={() => {setExitHover(() => false)}} style={{transform: exitHover ? "scale(2) rotate(180deg)" : "scale(1) rotate(180deg)"}}></i>
            </div>
            <div className="info">
                {!loading ? <span>{indicatorInfo}</span> : <Loading/>}
            </div>

        </div>
        <motion.div className="searchBar" ref={scope}>
                <input value={query} type="text" id="indicator"  placeholder={"SP.POP.TOTL"} onChange={e => {handleInputChange(e)}}/>
            </motion.div>
        {indicatorDB.db.length > 0 ? <FixedSizeList 
        ref={ref}
        className="indicatorItems"
         height={200}
         itemCount={isSearching ? searchResults.res.length : indicatorDB.db.length} 
         itemSize={indicatorDisplayContext == "code" ? 50 : 150}
         width={"100%"}>
            {IndicatorItem}
        </FixedSizeList> : <Loading/>}
        
    </div>
  )
}

export default IndicatorPicker