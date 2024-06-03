export interface IMDBAPIResponse {
	d: IMDBWork[];
	q: string;
	v: number;
}

export interface IMDBWork {
	/** images */
	i?:   [string, number, number];
	/** imdb id */
	id:   string;
	/** Title */
	l:    string;
	/** type? */
	qid?: string;
	/** type (more specific) - use qid */
	q:   string;
	/** few main actors, comma separated */
	s:    string;
	/** year of release */
	y?:   number;
}

export type IMDBImg = IMDBWork['i']

export interface TMBDAPIResponse {
	movie_results:      TMDBWork[];
	tv_results:         TMDBWork[];
	person_results:     unknown[];
	tv_episode_results: unknown[];
	tv_season_results:  unknown[];
}

export interface TMDBWork {
	backdrop_path:     string;
	id:                number;
	original_title:    string;
	overview:          string;
	poster_path:       string;
	media_type:        string;
	adult:             boolean;
	title:             string;
	original_language: string;
	genre_ids:         number[];
	popularity:        number;
	/** YYYY-MM-DD */
	release_date:      string;
	video:             boolean;
	vote_average:      number;
	vote_count:        number;
}

export type ResType = 'movie' | 'tv' | 'other'
export type DetailsTuple = [TMDBWork | '404', ResType]

