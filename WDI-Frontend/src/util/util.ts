

function cleanAndCapitalize(str: string) {
    return str.replace(/[^a-z0-9]/gi, '').toUpperCase();
}
 

function binarySearch<U, T>(
    item: (idx: number) => U, 
    target: T, 
    firstIdx: number, 
    lastIdx: number, 
    comparator: (a:U, target:T) => number) {

    let left = firstIdx;
    let right = lastIdx;

    while (left <= right) {
        const middle = Math.floor((left + right) / 2);

        if (comparator(item(middle), target) == 0) {
        return middle; // Target found at index `middle`
        } else if (comparator(item(middle), target) == -1) {
        left = middle + 1; // Search in the right half
        } else {
        right = middle - 1; // Search in the left half
        }
    }

    return -1; // Target not found
}
  
export {cleanAndCapitalize, binarySearch}


