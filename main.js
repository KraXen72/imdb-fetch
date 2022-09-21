const imgNA = 'placeholder.jpg'
let lastFuncName = ""

document.addEventListener('DOMContentLoaded', () => {
    let inp = document.getElementById('search')

    inp.onkeydown = debounce(() => { //search query
        if (inp.value !== "") {
            let funcname = encodeURIComponent(inp.value.toString().trim().replaceAll("%20"," ").replaceAll(' ', "_").replaceAll('-', "_").toLowerCase())
            console.log("query: ", inp.value, "funcname: ", funcname)

            window[`imdb$${funcname}`] = function (results) {
                renderResults(results)
            };
            try { //try to delete all old imdb functions so i don't pollute window
                delete window[lastFuncName];
            } catch (e) { }
            lastFuncName = funcname;

            //try to delete any previous functions so i don't pollute head with script tags
            [...document.querySelectorAll('.imdb-request')].forEach(node => node.remove())
            //i am so proud that i managed to use the official, key-less imdb api, despite it being json-p
            addScript(`https://sg.media-imdb.com/suggests/${funcname.substring(0, 1)}/${funcname}.json`);
        } else {
            document.getElementById("results").innerHTML = `<div id="nothing"><img src="dude_chillin.svg" alt="" draggable="false"><div>IMDb movie search</div></div>`
        }
    })

    document.getElementById('details-x-button').onclick = () => {
        document.getElementById('main-grid').classList.remove('details-open')
        document.getElementById('details-screen').setAttribute('hidden', 'true')
    }
})

//don't spam api, only do request after 300ms of not typing.
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

async function safeJSONRequest(URLObject) {
	try {
		const req = await fetch(URLObject)
		return await req.json()
	} catch (error) {
		console.error(`safeJSONRequest Error:`, error, ' on URL object: ', URL)
		return void 0 // so it can be used with '?? default value'
	}
}

/** the main api object to access apis */
const api = {
	/** wrapper for tmdb api */
	tmdb: {
		_params : { 
			// this is my api key, but you can get one for free by applying at https://www.themoviedb.org/settings/api.
			// they are not request limited unlike the OMDbapi.
			// or if you don't want to go through registration, there is a bunch of keys here: https://github.com/rickylawson/freekeys 
			"api_key": "7248c5cc1f2080c7baf7361d2427fb80",
			language: "en_US"  
		},
		async findByID(imdbID, params) {
			if (typeof imdbID === "undefined") { console.error("invalid id: ", imdbID); return void 0 }
			const url = new URL(`https://api.themoviedb.org/3/find/${imdbID}`)
			url.search = new URLSearchParams({...this._params, "external_source": "imdb_id", ...params}).toString()

			return await safeJSONRequest(url)
		},
		async search(name, type, params) { //unused for now lol
			if (typeof name === "undefined" || typeof type === "undefined") { console.error("invalid name: ", name, "or type: ", type); return void 0 }
			const url = new URL(`https://api.themoviedb.org/3/search/${type}`)
			url.search = new URLSearchParams({...this._params, "query": name, ...params}).toString()

			return await safeJSONRequest(url)
		},
		async details(type, TMDBid, params) {
			if (typeof TMDBid === "undefined" || typeof type === "undefined") { console.error("invalid id: ", TMDBid, "or type: ", type); return void 0 }

			const url = new URL(`https://api.themoviedb.org/3/${type}/${TMDBid}`)
			url.search = new URLSearchParams({...this._params, "append_to_response": type === "movie" ? "release_dates" : "content_ratings", ...params}).toString()
			console.log("details", url)

			return await safeJSONRequest(url)
		}
	}
}

