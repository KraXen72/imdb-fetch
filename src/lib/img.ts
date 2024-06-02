import type { IMDBImg } from "./types"

const imgNA = 'placeholder.jpg'
type qualityOpts = 'hq' | 'lq' | 'ulq'

/**
 * get the image from imdb api in hq or lq.
 * @param img array where [0] is image link
 * @param quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
export function getImgOfQuality(img: IMDBImg, quality: qualityOpts) {
	if (!(Array.isArray(img)) || typeof img === 'undefined') {
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

	// for the widhts and heights here i just referenced a "srcset" for an image on imdb.com
	//console.log(img[0] ?? "undefined", quality)
	switch (quality) {
		case "hq":
			return _constructImageQuery(imageURL, 100, /*380*/1500, /*562*/1000, "_CR0,,")
		case "lq":
			return _constructImageQuery(imageURL, 75, 285, 422, "_SX100_CR0,,") //_CR1,1,
		case "ulq":
			return _constructImageQuery(imageURL, 10, 190, 281, "_SX100_CR0,,")
		default:
			throw "No quality selected."
	}
}

/**
 * get the image from imdb api in hq or lq.
 * @param {Array} img array where [0] is image link
 * @param {String} quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
export function containCover(imgArr: IMDBImg) {
	if (typeof imgArr === 'undefined') return "cover" //imgNA is portrait
	return imgArr[1] >= imgArr[2] ? "contain" : "cover"
}