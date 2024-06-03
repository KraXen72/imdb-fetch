import type { TMBDAPIResponse } from "./types"

async function safeJSONRequest(URLObject: URL) {
	try {
		const req = await fetch(URLObject)
		return await req.json()
	} catch (error) {
		console.error(`safeJSONRequest Error:`, error, ' on URL object: ', URL)
		return void 0 // so it can be used with '?? default value'
	}
}

// TODO deprecate this in favor of moviedb-promise

export const omdbAPI = {
	_params: {
		// same thing applies here as the above api key. user rickylawson's freekeys or apply for your own key, you'll get it quickly
		// this api key is request-limited to 1000 requests per day. Either sub to their paetron or handle negative responses
		"apikey": "2deceaec", r: "json"
	},
	async findByID(imdbID: string, params: Record<string, string>) {
		if (typeof imdbID === "undefined") { console.error("invalid id: ", imdbID); return void 0 }
		console.warn("[expensive] api call to OMDb (max 1000 per day)")
		const url = new URL(`https://www.omdbapi.com/`)
		url.search = new URLSearchParams({ ...this._params, "i": imdbID, ...params }).toString()

		return await safeJSONRequest(url)
	}
}

export const tmdbAPI = {
	_params: {
		// this is my api key, but you can get one for free by applying at https://www.themoviedb.org/settings/api.
		// they are not request limited unlike the OMDbapi.
		// or if you don't want to go through registration, there is a bunch of keys here: https://github.com/rickylawson/freekeys 
		"api_key": "7248c5cc1f2080c7baf7361d2427fb80",
		language: "en_US"
	},
	async findByID(imdbID: string, params: Record<string, string> = {}) {
		if (typeof imdbID === "undefined") { console.error("invalid id: ", imdbID); return void 0 }
		const url = new URL(`https://api.themoviedb.org/3/find/${imdbID}`)
		url.search = new URLSearchParams({ ...this._params, "external_source": "imdb_id", ...params }).toString()

		return await safeJSONRequest(url) as Promise<TMBDAPIResponse>
	},
	async search(name: string, type: string, params: Record<string, string> = {}) { //unused for now lol
		if (typeof name === "undefined" || typeof type === "undefined") { console.error("invalid name: ", name, "or type: ", type); return void 0 }
		const url = new URL(`https://api.themoviedb.org/3/search/${type}`)
		url.search = new URLSearchParams({ ...this._params, "query": name, ...params }).toString()

		return await safeJSONRequest(url)
	},
	async details(type: string, TMDBid: string, params: Record<string, string> = {}) {
		if (typeof TMDBid === "undefined" || typeof type === "undefined") { console.error("invalid id: ", TMDBid, "or type: ", type); return void 0 }

		const url = new URL(`https://api.themoviedb.org/3/${type}/${TMDBid}`)
		url.search = new URLSearchParams({ ...this._params, "append_to_response": type === "movie" ? "release_dates" : "content_ratings", ...params }).toString()
		console.log("details", url)

		return await safeJSONRequest(url)
	},
	/** generic tmbd api requrest. for example "videos" */
	async genericRequest(type: string, TMDBid: string, route: string, params: Record<string, string> = {}) {
		if (typeof TMDBid === "undefined") { console.error("invalid id: ", TMDBid); return void 0 }
		if (typeof type === "undefined") { console.error("invalid type: ", type); ; return void 0 }
		if (typeof route === "undefined" || route.trim() === "") { console.error("invalid route: ", route); ; return void 0 }

		const url = new URL(`https://api.themoviedb.org/3/${type}/${TMDBid}/${route}`)
		url.search = new URLSearchParams({ ...this._params, "append_to_response": type === "movie" ? "release_dates" : "content_ratings", ...params }).toString()
		console.log("details", url)

		return await safeJSONRequest(url)
	}
}