const imgUtil = {
	/**
	 * get the image from imdb api in hq or lq.
	 * @param {Array} img array where [0] is image link
	 * @param {String} quality "hq", "lq" or "ulq"
	 * @returns link to image in desired quality
	 */
	getImgOfQuality(img, quality) {
		if (!(Array.isArray(img))) {
			//console.error(`no 'img' array provided. attempted quality: ${quality}. typeof img: ${typeof img}`)
			return imgNA
		}
		const imageURL = img[0].replaceAll("._V1_", "$param") // prepare for parameter injection
	
		const _constructImageQuery = (url, quality, width, height, cropParam) => url.replaceAll("$param", `._V1_QL${quality}_UY${height}${cropParam}${width},${height}`)
		
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
	},
	/**
	 * get the image from imdb api in hq or lq.
	 * @param {Array} img array where [0] is image link
	 * @param {String} quality "hq", "lq" or "ulq"
	 * @returns link to image in desired quality
	 */
	containCover(imgArr) {
		if (imgArr === undefined || imgArr.length === 0) { return "cover" } //imgNA is portrait
		return imgArr[1] >= imgArr[2] ? "contain" : "cover"
	}
}

/*ui stuff*/
function renderResults(obj) {
    let resultsDiv = document.getElementById("results")
    resultsDiv.innerHTML = ``
    if (obj.d !== undefined) { 
		obj.d = obj.d.filter(result => {
			return result.id.slice(0, 2) !== "nm" 
			&& !result.id.includes('/')
			&& !result.qid !== "musicvideo"
		}) 
	}

    if (obj.d === undefined || obj.d.length === 0) {
        resultsDiv.innerHTML = `<div id="nothing"><img src="nothing_found.svg" alt="" draggable="false"><div>Nothing found</div></div>`
    } else {
        console.log("cards: ", obj.d)
        for (let i = 0; i < obj.d.length; i++) {
            const result = obj.d[i];
            //only do movies, skip people
            genResultCard(result)
        }
    }
}

//get the html for a result card
function genResultCard(result) {
    let resultsDiv = document.getElementById("results")

    let rCard = document.createElement("div")
    rCard.classList.add("result-card")
    rCard.innerHTML = `
    <div class="poster" imdb-id="${result.id}">
        <img src="${imgUtil.getImgOfQuality(result.i, "ulq")}" 
        class="poster-img ulq ${imgUtil.containCover(result.i, result.i)}" 
        onerror="placeholder.png" draggable="false">
        <img src="${imgUtil.getImgOfQuality(result.i, "lq")}" 
        class="poster-img lq ${imgUtil.containCover(result.i, result.i)}" 
        onerror="placeholder.png" draggable="false" style="display: none;">
        <img src="${imgUtil.getImgOfQuality(result.i, "hq")}" 
        class="poster-img hq ${imgUtil.containCover(result.i, result.i)}" 
        onerror="placeholder.png" draggable="false" style="display: none;">
        <div class="card-hover">
            <button class="matter-button-outlined vimdb">imdb</button>
            <button class="matter-button-outlined cimdb">copy ID</button>
            <button class="matter-button-outlined vtmdb">tmdb</button>
            <button class="matter-button-outlined ctmdb">copy ID</button>
            <hr class="hr-text csep">
            <button class="matter-button-outlined details">details</button>
            <div class="type matter-subtitle1">${result.q !== undefined ? result.q === "feature" ? "movie" : result.q.toLowerCase() : "unknown"}</div>
        </div>
        <a href="${`https://imdb.com/title/${result.id}/`}" hidden class="poster-open" target="_blank">view on imdb</a>
    </div>
    <strong class="title" title="${result.l}">${result.l}</strong>
    <div class="year-and-id"><span class="year" id="year-${result.id}">${result.y === undefined ? "N/A" : result.y}</span><span class="noselect"> &bull; </span><span class="imdbID" id="imdbid-${result.id}">${result.id}</></div>
    `
    const hq = rCard.querySelector('img.poster-img.hq')
    const lq = rCard.querySelector('img.poster-img.lq')
    const ulq = rCard.querySelector('img.poster-img.ulq')

    lq.onload = () => {
        lq.style.display = "block";
        ulq.style.display = "none"
        lq.onload = ""
    }
    hq.onload = () => {
        hq.style.display = "block";
        lq.style.display = "none";
        ulq.style.display = "none"
        hq.onload = ""
        lq.onload = ""
    }

    //button onclicks. details and copy tba
    rCard.querySelector('.vimdb').onclick = () => { cardUtil.fancyLinkOpen(`https://imdb.com/title/${result.id}/`) }
    rCard.querySelector('.cimdb').onclick = () => { cardUtil.copyToClipboard(result.id) }

    resultsDiv.appendChild(rCard)

    processTMDB(result, rCard) //tmdb onclicks get applied after append

}

