const vanillaSort = async (dataArray, option) => {
    dataArray.sort(function (a, b) {
        if (a[option] > b[option]) {
            return -1;
        }

        if (a[option] < b[option]) {
            return 1;
        }
        return 0;
    });
    return dataArray;
};

export default vanillaSort;
