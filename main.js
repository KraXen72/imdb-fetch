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
    <div class="poster">
        <img 
        src="${result.i === undefined ? imgNA : result.i[0].replace("._V1_.jpg", "._V1._SX40_CR0,,337,500_.jpg")}" 
        class="poster-img ${result.i !== undefined && result.i[1] > result.i[2] ? "contain" : ""}" 
        onerror="placeholder.png" draggable="false">
        <a href="${`https://imdb.com/title/${result.id}/`}" class="poster-open" target="_blank">view on imdb</a>
    </div>
    <strong class="title" title="${result.l}">${result.l}</strong>
    <div class="year-and-id"><span class="year" id="year-${result.id}">${result.y === undefined ? "N/A" : result.y}</span><span class="noselect"> &bull; </span><span class="imdbID" id="imdbid-${result.id}">${result.id}</></div>
    `
    rCard.querySelector('img.poster-img').onload = () => {
        rCard.querySelector('img.poster-img').src = result.i === undefined ? imgNA : result.i[0]
    }
    resultsDiv.appendChild(rCard)
}

function addScript(src) { var s = document.createElement('script'); s.src = src; s.classList.add('imdb-request'); document.head.appendChild(s); }