async function renderDetails(info, card, restype) {
    let obj = await api.tmdb.details(restype, info.resid)
	console.log("details: ", obj)

    let details = document.getElementById('details-screen')

    update('details-title', getTitle("full"))
    update('details-genres', genrePills(obj.genres))
    update('details-type-length', generateLine2(getPG(obj.release_dates)));
    update('details-overview', obj.overview)
    // update('details-pg', getPG(obj.release_dates))
    updateImages()

    document.getElementById('main-grid').classList.add('details-open')
    details.removeAttribute('hidden')

    document.getElementById('pluggedin').onclick = ""
    document.getElementById('pluggedin').onclick = () => { cardUtil.fancyLinkOpen(`https://www.pluggedin.com/?s=${getTitle("plain")}`) }

    document.getElementById('trailerbtn').onclick = ""
    document.getElementById('trailerbtn').onclick = () => { cardUtil.fancyLinkOpen(`https://www.youtube.com/results?search_query=${getTitle("plain").toLowerCase().replaceAll(" ", "+")}+trailer`) }

	const scoreVal = obj.vote_average
    let percScore = Number(Math.round(scoreVal * 10).toFixed(0))
	const circProgress = document.querySelector(".circular-progress")
	//console.log(typeof scoreVal, scoreVal)
	
	if (scoreVal === 0 || scoreVal === null) {
		circProgress.dataset.feel = "null"
	} else if (scoreVal >= 7) {
		circProgress.dataset.feel = "great"
	} else if (scoreVal < 7 && scoreVal >= 5) {
		circProgress.dataset.feel = "good"
	} else if (scoreVal < 5) {
		circProgress.dataset.feel = "bad"
	}

    update('score', percScore === 0 ? "" : percScore)
	if (obj.vote_count && obj.vote_count >= 0) document.getElementById("score").title = `${obj.vote_count} people rated`
    updateScoreCircle(percScore)

    // helper functions

    function updateImages() {
        let detposter = document.getElementById('details-poster')
        let dethead = document.getElementById('details-header')

        if (obj.poster_path !== null) {
            detposter.src = `https://image.tmdb.org/t/p/original/${obj.poster_path}`
        } else {
            detposter.src = card.querySelector('.poster-img.hq').src
        }

        if (obj.backdrop_path !== null) {
            dethead.style.backgroundImage = `url('https://image.tmdb.org/t/p/original/${obj.backdrop_path}')`
        } else {
            dethead.style = ""
            dethead.classList.add('fallback-bg')
        }
    }
    function update(id, value) {
        document.getElementById(id).innerHTML = value
    }
    function updateScoreCircle(value) {
        const p = ( 1 - value / 100 ) * (2 * Math.PI * 40); // 40 is the radius of the circle
        document.getElementById("svg-progress-indicator").style.strokeDashoffset = p
    }
    function genrePills(obj) {
        let html = ''
        let genres = obj.map(g => g.name)
        let extragenres = []
        if (genres.length > 3) {
            extragenres = genres.slice(3, genres.length)
            genres = genres.slice(0, 3)
        }
        genres.forEach(g => {
            html += `<span class="details-genre">${g}</span>`
        })
        if (extragenres.length > 0) {
            html += `<span class="details-genre" title="${extragenres.join(', ')}">&bull;&bull;&bull;</span>`
        }
        return html
    }
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    function getPG(relDates, mode = 'movie') {
		const countriesBlacklist = ["TW", "TH", "HK", "IA", "IT", "FR", "RO", "IN", "PE", "GR", "PT", "SE", "NO", "BG", "HU", "DK", "ES", "MY"] // wierd/non-standard ratings

        let certs
        if (relDates !== undefined && relDates.results !== undefined) { //TODO make this accept tv certs
			if (mode === 'movie') {
				certs = relDates.results.map(result => {
					const country = result["iso_3166_1"]
					const certifications = result["release_dates"]
					// remove duplicates by casting arr => set => arr, filter "" out of the array
					return { country, certs: [...new Set([ ...certifications.map(c => c.certification) ])].filter(c => c !== "") }
				})
				.filter(cert => cert.certs.length > 0) //filter out countries with no certifications
				.map(({country, certs}) => ({country, cert: certs[0]})) // by this point we assume each country only has 1 cert. cast certs[0] => cert
				.filter((cert, i, arr) => arr.length > 1 && !countriesBlacklist.includes(cert.country) ) //filter out blacklist countries, but not if they're the last ones
				.map(({country, cert}) => ({country, cert, value: assignStandardValue(cert)}))
				
				//TODO finish
				console.log(certs)
			} else if (mode === 'tv') {
				certs = [] //TODO add shows support
			} else {
				certs = []
			}
        } else {
            certs = []
        }
        if (certs.length > 0) {
            return `<span title="${certs.join(", ")}">${typeof certs[0] === 'number' ? `PG-${certs[0]}` : certs[0]}</span>`
        } else {
            return `<span title="No age rating information available">N/A</span>`
        }
    }
	
	/** generate the second line */
    function generateLine2(pgString) {
		let runtime = obj.runtime ?? ""
		runtime = runtime === 0 ? "" : runtime
		const type = restype === 'movie' ? 'Movie' : restype === 'tv' ? 'Tv series' : 'Other'

		const prepend = `<span id="details-pg">${pgString}</span>`

		if (restype === 'movie') {
			const movieLength  = `${Math.floor(runtime / 60)}h ${runtime % 60}min`
			return `${prepend}<strong>${type}</strong> &bull; ${movieLength}`
		} else if (restype === 'tv') {
			return `${prepend}<strong>${type}</strong> &bull; <strong>Seasons:</strong> ${getSeasons()}`
		} else {
			return `${prepend}Other &bull; No info`
		}
    }
    function getSeasons() {
        let hasSpecials = false
        let specials = {}
        obj.seasons.forEach(season => { if (season.name.toLowerCase() === "specials") { hasSpecials = true; specials = season } })

        if (hasSpecials) {
			const seasons = obj.seasons.filter(s => s.name.toLowerCase() !== "specials")
				.filter(season => season.name.trim() !== "")
				.map(s => `<span title="${s.name}">[${s.episode_count}]</span>`)
				.join(', ')
            return `${obj.seasons.length - 1}: ${seasons} &bull; <strong>Specials:</strong> ${specials.episode_count}`
        } else {
            return `${obj.seasons.length}: ${obj.seasons.map(s => `<span title="${s.name}">[${s.episode_count}]</span>`).join(', ')}`
        }
    }
    function getTitle(mode) {
        if (mode === "full") {
            return `${restype === 'movie' ? obj.title : restype === 'tv' ? obj.name : "couldn't get title.."} <span id="details-year">(${card.querySelector('.year').textContent})</span>`
        } else if (mode === "plain") {
            return `${restype === 'movie' ? obj.title : restype === 'tv' ? obj.name : ""}`
        }

    }
}

