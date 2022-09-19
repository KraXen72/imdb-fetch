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

/** the main api object to access apis */
const api = {
	/** wrapper for tmdb api */
	tmdb: {
		_params : { 
			"\x61\x70\x69\x5F\x6B\x65\x79": eval(atob('YXRvYignWkdFMk16VTBPREE0Tm1Vek9TdzVabVpqT1RFd1ptSmpNRGcxTWpaa1pqQTFMeXAwYUdseklHbHpJRzV2ZENCbGRtVnVJRzE1SUd0bGVTQTZZMjl2Ykdsdk9pb3YnKS5zcGxpdChhdG9iKCdMQT09JykpLmpvaW4oImJhbmFuYSIucmVwbGFjZSgiYmFuYW5hIiwgIiIpKS5yZXBsYWNlQWxsKGF0b2IoJ0x5cDBhR2x6SUdseklHNXZkQ0JsZG1WdUlHMTVJR3RsZVNBNlkyOXZiR2x2T2lvdicpLCAib3JhbmdlIi5yZXBsYWNlQWxsKGF0b2IoJ2IzSmhibWRsJyksICIiKSk=')), 
			language: "en_US"  
		},
		async find(imdbID, params) {
			if (typeof imdbID === "undefined") { console.error("invalid id: ", imdbID); return void 0 }
			const url = new URL(`https://api.themoviedb.org/3/find/${imdbID}`)
			url.search = new URLSearchParams({
				...this._params,
				"external_source": "imdb_id",
				...params
			}).toString()

			//console.log("new api: url: ", url)
			try {
				let req = await fetch(url)
				return await req.json()
			} catch (error) {
				console.error(error)
				return void 0 // so it can be used with '?? default value'
			}
		},
		async details(type, TMDBid, params) {
			if (typeof TMDBid === "undefined" || typeof type === "undefined") { console.error("invalid id: ", TMDBid, "or type: ", type); return void 0 }

			const url = new URL(`https://api.themoviedb.org/3/${type}/${TMDBid}`)
			url.search = new URLSearchParams({
				...this._params,
				"append_to_response": "release_dates",
				...params
			}).toString()

			try {
				let req = await fetch(url)
				return await req.json()
			} catch (error) {
				console.error(error)
				return void 0 // so it can be used with '?? default value'
			}
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

    let details = document.getElementById('details-screen')

    update('details-title', getTitle("full"))
    update('details-genres', genrePills(obj.genres))
    update('details-type-length', getDetailsLength(`<span id="details-pg">${getPG(obj.release_dates)}</span>`));
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
	console.log(typeof scoreVal, scoreVal)

	
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
    function getPG(relDates) {
        let normalratings = ['M', 'R', 'M/R', 'G', 'PG', 'PG-13', "PG-16", 'NC-17', 'MA', 'MA 15', 'R 18', 'X 18']
        let certs
        if (relDates !== undefined && relDates.results !== undefined) {
            certs = [].concat.apply([], relDates.results.map(date => date.release_dates.map(rd => rd.certification))) /*get all certifications from each country, flattern the array */
                .filter(item => item !== "")  /*filter out "",*/
                .filter(onlyUnique) /* filter out duplicates */
                .map(item => {
                    item.replaceAll("+", ""); //get rid of 16+ etc so its only 16
                    return parseInt(item) || item //try to convert to numbers
                })
                .filter(item => typeof item === 'number' || normalratings.includes(item) || item.includes('PG-')) //filter out all wierdass ratings
                .sort() //sort alphabetically
                .sort((a, b) => a - b) //try to sort from lowest
        } else {
            certs = []
        }
        if (certs.length > 0) {
            return `<span title="${certs.join(", ")}">${typeof certs[0] === 'number' ? `PG-${certs[0]}` : certs[0]}</span>`
        } else {
            return `<span>PG-??</span>`
        }
    }
	
    function getDetailsLength(prepend = '') {
		let runtime = obj.runtime ?? ""
		runtime = runtime === 0 ? "" : runtime
		const type = restype === 'movie' ? 'Movie' : restype === 'tv' ? 'Tv series' : 'Other'

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
	const movieTypes = ['feature', 'tv special', 'tv movie', 'short', 'movie']
	const tvTypes = ['tv series', 'tv mini-series']

	let res = await api.tmdb.find(imdbres.id) ?? { 'movie_results': [], 'tv_results': [] }
	console.log(res)
	// let req = await fetch(`
	// https://api.themoviedb.org/3/find/${imdbres.id}?api_key=${this.haveFun()}&language=en-US&external_source=imdb_id`)
	// res = await req.json()
	let restype = ''

	if (res['movie_results'].length > 0 && movieTypes.includes(imdbres.q.toLowerCase())) {
		res = res['movie_results'][0];
		restype = 'movie'
	} else if (res['tv_results'].length > 0 && tvTypes.includes(imdbres.q.toLowerCase())) {
		res = res['tv_results'][0];
		restype = 'tv'
	} else {
		res = "404"
	}
	// //fallback search by name
	// if (res === "404") {
	// 	let fallbackRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${api.tmdb.haveFun()}&query=${}&language=en-US`)
	// }

	let copybtn = card.querySelector('.ctmdb')
	let viewbtn = card.querySelector('.vtmdb')
	let detbtn = card.querySelector('.details')

	if (res === "404") {
		copybtn.setAttribute('disabled', "")
		viewbtn.setAttribute('disabled', "")
		detbtn.setAttribute('disabled', "")
		return false
	}
	viewbtn.onclick = () => { cardUtil.fancyLinkOpen(`https://www.themoviedb.org/${restype}/${res.id}`) }
	copybtn.onclick = () => { cardUtil.copyToClipboard(res.id) }

	detbtn.onclick = () => { renderDetails({ restype, "resid": res.id, "v": imdbres.v !== undefined ? imdbres.v : "404" }, card, restype) }
}
