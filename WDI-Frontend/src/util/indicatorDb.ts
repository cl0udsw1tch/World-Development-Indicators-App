
// public secondaryIndex: number[];
// maps secondaryOrder => primaryOrder

// public tertiaryIndex: number[];
// maps primaryOrder => secondaryOrder
class IndicatorDB {

    public db: Array<{code: string, name: string, frags: string[]}>

    // maps secondaryOrder => primaryOrder
    public secondaryIndex: number[];

    // maps primaryOrder => secondaryOrder
    public tertiaryIndex: number[];

    constructor(db: Array<{code: string, name:string, frags: string[]}>, secondaryIndex: number[], tertiaryIndex: number[]) {
        this.db = db
        this.secondaryIndex = secondaryIndex
        this.tertiaryIndex = tertiaryIndex
    }

}

const secondaryOrdinal = (frags: string[]): string => {
    return frags.reduce((prev, curr) => {
        return prev + (curr !== "" ? curr.at(0)! : "")
    }, "")
}

const secondarySorter = (a: string[], b: string[]) => {
    const aVal = secondaryOrdinal(a)
    const bVal = secondaryOrdinal(b)
    return aVal.slice(0, 3) < bVal.slice(0, 3) ? -1 : (
        aVal.slice(0, 3) > bVal.slice(0, 3) ? 1 : (
            a.slice(0, 3).join("") < b.slice(0, 3).join("") ? -1 : (
                a.slice(0, 3).join("") > b.slice(0, 3).join("") ? 1 : (
                    aVal.slice(3) < bVal.slice(3) ? -1 : (
                        (aVal.slice(3) > bVal.slice(3) ? 1 : 0)))
                )
            )
           
)
}

export {IndicatorDB, secondaryOrdinal, secondarySorter}