function addScript(src) { var s = document.createElement('script'); s.src = src; s.classList.add('imdb-request'); document.head.appendChild(s); }

const cardUtil = {
	/**
	 * fancy way to open a link on new tab.
	 * @param {String} url url
	 */
	fancyLinkOpen(url) {
		setTimeout(() => { window.open(url, '_blank') }, 300)
	},
	/**
	 * copy a string to clipboard
	 * @param {String} whattocopy what to copy
	 */
	copyToClipboard(whattocopy) {
		setTimeout(() => {
			let copying = document.getElementById('copyinp');
			copying.value = whattocopy;
			copying.select();
			document.execCommand("copy");
		}, 300)
	}
}

/**
* match IMDb id to TMDB id, determine restype
* @param {String} imdbres imdb result
* @param {Object} card html card element
*/
async function processTMDB(imdbres, card) {
	const movieTypes = ['feature', 'tv special', 'tv movie', 'tv short', 'short', 'movie', 'video']
	const tvTypes = ['tv series', 'tv mini-series']

	let res = await api.tmdb.findByID(imdbres.id) ?? { 'movie_results': [], 'tv_results': [] }
	// let req = await fetch(`
	// https://api.themoviedb.org/3/find/${imdbres.id}?api_key=${this.haveFun()}&language=en-US&external_source=imdb_id`)
	// res = await req.json()
	
	const cleanType = imdbres.q.toLowerCase()
	let restype = ''

	if (movieTypes.includes(cleanType)) {
		restype = 'movie'
	} else if (tvTypes.includes(cleanType)) {
		restype = 'tv'
	} else {
		restype = 'other'
	}

	if (res === { 'movie_results': [], 'tv_results': [] }) res = "404"

	let finalRes = '404'
	if (restype === "movie" && res['movie_results'].length > 0) {
		finalRes = res['movie_results'][0]
	} else if (restype === "tv" && res['tv_results'].length > 0) {
		finalRes = res['tv_results'][0]
	// } else if ((restype === "movie" || restype === "tv") && res === '404') {
	// 	fallbackRes = await api.tmdb.search(imdbres.l, restype === "" ? cleanType : restype)
	// 	console.log(fallbackRes, "fallback search for: ", imdbres)

	// 	finalRes = '404'
	} else {
		console.warn(`${imdbres.l} doesen't exist on TMDB`, imdbres)
		finalRes = '404'
	}

	console.log(imdbres.l, finalRes, restype)

	let copybtn = card.querySelector('.ctmdb')
	let viewbtn = card.querySelector('.vtmdb')
	let detbtn = card.querySelector('.details')

	if (finalRes === "404") {
		copybtn.setAttribute('disabled', "")
		viewbtn.setAttribute('disabled', "")
		detbtn.setAttribute('disabled', "")
		return false
	}
	viewbtn.onclick = () => { cardUtil.fancyLinkOpen(`https://www.themoviedb.org/${restype}/${finalRes.id}`) }
	copybtn.onclick = () => { cardUtil.copyToClipboard(finalRes.id) }

	detbtn.onclick = () => { renderDetails({ restype, "resid": finalRes.id, "v": imdbres.v ?? "404" }, card, restype) }
}

/** assign a numerical value to different country ratings/certifications so they can be easily sorted */
function assignStandardValue(cert) {
	switch (cert) {
		case "RC":
		case "X18+":
		case "R18+":
		case "R18":
		case "X":
			return 21
		case "18":
		case "18+":
		case "R-18":
		case "N-18":
			return 18
		case "NC-17":
		case "18A":
		case "17":
			return 17
		case "R":
		case "16+":
		case "16":
		case "R-16":
		case "N-16":
			return 16
		case "M":
		case "MA15+":
		case "15":
			return 15
		case "14A":
		case "14":
			return 14
		case "PG-13":
		case "13+":
		case "13":
		case "R-13":
		case "N-13":
		case "PG13":
			return 13
		case "12":
		case "UA":
		case "12A":
		case "12+":
			return 12
		case "11":
		case "K-11":
			return 11
		case "PG":
		case "10":
			return 10
		case "9":
			return 9
		case "7":
		case "N-7":
			return 7
		case "6":
		case "6+":
			return 6
		case "U":
		case "V":
		case "G":
		case "L":
		case "S":
		case "0+":
		case "0":
		case "AL":
			return 0
		case "NR":
		default:
			return null
	}
}
