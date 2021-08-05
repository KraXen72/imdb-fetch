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
    let resultsDiv = document.getElementById("results")

    let rCard = document.createElement("div")
    rCard.classList.add("result-card")
    rCard.innerHTML = `
    <div class="poster" imdb-id="${result.id}">
        <!-- ultra low quality pic -->
        <img src="${imgUtil.getImgOfQuality(result.i[0], "ulq")}" 
        class="poster-img ulq ${imgUtil.containCover(result.i[1], result.i[2])}" 
        onerror="placeholder.png" draggable="false">
        <!-- low quality pic -->
        <img src="${imgUtil.getImgOfQuality(result.i[0], "lq")}" 
        class="poster-img lq ${imgUtil.containCover(result.i[1], result.i[2])}" 
        onerror="placeholder.png" draggable="false" style="display: none;">
        <!-- high quality pic -->
        <img src="${imgUtil.getImgOfQuality(result.i[0], "hq")}" 
        class="poster-img hq ${imgUtil.containCover(result.i[1], result.i[2])}" 
        onerror="placeholder.png" draggable="false" style="display: none;">
        <!-- link to be reworked -->
        <a href="${`https://imdb.com/title/${result.id}/`}" class="poster-open" target="_blank">view on imdb</a>
    </div>
    <strong class="title" title="${result.l}">${result.l}</strong>
    <div class="year-and-id"><span class="year" id="year-${result.id}">${result.y === undefined ? "N/A" : result.y}</span><span class="noselect"> &bull; </span><span class="imdbID" id="imdbid-${result.id}">${result.id}</></div>
    `
    let hq = rCard.querySelector('img.poster-img.hq')
    let lq = rCard.querySelector('img.poster-img.lq')
    let ulq = rCard.querySelector('img.poster-img.ulq')

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
    resultsDiv.appendChild(rCard)
}

function addScript(src) { var s = document.createElement('script'); s.src = src; s.classList.add('imdb-request'); document.head.appendChild(s); }

const imgUtil = {}

/**
 * set the contain or cover for object fit.
 * @param {String} width width of img
 * @param {String} height height of img
 * @return {String|String} "cover" or "contain"
 */
imgUtil.containCover = (width, height) => { 
    return width >= height ? "contain" : "cover"
}
/**
 * get the image from imdb api in hq or lq.
 * @param {String} img image link
 * @param {String} quality "hq", "lq" or "ulq"
 * @returns link to image in desired quality
 */
imgUtil.getImgOfQuality = (img, quality) => {
    if (img === undefined || img === null) {
        return imgNA
    } else {
        if (quality === "hq") {
            return img
        } else if (quality === "lq") {
            return img.replace("._V1_.jpg", "._V1._SX40_CR0,,337,500_.jpg")
        } else if (quality === 'ulq') {
            return img.replace("._V1_.jpg", "._V1._SX40_CR0,,202,300_.jpg")
        } else {
            throw "No quality selected."
        }
    }
}