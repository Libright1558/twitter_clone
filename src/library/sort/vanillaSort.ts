import { PostData, PostDataArray } from "../..";

const vanillaSort = async (dataArray: PostDataArray, option: keyof PostData) => {
    dataArray.sort(function (a: PostData, b: PostData) {
        if (a[option]! > b[option]!) {
            return -1;
        }

        if (a[option]! < b[option]!) {
            return 1;
        }
        return 0;
    });
    return dataArray;
};

export default vanillaSort;
