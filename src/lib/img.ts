
const imgNA = 'placeholder.jpg'
type qualityOpts = 'hq' | 'lq' | 'ulq'

/**
 * get the image from imdb api in hq or lq.
 * @param img array where [0] is image link
 * @param quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
export function getImgOfQuality(img: string[], quality: qualityOpts) {
	if (!(Array.isArray(img))) {
		//console.error(`no 'img' array provided. attempted quality: ${quality}. typeof img: ${typeof img}`)
		return imgNA
	}
	const imageURL = img[0].replaceAll("._V1_", "$param") // prepare for parameter injection

	function _constructImageQuery(
		url: string, 
		quality: number, 
		width: number, 
		height: number, 
		cropParam: string
	) {
		return url.replaceAll("$param", `._V1_QL${quality}_UY${height}${cropParam}${width},${height}`)
	}

	if (img === undefined || img.length === 0) {
		return imgNA
	} else {
		// for the widhts and heights here i just referenced a "srcset" for an image on imdb.com
		//console.log(img[0] ?? "undefined", quality)
		switch (quality) {
			case "hq":
				return _constructImageQuery(imageURL, 100, /*380*/1500, /*562*/1000, "_CR0,,")
				break;
			case "lq":
				return _constructImageQuery(imageURL, 75, 285, 422, "_SX100_CR0,,") //_CR1,1,
				break;
			case "ulq":
				return _constructImageQuery(imageURL, 10, 190, 281, "_SX100_CR0,,")
				break;
			default:
				throw "No quality selected."
				break;
		}
	}
}

/**
 * get the image from imdb api in hq or lq.
 * @param {Array} img array where [0] is image link
 * @param {String} quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
export function containCover(imgArr: string[]) {
	if (imgArr === undefined || imgArr.length === 0) { return "cover" } //imgNA is portrait
	return imgArr[1] >= imgArr[2] ? "contain" : "cover"
}