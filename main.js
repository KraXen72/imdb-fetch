const imgNA = 'placeholder.jpg'
let lastFuncName = ""

document.addEventListener('DOMContentLoaded', () => {
    let inp = document.getElementById('search')

    inp.onkeydown = debounce(() => { //search query
        if (inp.value !== "") {
            let funcname = inp.value.toString().replaceAll(' ', "_").replaceAll('-',"_").toLowerCase()
            console.log("query: ", inp.value, "funcname: ", funcname)

            window[`imdb$${funcname}`] = function (results) {
                console.log(results)
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
    
    if(obj.d === undefined || obj.d.length === 0) {
        resultsDiv.innerHTML = `<div id="nothing"><img src="nothing_found.svg" alt="" draggable="false"><div>Nothing found</div></div>`
    } else {
        for (let i = 0; i < obj.d.length; i++) {
            const result = obj.d[i];
            //only do movies, skip people
            if (result.id.substring(0, 2) !== "nm") {
                genResultCard(result)
            }
        }
    }
}

//get the html for a result card
function genResultCard(result) {
    console.log("card: ", result)
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
            <div class="type">${result.q === "feature" ? "movie" : result.q.toLowerCase()}</div>
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

    resultsDiv.appendChild(rCard)

    apiHelper.processTMDB(result, rCard) //tmdb onclicks get applied after append

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
 * :')
 * its not even mine so :shrug:
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
    let req = await fetch(`
    https://api.themoviedb.org/3/find/${imdbres.id}?api_key=${apiHelper.haveFun()}&language=en-US&external_source=imdb_id`)
    let res = await req.json()
    let restype = ''
    if (res['movie_results'].length > 0 && imdbres.q.toLowerCase() === 'feature') {
        res = res['movie_results'][0];
        restype = 'movie'
    } else if (res['tv_results'].length > 0 && imdbres.q.toLowerCase() === 'tv series' ) {
        res = res['tv_results'][0];
        restype = 'tv'
    } else {
        res = "404"
    }

    const copybtn = card.querySelector('.ctmdb')
    const viewbtn = card.querySelector('.vtmdb')

    if (res === "404") {
        copybtn.setAttribute('disabled', "")
        viewbtn.setAttribute('disabled', "")
        return false
    }
    viewbtn.onclick = () => {cardUtil.fancyLinkOpen(`https://www.themoviedb.org/${restype}/${res.id}`)}

    //TODO upgrade hq images from tmdb and also in details screen.
    console.log(res)
}