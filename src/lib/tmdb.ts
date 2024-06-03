import type { IMDBWork, ResType, TMDBWork } from "./types"
import { tmdbAPI } from "./api"

const movieTypes = ['feature', 'tv special', 'tv movie', 'tv short', 'short', 'movie', 'video']
const tvTypes = ['tv series', 'tv mini-series']

export async function processTMDB(imdbres: IMDBWork): Promise<[TMDBWork | '404', ResType]> {

	let res = await tmdbAPI.findByID(imdbres.id) ?? { 'movie_results': [], 'tv_results': [] }

	const cleanType = imdbres.q.toLowerCase()
	let restype: ResType = 'other'

	if (movieTypes.includes(cleanType)) {
		restype = 'movie'
	} else if (tvTypes.includes(cleanType)) {
		restype = 'tv'
	}

	if (
		Array.isArray(res['movie_results']) && res['movie_results'].length === 0 &&
		Array.isArray(res['tv_results']) && res['tv_results'].length === 0
	) {
		console.warn(`${imdbres.l} doesen't exist on TMDB`, imdbres)
		return ["404", restype]
	}

	if (restype === "movie" && res['movie_results'].length > 0) {
		return [res['movie_results'][0], restype]
	} else if (restype === "tv" && res['tv_results'].length > 0) {
		return [res['tv_results'][0], restype]
	} else {
		console.warn(`${imdbres.l} doesen't exist on TMDB`, imdbres)
		return ["404", restype]
	}
}