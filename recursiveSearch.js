
function main() {
    let arr = [1, 2, 3, 4, 5, 6];
    console.log(searchSorted(0, 5, 3, arr));
}
//returns index of an array arr where num is found.
//assumes array is sorted from least to greatest.
//even w/ repeated values, would still return an index where one of those values was.
function searchSorted(start, end, num, arr) {
    let len = end-start+1;//5-0+1 = 6. end & start are indecies.
    if (len <= 2) {//base case
        if (arr[start] == num) {
            return start;
        }
        else if (arr[end] == num) {
            return end;
        }
        else {
            return -1;
        }
    }
    else {
        let mid = parseInt(len/2)+start;
        if (num > arr[mid]) {
            return searchSorted(mid+1, end, num, arr);
        }
        else if (num < arr[mid]) {//num is in first half.
            return searchSorted(start, mid-1, num, arr);
        }
        else {//arr[mid] == num
            return mid;
        }
    }
}

main();