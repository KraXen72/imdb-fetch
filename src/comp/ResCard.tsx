import type { IMDBWork } from "../lib/types";


export default function ResCard(props: IMDBWork) {
	return <div>
		<span>{props.l}</span>
	</div>
}

// function renderResults(obj) {
// 	let resultsDiv = document.getElementById("results")
// 	resultsDiv.innerHTML = ``
// 	if (obj.d !== undefined) {
// 		obj.d = obj.d.filter(result => {
// 			return result.id.slice(0, 2) !== "nm"
// 				&& !result.id.includes('/')
// 				&& !result.qid !== "musicvideo"
// 		})
// 	}

// 	if (obj.d === undefined || obj.d.length === 0) {
// 		resultsDiv.innerHTML = `<div id="nothing"><img src="nothing_found.svg" alt="" draggable="false"><div>Nothing found</div></div>`
// 	} else {
// 		console.log("cards: ", obj.d)
// 		for (let i = 0; i < obj.d.length; i++) {
// 			const result = obj.d[i];
// 			//only do movies, skip people
// 			genResultCard(result)
// 		}
// 	}
// }


// each result is typeof { i: [string, number, number], id: string, l: string, q: string, qid: string, s: string, y: number }
// which corresponds to: { i: [image url, width, height], id: imdbID, l: title, q: type(tv/mov), qid: tvSeries/movie, y: year of release }
/** get the html for a result card */
// function genResultCard(result) {
// 	let resultsDiv = document.getElementById("results")

// 	let rCard = document.createElement("div")
// 	rCard.classList.add("result-card")
// 	rCard.innerHTML = `
//     <div class="poster" imdb-id="${result.id}">
//         <img src="${imgUtil.getImgOfQuality(result.i, "ulq")}" 
//         class="poster-img ulq ${imgUtil.containCover(result.i, result.i)}" 
//         onerror="placeholder.png" draggable="false">
//         <img src="${imgUtil.getImgOfQuality(result.i, "lq")}" 
//         class="poster-img lq ${imgUtil.containCover(result.i, result.i)}" 
//         onerror="placeholder.png" draggable="false" style="display: none;">
//         <img src="${imgUtil.getImgOfQuality(result.i, "hq")}" 
//         class="poster-img hq ${imgUtil.containCover(result.i, result.i)}" 
//         onerror="placeholder.png" draggable="false" style="display: none;">
//         <div class="card-hover">
//             <button class="matter-button-outlined vimdb">imdb</button>
//             <button class="matter-button-outlined cimdb">copy ID</button>
//             <button class="matter-button-outlined vtmdb">tmdb</button>
//             <button class="matter-button-outlined ctmdb">copy ID</button>
//             <hr class="hr-text csep">
//             <button class="matter-button-outlined details">details</button>
//             <div class="type matter-subtitle1">${result.q !== undefined ? result.q === "feature" ? "movie" : result.q.toLowerCase() : "unknown"}</div>
//         </div>
//         <a href="${`https://imdb.com/title/${result.id}/`}" hidden class="poster-open" target="_blank">view on imdb</a>
//     </div>
//     <strong class="title" title="${result.l}">${result.l}</strong>
//     <div class="year-and-id"><span class="year" id="year-${result.id}">${result.y === undefined ? "N/A" : result.y}</span><span class="noselect"> &bull; </span><span class="imdbID" id="imdbid-${result.id}">${result.id}</></div>
//     `
// 	const hq = rCard.querySelector('img.poster-img.hq')
// 	const lq = rCard.querySelector('img.poster-img.lq')
// 	const ulq = rCard.querySelector('img.poster-img.ulq')

// 	lq.onload = () => {
// 		lq.style.display = "block";
// 		ulq.style.display = "none"
// 		lq.onload = ""
// 	}
// 	hq.onload = () => {
// 		hq.style.display = "block";
// 		lq.style.display = "none";
// 		ulq.style.display = "none"
// 		hq.onload = ""
// 		lq.onload = ""
// 	}

// 	//button onclicks. details and copy tba
// 	rCard.querySelector('.vimdb').onclick = () => { cardUtil.fancyLinkOpen(`https://imdb.com/title/${result.id}/`) }
// 	rCard.querySelector('.cimdb').onclick = () => { cardUtil.copyToClipboard(result.id) }

// 	resultsDiv.appendChild(rCard)

// 	processTMDB(result, rCard) //tmdb onclicks get applied after append

// }