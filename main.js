const imgNA = 'placeholder.jpg'
let lastFuncName = ""

document.addEventListener('DOMContentLoaded', () => {
    let inp = document.getElementById('search')

    inp.onkeydown = debounce(() => { //search query
        if (inp.value !== "") {
            let funcname = inp.value.toString().replaceAll(' ', "_").replaceAll('-',"_").toLowerCase()
            console.log("query: ", inp.value, "funcname: ", funcname)

            window[`imdb$${funcname}`] = function (results) {
                renderResults(results)
            };
            try { //try to delete all old imdb functions so i don't pollute window
                delete window[lastFuncName];
            } catch(e){}
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
function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

/*ui stuff*/
function renderResults(obj) {
    let resultsDiv = document.getElementById("results")
    resultsDiv.innerHTML = ``
    if (obj.d !== undefined) { obj.d = obj.d.filter(result => result.id.substring(0, 2) !== "nm" && !result.id.includes('/')) }
    
    if(obj.d === undefined || obj.d.length === 0) {
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
    rCard.querySelector('.vimdb').onclick = () => {cardUtil.fancyLinkOpen(`https://imdb.com/title/${result.id}/`)}
    rCard.querySelector('.cimdb').onclick = () => {cardUtil.copyToClipboard(result.id)}

    resultsDiv.appendChild(rCard)

    apiHelper.processTMDB(result, rCard) //tmdb onclicks get applied after append

}

async function renderDetails(info, card, restype) {
    let url = `https://api.themoviedb.org/3/${info.restype}/${info.resid}?api_key=${apiHelper.haveFun()}&language=en-US&append_to_response=release_dates`
    dreq = await fetch(url)
    obj = await dreq.json()

    console.log("detail fetch: ", url, obj)

    let details = document.getElementById('details-screen')

    update('details-title', getTitle("full"))
    update('details-genres', genrePills(obj.genres))
    update('details-type-length', getDetailsLength());
    update('details-overview', obj.overview)
    update('score', obj.vote_average)
    update('details-pg', getPG(obj.release_dates))
    updateImages()
    
    document.getElementById('main-grid').classList.add('details-open')
    details.removeAttribute('hidden')

    document.getElementById('pluggedin').onclick = ""
    document.getElementById('pluggedin').onclick = () => {cardUtil.fancyLinkOpen(`https://www.pluggedin.com/?s=${getTitle("plain")}`)}

    document.getElementById('trailerbtn').onclick = ""
    document.getElementById('trailerbtn').onclick = () => {cardUtil.fancyLinkOpen(`https://www.youtube.com/results?search_query=${getTitle("plain").toLowerCase().replaceAll(" ","+")}+trailer`)}

    if (obj.vote_average < 6) {
        document.getElementById('score').classList.remove("good-score")
        document.getElementById('score').classList.add("bad-score")
    } else if (obj.vote_average >= 6 && obj.vote_average < 8) {
        document.getElementById('score').classList.remove("good-score")
        document.getElementById('score').classList.remove("bad-score")
    } else if (obj.vote_average >= 8) {
        document.getElementById('score').classList.remove("bad-score")
        document.getElementById('score').classList.add("good-score")
    }

    // helper functions

    //TODO put helper functions into an objet and pass them all stuff
    function updateImages() {
        let detposter =  document.getElementById('details-poster')
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
    function update(id,  value) {
        document.getElementById(id).innerHTML = value
    }
    function genrePills(obj) {
        let html = ''
        let genres = obj.map(g => g.name)
        let extragenres = []
        if (genres.length > 3) {
            extragenres = genres.slice(3, genres.length)
            genres = genres.slice(0,3)
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
        .filter( onlyUnique ) /* filter out duplicates */
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
            return `<span title="${certs.join(", ")}">${typeof certs[0] === 'number' ? `PG-${certs[0]}`: certs[0]}</span>`
        } else {
            return `<span>PG-??</span>`
        }
    }
    function getDetailsLength() {
        let runtime = obj.runtime ?? ""
        runtime = runtime === 0 ? "" : runtime
        return restype === 'movie' ? `${restype.split("").map((l, i) => i === 0 ? l.toUpperCase() : l).join("")}${runtime === "" ? "": ` &bull; ${Math.floor(obj.runtime / 60)}h ${obj.runtime % 60}min`}` : 
        restype === 'tv' ? `Tv series &bull; Seasons: ${getSeasons()}` : 
        `${restype.split("").map((l, i) => i === 0 ? l.toUpperCase() : l).join("")}`
    }
    function getSeasons() {
        let hasSpecials = false
        let specials = {}
        obj.seasons.forEach(season => { if (season.name.toLowerCase() === "specials") { hasSpecials = true; specials = season } })

        if (hasSpecials) {
            return `${obj.seasons.length - 1}, ${obj.seasons.filter(s => s.name.toLowerCase() !== "specials").map(s => `<span title="${s.name}">[${s.episode_count}]</span>`).join(', ')}, Specials: ${specials.episode_count}`
        } else {
            return `${obj.seasons.length}, ${obj.seasons.map(s => `<span title="${s.name}">[${s.episode_count}]</span>`).join(', ')}`
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

const imgUtil = {}
const cardUtil = {}
const apiHelper = {}

/**
 * set the contain or cover for object fit.
 * @param {Array} imgArr image array where [1] is width and [2] is height
 * @return {String|String} "cover" or "contain"
 */
imgUtil.containCover = (imgArr) => { 
    if (imgArr === undefined || imgArr.length === 0) { return "cover" } //imgNA is portrait
    return imgArr[1] >= imgArr[2] ? "contain" : "cover"
}

/**
 * get the image from imdb api in hq or lq.
 * @param {Array} img array where [0] is image link
 * @param {String} quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
imgUtil.getImgOfQuality = (img, quality) => {
    if (img === undefined || img.length === 0) {
        return imgNA
    } else {
        if (quality === "hq") {
            return img[0]
        } else if (quality === "lq") {
            return img[0].replace("._V1_.jpg", "._V1._SX40_CR0,,337,500_.jpg")
        } else if (quality === 'ulq') {
            return img[0].replace("._V1_.jpg", "._V1._SX40_CR0,,202,300_.jpg")
        } else {
            throw "No quality selected."
        }
    }
}

/**
 * fancy way to open a link on new tab.
 * @param {String} url url
 */
cardUtil.fancyLinkOpen = (url) => {
    setTimeout(() => {window.open(url, '_blank')}, 300)
}

/**
 * copy a string to clipboard
 * @param {String} whattocopy what to copy
 */
cardUtil.copyToClipboard = (whattocopy) => {
    setTimeout(() => {
        let copying = document.getElementById('copyinp');
        copying.value = whattocopy;
        copying.select();
        document.execCommand("copy");
    }, 300)
}

/**
 * :')
 */
apiHelper.haveFun = () => {
    return eval(atob('YXRvYignWkdFMk16VTBPREE0Tm1Vek9TdzVabVpqT1RFd1ptSmpNRGcxTWpaa1pqQTFMeXAwYUdseklHbHpJRzV2ZENCbGRtVnVJRzE1SUd0bGVTQTZZMjl2Ykdsdk9pb3YnKS5zcGxpdChhdG9iKCdMQT09JykpLmpvaW4oImJhbmFuYSIucmVwbGFjZSgiYmFuYW5hIiwgIiIpKS5yZXBsYWNlQWxsKGF0b2IoJ0x5cDBhR2x6SUdseklHNXZkQ0JsZG1WdUlHMTVJR3RsZVNBNlkyOXZiR2x2T2lvdicpLCAib3JhbmdlIi5yZXBsYWNlQWxsKGF0b2IoJ2IzSmhibWRsJyksICIiKSk='))
}

/**
 * make da tmdb requet to get id
 * @param {String} imdbres imdb result
 * @param {Object} card html card element
 */
apiHelper.processTMDB = async (imdbres, card) => {
    let res = {'movie_results': [], 'tv_results': []} //remove this on internet
    let req = await fetch(`
    https://api.themoviedb.org/3/find/${imdbres.id}?api_key=${apiHelper.haveFun()}&language=en-US&external_source=imdb_id`)
    res = await req.json()
    let restype = ''
    if (res['movie_results'].length > 0 && ['feature', 'tv special', 'tv movie'].includes(imdbres.q.toLowerCase())) {
        res = res['movie_results'][0];
        restype = 'movie'
    } else if (res['tv_results'].length > 0 && imdbres.q.toLowerCase() === 'tv series' ) {
        res = res['tv_results'][0];
        restype = 'tv'
    } else {
        res = "404"
    }

    let copybtn = card.querySelector('.ctmdb')
    let viewbtn = card.querySelector('.vtmdb')
    let detbtn = card.querySelector('.details')

    if (res === "404") {
        copybtn.setAttribute('disabled', "")
        viewbtn.setAttribute('disabled', "")
        detbtn.setAttribute('disabled', "")
        return false
    }
    viewbtn.onclick = () => {cardUtil.fancyLinkOpen(`https://www.themoviedb.org/${restype}/${res.id}`)}
    copybtn.onclick = () => {cardUtil.copyToClipboard(res.id)}
    
    detbtn.onclick = () => { renderDetails({restype, "resid": res.id, "v": imdbres.v !== undefined ? imdbres.v : "404"}, card, restype) }
}