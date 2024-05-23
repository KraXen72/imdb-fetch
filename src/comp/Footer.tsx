import tmdblogo from '../assets/tmdb_attribution_logo.svg'

export default function Footer() {
	return <div id="footer">
		<span>Made by KraXen72.</span>
		<span>&nbsp;</span>
		<span>Uses the IMDb suggests API</span>
		<span>&nbsp;and&nbsp;</span>
		<a href="http://www.themoviedb.org">
			<img 
				src={tmdblogo} 
				alt="tmdb / www.themoviedb.org" 
				height="16px" 
				id="tmdb-img" ></img>
		</a>
		<span>api.</span>
	</div>
}