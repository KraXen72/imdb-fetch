
import { createSignal } from "solid-js";
import type { IMDBAPIResponse, IMDBWork } from "./types";

let lastFuncName = ''

// @ts-ignore
globalThis._imdbSearchCallback = (data: IMDBAPIResponse) => processImdbResponse(data)

export function search(rawQuery: string) {
	if (rawQuery.trim() === '') {
		setRes([])
		return;
	}
	const funcname = rawQuery.trim()
		.replace(/-|;/g, " ") // replace invalid
		.replace(" ", "_") // first space can be a _
		.replaceAll(" ", "") // all remaining spaces need to be yeeted because stupid IMDb fix ur api.
		.toLowerCase()
	console.log("query: ", rawQuery, "funcname: ", funcname)

	//@ts-ignore
	window[`imdb$${funcname}`] = globalThis._imdbSearchCallback

	//@ts-ignore try to delete all old imdb functions so i don't pollute window
	try { delete window[lastFuncName]; } catch (e) { }
	lastFuncName = funcname;
	const firstChar = funcname.slice(0, 1)

	// the horrors, the husks
	imdbScriptTag(`https://sg.media-imdb.com/suggests/${firstChar}/${encodeURIComponent(funcname)}.json`)
}

function processImdbResponse(data: IMDBAPIResponse) {
	console.log(data)
	setRes(data.d)
}

function imdbScriptTag(src: string) {
	document.getElementById("imdb-script-tag")?.remove()

	const scriptTag = document.createElement('script')
	scriptTag.id = 'imdb-script-tag'
	scriptTag.src = src
	document.head.appendChild(scriptTag)
}

export const DEBOUNCE_MS = 200

const [results, setRes] = createSignal<IMDBWork[]>([])
export { results }